# 🏥 Appointment Management System - Full Stack

A complete appointment scheduling and queue management system built with React, FastAPI, and Neon PostgreSQL.

![Tech Stack](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)
![Tech Stack](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwind-css)
![Tech Stack](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![Tech Stack](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql)

## 📋 Overview

This system provides a modern, full-featured appointment management interface with:
- **Two Views**: Appointment List Management & Day Calendar
- **Real-time Updates**: Status changes sync with database
- **Advanced Filtering**: By date, status, doctor, and search
- **Cloud Database**: Powered by Neon serverless PostgreSQL
- **RESTful API**: FastAPI backend simulating AWS Lambda + AppSync architecture

## 🎯 Features

### Appointment Management View
- ✅ Stats dashboard (Today, Confirmed, Upcoming, Virtual)
- ✅ Interactive calendar with month navigation
- ✅ Multiple filter options (date, status, doctor, search)
- ✅ Real-time status updates
- ✅ Detailed appointment cards with patient info

### Day Calendar View
- ✅ Google Calendar-style time grid
- ✅ Visual event blocks with color coding
- ✅ Event details sidebar
- ✅ Click to view/edit appointments
- ✅ 7 AM - 6 PM time range

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Neon PostgreSQL account (free at [neon.tech](https://neon.tech))

### 1. Clone & Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
pip install -r requirements.txt
```

### 2. Setup Database

1. Create a Neon database at [neon.tech](https://neon.tech)
2. Copy `.env.example` to `.env`
3. Add your Neon connection string to `.env`:
   ```env
   DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
   ```

### 3. Initialize Database

```bash
python database.py
```

### 4. Start Servers

**Terminal 1 - Backend:**
```bash
python api.py
```
Backend runs on http://localhost:8000

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend runs on http://localhost:5175

### 5. Open Application

Visit **http://localhost:5175** in your browser

## 📁 Project Structure

```
├── api.py                          # FastAPI backend server
├── database.py                     # Database initialization & seeding
├── appointmentService.js           # Frontend API client
├── EMR_Frontend_Assignment.jsx     # Main appointment view
├── DayCalendarView.jsx            # Calendar view
├── src/
│   ├── main.jsx                   # React entry with tab switcher
│   └── index.css                  # Global styles
├── requirements.txt               # Python dependencies
├── package.json                   # Node dependencies
└── .env                          # Database config (create this)
```

## 🔧 Technology Stack

### Frontend
- **React 18.2** - UI framework
- **Tailwind CSS 3.4** - Styling
- **Vite 5.0** - Build tool

### Backend
- **FastAPI** - Python web framework
- **Uvicorn** - ASGI server
- **Psycopg2** - PostgreSQL adapter

### Database
- **Neon PostgreSQL** - Serverless PostgreSQL
- **SSL Connection** - Secure database access

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | Get all appointments (with filters) |
| POST | `/api/appointments` | Create new appointment |
| PUT | `/api/appointments/{id}/status` | Update appointment status |
| DELETE | `/api/appointments/{id}` | Delete appointment |
| GET | `/api/stats` | Get dashboard statistics |

**API Documentation:** http://localhost:8000/docs

## 🎨 UI Features

### Filters & Search
- **Date Selection**: Click calendar dates
- **Tabs**: Upcoming / Today / Past / All
- **Status Filter**: All / Confirmed / Scheduled / Completed / Cancelled
- **Doctor Filter**: Filter by assigned doctor
- **Search**: Search by patient or doctor name

### Status Management
- Color-coded status badges
- One-click status updates
- Optimistic UI updates
- Automatic revert on error

## 🔐 Architecture

```
┌─────────────────┐      HTTP/JSON      ┌──────────────────┐      SQL      ┌─────────────────┐
│  React Frontend │ ──────────────────→ │  FastAPI Backend │ ────────────→ │ Neon PostgreSQL │
│   (Port 5175)   │ ←────────────────── │   (Port 8000)    │ ←──────────── │  (Cloud)        │
└─────────────────┘      CORS Enabled   └──────────────────┘               └─────────────────┘
```

**Design Pattern**: Simulates AWS serverless architecture
- Frontend = React SPA
- Backend = Lambda functions (via FastAPI)
- API = AppSync GraphQL (via REST endpoints)
- Database = Aurora PostgreSQL (via Neon)

## 🧪 Testing

### Test Backend
```bash
# Check health
curl http://localhost:8000/

# Get appointments
curl http://localhost:8000/api/appointments

# Update status
curl -X PUT http://localhost:8000/api/appointments/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Completed"}'
```

### Test Frontend
1. Open http://localhost:5175
2. Click different dates in calendar
3. Switch between tabs
4. Update appointment status
5. Use search and filters

## 🐛 Troubleshooting

**Backend not connecting to database:**
- Check `.env` file exists with correct DATABASE_URL
- Verify Neon database is active (free tier may sleep)
- Test connection in Neon dashboard

**Frontend showing error:**
- Ensure backend is running on port 8000
- Check browser console for errors
- Verify CORS is enabled in `api.py`

**Port already in use:**
- Backend: Change port in `api.py`
- Frontend: Vite auto-assigns next available port

## 📚 Documentation

- **Setup Guide**: See `SETUP.md` for detailed instructions
- **API Docs**: http://localhost:8000/docs (when backend running)
- **Database Schema**: See `database.py` for table structure

## 🎯 Future Enhancements

- [ ] Create new appointments from UI
- [ ] Edit appointment details
- [ ] Delete appointments
- [ ] WebSocket real-time updates
- [ ] Email notifications
- [ ] User authentication
- [ ] Export to CSV/PDF
- [ ] Appointment reminders
- [ ] Multi-language support
- [ ] Mobile responsive improvements

## 📄 License

MIT License - Feel free to use for your projects!

## 👨‍💻 Author

Built as an internship assignment demonstrating full-stack development skills with modern tech stack.

---

**Need Help?** Check `SETUP.md` for detailed setup instructions or open an issue.
