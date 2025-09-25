import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset, TensorDataset
from torchvision import datasets, transforms, models
import spectral as spy
import numpy as np
from PIL import Image
from sklearn.preprocessing import LabelEncoder
from tqdm import tqdm
from huggingface_hub import snapshot_download
import kagglehub

# =========================================
# 2. Configuration and Hyperparameters
# =========================================
# Device setup
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Hyperparameters
BATCH_SIZE = 16
EPOCHS = 10
LR = 1e-3
HS_CUBE_SIZE = (64, 64)
RGB_IMG_SIZE = (224, 224)
NUM_RGB_CLASSES = 15  # Based on the PlantVillage dataset used

# =========================================
# 3. Data Loading and Preprocessing
# =========================================

def download_datasets():
    """Downloads the required datasets from Hugging Face Hub and Kaggle."""
    print("Downloading WHU-Hi dataset...")
    huggingface_path = snapshot_download(
        repo_id="danaroth/whu_hi",
        repo_type="dataset"
    )
    print(f"WHU-Hi dataset downloaded to: {huggingface_path}")

    print("\nDownloading PlantVillage dataset...")
    kaggle_path = kagglehub.dataset_download("emmarex/plantdisease")
    print(f"PlantVillage dataset saved at: {kaggle_path}")
    
    return huggingface_path, kaggle_path

def extract_patches(cube, gt, patch_size=HS_CUBE_SIZE[0]):
    """Extracts patches and corresponding labels from the hyperspectral cube."""
    H, W, Bands = cube.shape
    patches = []
    labels = []
    stride = patch_size
    for i in range(0, H - patch_size + 1, stride):
        for j in range(0, W - patch_size + 1, stride):
            patch = cube[i:i + patch_size, j:j + patch_size, :]
            label_patch = gt[i:i + patch_size, j:j + patch_size]
            # Use majority vote for the label, ignoring background (label 0)
            unique_labels, counts = np.unique(label_patch[label_patch > 0], return_counts=True)
            if len(unique_labels) > 0:
                label = unique_labels[np.argmax(counts)]
                patches.append(np.transpose(patch, (2, 0, 1)))  # Convert to Bands x H x W
                labels.append(label)
    return np.array(patches, dtype=np.float32), np.array(labels, dtype=np.int64)

class HS_RGB_Dataset(Dataset):
    """Custom dataset to combine pre-extracted HS features and RGB images."""
    def __init__(self, hs_features, rgb_dataset):
        self.hs_features = hs_features
        self.rgb_dataset = rgb_dataset

    def __len__(self):
        return len(self.rgb_dataset)

    def __getitem__(self, idx):
        rgb_img, rgb_label = self.rgb_dataset[idx]
        # Cycle through HS features if RGB dataset is larger
        hs_feat = self.hs_features[idx % len(self.hs_features)]
        return hs_feat, rgb_img, rgb_label

# =========================================
# 4. Model Architecture
# =========================================

class HyperspectralCNN(nn.Module):
    """A simple CNN to extract features from hyperspectral patches."""
    def __init__(self, input_bands, output_dim=128):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(input_bands, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Flatten()
        )
        # Calculate the flattened size dynamically
        flat_size = 128 * (HS_CUBE_SIZE[0] // 4) * (HS_CUBE_SIZE[1] // 4)
        self.fc = nn.Linear(flat_size, output_dim)

    def forward(self, x):
        x = self.features(x)
        x = self.fc(x)
        return x

class RGBResNet(nn.Module):
    """A pre-trained ResNet-18 model to extract features from RGB images."""
    def __init__(self, output_dim=128):
        super().__init__()
        self.base_model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
        # Replace the final classification layer with a feature extractor
        self.base_model.fc = nn.Linear(self.base_model.fc.in_features, output_dim)

    def forward(self, x):
        return self.base_model(x)

class CombinedModel(nn.Module):
    """Combines features from both HS and RGB models for final classification."""
    def __init__(self, rgb_model, final_classes):
        super().__init__()
        self.rgb_model = rgb_model
        self.classifier = nn.Sequential(
            nn.Linear(128 + 128, 256),  # 128 from HS, 128 from RGB
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, final_classes)
        )

    def forward(self, hs_feat, rgb_img):
        rgb_feat = self.rgb_model(rgb_img)
        combined = torch.cat([hs_feat, rgb_feat], dim=1)
        out = self.classifier(combined)
        return out

# =========================================
# 5. Main Execution Logic
# =========================================

