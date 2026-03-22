# 🚀 Cognifit AI Recruitment Platform - Complete Testing Guide

## Database Status ✅
Your MongoDB database is now fully populated with:
- **6 Job Listings** (Backend, Frontend, Full Stack, DevOps, UI/UX, ML Engineer)
- **4 Candidate Profiles** (Raj Kumar, Priya Singh, Amit Patel, Sarah Johnson)  
- **5 Job Applications** with various statuses (accepted, pending, rejected)
- **1 Admin & 1 Recruiter** account for testing

---

## 🔐 Test Accounts

### Admin Account
- **Email:** admin@cognifit.com
- **Password:** admin123

### Recruiter Account  
- **Email:** recruiter@cognifit.com
- **Password:** recruiter123

### Candidate Accounts
1. **Name:** Raj Kumar | **Email:** raj@example.com | **Password:** raj123
2. **Name:** Priya Singh | **Email:** priya@example.com | **Password:** priya123
3. **Name:** Amit Patel | **Email:** amit@example.com | **Password:** amit123
4. **Name:** Sarah Johnson | **Email:** sarah@example.com | **Password:** sarah123

---

## 🔗 Live URLs

**Frontend:** https://cognifit-frontend-6coo.onrender.com  
**Backend API:** https://cognifit-backend.onrender.com/api

---

## 📋 API Endpoints to Test

### 1️⃣ Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/send-mobile-otp
POST /api/auth/verify-mobile-otp
POST /api/auth/send-email-otp
POST /api/auth/verify-email-otp
```

**Test Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"recruiter@cognifit.com","password":"recruiter123"}'
```

---

### 2️⃣ Job Management Endpoints
```
GET /api/jobs
GET /api/jobs/:id
POST /api/jobs (Recruiter only)
PUT /api/jobs/:id (Recruiter only)
DELETE /api/jobs/:id (Recruiter only)
```

**Test Get All Jobs:**
```bash
curl http://localhost:5000/api/jobs
```

---

### 3️⃣ Application Management Endpoints
```
GET /api/applications
POST /api/applications (Apply for job)
GET /api/applications/:id
PUT /api/applications/:id (Update status)
```

**Test Get All Applications:**
```bash
curl http://localhost:5000/api/applications
```

---

### 4️⃣ 🎯 AI MATCHING ENDPOINTS (NEW!)

#### **Get Matched Candidates for a Job**
```bash
curl http://localhost:5000/api/matching/job/{jobId}/candidates
```
**Purpose:** Shows all candidates who applied for a job, ranked by AI match score  
**Response:** Returns list of candidates with:
- Match Score (0-100%)
- Extracted Skills (Technical + Soft)
- Years of Experience
- Application Status

**Example Response:**
```json
{
  "success": true,
  "message": "Found 3 candidates for job",
  "job": {
    "title": "Senior Backend Developer",
    "description": "..."
  },
  "matchedCandidates": [
    {
      "candidateName": "Raj Kumar",
      "candidateEmail": "raj@example.com",
      "matchScore": 92,
      "extractedSkills": {
        "technical": ["nodejs", "mongodb", "aws"],
        "soft": ["leadership", "teamwork"],
        "experience": "senior"
      },
      "status": "accepted"
    }
  ]
}
```

---

#### **Get Matched Jobs for a Candidate**
```bash
curl http://localhost:5000/api/matching/candidate/{candidateId}/jobs
```
**Purpose:** Shows all jobs ranked by how well they match the candidate's resume  
**Response:** Returns list of jobs with match scores sorted by best fit

**Example Response:**
```json
{
  "success": true,
  "matchedJobs": [
    {
      "jobTitle": "Senior Backend Developer",
      "company": "TechCorp",
      "matchScore": 95,
      "recommendation": "Strong match - Highly recommended"
    },
    {
      "jobTitle": "Full Stack Developer",
      "company": "StartupXYZ", 
      "matchScore": 85,
      "recommendation": "Strong match - Highly recommended"
    }
  ]
}
```

---

#### **Analyze Resume & Extract Skills**
```bash
curl -X POST http://localhost:5000/api/matching/analyze-resume \
  -H "Content-Type: application/json" \
  -d '{"resumeText":"I have 5 years experience with Node.js, MongoDB, React and AWS..."}'
```
**Purpose:** Analyzes resume text to extract skills and experience level  
**Response:** 
```json
{
  "analysis": {
    "technicalSkills": ["nodejs", "mongodb", "react", "aws"],
    "softSkills": ["leadership"],
    "experienceLevel": "senior",
    "hasEducation": true
  }
}
```

---

#### **Get Top Candidates for ALL Jobs**
```bash
curl http://localhost:5000/api/matching/top-candidates
```
**Purpose:** Shows top 5 candidates for each open job  
**Response:** Returns all jobs with their best-matching candidates

---

#### **Score Candidate for Specific Job**
```bash
curl -X POST http://localhost:5000/api/matching/score \
  -H "Content-Type: application/json" \
  -d '{"candidateId":"...", "jobId":"..."}'
```
**Purpose:** Scores a single candidate against a specific job  
**Response:** Detailed scoring breakdown with recommendation

---

## 🧪 Step-by-Step Testing Flow

### Step 1: Test User Registration (Fresh User)
1. Go to: https://cognifit-frontend-6coo.onrender.com
2. Click **REGISTER**
3. Fill form with:
   - Name: Your Name
   - Email: yourtestemail@example.com
   - Password: TestPass123
   - Phone: Your 10-digit phone number
4. Choose verification method (**Email recommended** - SMS needs verified number in Twilio)
5. Enter any 6-digit code (demo mode accepts any code)
6. Complete CAPTCHA
7. ✅ You should see "Registration successful!"

---

