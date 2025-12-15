import React, { useState, useMemo } from "react";

/**
 * DayCalendarView Component
 * Single-day calendar scheduling view with time grid and event details sidebar
 * Matches Google Calendar style layout
 */
export function DayCalendarView() {
  // Mock events data
  const events = [
    {
      id: 1,
      title: "General Checkup",
      patient: "Rahul Sharma",
      start: "09:00",
      end: "10:00",
      color: "bg-blue-500",
      date: "Thursday, November 6, 2025",
      phone: "+91 98765 43210",
      email: "rahul.sharma@email.com",
      abhaId: "12-3456-7890-1234",
      doctor: "Dr. Rajesh Kumar – Cardiologist"
    },
    {
      id: 2,
      title: "Follow-up Consultation",
      patient: "Priya Singh",
      start: "11:00",
      end: "12:00",
      color: "bg-amber-400",
      date: "Thursday, November 6, 2025",
      phone: "+91 98765 43211",
      email: "priya.singh@email.com",
      abhaId: "",
      doctor: "Dr. Rajesh Kumar – Cardiologist"
    },
    {
      id: 3,
      title: "Vaccination",
      patient: "Amit Patel",
      start: "14:00",
      end: "15:00",
      color: "bg-violet-500",
      date: "Thursday, November 6, 2025",
      phone: "+91 98765 43212",
      email: "amit.patel@email.com",
      abhaId: "98-7654-3210-9876",
      doctor: "Dr. Rajesh Kumar – Cardiologist"
    }
  ];

  // State
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [currentDate] = useState("Thursday, November 6, 2025");

  // Get selected event
  const selectedEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId);
  }, [selectedEventId]);

  // Hours to display (7 AM to 6 PM)
  const hours = [
    "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM",
    "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"
  ];

  // Calculate event position
  const getEventPosition = (start, end) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    const startOffset = (startHour - 7) * 56 + (startMin / 60) * 56;
    const endOffset = (endHour - 7) * 56 + (endMin / 60) * 56;
    const height = endOffset - startOffset - 6;
    
    return {
      top: `${startOffset}px`,
      height: `${height}px`
    };
  };

  // Format time to 12-hour format
  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Top Toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-slate-900">Calendar</span>
            </div>

            {/* Center Controls */}
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Today
              </button>
              
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <span className="text-lg font-semibold text-slate-900">{currentDate}</span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <option>Day</option>
                <option>Week</option>
                <option>Month</option>
              </select>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                <span className="text-lg">+</span>
                Create
              </button>
            </div>
          </div>

          {/* Main Content: Time Grid + Event Details */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr),minmax(0,1.3fr)]">
            {/* Left: Time Grid */}
            <div className="relative px-6 py-4 overflow-x-hidden overflow-y-auto max-h-[640px]">
              {/* Timezone Label */}
              <div className="mb-2 pl-16">
                <span className="text-xs text-slate-400">GMT+05:30</span>
              </div>

              {/* Time Grid */}
              <div className="relative">
                <div className="space-y-0">
                  {hours.map((hour, index) => (
                    <div key={hour} className="grid grid-cols-[4rem,minmax(0,1fr)] h-14">
                      <div className="text-xs text-slate-400 pr-2 pt-0 text-right">
                        {hour}
                      </div>
                      <div className="border-t border-slate-100"></div>
                    </div>
                  ))}
                </div>

                {/* Events Layer */}
                <div className="absolute inset-0 left-24 right-4 pointer-events-none">
                  <div className="relative pointer-events-auto">
                    {events.map((event) => {
                      const position = getEventPosition(event.start, event.end);
                      const isSelected = selectedEventId === event.id;
                      
                      return (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEventId(event.id)}
                          className={`absolute left-0 right-0 rounded-lg text-white text-xs px-4 py-2 flex flex-col justify-center shadow-md transition-all ${event.color} ${
                            isSelected ? 'ring-2 ring-slate-900 ring-offset-2 shadow-lg' : 'hover:shadow-lg'
                          }`}
                          style={position}
                        >
                          <div className="font-semibold">{event.title}</div>
                          <div className="text-white/90 mt-0.5">{event.patient}</div>
                          <div className="text-white/80 text-[10px] mt-1">
                            {formatTime(event.start)} - {formatTime(event.end)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Event Details Sidebar */}
            <div className="border-l border-slate-100 bg-slate-50/60 h-full flex flex-col max-h-[640px]">
              {/* Sidebar Header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">
                  {selectedEvent ? 'Event Details' : 'Create Event'}
                </h3>
                {selectedEvent && (
                  <button 
                    onClick={() => setSelectedEventId(null)}
                    className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Sidebar Content */}
              <div className="px-6 py-6 space-y-5 overflow-y-auto flex-1">
                {selectedEvent ? (
                  <>
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">Event Title</label>
                      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900">
                        {selectedEvent.title}
                      </div>
                    </div>

                    {/* Event Type Button */}
                    <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                      Consultation Event
                    </button>

                    {/* Date & Time */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">Date</label>
                      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 flex items-center justify-between">
                        <span>{selectedEvent.date}</span>
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2">Start Time</label>
                        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 flex items-center justify-between">
                          <span>{formatTime(selectedEvent.start)}</span>
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2">End Time</label>
                        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 flex items-center justify-between">
                          <span>{formatTime(selectedEvent.end)}</span>
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Patient Information */}
                    <div className="pt-2">
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">Patient Information</h4>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-2">Patient Name</label>
                            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900">
                              {selectedEvent.patient}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-2">Phone Number</label>
                            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900">
                              {selectedEvent.phone}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-2">Email Address</label>
                            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900">
                              {selectedEvent.email}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-2">ABHA ID (Optional)</label>
                            <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-400">
                              {selectedEvent.abhaId || 'Not provided'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Doctor Section */}
                    <div className="pt-2">
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">Assigned Doctor</h4>
                      <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            RK
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{selectedEvent.doctor}</div>
                            <div className="text-xs text-slate-500">Notify 30 minutes before</div>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        More options
                      </button>
                      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Save
                      </button>
                    </div>
                  </>
                ) : (
                  /* No Event Selected - Create New */
                  <>
                    {/* Title Input */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">Event Title</label>
                      <input
                        type="text"
                        placeholder="Consultation with Dr. Yagya"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Event Type Button */}
                    <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                      New Event
                    </button>

                    {/* Date & Time */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">Date</label>
                      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                        <span>{currentDate}</span>
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2">Start Time</label>
                        <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>8:30 AM</option>
                          <option>9:00 AM</option>
                          <option>9:30 AM</option>
                          <option>10:00 AM</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2">End Time</label>
                        <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>9:30 AM</option>
                          <option>10:00 AM</option>
                          <option>10:30 AM</option>
                          <option>11:00 AM</option>
                        </select>
                      </div>
                    </div>

                    {/* Patient Information */}
                    <div className="pt-2">
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">Patient Information</h4>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Add patient name"
                            className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="tel"
                            placeholder="Add phone number"
                            className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="email"
                            placeholder="Add email address"
                            className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Add ABHA ID (Optional)"
                            className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Doctor Section */}
                    <div className="pt-2">
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">Assign Doctor</h4>
                      <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            RK
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">Dr. Rajesh Kumar – Cardiologist</div>
                            <div className="text-xs text-slate-500">Notify 30 minutes before</div>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        More options
                      </button>
                      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Save
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DayCalendarView;