def main():
    # --- Download and Prepare Data ---
    huggingface_path, kaggle_base_path = download_datasets()
    
    # Hyperspectral Data
    honghu_path = os.path.join(huggingface_path, "WHU-Hi-HongHu")
    hs_img = spy.open_image(os.path.join(honghu_path, "WHU-Hi-HongHu.hdr"))
    hs_cube = hs_img.load()
    gt_img = spy.open_image(os.path.join(honghu_path, "WHU-Hi-HongHu_gt.hdr"))
    gt_cube = gt_img.load().squeeze()

    hs_patches, hs_labels = extract_patches(hs_cube, gt_cube)
    print(f"HS patches extracted: {hs_patches.shape}, Labels: {hs_labels.shape}")

    hs_dataset = TensorDataset(torch.tensor(hs_patches), torch.tensor(hs_labels))
    hs_loader = DataLoader(hs_dataset, batch_size=BATCH_SIZE, shuffle=False, drop_last=True)
    
    # RGB Data
    plant_village_path = os.path.join(kaggle_base_path, "plantvillage/PlantVillage")
    rgb_transform = transforms.Compose([
        transforms.Resize(RGB_IMG_SIZE),
        transforms.ToTensor()
    ])
    plant_dataset = datasets.ImageFolder(root=plant_village_path, transform=rgb_transform)
    print(f"Total PlantVillage samples: {len(plant_dataset)}")
    print(f"Number of RGB classes: {len(plant_dataset.classes)}")

    # --- Pre-extract Hyperspectral Features ---
    print("\nPre-extracting features from the hyperspectral model...")
    hs_model = HyperspectralCNN(input_bands=hs_patches.shape[1]).to(device)
    hs_model.eval()
    hs_features_list = []
    with torch.no_grad():
        for hs_data, _ in tqdm(hs_loader, desc="Extracting HS features"):
            hs_data = hs_data.to(device)
            hs_feat = hs_model(hs_data)
            hs_features_list.append(hs_feat.cpu())
            
    hs_features = torch.cat(hs_features_list)
    torch.save(hs_features, "hs_features.pt")
    print(f"HS features extracted and saved: {hs_features.shape}")

    # --- Setup Combined Dataset and Dataloader ---
    combined_dataset = HS_RGB_Dataset(hs_features, plant_dataset)
    combined_loader = DataLoader(combined_dataset, batch_size=BATCH_SIZE, shuffle=True, drop_last=True)
    
    # --- Initialize and Train the Combined Model ---
    print("\nTraining the combined model...")
    rgb_model = RGBResNet().to(device)
    combined_model = CombinedModel(rgb_model, final_classes=NUM_RGB_CLASSES).to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(combined_model.parameters(), lr=LR)
    
    for epoch in range(EPOCHS):
        combined_model.train()
        running_loss = 0.0
        for hs_feat, rgb_data, rgb_label in tqdm(combined_loader, desc=f"Epoch {epoch+1}/{EPOCHS}"):
            hs_feat, rgb_data, rgb_label = hs_feat.to(device), rgb_data.to(device), rgb_label.to(device)

            optimizer.zero_grad()
            outputs = combined_model(hs_feat, rgb_data)
            loss = criterion(outputs, rgb_label)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
        
        epoch_loss = running_loss / len(combined_loader)
        print(f"Epoch [{epoch+1}/{EPOCHS}] Loss: {epoch_loss:.4f}")

    # --- Save and Test the Model ---
    torch.save(combined_model.state_dict(), "combined_model.pth")
    print("\nTraining finished. Model saved as combined_model.pth")

    print("\n--- Testing the Model ---")
    test_loader = DataLoader(combined_dataset, batch_size=BATCH_SIZE, shuffle=False)
    combined_model.eval()
    all_predictions = []
    all_labels = []

    with torch.no_grad():
        for hs_feat, rgb_data, labels in tqdm(test_loader, desc="Testing"):
            hs_feat, rgb_data, labels = hs_feat.to(device), rgb_data.to(device), labels.to(device)
            
            outputs = combined_model(hs_feat, rgb_data)
            _, preds = torch.max(outputs, 1)
            
            all_predictions.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    accuracy = np.mean(np.array(all_predictions) == np.array(all_labels))
    print(f"\nTest Accuracy: {accuracy * 100:.2f}%")
    
    class_names = plant_dataset.classes
    print("\n--- Sample Predictions ---")
    for i in range(min(20, len(all_predictions))):
        pred_class = class_names[all_predictions[i]]
        true_class = class_names[all_labels[i]]
        print(f"Sample {i+1}: Predicted='{pred_class}', True='{true_class}'")

if __name__ == "__main__":
    main()