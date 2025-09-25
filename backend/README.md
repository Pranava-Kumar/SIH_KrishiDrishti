# KrishiDrishti Backend

This directory contains the FastAPI backend server for the KrishiDrishti MVP. It handles image uploads, runs the AI analysis using a pre-trained PyTorch model, and provides API endpoints for the frontend.

## Project Structure

- `app/`: Main FastAPI application code.
  - `main.py`: FastAPI application instance and configuration.
  - `api/`: API routes and models.
    - `routes/`: Upload and analysis endpoints.
    - `models/`: Pydantic models for request/response validation.
  - `core/`: Core application logic.
    - `model_loader.py`: Loads the trained PyTorch model and hyperspectral features.
    - `image_processor.py`: Preprocesses uploaded RGB images.
    - `ai_predictor.py`: Runs the analysis pipeline.
  - `utils/`: Utility functions.
    - `file_handler.py`: Handles file saving and loading.
- `data/`: Data storage directory.
  - `models/`: Contains `combined_model.pth` and `hs_features.pt`.
  - `uploads/`: Stores user-uploaded files temporarily.
  - `results/`: Stores analysis results as JSON files.
- `requirements.txt`: Python dependencies.

## Setup

1.  **Navigate to the Backend Directory:**
    ```bash
    cd farmalandcare/backend
    ```

2.  **Create a Virtual Environment (Recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Ensure Model Files are Present:**
    Verify that `combined_model.pth` and `hs_features.pt` are located in `data/models/`.

## Running the Server

1.  **Ensure you are in the `backend` directory and your virtual environment is activated.**

2.  **Start the Uvicorn server:**
    ```bash
    # Using the main.py entry point
    uvicorn app.main:app --reload

    # Or if you have the main.py script set up to run directly:
    # python -m uvicorn app.main:app --reload
    ```
    The server will start on `http://127.0.0.1:8000` by default. Check the console output for the exact address.

3.  **Access the API:**
    - API documentation will be available at `http://127.0.0.1:8000/docs`.
    - The root endpoint is `http://127.0.0.1:8000/`.
    - The health check endpoint is `http://127.0.0.1:8000/health`.

## API Endpoints

- `GET /`: Root message.
- `GET /health`: Health check.
- `POST /api/upload`: Upload an RGB image. Returns an `upload_id`.
- `POST /api/analyze/{upload_id}`: Run AI analysis on the uploaded image identified by `upload_id`. Returns the analysis result.
- `GET /api/results/{upload_id}`: Retrieve the analysis result for a given `upload_id`.

## Notes

- The server uses file-based storage for uploads and results, suitable for the MVP.
- The AI model (`combined_model.pth`) and pre-computed features (`hs_features.pt`) are loaded into memory when the server starts.
- The analysis currently uses a simplified approach for selecting hyperspectral features.