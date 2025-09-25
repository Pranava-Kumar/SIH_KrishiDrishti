# KrishiDrishti - AI-Powered Crop Health Monitoring

KrishiDrishti is an AI-powered crop health monitoring application designed to help farmers identify plant diseases and health issues using RGB images. The application combines hyperspectral and RGB data analysis to provide accurate diagnosis and treatment recommendations.

## 🌾 Features

- **AI-powered Analysis**: Uses a combined model with ResNet architecture and hyperspectral features
- **Image Upload**: Allows farmers to upload images of their crops
- **Disease Detection**: Identifies common plant diseases and health issues
- **Confidence Levels**: Provides confidence scores for predictions
- **Actionable Recommendations**: Offers treatment suggestions based on detected conditions
- **User-friendly Interface**: Simple upload and analysis process for farmers
- **Report Generation**: Creates detailed reports of the analysis

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with Pydantic models
- **AI Model**: Combined model using ResNet18 for RGB processing and CNN for hyperspectral features
- **Endpoints**:
  - `POST /api/upload`: Upload crop images
  - `POST /api/analyze/{upload_id}`: Trigger AI analysis
  - `GET /api/results/{upload_id}`: Retrieve results
  - `GET /health`: Health check
- **File Handling**: Asynchronous file operations with upload/result storage

### Frontend (Next.js)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with Radix UI components
- **Pages**:
  - Home page with introduction
  - Upload page for image submission
  - Analysis page for results display
  - Report page for detailed information
- **API Integration**: Fetch-based API calls to backend

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- Git

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/Pranava-Kumar/SIH_KrishiDrishti.git
cd SIH_KrishiDrishti
```

2. **Navigate to backend and install dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

3. **Navigate to frontend and install dependencies**:
```bash
cd ../frontend
npm install
```

### Running the Application

You can use the provided batch file to easily run the application:

```bash
start_app.bat
```

This will present you with options:
- Option 1: Run only the frontend
- Option 2: Run only the backend
- Option 3: Run both frontend and backend
- Option 4: Build frontend, typecheck, and lint
- Option 5: Check backend for errors
- Option 6: Exit

Or run manually:

1. **Start the backend**:
```bash
cd backend
uvicorn app.main:app --reload
```

2. **Start the frontend**:
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🧠 Model Architecture

The AI model combines:
- **RGB Processing**: ResNet18-based model for image feature extraction
- **Hyperspectral Features**: Pre-computed features from hyperspectral data
- **Combined Classifier**: Neural network that combines both feature types for final classification
- **Output**: 15 different plant disease classes

The model was trained on the PlantVillage dataset with additional hyperspectral data for enhanced accuracy.

## 📁 Project Structure

```
farmalandcare/
├── backend/                 # FastAPI backend server
│   ├── app/                 # Application code
│   │   ├── api/             # API routes and models
│   │   ├── core/            # Core logic (model, image processing)
│   │   └── utils/           # Utility functions
│   └── data/                # Model files and storage
├── frontend/                # Next.js frontend application
│   ├── app/                 # App router pages
│   ├── components/          # Reusable UI components
│   └── lib/                 # Utility functions
├── notebooks/               # Jupyter notebooks
├── scripts/                 # Python scripts
└── start_app.bat            # Batch file for running application
```

## 📊 Supported Classes

The model can identify 15 different crop health conditions:
- Apple: Apple scab, Black rot, Cedar apple rust, healthy
- Cherry: Powdery mildew, healthy
- Corn: Common rust, Northern Leaf Blight, healthy
- Grape: Black rot, healthy
- Potato: Early blight, Late blight, healthy
- Tomato: Bacterial spot, Early blight, Late blight, Leaf Mold, Septoria leaf spot, Spider mites, Target Spot, Yellow Leaf Curl Virus, Mosaic virus, healthy

## 🛠️ Development

### Backend Development
- All API endpoints follow REST principles
- Input validation using Pydantic models
- Asynchronous file handling
- Proper error handling and logging

### Frontend Development
- Next.js App Router
- TypeScript for type safety
- Responsive design with Tailwind CSS
- Component-based architecture

## 💡 Usage

1. Visit the home page and click "Start Analysis"
2. Upload an image of your crop (JPG, PNG)
3. Wait for the AI analysis to complete
4. View the results including:
   - Predicted condition
   - Confidence level
   - Recommended treatments
5. Optionally generate a detailed report

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is part of the SIH (Smart India Hackathon) 2025 initiative.

## 📞 Support

For support, please open an issue on the GitHub repository.

---

<div align="center">

**KrishiDrishti** - Empowering Farmers with AI  
*For SIH 2025*

</div>