# 🔧 Deployment Fix Guide - Render

## ✅ Local Testing (Verify API Works Locally First)

### 1. Stop Current Services
```powershell
Get-Job | Stop-Job
Get-Job | Remove-Job
```

### 2. Restart Backend
```powershell
cd backend
npm start
```

You should see:
```
✅ MongoDB Connected
Server running on port 5000 🚀
```

### 3. Restart Frontend (in new terminal)
```powershell
cd frontend
npm start
```

Browser should open to `http://localhost:3000`

### 4. Test API Connection
- Open browser DevTools (F12)
- Console → Try: `fetch('http://localhost:5000/api/jobs')`
- Should return JSON jobs data

---

## 🚀 Deploy to Render (Step by Step)

### CRITICAL: Before Deploying

1. **Ensure Git is Configured**
   ```powershell
   git config --global user.email "your-email@example.com"
   git config --global user.name "Your Name"
   ```

2. **Check Git Status**
   ```powershell
   git status
   git log --oneline -3
   ```

---

### Phase 1: Push to GitHub

1. **Create Empty Repository on GitHub**
   - Go to https://github.com/new
   - Repository name: `ai-recruitment-platform`
   - ✅ Set to **Private**
   - ✅ Do NOT initialize with README
   - Click **Create repository**

2. **Push Your Code**
   ```powershell
   cd c:\Users\kanik\OneDrive\Documents\Projects\ai-recruitment-platform
   
   git remote add origin https://github.com/YOUR_USERNAME/ai-recruitment-platform.git
   git branch -M main
   git push -u origin main
   ```
   
   Replace `YOUR_USERNAME` with your actual GitHub username.

3. **Verify on GitHub**
   - Refresh https://github.com/YOUR_USERNAME/ai-recruitment-platform
   - Should see all files

---

### Phase 2: Deploy Backend on Render

1. **Go to Render Dashboard**
   - Open https://dashboard.render.com
   - Login/Signup if needed

2. **Create Backend Service**
   - Click **+ New** → **Web Service**
   - Click **Connect Account** (GitHub)
   - Select `ai-recruitment-platform` repository
   - Click **Deploy**

3. **Configure Backend Service**
   
   **Name & Environment:**
   - Name: `ai-recruitment-backend`
   - Environment: `Node`
   - Region: Choose closest to you
   - Plan: **Free** (you can upgrade later)

   **Build Settings:**
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

   **Environment Variables:**
   Click **Add Environment Variable** for each:
   
   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | `mongodb+srv://rajatagrawal887_db_user:QbvudqXhCRHhFUcx@cluster0.y6bmn42.mongodb.net/ai-recruitment?retryWrites=true&w=majority` |
   | `JWT_SECRET` | Generate a random string (use online generator or: `openssl rand -base64 32`) |
   | `PORT` | `5000` |
   | `NODE_ENV` | `production` |

4. **Deploy**
   - Click **Create Web Service**
   - Wait for deployment (check logs)
   - When ready, you'll see green checkmark
   - **Copy your backend URL** (e.g., `https://ai-recruitment-backend.onrender.com`)

5. **Verify Backend is Working**
   - Visit: `https://your-backend-url/api/jobs` (replace with your actual URL)
   - Should return JSON with jobs array

---

### Phase 3: Deploy Frontend on Render

1. **Create Frontend Service**
   - Go to https://dashboard.render.com
   - Click **+ New** → **Web Service**
   - Select same repository
   - Click **Deploy**

2. **Configure Frontend Service**

   **Name & Environment:**
   - Name: `ai-recruitment-frontend`
   - Environment: `Node`
   - Plan: **Free**

   **Build Settings:**
   - Build Command: `cd frontend && npm install && npm run build`
   - Start Command: `cd frontend && npm start`

   **Environment Variables:**
   Click **Add Environment Variable** for each:
   
   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://your-backend-url/api` |
   | `NODE_ENV` | `production` |

   ⚠️ **Important**: Replace `your-backend-url` with actual backend URL from Step 2.4

3. **Deploy**
   - Click **Create Web Service**
   - Wait for deployment and build to complete

4. **Verify Frontend is Working**
   - Visit your frontend URL from Render dashboard
   - Should see the jobs page
   - Open DevTools Console (F12)
   - Check for any errors

---

## 🆘 Troubleshooting

### Backend won't start
**Error:** "MongoDB Connection Failed"
- ✅ Check MONGO_URI is exactly correct (copy-paste from .env)
- ✅ Verify MongoDB Atlas cluster is online
- ✅ Check IP whitelist includes Render IPs (0.0.0.0/0)

**Error:** "Port already in use"
- This shouldn't happen on Render
- Check PORT env var is set to 5000

### Frontend showing blank page
**Issue:** Build fails
- Check build command: `cd frontend && npm install && npm run build`
- Verify no syntax errors in code
- Check logs in Render dashboard

**Issue:** Can't reach backend
- ✅ REACT_APP_API_URL must be correct full URL
- ✅ Must include `/api` at end
- ✅ Backend must be deployed first

### "Cannot GET /api"
- Backend is not running
- Check Render logs for errors
- Verify MONGO_URI is correct

### CORS Errors
- Already fixed in updated server.js
- If still happening, check background tab is open
- Refresh the page

---

## 📱 Testing the Deployment

Once both services are deployed:

1. **Test Homepage**
   - Visit frontend URL
   - Should see jobs list

2. **Test API Directly**
   ```
   https://your-backend-url/api/jobs
   ```

3. **Test Authentication**
   - Go to login page
   - Try login with demo credentials

4. **Check Browser Console (F12)**
   - No red errors
   - Should see network requests to backend

---

## 🔄 Making Updates After Deployment

Simply commit and push your changes:

```powershell
git add .
git commit -m "Your update message"
git push origin main
```

Render will automatically redeploy!

---

## 📊 Check Deployment Status

- **Backend logs**: Dashboard → ai-recruitment-backend → Logs
- **Frontend logs**: Dashboard → ai-recruitment-frontend → Logs
- **Deployments**: Dashboard → each service → Deployments tab

---

## Important Notes

- **Free Tier**: Services sleep after 15 min of inactivity
  - To keep always-on: Upgrade to Starter plan ($7/month)
- **Build Time**: First build takes 5-10 minutes
- **Database**: MongoDB Atlas works with Render (free tier)
- **Auto Deploy**: Every push to `main` triggers new deploy

---

Need help? Check each service's logs in Render dashboard for specific errors!
