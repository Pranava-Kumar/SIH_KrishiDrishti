🌾 KrishiDrishti – Minimum Viable Product (MVP) Specification
SIH 2025 | Problem Statement: AI-powered monitoring of crop health, soil condition, and pest risks using multispectral/hyperspectral imaging and sensor data
Issued by: MathWorks India Pvt Ltd
Theme: Agriculture, FoodTech & Rural Development
Team: [Your Team Name]
Date: 25 September 2025

🎯 1. MVP Vision
Build a web-first, open-source prototype that demonstrates the core capabilities of the MathWorks-specified solution—without requiring MATLAB—using Python + Next.js to deliver:

Hyperspectral/multispectral image processing
AI-driven crop stress and pest risk detection
Interactive dashboard with actionable insights
✅ Key Alignment: While built in Python, this MVP mirrors the functionality of MathWorks' Hyperspectral Imaging Library, Deep Learning Toolbox, and Image Processing Toolbox using open-source equivalents. 

🧩 2. Core Features (MVP Scope)
✅ Included in MVP
Hyperspectral Data Upload
Upload ENVI/TIFF hyperspectral files via web UI
Enables field-level analysis
Spectral Index Computation
Auto-compute NDVI, NDRE, MSI, SAVI
Quantifies crop health objectively
AI-Powered Risk Detection
CNN model detects stress/pest zones from spectral data
Early warning 7–10 days before visible symptoms
Interactive Field Map
Visualize RGB, NDVI, and risk heatmaps in browser
Intuitive spatial understanding
Temporal Trend Charts
Plot NDVI + synthetic sensor data over time
Track crop health progression
Actionable Alerts
"High aphid risk in Zone 3 – Spray Imidacloprid 17.8% SL"
Clear, localized recommendations
PDF Report Export
Generate printable field health report
Share with agronomists or input dealers

❌ Excluded from MVP (Phase 2+)
Real-time IoT sensor integration but use simulated sensor data using python scripts to geenerate the suimulated sensor data.
SMS/IVR alerts for feature phones
Mobile app (Flutter/React Native)
Voice report processing
Multi-field farm management
Live drone/satellite data ingestion

🗃️ 3. Data Strategy
Input Data (Simulated + Public)
Hyperspectral Imagery
Honghu Dataset
ENVI (.hdr + .dat)
385 bands, 270+ crop samples
Multispectral Imagery
Simulated DJI Mavic 3 data
GeoTIFF
5 bands: RGB + NIR + Red Edge
Sensor Data
Synthetic generation
CSV
Soil moisture, temp, humidity (daily)
Field Metadata
Manual input via UI
JSON
Crop type, planting date, boundaries

💡 Why this works: Public datasets validate technical capability; synthetic data ensures reproducibility. 

⚙️ 4. Technical Architecture
Backend (Python)
Framework
FastAPI
REST API with async support
Spectral Processing
spectral
,
rasterio
,
opencv-python
Load ENVI/TIFF, compute indices
AI Models
TensorFlow/Keras
CNN for spatial risk detection
Data Fusion
pandas
Align spectral + sensor time-series
Storage
Local filesystem
Store uploaded/processed files
Task Queue
Celery (optional)
Background processing for large files

Frontend (Next.js)
Framework
Next.js 14 (App Router)
SSR, file-based routing
Styling
TailwindCSS + shadcn/ui
Responsive, accessible UI
Charts
Recharts
NDVI trends, sensor data
Image Viewer
react-image-mapper
Interactive field map with zones
State
React Context
Manage field data across pages
API Client
Axios
Connect to FastAPI backend

Deployment (Phase 1)
Backend: Run locally or on Render/Vercel (serverless)
Frontend: Vercel (free tier)
No database required (file-based storage)
🔁 5. End-to-End User Flow
SVG content

Key Screens
Upload Page: Drag-and-drop ENVI/TIFF + CSV
Dashboard: Health score, risk level, recent alerts
Field Map: Toggle between RGB / NDVI / Risk Map
Trends: Line charts for NDVI + synthetic sensor data
Alerts: List of detected issues with recommended actions
Report: Printable PDF with maps, charts, and advice
🧪 6. Validation & Metrics
Technical Validation
Spectral Index Accuracy
>95% match with MATLAB
Compare NDVI output with reference
CNN Detection Accuracy
>85% on Honghu dataset
Standard classification metrics
Processing Time
<30 sec for 100MB file
Local benchmark
Web Load Time
<2 sec dashboard load
Lighthouse audit

SIH Alignment Check
Hyperspectral Imaging Library
spectral
+
rasterio
for ENVI/TIFF
Spectral Indices
Custom NDVI/NDRE/MSI functions
Deep Learning Toolbox
TensorFlow CNN for classification
Interactive Dashboard
Next.js + Recharts + Image Mapper
Sensor Data Fusion
Pandas time-series alignment

📅 7. 4-Week MVP Roadmap
Week 1: Core Processing Engine
Set up FastAPI project
Implement ENVI/TIFF loader (spectral)
Compute NDVI, NDRE, MSI
Generate static health maps (matplotlib → base64)
Week 2: AI Integration
Train CNN on Honghu dataset (TensorFlow)
Implement risk zone detection
Add synthetic sensor data generator
Build data fusion pipeline (pandas)
Week 3: Web Dashboard
Create Next.js app with Tailwind
Build upload page + dashboard layout
Integrate Recharts for trends
Implement image viewer for field maps
Week 4: Integration & Demo
Connect frontend ↔ backend APIs
Add PDF report generation (react-pdf)
Test with 3 public datasets
Record demo video + prepare SIH submission
📦 8. Deliverables for SIH
Working Web Prototype
URL hosted on Vercel
Source code on GitHub (public)
Demo Video (3–5 mins)
Upload hyperspectral file → view dashboard → export report
Explain how it mirrors MathWorks functionality
Technical Report
Architecture diagram
Validation metrics
SIH alignment statement
GitHub Repository
/backend: FastAPI code
/frontend: Next.js app
/notebooks: Model training notebooks
MVP.md: This document
💡 9. Why This MVP Wins
MathWorks-Aligned: Demonstrates equivalent functionality using open tools
Farmer-Centric: Focuses on actionable insights, not just tech
Reproducible: Uses public datasets + open-source stack
Scalable: Architecture supports future SMS/mobile/IVR
SIH-Ready: Clear validation against problem statement requirements
🌾 Final Message: "We built an accessible, open-source alternative that proves the MathWorks vision can be realized without proprietary software—making precision agriculture truly inclusive."