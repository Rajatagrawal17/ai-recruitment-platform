# Deployment Guide - Render

## Prerequisites
- GitHub account
- Render account (https://render.com)
- MongoDB Atlas account (already set up)

## Step 1: Push to GitHub

```bash
# Initialize git repo
git init
git add .
git commit -m "Initial commit: AI Recruitment Platform"

# Create new repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/ai-recruitment-platform.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend on Render

1. Go to https://dashboard.render.com
2. Click **"New Web Service"**
3. Select your GitHub repository
4. Configure:
   - **Name**: `ai-recruitment-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (or paid as needed)

5. Add Environment Variables:
   - `MONGO_URI` = Your MongoDB connection string
   - `JWT_SECRET` = Generate a random secret (e.g., `openssl rand -base64 32`)
   - `PORT` = 5000
   - `NODE_ENV` = production

6. Click **"Create Web Service"**
7. Wait for deployment to complete and note the URL (e.g., `https://ai-recruitment-backend.onrender.com`)

## Step 3: Deploy Frontend on Render

1. Click **"New Web Service"** again
2. Select the same repository
3. Configure:
   - **Name**: `ai-recruitment-frontend`
   - **Environment**: `Node`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Start Command**: `cd frontend && npm start`
   - **Plan**: Free

4. Add Environment Variables:
   - `REACT_APP_API_URL` = Your backend URL from Step 2 (e.g., `https://ai-recruitment-backend.onrender.com/api`)
   - `NODE_ENV` = production

5. Click **"Create Web Service"**
6. Wait for deployment to complete

## Step 4: Update Frontend API Configuration

Update `frontend/src/services/api.js` to use the environment variable:

```javascript
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});
```

Or update the `.env` file in the frontend folder with:
```
REACT_APP_API_URL=https://ai-recruitment-backend.onrender.com/api
```

## Step 5: Verify Deployment

1. Visit your frontend URL
2. Test login/registration
3. Test job browsing and application features
4. Check browser console for any API errors

## Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify MONGO_URI is correct
- Ensure JWT_SECRET is set

### Frontend API calls fail
- Verify REACT_APP_API_URL is set correctly
- Check CORS settings in backend/server.js
- Ensure backend URL is accessible

### Free tier limitations
- Render free tier services go to sleep after 15 minutes of inactivity
- Upgrade to paid plan for always-on service
- Databases need separate upgrade

## Updating After Deployment

Simply push changes to GitHub:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Render will automatically redeploy when it detects changes.

## Important Notes

- **Free tier has limitations**: Services sleep after 15 min of inactivity
- **Database**: MongoDB Atlas is already configured and should work
- **Environment Variables**: Never commit .env files, use Render dashboard
- **Build time**: Initial build may take 5-10 minutes
