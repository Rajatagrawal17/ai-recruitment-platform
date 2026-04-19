# AI Tools Demo Mode - Testing Guide

## Overview
All AI endpoints now work in **Demo Mode** when `CLAUDE_API_KEY` is not configured or contains placeholder text.

## Current Status

### ✅ Updated Endpoints (Demo Mode Support)
1. **POST /api/ai/analyze-resume** - Resume analysis with ATS score
2. **POST /api/ai/check-authenticity** - Resume authenticity detection
3. **POST /api/ai/match-resume-to-job** - Resume-to-job matching
4. **POST /api/ai/generate-improvements** - Resume improvement suggestions

### ✅ Working Endpoints (Using Mock/Keyword Service)
- POST /api/ai/match-jobs
- POST /api/ai/recommendations
- POST /api/ai/analyze-skills
- POST /api/ai/interview-questions
- POST /api/ai/interview-tips
- POST /api/ai/predict-salary
- POST /api/ai/skill-gap
- POST /api/ai/generate-application
- POST /api/ai/screen-candidates

## Frontend Components

### 5 AI Tools Available at `/ai-tools`

1. **Resume Analyzer**
   - URL: http://localhost:3000/ai-tools
   - Tab: Resume Analysis
   - Features: 
     - Paste resume text
     - Get ATS score (0-100)
     - View detected skills
     - See improvement suggestions
     - Shows provider: "Mock AI (Demo Mode)" or "Claude AI"

2. **AI Job Matcher**
   - Tab: Job Matching
   - Features:
     - Displays matched jobs (0-100% match)
     - Shows matched skills
     - Color-coded: Green (80+), Yellow (60-79), Red (<60)

3. **Skill Gap Analyzer**
   - Tab: Skill Gap
   - Features:
     - Input current skills (CSV)
     - Input required skills (CSV)
     - Get gap percentage
     - View learning path

4. **Salary Predictor**
   - Tab: Salary Prediction
   - Features:
     - Enter job title, experience, location, skills
     - Get salary range (LPA/USD)
     - View market insights

5. **Interview Prep**
   - Tab: Interview Preparation
   - Features:
     - Generate 5 interview questions
     - Get interview tips
     - Carousel navigation for questions
     - Categorized tips (Strategy, Technical, Soft Skills)

## Testing Steps

### Backend Setup
```bash
cd backend
npm install
npm start
# Output should show:
# ⚠️  DEMO MODE: Claude API key not configured. Using mock data.
# Server running on 0.0.0.0:5000
# MongoDB Connected ✅
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
# Opens browser at http://localhost:3000
```

### Manual Testing

1. **Login**
   - Navigate to http://localhost:3000
   - Register or login with existing credentials
   - After login, see "AI Tools" in navbar dropdown

2. **Access AI Tools**
   - Click "AI Tools" in navbar dropdown
   - Should redirect to `/ai-tools` 
   - See 5 tool cards: Resume, Jobs, Skills, Salary, Interview

3. **Test Resume Analyzer**
   - Click Resume Analyzer tab
   - Paste sample resume text:
     ```
     John Doe
     Senior Software Engineer
     
     Skills: React, Node.js, MongoDB, AWS, Python
     Experience: 5 years in full-stack development
     
     Projects:
     - Built microservices platform
     - Led team of 3 engineers
     ```
   - Click "Analyze Resume"
   - Should see:
     - ATS Score: ~75 (Mock AI (Demo Mode))
     - Detected Skills: React, Node.js, MongoDB, AWS, Python
     - Experience: 5 years
     - Suggestions: Various improvement tips

4. **Test AI Job Matcher**
   - Click AI Job Matcher tab
   - Should auto-load matched jobs
   - Each job shows:
     - Title, Company
     - Match percentage
     - Matched skills
     - Color-coded score

5. **Test Other Tools**
   - Similar flow for Skill Gap, Salary, Interview Prep
   - Check network tab (DevTools) to see mock API responses

## API Response Format

All endpoints return:
```json
{
  "success": true,
  "data": {
    // Tool-specific data
    "provider": "Mock AI (Demo Mode)" | "Claude AI"
  }
}
```

## Switching to Real Claude AI

To use real Claude AI instead of demo:

1. Get API key from https://console.anthropic.com
2. Update `.env`:
   ```
   CLAUDE_API_KEY=sk-ant-...your-real-key...
   ```
3. Restart backend
4. System automatically switches to Claude AI
5. Frontend shows "Claude AI" as provider

## Troubleshooting

### Endpoints not responding
- Check backend is running: `http://localhost:5000/api/ai/analyze-resume`
- Check browser console for network errors
- Verify token is in localStorage

### AI tools page not loading
- Clear browser cache
- Check `/ai-tools` route exists in App.js
- Verify token is valid

### Demo mode not working
- Restart backend: `npm start`
- Should see: "⚠️ DEMO MODE: Claude API key not configured"
- Delete `CLAUDE_API_KEY` from `.env` or set to placeholder

### Real Claude API not working
- Verify API key format: `sk-ant-...`
- Check API key has credits/quota
- Backend logs should show error with details
- Will fallback to demo mode on error
