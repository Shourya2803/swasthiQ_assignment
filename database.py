"""
Database configuration and connection management for Neon PostgreSQL
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from contextlib import contextmanager

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set. Please create a .env file with your Neon database URL.")

@contextmanager
def get_db_connection():
    """
    Context manager for database connections
    Automatically handles connection opening and closing
    """
    conn = None
    try:
        conn = psycopg2.connect(
            DATABASE_URL,
            cursor_factory=RealDictCursor  # Returns results as dictionaries
        )
        yield conn
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()

def init_database():
    """
    Initialize database schema - creates tables if they don't exist
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Create appointments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS appointments (
                id SERIAL PRIMARY KEY,
                patient_name VARCHAR(255) NOT NULL,
                appointment_date DATE NOT NULL,
                appointment_time TIME NOT NULL,
                duration INTEGER NOT NULL,
                doctor_name VARCHAR(255) NOT NULL,
                status VARCHAR(50) NOT NULL CHECK (status IN ('Confirmed', 'Scheduled', 'Completed', 'Cancelled')),
                mode VARCHAR(50) NOT NULL CHECK (mode IN ('In-person', 'Virtual')),
                reason TEXT,
                notes TEXT,
                phone VARCHAR(20),
                email VARCHAR(255),
                abha_id VARCHAR(50),
                patient_initials VARCHAR(5),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Create index for faster queries
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_appointment_date 
            ON appointments(appointment_date);
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_appointment_status 
            ON appointments(status);
        """)
        
        print("✅ Database schema initialized successfully")

def seed_sample_data():
    """
    Insert sample appointment data if the table is empty
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Check if data already exists
        cursor.execute("SELECT COUNT(*) FROM appointments")
        count = cursor.fetchone()['count']
        
        if count > 0:
            print(f"ℹ️  Database already contains {count} appointments. Skipping seed.")
            return
        
        # Sample data
        sample_appointments = [
            ('Rahul Sharma', '2025-12-15', '09:00', 60, 'Dr. Rajesh Kumar', 'Confirmed', 'In-person', 'General Checkup', 'Regular health screening', '+91 98765 43210', 'rahul.sharma@email.com', '12-3456-7890-1234', 'RS'),
            ('Priya Singh', '2025-12-15', '11:00', 30, 'Dr. Anita Desai', 'Scheduled', 'Virtual', 'Follow-up Consultation', 'Review test results', '+91 98765 43211', 'priya.singh@email.com', '', 'PS'),
            ('Amit Patel', '2025-12-15', '14:00', 45, 'Dr. Vikram Mehta', 'Confirmed', 'In-person', 'Vaccination', 'Annual flu shot', '+91 98765 43212', 'amit.patel@email.com', '98-7654-3210-9876', 'AP'),
            ('Sneha Reddy', '2025-12-16', '10:30', 60, 'Dr. Rajesh Kumar', 'Scheduled', 'Virtual', 'Cardiology Consultation', 'Blood pressure follow-up', '+91 98765 43213', 'sneha.reddy@email.com', '45-6789-0123-4567', 'SR'),
            ('Vikram Joshi', '2025-12-16', '15:00', 30, 'Dr. Anita Desai', 'Cancelled', 'In-person', 'Dental Checkup', '', '+91 98765 43214', 'vikram.joshi@email.com', '', 'VJ'),
            ('Anjali Verma', '2025-12-17', '09:30', 45, 'Dr. Vikram Mehta', 'Scheduled', 'In-person', 'Physical Therapy', 'Knee rehabilitation', '+91 98765 43215', 'anjali.verma@email.com', '78-9012-3456-7890', 'AV'),
            ('Rohan Gupta', '2025-12-14', '11:00', 30, 'Dr. Rajesh Kumar', 'Completed', 'Virtual', 'Prescription Renewal', '', '+91 98765 43216', 'rohan.gupta@email.com', '', 'RG'),
            ('Kavya Nair', '2025-12-14', '14:30', 60, 'Dr. Anita Desai', 'Completed', 'In-person', 'Annual Physical', 'Complete health assessment', '+91 98765 43217', 'kavya.nair@email.com', '23-4567-8901-2345', 'KN'),
            ('Arjun Malhotra', '2025-12-13', '10:00', 45, 'Dr. Vikram Mehta', 'Completed', 'In-person', 'Orthopedic Consultation', 'Back pain evaluation', '+91 98765 43218', 'arjun.malhotra@email.com', '', 'AM'),
            ('Divya Iyer', '2025-12-18', '13:00', 30, 'Dr. Rajesh Kumar', 'Scheduled', 'Virtual', 'Dermatology Consult', 'Skin condition review', '+91 98765 43219', 'divya.iyer@email.com', '56-7890-1234-5678', 'DI'),
            ('Karan Shah', '2025-12-19', '16:00', 60, 'Dr. Anita Desai', 'Scheduled', 'In-person', 'Mental Health Session', 'Stress management', '+91 98765 43220', 'karan.shah@email.com', '', 'KS'),
            ('Meera Kapoor', '2025-12-20', '11:30', 45, 'Dr. Vikram Mehta', 'Scheduled', 'Virtual', 'Nutrition Counseling', 'Diet planning', '+91 98765 43221', 'meera.kapoor@email.com', '89-0123-4567-8901', 'MK'),
        ]
        
        cursor.executemany("""
            INSERT INTO appointments (
                patient_name, appointment_date, appointment_time, duration, 
                doctor_name, status, mode, reason, notes, phone, email, abha_id, patient_initials
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, sample_appointments)
        
        print(f"✅ Seeded {len(sample_appointments)} sample appointments")

if __name__ == "__main__":
    print("🔧 Initializing database...")
    init_database()
    seed_sample_data()
    print("✅ Database setup complete!")