### Step 2: Test User Login
1. Click **LOGIN**
2. Use credentials:
   - Email: admin@cognifit.com
   - Password: admin123
3. ✅ Should redirect to Dashboard

---

### Step 3: Test Admin Dashboard
1. Login as Admin or Recruiter
2. View **Job Statistics:**
   - Total Jobs Posted
   - Applications Received
   - Acceptance Rate
3. View **Interactive Charts:**
   - Application trends
   - Job status breakdown
4. See **Recent Activity Feed**

---

### Step 4: Test Job Listing & Applications
1. Go to **JOBS** tab
2. View all job listings (6 jobs should be visible)
3. For each job, see:
   - Title, Description, Salary, Location
   - Required Skills
4. Click **APPLY** on any job
5. Fill application form with resume text
6. ✅ Application should be saved

---

### Step 5: Test AI Matching (Backend Testing)
Open Postman or terminal and test these:

#### Test 5A: Get Matched Candidates for a Job
```bash
# Get all jobs first to get a jobId
curl http://localhost:5000/api/jobs

# Then test matching with one of the job IDs
curl http://localhost:5000/api/matching/job/{jobId}/candidates
```

#### Test 5B: Get Matched Jobs for Candidate
```bash
# Get all users first to get a candidateId
curl http://localhost:5000/api/users

# Then test matching with candidate ID
curl http://localhost:5000/api/matching/candidate/{candidateId}/jobs
```

#### Test 5C: Analyze A Resume
```bash
curl -X POST http://localhost:5000/api/matching/analyze-resume \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "Senior Backend Developer with 8 years of experience in Node.js, MongoDB, AWS, Kubernetes, Docker. Expert in REST APIs, microservices, and databases. Communication, leadership, and team player."
  }'
```

---

### Step 6: Test OTP Verification
1. Go to Register page
2. Enter phone number and choose email method
3. Check **Render Backend Logs** to see demo OTP:
   ```
   ╔════════════════════════════════════════╗
   ║  📧 EMAIL OTP (DEMO MODE)             ║
   ║  Email: yourtest@example.com           ║
   ║  OTP: 123456                           ║
   ║  Valid: 10 minutes                     ║
   ╚════════════════════════════════════════╝
   ```
4. Use that OTP code in the form
5. ✅ Should proceed to next step

---

## 🎯 AI Matching Score Interpretation

| Score | Meaning | Recommendation |
|-------|---------|-----------------|
| 80-100% | Excellent match | ⭐⭐⭐ Highly Recommended |
| 60-79% | Good match | ⭐⭐ Consider for Interview |
| 40-59% | Potential match | ⭐ Review Further |
| <40% | Poor match | ❌ Consider Others |

---

## 🛠️ How AI Scoring Works

Your system uses a **weighted scoring algorithm:**

- **50%** - Skill Matching (Does resume have required skills?)
- **30%** - Experience Match (Does resume show relevant experience?)
- **20%** - Education & Qualifications (Degree, certifications?)

**Example:**
- Senior Backend Developer position requires: Node.js, MongoDB, AWS
- Candidate has: Node.js ✅, MongoDB ✅, AWS ✅, Python ⚠️
- Score = (3/3) × 0.5 + 0.85 × 0.3 + 1.0 × 0.2 = **92%** ⭐⭐⭐

---

## 🔧 Troubleshooting

### Issue: "Failed to send OTP"
**Solution:** Check backend logs on Render dashboard. The system is running in DEMO MODE and logs the OTP to console.

### Issue: API returns 404
**Solution:** Make sure you're using correct:
1. Job ID / Candidate ID (use `/api/jobs` and `/api/users` to get IDs)
2. Endpoint path spelling
3. Backend is running on Render

### Issue: "CORS Error"
**Solution:** Already fixed! But if you see it:
1. Go to Render dashboard
2. Click cognifit-backend service
3. Click "Manual Deploy"
4. Wait 2-3 minutes

---

## 📊 What You Have Now

✅ **Database:**
- MongoDB Atlas with 6 jobs, 4 candidates, 5 applications

✅ **Authentication:**
- JWT token-based login
- OTP verification (SMS via Twilio, Email via Gmail)
- CAPTCHA on registration

✅ **AI Matching System:**
- Skill extraction from resumes
- Experience level detection
- Education verification
- Weighted scoring algorithm
- Candidate ranking per job
- Job recommendations per candidate

✅ **Frontend:**
- Beautiful Cognifit-branded UI
- Animated dashboard with charts
- Job listing and search
- User profile management
- Registration with verification

✅ **Backend:**
- RESTful API with Express
- MongoDB data persistence
- AI matching endpoints
- Role-based access (candidate, recruiter, admin)

---

## 🚀 What's Working

- ✅ Register new users
- ✅ Login to platform
- ✅ View all jobs  
- ✅ Apply for jobs
- ✅ See job statistics on dashboard
- ✅ AI matching scores
- ✅ Resume skill analysis
- ✅ Candidate ranking

---

## 📝 Next Steps (Optional Enhancements)

1. **Real SMS Delivery:** Complete Twilio verification (requires verified phone numbers)
2. **OpenAI Integration:** Use GPT for advanced resume analysis
3. **Email Notifications:** Send emails when candidates apply/get matched
4. **Interview Scheduling:** Add calendar integration
5. **Assessment Tests:** Integrate coding/skill tests

---

## 💡 Pro Tips

1. **Use Terminal OTPs in Demo Mode:** Just copy the OTP from backend logs
2. **Test with Multiple Candidates:** Create different resumes to see varying match scores
3. **Try Different Email Methods:** Both SMS and Email work, email is faster in demo mode
4. **Check Backend Logs:** Render logs show everything happening on backend

---

Good luck! Your AI Recruitment Platform is ready for testing! 🎉
