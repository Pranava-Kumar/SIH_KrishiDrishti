# FarmAndCare (KrishiDrishti) Project - QWEN Context

## Project Overview

FarmAndCare (also known as KrishiDrishti) is a full-stack AI-powered crop health monitoring application. The project consists of:

- **Backend**: A FastAPI server that handles image uploads, runs AI analysis using a pre-trained PyTorch model, and provides API endpoints
- **Frontend**: A Next.js application that provides a user interface for uploading crop images and viewing AI analysis results
- **AI Component**: Uses PyTorch and spectral analysis to assess crop health from RGB images

The application is designed to help farmers upload images of their crops to get instant AI analysis for potential diseases or health issues, along with actionable recommendations to protect their yield.

## Architecture

### Backend (FastAPI)
- Located in the `backend/` directory
- Built with FastAPI framework
- Handles image uploads, AI model inference, and result storage
- API endpoints include:
  - `GET /`: Root message
  - `GET /health`: Health check
  - `POST /api/upload`: Upload an RGB image and return an upload_id
  - `POST /api/analyze/{upload_id}`: Run AI analysis on uploaded image
  - `GET /api/results/{upload_id}`: Retrieve analysis results

### Frontend (Next.js)
- Located in the `frontend/` directory
- Built with Next.js 15.5.4 and React 19
- Provides a user-friendly interface for crop health monitoring
- Includes features like image upload, progress tracking, and results visualization
- Uses Tailwind CSS for styling and Radix UI components

## Building and Running

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd farmalandcare/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Ensure model files are present in `data/models/` directory:
   - `combined_model.pth`
   - `hs_features.pt`

5. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The server will run on `http://127.0.0.1:8000`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd farmalandcare/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

## Key Files and Directories

### Backend Structure
- `app/main.py`: Main FastAPI application instance and configuration
- `app/api/routes/`: API routes for upload and analysis endpoints
- `app/core/`: Core application logic including model loading, image processing, and AI prediction
- `app/utils/`: Utility functions for file handling
- `data/models/`: Contains the trained PyTorch model and hyperspectral features
- `data/uploads/`: Temporary storage for user-uploaded files
- `data/results/`: Storage for analysis results as JSON files

### Frontend Structure
- `app/page.tsx`: Home page component with main application entry point
- `app/upload`: Upload page for crop image submission
- `components/`: Reusable UI components
- `lib/`: Utility functions and business logic
- `public/`: Static assets

## Dependencies

### Backend Dependencies
- fastapi
- uvicorn
- torch (PyTorch)
- torchvision
- spectral
- pillow
- numpy
- pandas
- python-multipart

### Frontend Dependencies
- next (15.5.4)
- react (19.1.0)
- react-dom (19.1.0)
- @radix-ui/react components
- tailwindcss
- typescript
- lucide-react (icon library)
- recharts (charting library)

## Development Conventions

- The backend uses file-based storage for uploads and results (suitable for MVP)
- The AI model and pre-computed features are loaded into memory when the server starts
- CORS is configured to allow all origins (should be restricted for production)
- Frontend follows Next.js App Router conventions
- Type checking is enforced with TypeScript in the frontend
- Styling uses Tailwind CSS with a utility-first approach

## Notes

- This is an MVP-level application focused on crop health analysis
- The AI component uses a simplified approach for selecting hyperspectral features
- The backend API is documented at `http://127.0.0.1:8000/docs` when running
- The project has both a "farmalandcare" and "KrishiDrishti" identity in documentation
- Model files need to be manually placed in the correct directory for the backend to function