# Project Structure

This project has been reorganized into separate frontend and backend directories for better organization and easier deployment.

## Directory Layout

```
swasthiQ_intern/
├── frontend/                      # React + Vite application
│   ├── src/                       # React components
│   │   └── main.jsx              # App entry point
│   ├── index.html                # HTML template
│   ├── package.json              # Node dependencies
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Tailwind CSS config
│   ├── appointmentService.js     # API client
│   ├── EMR_Frontend_Assignment.jsx
│   ├── DayCalendarView.jsx
│   ├── vercel.json               # Vercel deployment config
│   └── .env.production           # Production env template
│
├── backend/                       # Python FastAPI server
│   ├── api.py                    # FastAPI server & endpoints
│   ├── database.py               # PostgreSQL connection & init
│   ├── appointment_service.py    # Original mock service
│   ├── requirements.txt          # Python dependencies
│   ├── runtime.txt               # Python version
│   ├── Procfile                  # Process file for deployment
│   ├── railway.toml              # Railway deployment config
│   └── .env                      # Database credentials
│
├── render.yaml                    # Render Blueprint (both services)
├── DEPLOYMENT.md                  # Deployment instructions
├── SETUP.md                       # Local setup guide
└── README.md                      # Main documentation

```

## Running Locally

### Backend (from project root)
```bash
cd backend
pip install -r requirements.txt
python api.py
```
Server runs on http://localhost:8000

### Frontend (from project root)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173 (or similar)

## Deployment Options

### Option 1: Render (Monorepo - Recommended)
Uses `render.yaml` at root to deploy both services together.
- Backend: Python web service
- Frontend: Static site

### Option 2: Railway (Backend) + Vercel (Frontend)
- Railway: Deploy from `backend/` directory
- Vercel: Deploy from `frontend/` directory

See `DEPLOYMENT.md` for detailed instructions.

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-url.com/api
```

## Key Files

| File | Purpose |
|------|---------|
| `backend/api.py` | FastAPI server with 5 REST endpoints |
| `backend/database.py` | PostgreSQL schema & seeding |
| `frontend/appointmentService.js` | API client connecting to backend |
| `frontend/EMR_Frontend_Assignment.jsx` | Main appointment management UI |
| `frontend/DayCalendarView.jsx` | Calendar time grid view |
| `render.yaml` | Render deployment for both services |

## Technology Stack

**Frontend:**
- React 18.2
- Tailwind CSS 3.4
- Vite 5.0

**Backend:**
- Python 3.10
- FastAPI 0.104
- Uvicorn 0.24
- Psycopg2 (PostgreSQL driver)

**Database:**
- Neon PostgreSQL (serverless)
