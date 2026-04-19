# COGNIFIT - Environment Variables Setup Guide

## 🎯 Quick Start

This guide explains every environment variable needed for the AI Recruitment Platform to work on Render.

---

## 📦 BACKEND - Environment Variables (Render Dashboard)

### Required Variables:

| Variable | Value | Where to Get | Example |
|----------|-------|-------------|---------|
| **MONGO_URI** | MongoDB connection string | MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true` |
| **JWT_SECRET** | Secret key for tokens | Generate random | `6ZvHFXnjGL+ZQX0FocKOdaKXsWGoCHnX` |
| **NODE_ENV** | Environment mode | Set to value | `production` |
| **PORT** | Server port | Set to value | `5000` |
| **TWILIO_ACCOUNT_SID** | Twilio SMS account | Twilio dashboard | `AC3ed436947bf8b326f536` |
| **TWILIO_AUTH_TOKEN** | Twilio auth token | Twilio dashboard | `97e9d124c78b764837f5e1c5` |
| **TWILIO_PHONE_NUMBER** | Twilio phone number | Twilio dashboard | `+12545034967` |
| **SMTP_USER** | Gmail email address | Your Gmail | `your@gmail.com` |
| **SMTP_PASSWORD** | Gmail app password | Gmail app passwords | `xxxx xxxx xxxx xxxx` |
| **CLAUDE_API_KEY** | Claude API key | anthropic.com | `sk-ant-...` |

### ⚠️ CRITICAL: MongoDB IP Whitelist

**YOUR APP WON'T CONNECT TO DATABASE WITHOUT THIS:**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click your cluster → **Network Access**
3. Click **ADD IP ADDRESS**
4. Enter: `0.0.0.0/0` (allows all IPs - required for Render's dynamic IPs)
5. Click **Confirm**

---

## 🎨 FRONTEND - Environment Variables (Render Dashboard)

### Required Variables:

| Variable | Value | Example |
|----------|-------|---------|
| **REACT_APP_API_URL** | Backend base URL | `https://ai-recruitment-backend-XXXX.onrender.com` |
| **NODE_ENV** | Environment | `production` |

### Find Your Backend URL:

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click on your **backend service** (`ai-recruitment-backend`)
3. Copy the URL from the top (looks like `https://ai-recruitment-backend-xxxx.onrender.com`)
4. Paste this into `REACT_APP_API_URL` WITHOUT `/api` at the end

**Example:**
- ✅ CORRECT: `https://ai-recruitment-backend-xxxx.onrender.com`
- ❌ WRONG: `https://ai-recruitment-backend-xxxx.onrender.com/api`

---

## ✅ Verification Checklist

### After setting all variables, verify:

#### Frontend (in browser F12 console):

```javascript
// Should show your backend URL
// Look for lines starting with 📌, 📍, 🌍
```

Expected output:
```
╔═════════════════════════════════════════════════════════════╗
║          🚀 COGNIFIT AI RECRUITMENT PLATFORM 🚀            ║
╚═════════════════════════════════════════════════════════════╝
📌 Backend Base URL: https://ai-recruitment-backend-xxxx.onrender.com
📍 Example API Endpoint: https://ai-recruitment-backend-xxxx.onrender.com/api/auth/login
🌍 Environment: production
💻 Frontend URL: https://cognifit-frontend-xxxx.onrender.com
```

#### Backend (Check Render Logs):

Look for:
```
Server running on 0.0.0.0:5000 🚀
MongoDB Connected ✅
```

If you see MongoDB error, go back and **whitelist 0.0.0.0/0** in MongoDB Atlas.

#### API Health Check:

Open browser and go to:
```
https://ai-recruitment-backend-xxxx.onrender.com/api/health
```

Should see:
```json
{
  "status": "ok",
  "timestamp": "2026-04-19T...",
  "dbConnected": true
}
```

---

## 🚀 Render.yaml Configuration

Your `render.yaml` already has:

### Backend:
- Build: `cd backend && npm install`
- Start: `cd backend && npm start`
- Health check: `/api/health` ✅

### Frontend:
- Build: `cd frontend && npm install && npm run build`
- Start: `cd frontend && npx serve -s build -l 0.0.0.0:$PORT`
- No health check needed (static files only)

---

## 🔧 Generate Secure Values

### JWT_SECRET (Generate Random):

```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}) | ForEach-Object {[byte]$_}) 
```

### Or use any random 32+ character string

---

## 🐛 Troubleshooting

### "Cannot connect to database"
- ✅ Check MONGO_URI is correct
- ✅ Check IP whitelist includes `0.0.0.0/0`
- ✅ Check credentials are correct

### "API calls return 404"
- ✅ Check REACT_APP_API_URL doesn't have `/api` suffix
- ✅ Check backend service is running (check Render logs)
- ✅ Check CORS is not blocking (check F12 Network tab)

### "Blank page loads"
- ✅ Open F12 Console and look for errors
- ✅ Check if there are red error messages
- ✅ Check if "🚀 COGNIFIT PLATFORM" message appears (means frontend loaded)

### "API calls with 500 error"
- ✅ Check Render backend logs for errors
- ✅ Most likely: MongoDB not connected (see whitelist above)

---

## 📝 Step-by-Step Setup

### 1️⃣ MongoDB Atlas Setup
- [ ] Create/login to MongoDB Atlas
- [ ] Copy connection string with credentials
- [ ] Add `MONGO_URI` to Render backend env vars
- [ ] Whitelist `0.0.0.0/0` in Network Access

### 2️⃣ Generate Secrets
- [ ] Generate JWT_SECRET (32+ random characters)
- [ ] Add to Render backend env vars

### 3️⃣ Add Backend Variables
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`
- [ ] Twilio variables (if using SMS OTP)
- [ ] SMTP variables (if using email OTP)
- [ ] Claude API key (if using AI features)

### 4️⃣ Get Backend URL
- [ ] Go to Render Backend service
- [ ] Copy the service URL
- [ ] Add to Frontend as `REACT_APP_API_URL` (WITHOUT `/api`)

### 5️⃣ Add Frontend Variables
- [ ] `REACT_APP_API_URL` (from step 4)
- [ ] `NODE_ENV` = `production`

### 6️⃣ Verify
- [ ] Open frontend in browser
- [ ] Check F12 Console for startup message
- [ ] Try logging in
- [ ] Check backend logs for requests

---

## 🎉 You're Done!

If everything is set up correctly, your app should now:
- ✅ Load without blank pages
- ✅ Connect to MongoDB
- ✅ Accept API requests from frontend
- ✅ Display data correctly

**Need help?** Check the browser console (F12) and Render backend logs for error messages.
