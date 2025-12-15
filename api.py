"""
FastAPI Backend for Appointment Management System
Connects React frontend to Neon PostgreSQL database
Simulates AWS Lambda + AppSync + Aurora architecture
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, time, datetime
from database import get_db_connection
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Appointment Management API",
    description="Backend API for EMR Appointment Scheduling System",
    version="1.0.0"
)

# CORS Configuration - Allow React frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Pydantic Models ====================

class Appointment(BaseModel):
    id: int
    patient_name: str
    appointment_date: date
    appointment_time: time
    duration: int
    doctor_name: str
    status: str
    mode: str
    reason: Optional[str] = None
    notes: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    abha_id: Optional[str] = None
    patient_initials: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class AppointmentCreate(BaseModel):
    patient_name: str
    appointment_date: date
    appointment_time: time
    duration: int
    doctor_name: str
    status: str
    mode: str
    reason: Optional[str] = None
    notes: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    abha_id: Optional[str] = None
    patient_initials: Optional[str] = None

class AppointmentUpdate(BaseModel):
    status: str

class AppointmentQueryResponse(BaseModel):
    success: bool
    appointments: List[Appointment]
    count: int

class StatusUpdateResponse(BaseModel):
    success: bool
    message: str
    appointment: Optional[Appointment] = None

# ==================== API Endpoints ====================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Appointment Management API is running",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/api/appointments", response_model=AppointmentQueryResponse)
async def get_appointments(
    date: Optional[str] = None,
    status: Optional[str] = None
):
    """
    Query appointments with optional filters
    Simulates AWS AppSync GraphQL query
    
    Args:
        date: Filter by appointment date (ISO format: YYYY-MM-DD)
        status: Filter by status (Confirmed, Scheduled, Completed, Cancelled)
    
    Returns:
        List of appointments matching the filters
    """
    try:
        logger.info(f"Fetching appointments - date: {date}, status: {status}")
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Build dynamic query based on filters
            query = "SELECT * FROM appointments WHERE 1=1"
            params = []
            
            if date:
                query += " AND appointment_date = %s"
                params.append(date)
            
            if status:
                query += " AND status = %s"
                params.append(status)
            
            query += " ORDER BY appointment_date, appointment_time"
            
            cursor.execute(query, params)
            appointments = cursor.fetchall()
            
            # Convert to list of dicts and format times
            formatted_appointments = []
            for apt in appointments:
                apt_dict = dict(apt)
                # Format time to string for JSON serialization
                if apt_dict['appointment_time']:
                    apt_dict['appointment_time'] = apt_dict['appointment_time'].strftime('%H:%M:%S')
                formatted_appointments.append(apt_dict)
            
            logger.info(f"Found {len(formatted_appointments)} appointments")
            
            return {
                "success": True,
                "appointments": formatted_appointments,
                "count": len(formatted_appointments)
            }
    
    except Exception as e:
        logger.error(f"Error fetching appointments: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.put("/api/appointments/{appointment_id}/status", response_model=StatusUpdateResponse)
async def update_appointment_status(
    appointment_id: int,
    update: AppointmentUpdate
):
    """
    Update appointment status
    Simulates AWS AppSync GraphQL mutation with Aurora transaction
    
    Args:
        appointment_id: ID of the appointment to update
        update: New status data
    
    Returns:
        Updated appointment data
    """
    try:
        logger.info(f"Updating appointment {appointment_id} to status: {update.status}")
        
        # Validate status
        valid_statuses = ['Confirmed', 'Scheduled', 'Completed', 'Cancelled']
        if update.status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Check if appointment exists
            cursor.execute("SELECT * FROM appointments WHERE id = %s", (appointment_id,))
            appointment = cursor.fetchone()
            
            if not appointment:
                raise HTTPException(status_code=404, detail="Appointment not found")
            
            # Update status - This simulates an Aurora PostgreSQL transaction
            cursor.execute("""
                UPDATE appointments 
                SET status = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING *
            """, (update.status, appointment_id))
            
            updated_appointment = cursor.fetchone()
            
            # Format time for JSON
            apt_dict = dict(updated_appointment)
            if apt_dict['appointment_time']:
                apt_dict['appointment_time'] = apt_dict['appointment_time'].strftime('%H:%M:%S')
            
            logger.info(f"Successfully updated appointment {appointment_id}")
            
            # In production, this would trigger an AppSync subscription notification
            # to update all connected clients in real-time
            
            return {
                "success": True,
                "message": f"Appointment status updated to {update.status}",
                "appointment": apt_dict
            }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating appointment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/api/appointments", response_model=Appointment)
async def create_appointment(appointment: AppointmentCreate):
    """
    Create a new appointment
    Simulates AWS AppSync GraphQL mutation
    
    Args:
        appointment: Appointment data
    
    Returns:
        Created appointment with ID
    """
    try:
        logger.info(f"Creating new appointment for {appointment.patient_name}")
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO appointments (
                    patient_name, appointment_date, appointment_time, duration,
                    doctor_name, status, mode, reason, notes, phone, email, abha_id, patient_initials
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
            """, (
                appointment.patient_name,
                appointment.appointment_date,
                appointment.appointment_time,
                appointment.duration,
                appointment.doctor_name,
                appointment.status,
                appointment.mode,
                appointment.reason,
                appointment.notes,
                appointment.phone,
                appointment.email,
                appointment.abha_id,
                appointment.patient_initials
            ))
            
            new_appointment = cursor.fetchone()
            
            # Format time for JSON
            apt_dict = dict(new_appointment)
            if apt_dict['appointment_time']:
                apt_dict['appointment_time'] = apt_dict['appointment_time'].strftime('%H:%M:%S')
            
            logger.info(f"Successfully created appointment {apt_dict['id']}")
            
            return apt_dict
    
    except Exception as e:
        logger.error(f"Error creating appointment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/api/appointments/{appointment_id}")
async def delete_appointment(appointment_id: int):
    """
    Delete an appointment
    
    Args:
        appointment_id: ID of the appointment to delete
    
    Returns:
        Success message
    """
    try:
        logger.info(f"Deleting appointment {appointment_id}")
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("DELETE FROM appointments WHERE id = %s RETURNING id", (appointment_id,))
            deleted = cursor.fetchone()
            
            if not deleted:
                raise HTTPException(status_code=404, detail="Appointment not found")
            
            logger.info(f"Successfully deleted appointment {appointment_id}")
            
            return {
                "success": True,
                "message": f"Appointment {appointment_id} deleted successfully"
            }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting appointment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/stats")
async def get_statistics():
    """
    Get appointment statistics for dashboard
    
    Returns:
        Stats about appointments (counts by status, today's appointments, etc.)
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Get today's date
            today = datetime.now().date()
            
            # Count by status
            cursor.execute("""
                SELECT 
                    COUNT(*) FILTER (WHERE appointment_date = %s) as today_count,
                    COUNT(*) FILTER (WHERE status = 'Confirmed') as confirmed_count,
                    COUNT(*) FILTER (WHERE appointment_date >= %s) as upcoming_count,
                    COUNT(*) FILTER (WHERE mode = 'Virtual') as virtual_count,
                    COUNT(*) as total_count
                FROM appointments
            """, (today, today))
            
            stats = cursor.fetchone()
            
            return {
                "success": True,
                "stats": dict(stats)
            }
    
    except Exception as e:
        logger.error(f"Error fetching statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ==================== Run Server ====================

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    print("🚀 Starting FastAPI server...")
    print(f"📝 API documentation available at: http://0.0.0.0:{port}/docs")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
