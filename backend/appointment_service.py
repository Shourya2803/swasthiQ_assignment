"""
Appointment Service Module
Simulates a Scheduling & Queue microservice for appointment management.
In production, this would integrate with AWS Lambda, AppSync, and Aurora PostgreSQL.
"""

from datetime import date
from typing import Optional

# Mock data: Simulates Aurora PostgreSQL database
APPOINTMENTS = [
    {
        "id": "apt001",
        "name": "John Smith",
        "date": "2025-12-10",
        "time": "09:00",
        "duration": 30,
        "doctorName": "Dr. Sarah Johnson",
        "status": "Confirmed",
        "mode": "In-Person"
    },
    {
        "id": "apt002",
        "name": "Emma Wilson",
        "date": "2025-12-15",
        "time": "10:30",
        "duration": 45,
        "doctorName": "Dr. Michael Chen",
        "status": "Scheduled",
        "mode": "Video"
    },
    {
        "id": "apt003",
        "name": "Robert Brown",
        "date": "2025-12-15",
        "time": "14:00",
        "duration": 30,
        "doctorName": "Dr. Sarah Johnson",
        "status": "Confirmed",
        "mode": "In-Person"
    },
    {
        "id": "apt004",
        "name": "Lisa Anderson",
        "date": "2025-12-20",
        "time": "11:00",
        "duration": 60,
        "doctorName": "Dr. Emily White",
        "status": "Upcoming",
        "mode": "Video"
    },
    {
        "id": "apt005",
        "name": "James Taylor",
        "date": "2025-12-08",
        "time": "15:30",
        "duration": 30,
        "doctorName": "Dr. Michael Chen",
        "status": "Confirmed",
        "mode": "In-Person"
    },
    {
        "id": "apt006",
        "name": "Maria Garcia",
        "date": "2025-12-18",
        "time": "09:30",
        "duration": 45,
        "doctorName": "Dr. Sarah Johnson",
        "status": "Upcoming",
        "mode": "Video"
    },
    {
        "id": "apt007",
        "name": "David Martinez",
        "date": "2025-12-05",
        "time": "13:00",
        "duration": 30,
        "doctorName": "Dr. Emily White",
        "status": "Cancelled",
        "mode": "In-Person"
    },
    {
        "id": "apt008",
        "name": "Jennifer Lee",
        "date": "2025-12-22",
        "time": "16:00",
        "duration": 30,
        "doctorName": "Dr. Michael Chen",
        "status": "Scheduled",
        "mode": "In-Person"
    },
    {
        "id": "apt009",
        "name": "Christopher Davis",
        "date": "2025-12-15",
        "time": "11:30",
        "duration": 45,
        "doctorName": "Dr. Emily White",
        "status": "Confirmed",
        "mode": "Video"
    },
    {
        "id": "apt010",
        "name": "Patricia Moore",
        "date": "2025-12-03",
        "time": "10:00",
        "duration": 60,
        "doctorName": "Dr. Sarah Johnson",
        "status": "Confirmed",
        "mode": "In-Person"
    },
    {
        "id": "apt011",
        "name": "Michael Johnson",
        "date": "2025-12-25",
        "time": "14:30",
        "duration": 30,
        "doctorName": "Dr. Michael Chen",
        "status": "Upcoming",
        "mode": "Video"
    },
    {
        "id": "apt012",
        "name": "Sarah Thompson",
        "date": "2025-12-12",
        "time": "08:30",
        "duration": 45,
        "doctorName": "Dr. Emily White",
        "status": "Cancelled",
        "mode": "In-Person"
    }
]


