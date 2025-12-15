# Complete Setup Guide - Full Stack Appointment Management System

## Architecture Overview

```
React Frontend (Vite)          Python Backend (FastAPI)        Neon PostgreSQL
Port 5175                  →   Port 8000                   →   Cloud Database
```

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Neon PostgreSQL Account** (free tier available at [neon.tech](https://neon.tech))

---

## Part 1: Database Setup (Neon PostgreSQL)

### Step 1: Create Neon Database

1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Click **"Create a Project"**
3. Name your project (e.g., `appointment-system`)
4. Select a region (choose closest to you)
5. Click **"Create Project"**

### Step 2: Get Connection String

1. After project creation, you'll see your **Connection String**
2. It looks like:
   ```
   postgresql://username:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Copy this entire string

### Step 3: Configure Environment

1. In the project root, create a `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and paste your connection string:
   ```env
   DATABASE_URL=postgresql://your-username:your-password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
   ```

---

## Part 2: Python Backend Setup

### Step 1: Install Python Dependencies

```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Initialize Database

This creates the tables and seeds sample data:

```bash
python database.py
```

You should see:
```
🔧 Initializing database...
✅ Database schema initialized successfully
✅ Seeded 12 sample appointments
✅ Database setup complete!
```

### Step 3: Start Backend Server

```bash
python api.py
```

You should see:
```
🚀 Starting FastAPI server...
📝 API documentation available at: http://localhost:8000/docs
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Test the backend:**
- Open http://localhost:8000 - Should show: `{"message": "Appointment Management API is running"}`
- Open http://localhost:8000/docs - Interactive API documentation

---

## Part 3: Frontend Setup

### Step 1: Install Node Dependencies

Open a **new terminal** (keep backend running):

```bash
npm install
```

### Step 2: Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
VITE v5.4.21  ready in xxx ms
➜  Local:   http://localhost:5175/
```

### Step 3: Open Application

Open your browser to **http://localhost:5175**

You should see:
- Two tabs: "Appointment Management" and "Day Calendar View"
- Data loaded from your Neon database
- 12 sample appointments

---

## Testing the Full Stack

### 1. Test Data Loading

- Refresh the page
- Data should load from database
- Check browser console for any errors

### 2. Test Status Update

- Click on an appointment
- Change its status using the dropdown
- Verify the status updates in the UI
- Check database: The status should be updated in Neon

### 3. Test Filtering

- **Date Filter**: Click dates in calendar
- **Tab Filter**: Switch between Upcoming/Today/Past/All
- **Search**: Type patient name or doctor name
- **Dropdowns**: Filter by status or doctor
- All filters should work together

---

## API Endpoints Reference

### GET /api/appointments
Fetch all appointments with optional filters

**Query Parameters:**
- `date` (optional): Filter by date (YYYY-MM-DD)
- `status` (optional): Filter by status

**Example:**
```bash
curl http://localhost:8000/api/appointments?date=2025-12-15&status=Confirmed
```

### PUT /api/appointments/{id}/status
Update appointment status

**Body:**
```json
{
  "status": "Confirmed"
}
```

**Example:**
```bash
curl -X PUT http://localhost:8000/api/appointments/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Completed"}'
```

### POST /api/appointments
Create new appointment

**Body:**
```json
{
  "patient_name": "John Doe",
  "appointment_date": "2025-12-20",
  "appointment_time": "10:00:00",
  "duration": 30,
  "doctor_name": "Dr. Smith",
  "status": "Scheduled",
  "mode": "In-person",
  "phone": "+1234567890",
  "email": "john@example.com"
}
```

### DELETE /api/appointments/{id}
Delete appointment

### GET /api/stats
Get dashboard statistics

---

## Troubleshooting

### Backend Issues

**Error: "DATABASE_URL environment variable is not set"**
- Make sure `.env` file exists in project root
- Check that DATABASE_URL is set correctly
- Verify no extra spaces or quotes

**Error: "psycopg2 not installed"**
- Run: `pip install psycopg2-binary`
- If still fails, try: `pip install psycopg2`

**Connection timeout to Neon**
- Check your internet connection
- Verify connection string is correct
- Check Neon dashboard - project should be active (not sleeping)
- Free tier databases may sleep after inactivity - wake them up in dashboard

**Port 8000 already in use**
- Stop other services using port 8000
- Or change port in `api.py`: `uvicorn.run(app, port=8001)`

### Frontend Issues

**Blank page or loading forever**
- Open browser console (F12)
- Check for CORS errors
- Verify backend is running on port 8000
- Check Network tab - requests should succeed

**"Failed to load appointments"**
- Backend not running - start it with `python api.py`
- Wrong API URL - check `appointmentService.js` line 6
- CORS blocked - verify CORS middleware in `api.py`

**Port 5173/5174/5175 in use**
- Vite will automatically try the next available port
- Or stop other Vite processes

### Database Issues

**"Relation 'appointments' does not exist"**
- Run database initialization: `python database.py`

**Old data still showing**
- Database was already seeded
- Either use existing data or:
  ```sql
  DELETE FROM appointments;
  ```
  Then run `python database.py` again

---

## Project Structure

```
swasthiQ_intern/
├── api.py                          # FastAPI backend server
├── database.py                     # Database setup and seeding
├── appointmentService.js           # Frontend API client
├── appointmentServiceMock.js       # Old mock service (not used)
├── appointment_service.py          # Original Python logic (reference)
├── EMR_Frontend_Assignment.jsx     # Appointment management UI
├── DayCalendarView.jsx            # Calendar view UI
├── src/
│   ├── main.jsx                   # React entry point (tab switcher)
│   └── index.css                  # Global styles
├── requirements.txt               # Python dependencies
├── package.json                   # Node dependencies
├── .env                          # Database credentials (create this)
└── .env.example                  # Template for .env
```

---

## Next Steps

### Add More Features

1. **Create New Appointments** - Implement the "New Appointment" button
2. **Delete Appointments** - Add delete functionality
3. **Edit Appointments** - Allow editing patient details
4. **Real-time Updates** - Add WebSocket support for live updates
5. **Authentication** - Add user login system
6. **Email Notifications** - Send appointment reminders

### Production Deployment

1. **Backend**: Deploy to AWS Lambda or Railway
2. **Frontend**: Deploy to Vercel or Netlify
3. **Database**: Already on Neon (production-ready)

---

## Important Notes

✅ **Both servers must be running**:
- Backend: `python api.py` (port 8000)
- Frontend: `npm run dev` (port 5175)

✅ **Database connection**:
- Free tier Neon databases sleep after inactivity
- Wake them up in the Neon dashboard if needed

✅ **Development mode**:
- Frontend has hot reload - changes appear instantly
- Backend needs restart for code changes

---

## Quick Start Commands

```bash
# Terminal 1: Backend
python database.py      # First time only
python api.py          # Keep running

# Terminal 2: Frontend
npm install            # First time only
npm run dev           # Keep running

# Browser
# Open: http://localhost:5175
```

---

## Support

If you encounter issues:
1. Check both terminal outputs for errors
2. Verify Neon database is active in dashboard
3. Check browser console (F12) for frontend errors
4. Visit API docs: http://localhost:8000/docs

Enjoy your full-stack appointment management system! 🎉
