from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from . import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="farmer")  # farmer, agronomist, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    uploads = relationship("Upload", back_populates="owner")
    analyses = relationship("AnalysisResult", back_populates="owner")
    

class Upload(Base):
    __tablename__ = "uploads"

    id = Column(Integer, primary_key=True, index=True)
    upload_id = Column(String, unique=True, index=True, nullable=False)
    filename = Column(String, nullable=False)
    original_filename = Column(String)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer)  # in bytes
    content_type = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    upload_type = Column(String, default="image")  # image, hyperspectral, sensor_data
    metadata = Column(Text)  # JSON metadata as string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="uploads")
    analysis_results = relationship("AnalysisResult", back_populates="upload")
    sensor_data = relationship("SensorData", back_populates="upload")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    upload_id = Column(String, unique=True, index=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    prediction = Column(String)
    confidence = Column(Float)
    recommendation = Column(Text)
    spectral_indices = Column(Text)  # JSON as string
    risk_zones = Column(Text)  # JSON as string
    alerts = Column(Text)  # JSON as string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="analyses")
    upload = relationship("Upload", back_populates="analysis_results")


class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    upload_id = Column(String, index=True, nullable=False)  # Reference to upload
    sensor_type = Column(String, nullable=False)  # soil_moisture, temperature, humidity, etc.
    value = Column(Float, nullable=False)
    unit = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    location = Column(String)  # GPS coordinates as string "lat,lng"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    upload = relationship("Upload", back_populates="sensor_data")


class FieldMetadata(Base):
    __tablename__ = "field_metadata"

    id = Column(Integer, primary_key=True, index=True)
    field_id = Column(String, unique=True, index=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    field_name = Column(String)
    location = Column(String)  # GPS coordinates as string "lat,lng"
    area = Column(Float)  # in hectares
    crop_type = Column(String)
    planting_date = Column(DateTime(timezone=True))
    expected_harvest_date = Column(DateTime(timezone=True))
    soil_type = Column(String)
    irrigation_type = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String, unique=True, index=True, nullable=False)
    upload_id = Column(String, index=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    risk_type = Column(String, nullable=False)  # pest_risk, disease_risk, stress, etc.
    risk_level = Column(String, nullable=False)  # low, medium, high
    zone = Column(String)  # specific field zone
    message = Column(Text)
    recommendation = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    owner = relationship("User")