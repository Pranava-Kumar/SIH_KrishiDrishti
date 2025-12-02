from sqlalchemy.orm import Session
from .models import User, Upload, AnalysisResult, SensorData, FieldMetadata, Alert
from typing import Optional
import uuid
from datetime import datetime


def create_user(db: Session, username: str, email: str, hashed_password: str, full_name: str = None, role: str = "farmer"):
    """Create a new user in the database"""
    db_user = User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
        role=role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_id(db: Session, user_id: int):
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str):
    """Get user by username"""
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str):
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def create_upload(db: Session, filename: str, file_path: str, owner_id: int, upload_type: str = "image", original_filename: str = None, file_size: int = None, content_type: str = None):
    """Create a new upload record"""
    upload_id = str(uuid.uuid4())
    db_upload = Upload(
        upload_id=upload_id,
        filename=filename,
        original_filename=original_filename,
        file_path=file_path,
        file_size=file_size,
        content_type=content_type,
        owner_id=owner_id,
        upload_type=upload_type
    )
    db.add(db_upload)
    db.commit()
    db.refresh(db_upload)
    return db_upload


def get_upload_by_id(db: Session, upload_id: str):
    """Get upload by upload_id"""
    return db.query(Upload).filter(Upload.upload_id == upload_id).first()


def create_analysis_result(db: Session, upload_id: str, owner_id: int, prediction: str = None, 
                          confidence: float = None, recommendation: str = None, 
                          spectral_indices: str = None, risk_zones: str = None, alerts: str = None):
    """Create a new analysis result"""
    db_analysis = AnalysisResult(
        upload_id=upload_id,
        owner_id=owner_id,
        prediction=prediction,
        confidence=confidence,
        recommendation=recommendation,
        spectral_indices=spectral_indices,
        risk_zones=risk_zones,
        alerts=alerts
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    return db_analysis


def get_analysis_result_by_id(db: Session, upload_id: str):
    """Get analysis result by upload_id"""
    return db.query(AnalysisResult).filter(AnalysisResult.upload_id == upload_id).first()


def create_sensor_data(db: Session, upload_id: str, sensor_type: str, value: float, unit: str = None, 
                      location: str = None, timestamp: datetime = None):
    """Create sensor data record"""
    if timestamp is None:
        timestamp = datetime.utcnow()
    
    db_sensor = SensorData(
        upload_id=upload_id,
        sensor_type=sensor_type,
        value=value,
        unit=unit,
        location=location,
        timestamp=timestamp
    )
    db.add(db_sensor)
    db.commit()
    db.refresh(db_sensor)
    return db_sensor


def get_sensor_data_by_upload_id(db: Session, upload_id: str):
    """Get sensor data by upload_id"""
    return db.query(SensorData).filter(SensorData.upload_id == upload_id).all()


def create_field_metadata(db: Session, field_id: str, owner_id: int, field_name: str = None, 
                        location: str = None, area: float = None, crop_type: str = None, 
                        planting_date: datetime = None, expected_harvest_date: datetime = None, 
                        soil_type: str = None, irrigation_type: str = None, notes: str = None):
    """Create field metadata record"""
    db_field = FieldMetadata(
        field_id=field_id,
        owner_id=owner_id,
        field_name=field_name,
        location=location,
        area=area,
        crop_type=crop_type,
        planting_date=planting_date,
        expected_harvest_date=expected_harvest_date,
        soil_type=soil_type,
        irrigation_type=irrigation_type,
        notes=notes
    )
    db.add(db_field)
    db.commit()
    db.refresh(db_field)
    return db_field


def get_field_metadata_by_id(db: Session, field_id: str):
    """Get field metadata by field_id"""
    return db.query(FieldMetadata).filter(FieldMetadata.field_id == field_id).first()


def create_alert(db: Session, upload_id: str, owner_id: int, risk_type: str, risk_level: str, 
                zone: str = None, message: str = None, recommendation: str = None):
    """Create a new alert"""
    alert_id = str(uuid.uuid4())
    db_alert = Alert(
        alert_id=alert_id,
        upload_id=upload_id,
        owner_id=owner_id,
        risk_type=risk_type,
        risk_level=risk_level,
        zone=zone,
        message=message,
        recommendation=recommendation
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert


def get_alerts_by_upload_id(db: Session, upload_id: str):
    """Get alerts by upload_id"""
    return db.query(Alert).filter(Alert.upload_id == upload_id).all()


def get_unresolved_alerts_by_user(db: Session, user_id: int):
    """Get unresolved alerts for a user"""
    return db.query(Alert).filter(Alert.owner_id == user_id, Alert.resolved == False).all()