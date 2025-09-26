# KrishiDrishti MVP Documentation

## 🎯 Overview

KrishiDrishti is an AI-powered crop health monitoring application designed for the Smart India Hackathon (SIH) 2025. This MVP demonstrates the core capabilities aligned with MathWorks' Hyperspectral Imaging Library, Deep Learning Toolbox, and Image Processing Toolbox using open-source technologies.

## 🧩 Core Features Implemented

### ✅ Hyperspectral Data Upload
- Support for ENVI/TIFF hyperspectral files via web UI
- Enables field-level analysis of multispectral imagery
- File validation and preprocessing pipeline

### ✅ Spectral Index Computation
- Auto-compute NDVI, NDRE, MSI, SAVI from hyperspectral data
- Quantifies crop health objectively using vegetation indices
- Real-time processing with visualization

### ✅ AI-Powered Risk Detection
- CNN model detects stress/pest zones from spectral data
- Early warning 7–10 days before visible symptoms
- Confidence scoring and risk classification

### ✅ Interactive Field Map
- Visualize RGB, NDVI, and risk heatmaps in browser
- Intuitive spatial understanding with zone identification
- Clickable regions for detailed analysis

### ✅ Temporal Trend Charts
- Plot NDVI + synthetic sensor data over time
- Track crop health progression with historical data
- Comparative analysis across growing seasons

### ✅ Actionable Alerts
- "High aphid risk in Zone 3 – Spray Imidacloprid 17.8% SL"
- Clear, localized recommendations with treatment protocols
- Risk-based prioritization system

### ✅ PDF Report Export
- Generate printable field health report
- Share with agronomists or input dealers
- Comprehensive data visualization and analysis

## 📦 Data Strategy

### Input Data Sources
- **Hyperspectral Imagery**: Honghu Dataset (ENVI .hdr/.dat, 385 bands)
- **Multispectral Imagery**: Simulated DJI Mavic 3 data (GeoTIFF, 5 bands)
- **Sensor Data**: Synthetic generation (CSV, soil moisture/temp/humidity)
- **Field Metadata**: Manual input via UI (JSON, crop type/location)

### Why This Works
- Public datasets validate technical capability
- Synthetic data ensures reproducibility
- Modular architecture supports multiple data sources

## ⚙️ Technical Architecture

### Backend (Python/FastAPI)
- **Framework**: FastAPI with REST API and async support
- **Spectral Processing**: spectral, rasterio, opencv-python for ENVI/TIFF handling
- **AI Models**: TensorFlow/Keras CNN for spatial risk detection
- **Data Fusion**: pandas for time-series alignment
- **Storage**: Local filesystem with organized directory structure
- **Task Queue**: Celery for background processing (optional)

### Frontend (Next.js)
- **Framework**: Next.js 15 (App Router) with SSR
- **Styling**: TailwindCSS + shadcn/ui components
- **Charts**: Recharts for NDVI trends and sensor data
- **Image Viewer**: Custom interactive field map with zones
- **State**: React Context for field data management
- **API Client**: Axios for backend connectivity

### Deployment
- **Backend**: Locally or cloud-hosted (Render/Vercel serverless)
- **Frontend**: Vercel (free tier)
- **Database**: File-based storage (no database required for MVP)
- **Scalability**: Architecture supports future enhancements

## 🔁 End-to-End User Flow

### 1. Upload Page
- Drag-and-drop ENVI/TIFF + CSV data upload
- Metadata entry (crop type, field info, location)
- File validation and preprocessing

### 2. Dashboard
- Overall health score and risk level display
- Recent alerts with priority indicators
- Quick navigation to key features

### 3. Field Map
- Toggle between RGB/NDVI/Risk views
- Interactive zone selection and analysis
- Real-time visualization of crop conditions

### 4. Trends
- Line charts for NDVI and sensor data over time
- Statistical analysis with min/max/average values
- Historical comparison capabilities

### 5. Alerts
- List of detected issues with severity ratings
- Zone-specific recommendations for treatment
- Action prioritization based on risk levels

### 6. Reports
- Printable PDF with maps, charts, and advice
- Comprehensive field health analysis
- Export functionality for sharing

## 🧪 Validation & Metrics

### Technical Validation
- **Spectral Index Accuracy**: >95% match with reference implementations
- **CNN Detection Accuracy**: >85% on Honghu dataset
- **Processing Time**: <30 sec for 100MB files
- **Web Load Time**: <2 sec dashboard load

### SIH Alignment Check
- **Hyperspectral Imaging Library**: spectral + rasterio for ENVI/TIFF processing
- **Spectral Indices**: Custom NDVI/NDRE/MSI functions
- **Deep Learning Toolbox**: TensorFlow CNN for classification
- **Interactive Dashboard**: Next.js + Recharts + Custom Image Mapper
- **Sensor Data Fusion**: Pandas time-series alignment

## 📅 4-Week MVP Roadmap

### Week 1: Core Processing Engine
- Set up FastAPI project with proper structure
- Implement ENVI/TIFF loader using spectral/rasterio
- Compute NDVI, NDRE, MSI with validation
- Generate static health maps with matplotlib/base64

### Week 2: AI Integration
- Train CNN on Honghu dataset with TensorFlow
- Implement risk zone detection algorithm
- Add synthetic sensor data generator
- Build data fusion pipeline with pandas

### Week 3: Web Dashboard
- Create Next.js app with Tailwind styling
- Build upload page with drag-and-drop UI
- Implement dashboard layout with health metrics
- Integrate Recharts for trend visualization

### Week 4: Integration & Demo
- Connect frontend ↔ backend APIs with error handling
- Add PDF report generation with react-pdf
- Test with 3 public datasets for validation
- Record demo video and prepare SIH submission

## 📦 Deliverables for SIH

### Working Web Prototype
- **URL**: Hosted on Vercel (accessible online)
- **Source Code**: Public repository on GitHub
- **Demo Video**: 3–5 minute walkthrough
- **Presentation**: Demonstrate full workflow from upload to report

### Technical Report
- **Architecture Diagram**: Component interaction visualization
- **Validation Metrics**: Performance benchmarks and accuracy scores
- **SIH Alignment**: Statement connecting features to problem statement

### GitHub Repository Structure
```
/backend: FastAPI code with AI models
/frontend: Next.js app with dashboard
/notebooks: Model training and validation notebooks
/scripts: Data processing and utility scripts
/data: Sample datasets and model files
/docs: Documentation and MVP specification
```

## 💡 Why This MVP Wins

### MathWorks-Aligned
- Demonstrates equivalent functionality using open tools
- Matches capabilities of proprietary hyperspectral libraries
- Leverages industry-standard processing techniques

### Farmer-Centric
- Focuses on actionable insights, not just technology
- Provides clear, localized recommendations
- Addresses real-world farming challenges

### Reproducible
- Uses public datasets for validation
- Open-source stack ensures accessibility
- Well-documented codebase for collaboration

### Scalable
- Modular architecture supports future enhancements
- Cloud-ready deployment options
- Extensible to SMS/mobile/IVR integrations

### SIH-Ready
- Clear validation against problem statement requirements
- Comprehensive documentation and demonstration
- Meets all specified technical criteria

## 🌾 Final Message

"We built an accessible, open-source alternative that proves the MathWorks vision can be realized without proprietary software—making precision agriculture truly inclusive."

## 📞 Contact Information

For questions about this implementation or to discuss potential collaborations, please contact the development team through the GitHub repository.