def get_appointments(date: Optional[str] = None, status: Optional[str] = None) -> list[dict]:
    """
    Query function to retrieve appointments with optional filtering.
    
    Simulates a GraphQL query resolver for:
    query GetAppointments($date: String, $status: String) {
        getAppointments(date: $date, status: $status) { ... }
    }
    
    In production, this would:
    - Execute a parameterized SQL query against Aurora PostgreSQL
    - Use connection pooling for performance
    - Implement proper error handling and logging
    
    Args:
        date: Optional date filter in YYYY-MM-DD format
        status: Optional status filter (Confirmed, Scheduled, Upcoming, Cancelled)
    
    Returns:
        List of appointment dictionaries matching the filters
    """
    # Start with all appointments
    result = APPOINTMENTS.copy()
    
    # Apply date filter if provided
    if date is not None:
        result = [apt for apt in result if apt["date"] == date]
    
    # Apply status filter if provided (case-insensitive)
    if status is not None:
        result = [apt for apt in result if apt["status"].lower() == status.lower()]
    
    # Return a new list to avoid mutations
    return [apt.copy() for apt in result]


def update_appointment_status(appointment_id: str, new_status: str) -> dict:
    """
    Mutation function to update an appointment's status.
    
    Simulates a GraphQL mutation resolver for:
    mutation UpdateAppointmentStatus($id: ID!, $status: String!) {
        updateAppointmentStatus(id: $id, status: $status) { ... }
    }
    
    In production, this would:
    1. BEGIN TRANSACTION in Aurora PostgreSQL
    2. Execute UPDATE query with WHERE id = appointment_id
    3. COMMIT TRANSACTION
    4. Publish event to AppSync for real-time subscription updates
    
    Args:
        appointment_id: The unique identifier of the appointment
        new_status: The new status value
    
    Returns:
        The updated appointment dictionary
    
    Raises:
        ValueError: If appointment_id is not found
    """
    # Find the appointment in the global list
    appointment = None
    for apt in APPOINTMENTS:
        if apt["id"] == appointment_id:
            appointment = apt
            break
    
    # Handle not found case
    if appointment is None:
        raise ValueError(f"Appointment with id '{appointment_id}' not found")
    
    # ========================================
    # AURORA TRANSACTIONAL WRITE WOULD OCCUR HERE
    # ========================================
    # In production:
    # - BEGIN TRANSACTION
    # - UPDATE appointments SET status = %s WHERE id = %s
    # - Validate the update was successful
    # - COMMIT TRANSACTION
    # - Handle rollback on failure
    
    # Update the status in-memory (simulating DB update)
    appointment["status"] = new_status
    
    # ========================================
    # APPSYNC SUBSCRIPTION EVENT WOULD BE PUBLISHED HERE
    # ========================================
    # In production:
    # - After successful commit, publish mutation event to AppSync
    # - AppSync broadcasts to all subscribed clients:
    #   subscription OnAppointmentUpdated {
    #       onAppointmentUpdated { id status ... }
    #   }
    # - Clients receive real-time updates without polling
    
    # Return a copy of the updated appointment
    return appointment.copy()


def get_today_str() -> str:
    """
    Helper function to get today's date as a string.
    
    Returns:
        Today's date in YYYY-MM-DD format
    """
    return date.today().isoformat()


# Example usage and testing
if __name__ == "__main__":
    print("=== Testing Appointment Service ===\n")
    
    # Test 1: Get all appointments
    print("1. All appointments:")
    all_apts = get_appointments()
    print(f"   Found {len(all_apts)} appointments\n")
    
    # Test 2: Filter by date
    print("2. Appointments on 2025-12-15:")
    date_filtered = get_appointments(date="2025-12-15")
    for apt in date_filtered:
        print(f"   {apt['name']} at {apt['time']} with {apt['doctorName']}")
    print()
    
    # Test 3: Filter by status
    print("3. Confirmed appointments:")
    status_filtered = get_appointments(status="Confirmed")
    print(f"   Found {len(status_filtered)} confirmed appointments\n")
    
    # Test 4: Filter by both date and status
    print("4. Confirmed appointments on 2025-12-15:")
    both_filtered = get_appointments(date="2025-12-15", status="Confirmed")
    for apt in both_filtered:
        print(f"   {apt['name']} - {apt['status']}")
    print()
    
    # Test 5: Update appointment status
    print("5. Updating appointment apt002 status to 'Confirmed':")
    updated = update_appointment_status("apt002", "Confirmed")
    print(f"   {updated['name']} - New status: {updated['status']}\n")
    
    # Test 6: Today's date
    print(f"6. Today's date: {get_today_str()}")
