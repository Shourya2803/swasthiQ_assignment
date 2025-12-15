/**
 * Appointment Service Mock (JavaScript)
 * Mirrors the Python appointment_service.py for frontend integration
 * In production, this would be replaced by GraphQL API calls to AppSync
 */

// Mock data: Simulates Aurora PostgreSQL database
const APPOINTMENTS = [
  {
    id: "apt001",
    name: "John Smith",
    date: "2025-12-10",
    time: "09:00",
    duration: 30,
    doctorName: "Dr. Sarah Johnson",
    status: "Confirmed",
    mode: "In-Person"
  },
  {
    id: "apt002",
    name: "Emma Wilson",
    date: "2025-12-15",
    time: "10:30",
    duration: 45,
    doctorName: "Dr. Michael Chen",
    status: "Scheduled",
    mode: "Video"
  },
  {
    id: "apt003",
    name: "Robert Brown",
    date: "2025-12-15",
    time: "14:00",
    duration: 30,
    doctorName: "Dr. Sarah Johnson",
    status: "Confirmed",
    mode: "In-Person"
  },
  {
    id: "apt004",
    name: "Lisa Anderson",
    date: "2025-12-20",
    time: "11:00",
    duration: 60,
    doctorName: "Dr. Emily White",
    status: "Upcoming",
    mode: "Video"
  },
  {
    id: "apt005",
    name: "James Taylor",
    date: "2025-12-08",
    time: "15:30",
    duration: 30,
    doctorName: "Dr. Michael Chen",
    status: "Confirmed",
    mode: "In-Person"
  },
  {
    id: "apt006",
    name: "Maria Garcia",
    date: "2025-12-18",
    time: "09:30",
    duration: 45,
    doctorName: "Dr. Sarah Johnson",
    status: "Upcoming",
    mode: "Video"
  },
  {
    id: "apt007",
    name: "David Martinez",
    date: "2025-12-05",
    time: "13:00",
    duration: 30,
    doctorName: "Dr. Emily White",
    status: "Cancelled",
    mode: "In-Person"
  },
  {
    id: "apt008",
    name: "Jennifer Lee",
    date: "2025-12-22",
    time: "16:00",
    duration: 30,
    doctorName: "Dr. Michael Chen",
    status: "Scheduled",
    mode: "In-Person"
  },
  {
    id: "apt009",
    name: "Christopher Davis",
    date: "2025-12-15",
    time: "11:30",
    duration: 45,
    doctorName: "Dr. Emily White",
    status: "Confirmed",
    mode: "Video"
  },
  {
    id: "apt010",
    name: "Patricia Moore",
    date: "2025-12-03",
    time: "10:00",
    duration: 60,
    doctorName: "Dr. Sarah Johnson",
    status: "Confirmed",
    mode: "In-Person"
  },
  {
    id: "apt011",
    name: "Michael Johnson",
    date: "2025-12-25",
    time: "14:30",
    duration: 30,
    doctorName: "Dr. Michael Chen",
    status: "Upcoming",
    mode: "Video"
  },
  {
    id: "apt012",
    name: "Sarah Thompson",
    date: "2025-12-12",
    time: "08:30",
    duration: 45,
    doctorName: "Dr. Emily White",
    status: "Cancelled",
    mode: "In-Person"
  }
];

/**
 * Query function to retrieve appointments with optional filtering
 * Simulates GraphQL query: getAppointments(date, status)
 * 
 * @param {string|null} date - Optional date filter (YYYY-MM-DD)
 * @param {string|null} status - Optional status filter
 * @returns {Promise<Array>} Promise resolving to filtered appointments
 */
export const getAppointments = async (date = null, status = null) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let result = [...APPOINTMENTS];
  
  // Apply date filter if provided
  if (date !== null && date !== undefined) {
    result = result.filter(apt => apt.date === date);
  }
  
  // Apply status filter if provided (case-insensitive)
  if (status !== null && status !== undefined) {
    result = result.filter(apt => 
      apt.status.toLowerCase() === status.toLowerCase()
    );
  }
  
  // Return deep copies to prevent mutations
  return result.map(apt => ({ ...apt }));
};

/**
 * Mutation function to update an appointment's status
 * Simulates GraphQL mutation: updateAppointmentStatus(id, status)
 * 
 * @param {string} appointmentId - The appointment ID
 * @param {string} newStatus - The new status value
 * @returns {Promise<Object>} Promise resolving to the updated appointment
 * @throws {Error} If appointment not found
 */
export const updateAppointmentStatus = async (appointmentId, newStatus) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Find the appointment
  const appointment = APPOINTMENTS.find(apt => apt.id === appointmentId);
  
  if (!appointment) {
    throw new Error(`Appointment with id '${appointmentId}' not found`);
  }
  
  // ========================================
  // AURORA TRANSACTIONAL WRITE WOULD OCCUR HERE
  // ========================================
  // In production:
  // - GraphQL mutation sent to AppSync
  // - Lambda resolver executes Aurora transaction
  // - UPDATE appointments SET status = $1 WHERE id = $2
  
  // Update the status in-memory (simulating DB update)
  appointment.status = newStatus;
  
  // ========================================
  // APPSYNC SUBSCRIPTION EVENT WOULD BE PUBLISHED HERE
  // ========================================
  // In production:
  // - AppSync publishes to subscription: onAppointmentUpdated
  // - All subscribed clients receive real-time updates
  
  // Return a copy of the updated appointment
  return { ...appointment };
};

/**
 * Get today's date as a string
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export const getTodayStr = () => {
  const today = new Date();
  return today.toISOString().slice(0, 10);
};

/**
 * Helper to compare dates
 * @param {string} date1 - Date in YYYY-MM-DD format
 * @param {string} date2 - Date in YYYY-MM-DD format
 * @returns {number} -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export const compareDates = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
};

export default {
  getAppointments,
  updateAppointmentStatus,
  getTodayStr,
  compareDates
};
