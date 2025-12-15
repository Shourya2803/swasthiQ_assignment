import React, { useState, useEffect, useMemo } from 'react';
import { 
  getAppointments, 
  updateAppointmentStatus, 
  getTodayStr,
  compareDates 
} from './appointmentService';

// Mock appointment data with extended fields
const MOCK_APPOINTMENTS = [
  {
    id: "apt001",
    name: "Sarah Johnson",
    initials: "SJ",
    date: "2025-12-15",
    time: "09:00",
    duration: 30,
    doctorName: "Dr. Michael Chen",
    status: "Confirmed",
    mode: "In-Person",
    reason: "Diabetes Management Review",
    note: "Patient needs prescription refill.",
    phone: "+1 (555) 123-4567",
    email: "sarah.j@email.com"
  },
  {
    id: "apt002",
    name: "Robert Brown",
    initials: "RB",
    date: "2025-12-15",
    time: "14:00",
    duration: 45,
    doctorName: "Dr. Emily White",
    status: "Confirmed",
    mode: "Video Call",
    reason: "Follow-up Consultation",
    note: "Review lab results from previous visit.",
    phone: "+1 (555) 234-5678",
    email: "rbrown@email.com"
  },
  {
    id: "apt003",
    name: "Emma Wilson",
    initials: "EW",
    date: "2025-12-18",
    time: "10:30",
    duration: 60,
    doctorName: "Dr. Michael Chen",
    status: "Scheduled",
    mode: "In-Person",
    reason: "Annual Physical Examination",
    note: "Fasting required before appointment.",
    phone: "+1 (555) 345-6789",
    email: "emma.w@email.com"
  },
  {
    id: "apt004",
    name: "James Taylor",
    initials: "JT",
    date: "2025-12-10",
    time: "15:30",
    duration: 30,
    doctorName: "Dr. Sarah Johnson",
    status: "Completed",
    mode: "Video Call",
    reason: "Mental Health Check-in",
    note: "Patient doing well on current treatment plan.",
    phone: "+1 (555) 456-7890",
    email: "jtaylor@email.com"
  },
  {
    id: "apt005",
    name: "Lisa Anderson",
    initials: "LA",
    date: "2025-12-08",
    time: "11:00",
    duration: 30,
    doctorName: "Dr. Emily White",
    status: "Cancelled",
    mode: "In-Person",
    reason: "Routine Check-up",
    note: "Patient requested to reschedule.",
    phone: "+1 (555) 567-8901",
    email: "lisa.a@email.com"
  }
];

/**
 * AppointmentManagementView Component
 * Full-featured appointment scheduling and queue management interface
 * Implements date filtering, status tabs, and real-time status updates
 * Now connected to Python FastAPI backend with Neon PostgreSQL
 */
