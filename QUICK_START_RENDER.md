# 🚀 Quick Deployment Guide - Render

## Your project is ready to deploy! Here's how:

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Name it: `ai-recruitment-platform`
3. Choose **Private** (recommended for production)
4. Click **Create Repository**

### Step 2: Push Your Code

Copy these commands and run them in your terminal:

```bash
cd c:\Users\kanik\OneDrive\Documents\Projects\ai-recruitment-platform

git remote add origin https://github.com/YOUR_USERNAME/ai-recruitment-platform.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Deploy Backend on Render

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Select your `ai-recruitment-platform` repository
4. Fill in:
   - **Name**: `ai-recruitment-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

5. Click **Advanced** and add environment variables:
   ```
   MONGO_URI = mongodb+srv://rajatagrawal887_db_user:QbvudqXhCRHhFUcx@cluster0.y6bmn42.mongodb.net/ai-recruitment?retryWrites=true&w=majority
   JWT_SECRET = (generate random: https://www.random.org/strings/)
   PORT = 5000
   NODE_ENV = production
   ```

6. Click **Create Web Service**
7. Wait for it to deploy (check logs for "Server running on port 5000")
8. **Copy the backend URL** (looks like: `https://ai-recruitment-backend.onrender.com`)

### Step 4: Deploy Frontend on Render

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Select your repository again
4. Fill in:
   - **Name**: `ai-recruitment-frontend`
   - **Environment**: `Node`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Start Command**: `cd frontend && npm start`

5. Click **Advanced** and add environment variables:
   ```
   REACT_APP_API_URL = https://ai-recruitment-backend.onrender.com/api
   NODE_ENV = production
   ```
   (Replace the backend URL with the one you copied in Step 3)

6. Click **Create Web Service**
7. Wait for deployment to complete

### Step 5: Test Your Site

- Visit your frontend URL (from Render dashboard)
- Test registration and login
- Test job browsing and application features

## 📝 Important Notes

- **Free Tier**: Services sleep after 15 minutes of inactivity (upgrade to paid to keep always-on)
- **Build Time**: First deployment takes 5-10 minutes
- **Updates**: Simply push to GitHub and Render auto-deploys

## 🆘 Troubleshooting

**Backend won't start?**
- Check logs in Render dashboard
- Verify MONGO_URI is correct

**Frontend can't reach backend?**
- Make sure REACT_APP_API_URL matches your backend URL
- Check backend is running

## Project Structure

```
ai-recruitment-platform/
├── backend/          # Node.js/Express API
├── frontend/         # React app
├── ai-service/       # AI matching service
├── .gitignore        # Git ignore rules
├── .env.example      # Example environment variables
├── render.yaml       # Render configuration
└── DEPLOYMENT.md     # Full deployment guide
```

---

**Questions?** See DEPLOYMENT.md for detailed instructions.
