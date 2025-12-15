import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import AppointmentManagementView from '../EMR_Frontend_Assignment';
import DayCalendarView from '../DayCalendarView';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('appointments'); // 'appointments' or 'calendar'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentView('appointments')}
              className={`px-6 py-4 font-medium text-sm transition-colors relative ${
                currentView === 'appointments'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📅 Appointment Management
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className={`px-6 py-4 font-medium text-sm transition-colors relative ${
                currentView === 'calendar'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🗓️ Day Calendar View
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {currentView === 'appointments' ? (
          <AppointmentManagementView />
        ) : (
          <DayCalendarView />
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