const AppointmentManagementView = () => {
  // State management
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [doctorFilter, setDoctorFilter] = useState('All Doctors');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get today's date
  const today = getTodayStr();

  // Fetch appointments from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAppointments();
        // Transform backend data to match frontend format
        const transformedData = data.map(apt => ({
          id: apt.id,
          name: apt.patient_name,
          initials: apt.patient_initials || apt.patient_name.split(' ').map(n => n[0]).join(''),
          date: apt.appointment_date,
          time: apt.appointment_time,
          duration: apt.duration,
          doctorName: apt.doctor_name,
          status: apt.status,
          mode: apt.mode,
          reason: apt.reason || '',
          note: apt.notes || '',
          phone: apt.phone || '',
          email: apt.email || ''
        }));
        setAppointments(transformedData);
      } catch (err) {
        console.error('Failed to fetch appointments:', err);
        setError('Failed to load appointments. Please check if the backend server is running.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique doctors for filter
  const uniqueDoctors = useMemo(() => {
    return [...new Set(appointments.map(apt => apt.doctorName))].sort();
  }, [appointments]);

  // Calculate stats
  const stats = useMemo(() => {
    const todayAppts = appointments.filter(apt => apt.date === today);
    const confirmed = appointments.filter(apt => apt.status === 'Confirmed');
    const upcoming = appointments.filter(apt => compareDates(apt.date, today) > 0);
    const virtual = appointments.filter(apt => apt.mode === 'Video Call');
    
    return {
      today: todayAppts.length,
      confirmed: confirmed.length,
      upcoming: upcoming.length,
      virtual: virtual.length
    };
  }, [appointments, today]);

  /**
   * Filter appointments based on all active filters
   */
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    // Apply tab-based date filtering
    if (activeTab === 'Today') {
      filtered = filtered.filter(apt => apt.date === today);
    } else if (activeTab === 'Upcoming') {
      filtered = filtered.filter(apt => compareDates(apt.date, today) >= 0);
    } else if (activeTab === 'Past') {
      filtered = filtered.filter(apt => compareDates(apt.date, today) < 0);
    }
    // 'All' tab shows everything

    // Apply date filter if a specific date is selected
    if (selectedDate) {
      filtered = filtered.filter(apt => apt.date === selectedDate);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.name.toLowerCase().includes(query) ||
        apt.doctorName.toLowerCase().includes(query) ||
        apt.reason.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'All Status') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Apply doctor filter
    if (doctorFilter !== 'All Doctors') {
      filtered = filtered.filter(apt => apt.doctorName === doctorFilter);
    }

    // Sort by date and time
    return filtered.sort((a, b) => {
      const dateCompare = compareDates(a.date, b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
  }, [appointments, activeTab, selectedDate, searchQuery, statusFilter, doctorFilter, today]);

  /**
   * Generate calendar days for current month
   */
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty slots for days before the first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasAppointments = appointments.some(apt => apt.date === dateStr);
      const appointmentsForDay = appointments.filter(apt => apt.date === dateStr);
      
      days.push({
        day,
        dateStr,
        hasAppointments,
        appointments: appointmentsForDay
      });
    }
    
    return days;
  }, [currentMonth, appointments]);

  /**
   * Handle date selection from calendar
   */
  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr === selectedDate ? null : dateStr);
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedDate(null); // Clear date selection when changing tabs
  };

  /**
   * Navigate calendar month
   */
  const changeMonth = (offset) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + offset);
      return newDate;
    });
  };

  /**
   * Handle status update for an appointment
   * Now calls the backend API
   */
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    // Optimistic update
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: newStatus }
          : apt
      )
    );

    try {
      await updateAppointmentStatus(appointmentId, newStatus);
    } catch (err) {
      console.error('Failed to update appointment:', err);
      // Revert on error
      const data = await getAppointments();
      const transformedData = data.map(apt => ({
        id: apt.id,
        name: apt.patient_name,
        initials: apt.patient_initials || apt.patient_name.split(' ').map(n => n[0]).join(''),
        date: apt.appointment_date,
        time: apt.appointment_time,
        duration: apt.duration,
        doctorName: apt.doctor_name,
        status: apt.status,
        mode: apt.mode,
        reason: apt.reason || '',
        note: apt.notes || '',
        phone: apt.phone || '',
        email: apt.email || ''
      }));
      setAppointments(transformedData);
      alert('Failed to update appointment status');
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  /**
   * Format time to 12-hour format
   */
  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status) => {
    const colors = {
      'Confirmed': 'bg-emerald-50 text-emerald-600 border-emerald-200',
      'Scheduled': 'bg-sky-50 text-sky-600 border-sky-200',
      'Completed': 'bg-violet-50 text-violet-600 border-violet-200',
      'Cancelled': 'bg-rose-50 text-rose-600 border-rose-200'
    };
    return colors[status] || 'bg-slate-50 text-slate-600 border-slate-200';
  };

  /**
   * Get appointment status dot color for calendar legend
   */
  const getStatusDotColor = (status) => {
    const colors = {
      'Confirmed': 'bg-emerald-500',
      'Scheduled': 'bg-sky-500',
      'Completed': 'bg-violet-500',
      'Cancelled': 'bg-rose-500'
    };
    return colors[status] || 'bg-slate-500';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <p className="text-sm text-red-600 mb-4">
              Make sure the Python backend is running on port 8000:
            </p>
            <code className="block bg-red-100 text-red-800 p-2 rounded text-xs mb-4">
              python api.py
            </code>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Appointment Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Schedule and manage patient appointments
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Export
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
              <span className="text-lg">+</span>
              New Appointment
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Today Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">Today</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500">Today's Appointments</p>
                <p className="text-2xl font-bold text-slate-900">{stats.today}</p>
              </div>
            </div>
          </div>

          {/* Confirmed Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-medium">Confirmed</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500">Confirmed Appointments</p>
                <p className="text-2xl font-bold text-slate-900">{stats.confirmed}</p>
              </div>
            </div>
          </div>

          {/* Upcoming Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="px-2 py-1 bg-violet-50 text-violet-600 rounded text-xs font-medium">Upcoming</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-slate-900">{stats.upcoming}</p>
              </div>
            </div>
          </div>

          {/* Virtual Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="px-2 py-1 bg-pink-50 text-pink-600 rounded text-xs font-medium">Virtual</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500">Telemedicine Sessions</p>
                <p className="text-2xl font-bold text-slate-900">{stats.virtual}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout: Calendar + Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
          {/* Left: Calendar Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 h-fit">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Calendar</h2>
            
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => changeMonth(-1)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-semibold text-slate-900">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button 
                onClick={() => changeMonth(1)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dayInfo, index) => {
                if (!dayInfo) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }
                
                const isSelected = dayInfo.dateStr === selectedDate;
                const isToday = dayInfo.dateStr === today;
                
                return (
                  <button
                    key={dayInfo.dateStr}
                    onClick={() => handleDateSelect(dayInfo.dateStr)}
                    className={`aspect-square flex items-center justify-center text-sm rounded-full transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold'
                        : isToday
                        ? 'bg-blue-50 text-blue-600 font-semibold ring-2 ring-blue-600'
                        : dayInfo.hasAppointments
                        ? 'text-slate-900 hover:bg-slate-100 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {dayInfo.day}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <p className="text-xs font-medium text-slate-500 mb-3">Status</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-600">Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sky-500" />
                  <span className="text-xs text-slate-600">Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  <span className="text-xs text-slate-600">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-xs text-slate-600">Cancelled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Appointments List Panel */}
          <div>
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-4">
              <div className="flex text-sm font-medium border-b border-slate-200">
                {['Upcoming', 'Today', 'Past', 'All'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`flex-1 px-6 py-3 transition-colors ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters Row */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>All Status</option>
                  <option>Confirmed</option>
                  <option>Scheduled</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>

                {/* Doctor Filter */}
                <select
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>All Doctors</option>
                  {uniqueDoctors.map(doctor => (
                    <option key={doctor}>{doctor}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Appointments List */}
            {isLoading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-4 text-slate-600">Loading appointments...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                <svg 
                  className="mx-auto h-16 w-16 text-slate-400 mb-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Appointments Found
                </h3>
                <p className="text-slate-600">
                  {selectedDate 
                    ? 'No appointments scheduled for this date.'
                    : `No ${activeTab.toLowerCase()} appointments.`}
                </p>
              </div>
            ) : (
              /* Appointment Cards */
              <div className="space-y-4">
                {filteredAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Top Row: Avatar, Name, Status */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Patient Avatar */}
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {appointment.initials}
                      </div>

                      {/* Patient Name and Doctor */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {appointment.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {appointment.doctorName}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>

                    {/* Date, Time, Duration Row */}
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <span>-</span>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatTime(appointment.time)}</span>
                      </div>
                      <span>-</span>
                      <span>{appointment.duration} min</span>
                      <span>-</span>
                      <div className="flex items-center gap-1.5">
                        {appointment.mode === 'Video Call' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        )}
                        <span>{appointment.mode}</span>
                      </div>
                    </div>

                    {/* Reason and Note */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div>
                        <span className="font-medium text-slate-700">Reason:</span>
                        <span className="text-slate-600 ml-1">{appointment.reason}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Note:</span>
                        <span className="text-slate-600 ml-1">{appointment.note}</span>
                      </div>
                    </div>

                    {/* Bottom Row: Contact and Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{appointment.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{appointment.email}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentManagementView;
