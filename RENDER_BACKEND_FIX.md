# Render Backend Deployment Fix Guide

**Status**: Backend returning 404 error - service not properly deployed

**Root Cause**: Service hasn't triggered build or environment variables missing

---

## ✅ STEP 1: Verify Service Exists on Render

1. Go to https://dashboard.render.com/
2. Look for **ai-recruitment-backend** service
3. Check build status:
   - 🟢 Green checkmark = deployed, working
   - 🟡 Gray/building = deploying now
   - 🔴 Red X = build failed

---

## ✅ STEP 2: If Service Doesn't Exist

### Create New Web Service:

1. Click **"New +"** → **"Web Service"**
2. Select **GitHub** as source
3. Search and select: **Rajatagrawal17/ai-recruitment-platform**
4. Configure:
   - **Name**: `ai-recruitment-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free

### Add Environment Variables:

Click **Environment** tab and add:

```
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=your-secret-key-here
RENDER_BACKEND_URL=https://ai-recruitment-backend.onrender.com
NODE_ENV=production
PORT=5000
```

**Where to get MONGO_URI:**
- Go to MongoDB Atlas → Your Database → Connection String
- Copy connection string
- Replace `<password>` with actual password
- Format: `mongodb+srv://username:password@cluster.mongodb.net/recruitment?retryWrites=true&w=majority`

---

## ✅ STEP 3: If Service Exists - Check Environment Variables

1. Open service dashboard
2. Click **Settings**
3. Scroll to **Environment Variables**
4. Verify all are set:
   - ✅ MONGO_URI (must be correct)
   - ✅ JWT_SECRET
   - ✅ NODE_ENV=production
   - ✅ PORT=5000

---

## ✅ STEP 4: Manually Trigger Deployment

If environment variables are correct but it's not deploying:

1. Open service → **Settings**
2. Scroll down, click **"Redeploy latest commit"** button
3. Watch build logs in **Deployments** tab
4. Wait for green checkmark (usually 3-5 minutes)

---

## ✅ STEP 5: Check Build Logs for Errors

1. Click **Deployments** tab
2. Click latest deployment
3. Check logs for errors
4. Common issues:
   - `npm install failed` → Check backend/package.json syntax
   - `Cannot find module` → Missing dependencies
   - `ECONNREFUSED MongoDB` → MONGO_URI incorrect

---

## ✅ STEP 6: Test Backend Health

Once deployed (green checkmark):

```
curl https://ai-recruitment-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "dbConnected": true,
  "timestamp": "2024-01-15T..."
}
```

If you get 404 → Check backend/routes/healthRoutes.js exists

---

## 🔍 Troubleshooting

### Backend Still 404 After Deployment?

Check if `/api/health` route exists:
- Look at [backend/server.js](../../backend/server.js)
- Should have: `app.use('/api/health', healthRoutes)`

### Build Failed?

1. Check [backend/package.json](../../backend/package.json) for syntax errors
2. Verify Node version: `node --version` (should be 18+)
3. Check dependencies install locally: `cd backend && npm install`

### MONGO_URI Not Working?

1. Verify connection string is correct
2. Check MongoDB Atlas firewall allows Render IPs (set to 0.0.0.0/0)
3. Test locally first: Copy MONGO_URI and test locally
4. Add `+srv` variant if using modern MongoDB

---

## 🚀 After Backend Deploys

1. Hard refresh frontend: **Ctrl+Shift+F5** (or Cmd+Shift+R on Mac)
2. Try login - should work instantly
3. Navbar should update immediately
4. Test logout button

---

## ⚡ Quick Commands to Test

```bash
# Test frontend
curl https://cognifit-frontend-6coo.onrender.com

# Test backend health
curl https://ai-recruitment-backend.onrender.com/api/health

# Test backend auth (after login has working data)
curl https://ai-recruitment-backend.onrender.com/api/users/me
```

---

**⏱️ Expected Timeline:**
- Service creation: 2 minutes
- Build on Render: 3-5 minutes
- Total deployment: ~10 minutes

**Once backend is 🟢 green → All features will work on production!**
