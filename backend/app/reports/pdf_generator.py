"""
PDF Report Generation for KrishiDrishti
This module handles PDF report generation for crop health analysis
"""
import io
import json
from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from app.db.config import get_db
from app.db import utils as db_utils
from app.core import spectral_processor
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def generate_pdf_report(analysis_data: Dict[str, Any]) -> io.BytesIO:
    """
    Generate a PDF report from analysis data
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Center', alignment=TA_CENTER))
    styles.add(ParagraphStyle(name='ReportTitle', fontSize=20, alignment=TA_CENTER, spaceAfter=30))
    styles.add(ParagraphStyle(name='SectionTitle', fontSize=14, spaceAfter=12, spaceBefore=18))
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Title
    title = Paragraph("KrishiDrishti Crop Health Analysis Report", styles['ReportTitle'])
    elements.append(title)
    
    # Add a spacer
    elements.append(Spacer(1, 20))
    
    # Summary section
    elements.append(Paragraph("Analysis Summary", styles['SectionTitle']))
    
    # Summary data
    summary_data = [
        ["Field ID", analysis_data.get("field_id", "N/A")],
        ["Analysis Date", analysis_data.get("timestamp", datetime.utcnow().isoformat())],
        ["Crop Type", analysis_data.get("crop_type", "N/A")],
        ["Location", analysis_data.get("location", "N/A")]
    ]
    
    summary_table = Table(summary_data, colWidths=[2*inch, 4*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(summary_table)
    
    # Analysis results
    elements.append(Paragraph("Analysis Results", styles['SectionTitle']))
    
    # Prediction and confidence
    prediction_data = [
        ["Prediction", analysis_data.get("prediction", "N/A")],
        ["Confidence", f"{analysis_data.get('confidence', 0):.2f}"],
        ["Recommendation", analysis_data.get("recommendation", "N/A")]
    ]
    
    prediction_table = Table(prediction_data, colWidths=[2*inch, 4*inch])
    prediction_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(prediction_table)
    
    # Spectral indices
    if "spectral_indices" in analysis_data:
        elements.append(Paragraph("Spectral Indices", styles['SectionTitle']))
        
        indices_data = []
        indices = analysis_data["spectral_indices"]
        
        # Add indices to table
        if "ndvi" in indices:
            avg_ndvi = sum(indices["ndvi"][:10]) / len(indices["ndvi"][:10]) if indices["ndvi"] else 0
            indices_data.append(["NDVI (Avg)", f"{avg_ndvi:.3f}"])
        if "ndre" in indices:
            avg_ndre = sum(indices["ndre"][:10]) / len(indices["ndre"][:10]) if indices["ndre"] else 0
            indices_data.append(["NDRE (Avg)", f"{avg_ndre:.3f}"])
        if "msi" in indices:
            avg_msi = sum(indices["msi"][:10]) / len(indices["msi"][:10]) if indices["msi"] else 0
            indices_data.append(["MSI (Avg)", f"{avg_msi:.3f}"])
        if "savi" in indices:
            avg_savi = sum(indices["savi"][:10]) / len(indices["savi"][:10]) if indices["savi"] else 0
            indices_data.append(["SAVI (Avg)", f"{avg_savi:.3f}"])
        if "evi" in indices:
            avg_evi = sum(indices["evi"][:10]) / len(indices["evi"][:10]) if indices["evi"] else 0
            indices_data.append(["EVI (Avg)", f"{avg_evi:.3f}"])
        
        if indices_data:
            indices_table = Table(indices_data, colWidths=[2*inch, 4*inch])
            indices_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(indices_table)
    
    # Risk zones
    if "risk_zones" in analysis_data:
        elements.append(Paragraph("Risk Zones", styles['SectionTitle']))
        
        risk_zones = analysis_data["risk_zones"]
        if risk_zones:
            risk_data = [["Zone ID", "Risk Level", "Risk Type", "Area (ha)", "Avg NDVI"]]
            
            for zone in risk_zones[:5]:  # Limit to first 5 zones for the report
                risk_data.append([
                    zone.get("id", "N/A"),
                    zone.get("risk_level", "N/A").title(),
                    zone.get("risk_type", "N/A").replace("_", " ").title(),
                    f"{zone.get('area_pixels', 0) / 10000:.2f}",  # Convert pixels to hectares roughly
                    f"{zone.get('avg_ndvi', 0):.3f}"
                ])
            
            risk_table = Table(risk_data, colWidths=[1.2*inch, 1.2*inch, 1.5*inch, 1*inch, 1.1*inch])
            risk_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(risk_table)
    
    # Alerts
    if "alerts" in analysis_data:
        elements.append(Paragraph("Alerts", styles['SectionTitle']))
        
        alerts = analysis_data["alerts"]
        if alerts:
            for alert in alerts[:3]:  # Limit to first 3 alerts
                alert_text = f"<b>Zone:</b> {alert.get('zone_id', 'N/A')} | " \
                             f"<b>Risk Type:</b> {alert.get('risk_type', 'N/A')} | " \
                             f"<b>Level:</b> {alert.get('risk_level', 'N/A').title()} | " \
                             f"<b>Rec.:</b> {alert.get('recommendation', 'N/A')[:50]}..."
                elements.append(Paragraph(alert_text, styles['Normal']))
                elements.append(Spacer(1, 8))
    
    # Recommendations
    elements.append(Paragraph("Recommendations", styles['SectionTitle']))
    
    recommendation_text = analysis_data.get("recommendation", "No specific recommendations available.")
    elements.append(Paragraph(recommendation_text, styles['Normal']))
    
    # Build the PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer


@router.get("/reports/{upload_id}")
async def get_pdf_report(upload_id: str):
    """
    Generate and return a PDF report for a given upload ID
    """
    try:
        # Get analysis result from database
        db = next(get_db())
        analysis_result = db_utils.get_analysis_result_by_id(db, upload_id)
        
        if not analysis_result:
            raise HTTPException(status_code=404, detail="Analysis result not found")
        
        # Convert analysis result to dict for PDF generation
        analysis_data = {
            "upload_id": analysis_result.upload_id,
            "prediction": analysis_result.prediction,
            "confidence": analysis_result.confidence,
            "recommendation": analysis_result.recommendation,
            "timestamp": analysis_result.updated_at.isoformat() if analysis_result.updated_at else datetime.utcnow().isoformat()
        }
        
        # Parse spectral indices and alerts from stored JSON
        if analysis_result.spectral_indices:
            try:
                analysis_data["spectral_indices"] = json.loads(analysis_result.spectral_indices)
            except json.JSONDecodeError:
                analysis_data["spectral_indices"] = {}
        
        if analysis_result.alerts:
            try:
                analysis_data["alerts"] = json.loads(analysis_result.alerts)
            except json.JSONDecodeError:
                analysis_data["alerts"] = []
        
        # Parse risk zones from stored JSON
        if analysis_result.risk_zones:
            try:
                analysis_data["risk_zones"] = json.loads(analysis_result.risk_zones)
            except json.JSONDecodeError:
                analysis_data["risk_zones"] = []
        
        # Add field metadata if available
        # We would fetch field metadata based on the upload
        # For now, we'll use placeholder data
        analysis_data["field_id"] = "FIELD001"
        analysis_data["crop_type"] = "Corn"
        analysis_data["location"] = "Sample Field Location"
        
        # Generate PDF
        pdf_buffer = generate_pdf_report(analysis_data)
        
        # Create response
        response = StreamingResponse(pdf_buffer, media_type="application/pdf")
        response.headers["Content-Disposition"] = f"attachment; filename=report_{upload_id}.pdf"
        
        logger.info(f"PDF report generated for upload_id: {upload_id}")
        return response
        
    except Exception as e:
        logger.error(f"Error generating PDF report for upload_id {upload_id}: {e}")
        raise HTTPException(status_code=500, detail="Error generating PDF report")


@router.post("/reports/generate")
async def generate_report(report_request: dict):
    """
    Generate a custom report based on provided parameters
    """
    try:
        # Validate request
        required_fields = ["upload_id", "start_date", "end_date"]
        for field in required_fields:
            if field not in report_request:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        upload_id = report_request["upload_id"]
        start_date = report_request["start_date"]
        end_date = report_request["end_date"]
        
        # Validate dates
        try:
            datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format")
        
        # Here would be the implementation to fetch data for the date range
        # For now, we'll return a placeholder
        analysis_data = {
            "upload_id": upload_id,
            "start_date": start_date,
            "end_date": end_date,
            "prediction": "Healthy Crops",
            "confidence": 0.89,
            "recommendation": "Continue regular monitoring practices. No immediate action required.",
            "timestamp": datetime.utcnow().isoformat(),
            "field_id": "FIELD001", 
            "crop_type": "Corn",
            "location": "Sample Field Location",
            "spectral_indices": {
                "ndvi": [0.72, 0.75, 0.71, 0.74, 0.73, 0.76, 0.74],
                "ndre": [0.52, 0.55, 0.51, 0.54, 0.53, 0.56, 0.54],
                "msi": [1.2, 1.18, 1.22, 1.19, 1.21, 1.17, 1.20],
                "savi": [0.52, 0.55, 0.51, 0.54, 0.53, 0.56, 0.54],
                "evi": [0.42, 0.45, 0.41, 0.44, 0.43, 0.46, 0.44]
            },
            "risk_zones": [
                {
                    "id": "zone_1_1",
                    "risk_level": "low",
                    "risk_type": "monitoring_needed",
                    "area_pixels": 15000,
                    "avg_ndvi": 0.74
                },
                {
                    "id": "zone_2_2",
                    "risk_level": "medium",
                    "risk_type": "general_stress",
                    "area_pixels": 8500,
                    "avg_ndvi": 0.42
                }
            ],
            "alerts": [
                {
                    "zone_id": "zone_2_2",
                    "risk_type": "general_stress",
                    "risk_level": "medium",
                    "recommendation": "Monitor this zone closely for 2-3 days. Increase surveillance."
                }
            ]
        }
        
        # Generate PDF
        pdf_buffer = generate_pdf_report(analysis_data)
        
        # Create response
        response = StreamingResponse(pdf_buffer, media_type="application/pdf")
        response.headers["Content-Disposition"] = f"attachment; filename=trend_report_{upload_id}.pdf"
        
        logger.info(f"Custom trend report generated for upload_id: {upload_id}")
        return response
        
    except Exception as e:
        logger.error(f"Error generating custom report: {e}")
        raise HTTPException(status_code=500, detail="Error generating custom report")