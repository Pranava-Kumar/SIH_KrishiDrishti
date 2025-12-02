# KrishiDrishti - Enterprise-Grade Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [API Endpoints](#api-endpoints)
4. [Database Schema](#database-schema)
5. [Frontend Components](#frontend-components)
6. [Deployment Guide](#deployment-guide)
7. [Testing Strategy](#testing-strategy)
8. [Security Measures](#security-measures)
9. [Performance Benchmarks](#performance-benchmarks)
10. [Monitoring & Logging](#monitoring-logging)

## Project Overview

KrishiDrishti is an AI-powered crop health monitoring application designed to help farmers identify crop diseases, pests, and health issues using hyperspectral imaging and machine learning algorithms. The application provides actionable recommendations for crop protection and yield optimization.

### Features:
- Hyperspectral and RGB image analysis
- Real-time crop health monitoring
- Risk zone identification
- Temporal trend analysis
- Interactive field mapping
- PDF report generation
- Sensor data integration
- User authentication and authorization

## Architecture

### Backend Architecture
The backend follows a modern microservice architecture pattern implemented with FastAPI:

```
app/
├── main.py              # Main application entry point
├── auth/                # Authentication modules
│   ├── utils.py         # Authentication utilities
│   ├── schemas.py       # Authentication schemas
│   └── routes.py        # Authentication routes
├── api/                 # API modules
│   ├── routes/          # API endpoint definitions
│   │   ├── upload.py    # Upload endpoints
│   │   ├── analysis.py  # Analysis endpoints
│   │   ├── spectral.py  # Spectral analysis endpoints
│   │   └── sensors.py   # Sensor data endpoints
│   └── utils/           # API utilities
│       ├── middleware.py # API middleware
│       └── validation.py # Request/response validation
├── core/                # Core business logic
│   ├── spectral_processor.py # Spectral processing
│   ├── risk_detector.py # Risk detection algorithms
│   ├── image_processor.py # Image processing
│   ├── ai_predictor.py  # AI prediction models
│   ├── sensor_generator.py # Sensor data generator
│   └── model_loader.py  # Model loading utilities
├── db/                  # Database modules
│   ├── __init__.py      # Database initialization
│   ├── models.py        # SQLAlchemy models
│   ├── config.py        # Database configuration
│   └── utils.py         # Database utilities
└── reports/             # PDF report generation
    └── pdf_generator.py # PDF generation utilities
```

### Frontend Architecture
The frontend is built with Next.js 15.5.4 following the App Router pattern:

```
app/
├── page.tsx             # Home page
├── layout.tsx           # Root layout
├── globals.css          # Global styles
├── upload/              # Upload page
├── dashboard/           # Dashboard page
├── field-map/           # Interactive field map
├── trends/              # Temporal trend charts
├── alerts/              # Alert management
├── reports/             # Report generation
└── analysis/            # Analysis results
```

## API Endpoints

### Authentication Endpoints
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### Upload Endpoints
- `POST /api/upload` - Upload an image file
- `POST /api/upload/hyperspectral` - Upload hyperspectral data

### Analysis Endpoints
- `POST /api/analyze/{upload_id}` - Run AI analysis
- `GET /api/results/{upload_id}` - Get analysis results
- `POST /api/analyze-risk/{upload_id}` - Analyze risk zones

### Spectral Analysis Endpoints
- `POST /api/spectral/analyze` - Analyze spectral data
- `GET /api/spectral/indices/{upload_id}` - Get spectral indices

### Sensor Data Endpoints
- `POST /api/sensors/generate` - Generate synthetic sensor data
- `GET /api/sensors/trends/{dataset_id}` - Get trend data
- `GET /api/sensors/data/{dataset_id}` - Get sensor data
- `POST /api/sensors/metadata` - Create field metadata

### Report Endpoints
- `GET /api/reports/{upload_id}` - Generate PDF report
- `POST /api/reports/generate` - Generate custom report

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'farmer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Uploads Table
```sql
CREATE TABLE uploads (
    id INTEGER PRIMARY KEY,
    upload_id VARCHAR(50) UNIQUE NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    content_type VARCHAR(50),
    owner_id INTEGER REFERENCES users(id),
    upload_type VARCHAR(50) DEFAULT 'image',
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Analysis Results Table
```sql
CREATE TABLE analysis_results (
    id INTEGER PRIMARY KEY,
    upload_id VARCHAR(50) UNIQUE NOT NULL,
    owner_id INTEGER REFERENCES users(id),
    prediction VARCHAR(100),
    confidence FLOAT,
    recommendation TEXT,
    spectral_indices TEXT,
    risk_zones TEXT,
    alerts TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sensor Data Table
```sql
CREATE TABLE sensor_data (
    id INTEGER PRIMARY KEY,
    upload_id VARCHAR(50) NOT NULL,
    sensor_type VARCHAR(50) NOT NULL,
    value FLOAT NOT NULL,
    unit VARCHAR(10),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Field Metadata Table
```sql
CREATE TABLE field_metadata (
    id INTEGER PRIMARY KEY,
    field_id VARCHAR(50) UNIQUE NOT NULL,
    owner_id INTEGER REFERENCES users(id),
    field_name VARCHAR(100),
    location VARCHAR(100),
    area FLOAT,
    crop_type VARCHAR(50),
    planting_date TIMESTAMP,
    expected_harvest_date TIMESTAMP,
    soil_type VARCHAR(50),
    irrigation_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Alerts Table
```sql
CREATE TABLE alerts (
    id INTEGER PRIMARY KEY,
    alert_id VARCHAR(50) UNIQUE NOT NULL,
    upload_id VARCHAR(50) NOT NULL,
    owner_id INTEGER REFERENCES users(id),
    risk_type VARCHAR(50) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    zone VARCHAR(100),
    message TEXT,
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP
);
```

## Frontend Components

### Core Components
- `Card` - Reusable UI card component
- `Button` - Styled button component
- `Select` - Custom dropdown component
- `Input` - Form input fields
- `Label` - Form labels
- `Table` - Data table component

### Map Components
- `MapContainer` - Interactive map container
- `ImageOverlay` - Overlay for spectral maps
- `GeoJSON` - Vector layers for risk zones

### Chart Components
- `LineChart` - Trend visualization
- `BarChart` - Comparative analysis
- `AreaChart` - Cumulative data visualization

## Deployment Guide

### Backend Deployment

1. **Environment Setup**
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

2. **Environment Variables**
   ```bash
   # Create .env file
   DATABASE_URL="postgresql://username:password@localhost/krishidrishti"
   SECRET_KEY="your-very-secure-secret-key"
   ALGORITHM="HS256"
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

3. **Database Migration**
   ```bash
   # Initialize and run database migrations
   python -c "from app.db.config import engine; from app.db.models import Base; Base.metadata.create_all(bind=engine)"
   ```

4. **Run Application**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Deployment

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Run Application**
   ```bash
   npm run start
   ```

## Testing Strategy

### Backend Testing
- Unit tests for core modules
- Integration tests for API endpoints
- Database tests with pytest
- Performance tests

### Frontend Testing
- Component unit tests with Jest
- Integration tests with React Testing Library
- End-to-end tests with Playwright

## Security Measures

### Authentication & Authorization
- JWT-based authentication with secure signing
- Role-based access control
- Password hashing with bcrypt
- Rate limiting to prevent abuse

### Data Protection
- Input validation and sanitization
- SQL injection prevention with ORM
- Cross-site request forgery (CSRF) protection
- Secure file upload handling

### API Security
- HTTPS enforcement
- CORS policy configuration
- API rate limiting
- Request/response validation

## Performance Benchmarks

### Backend Performance
- API response time: < 300ms for simple requests
- Analysis processing time: < 5s for hyperspectral data
- Database query time: < 100ms for indexed queries

### Frontend Performance
- Initial page load: < 2s
- Interactive map rendering: < 500ms
- Chart rendering: < 300ms
- Bundle size: < 2MB for initial load