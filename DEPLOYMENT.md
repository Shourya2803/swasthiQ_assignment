# 🚀 Deployment Guide

## Quick Deployment (Free Tier)

### Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Railway account (sign up at railway.app)
- Neon database (already setup ✅)

---

## 1. Deploy Backend to Railway

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Complete appointment management system"

# Create new GitHub repo and push
git remote add origin https://github.com/YOUR-USERNAME/appointment-system.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will auto-detect Python project

### Step 3: Configure Environment Variables

In Railway dashboard:
1. Go to "Variables" tab
2. Add environment variable:
   ```
   DATABASE_URL=your-neon-connection-string
   ```
3. Railway will auto-deploy

### Step 4: Get Backend URL

After deployment completes:
- Railway provides a URL like: `https://appointment-system-production.up.railway.app`
- Test it: `https://your-url.railway.app/` should show API status

---

## 2. Deploy Frontend to Vercel

### Step 1: Update API URL

Update `appointmentService.js`:

```javascript
// Change from localhost to your Railway URL
const API_BASE_URL = 'https://your-railway-url.railway.app/api';
```

### Step 2: Commit Changes

```bash
git add appointmentService.js
git commit -m "Update API URL for production"
git push
```

### Step 3: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click "Deploy"

### Step 4: Get Frontend URL

Vercel provides URL like: `https://appointment-system.vercel.app`

---

## 3. Update CORS (Important!)

After getting your Vercel URL, update `api.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174", 
        "http://localhost:5175",
        "https://your-vercel-app.vercel.app"  # Add this
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push - Railway will auto-deploy.

---

## Alternative: Deploy Both on Vercel

If you want everything on Vercel:

### Backend as Serverless Function

1. Create `api/index.py`:
```python
from api import app

# Vercel serverless handler
def handler(request):
    return app(request)
```

2. Create `vercel.json`:
```json
{
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## Deployment Checklist

Before deploying:

- [ ] Push code to GitHub
- [ ] Neon database is active
- [ ] `.env` not committed (in .gitignore)
- [ ] `requirements.txt` is complete
- [ ] `package.json` has build script

After deploying backend:
- [ ] Test API endpoint: `https://backend-url/`
- [ ] Test appointments: `https://backend-url/api/appointments`
- [ ] Test API docs: `https://backend-url/docs`

After deploying frontend:
- [ ] Update `appointmentService.js` with production URL
- [ ] Test frontend loads
- [ ] Test data fetching works
- [ ] Test status updates work
- [ ] Test all filters work

---

## Environment Variables

### Railway (Backend)
```
DATABASE_URL=postgresql://user:pass@host/db
```

### Vercel (Frontend) - Optional
```
VITE_API_URL=https://your-backend-url.railway.app/api
```

Then use in code:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

---

## Troubleshooting

**Backend 500 Error:**
- Check Railway logs
- Verify DATABASE_URL is set
- Test database connection from Railway console

**Frontend API Error:**
- Check CORS configuration in `api.py`
- Verify API URL in `appointmentService.js`
- Check browser console for errors

**Database Connection Timeout:**
- Neon free tier sleeps after inactivity
- Wake it in Neon dashboard
- Consider upgrading for production

---

## Cost Breakdown (Free Tier)

- **Neon Database:** Free (3 GB storage, 100 hours compute/month)
- **Railway Backend:** Free ($5 credit/month, ~500 hours)
- **Vercel Frontend:** Free (unlimited bandwidth for personal projects)

**Total: $0/month** for hobby/demo projects! 🎉

---

## Custom Domain (Optional)

### For Vercel:
1. Buy domain (Namecheap, Google Domains)
2. In Vercel: Settings → Domains
3. Add your domain
4. Update DNS records

### For Railway:
1. In Railway: Settings → Domains
2. Add custom domain
3. Update DNS records

---

## Production Recommendations

When going to production:

1. **Add Rate Limiting:**
```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
```

2. **Add Authentication:**
```python
from fastapi.security import HTTPBearer
security = HTTPBearer()
```

3. **Enable HTTPS Only**
4. **Add Monitoring** (Sentry, LogRocket)
5. **Set Up CI/CD** (GitHub Actions)
6. **Add Backup Strategy** for database
7. **Enable Database SSL** in production

---

## Next Steps

1. Deploy backend to Railway
2. Deploy frontend to Vercel
3. Update README with live links
4. Submit assignment! 🎉

Need help with any step? Just ask!
