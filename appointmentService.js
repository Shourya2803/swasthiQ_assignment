/**
 * Appointment Service - Backend API Integration
 * Connects React frontend to Python FastAPI backend
 * Replaces mock data with real database calls via Neon PostgreSQL
 */

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Fetch appointments from the backend
 * @param {string} date - Optional date filter (ISO format: YYYY-MM-DD)
 * @param {string} status - Optional status filter
 * @returns {Promise<Array>} Array of appointment objects
 */
export async function getAppointments(date = null, status = null) {
  try {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (status) params.append('status', status);
    
    const url = `${API_BASE_URL}/appointments${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.appointments || [];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
}

/**
 * Update appointment status
 * @param {number} appointmentId - ID of the appointment to update
 * @param {string} newStatus - New status value
 * @returns {Promise<Object>} Updated appointment object
 */
export async function updateAppointmentStatus(appointmentId, newStatus) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.appointment;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
}

/**
 * Create a new appointment
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<Object>} Created appointment object
 */
export async function createAppointment(appointmentData) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

/**
 * Delete an appointment
 * @param {number} appointmentId - ID of the appointment to delete
 * @returns {Promise<Object>} Success message
 */
export async function deleteAppointment(appointmentId) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
}

/**
 * Get appointment statistics
 * @returns {Promise<Object>} Statistics object
 */
export async function getStatistics() {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
}

/**
 * Helper: Get today's date in ISO format (YYYY-MM-DD)
 */
export function getTodayStr() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Helper: Compare two date strings
 */
export function compareDates(date1, date2) {
  return new Date(date1).getTime() - new Date(date2).getTime();
}
