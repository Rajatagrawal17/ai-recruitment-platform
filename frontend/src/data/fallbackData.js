// ✅ Fallback data for when API is unavailable
// This ensures the app works even without database/API connection

export const FALLBACK_CANDIDATE_APPLICATIONS = [
  {
    _id: "app_1",
    jobTitle: "Senior Frontend Developer",
    company: "Tech Corp",
    appliedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    matchScore: 85,
    status: "under-review",
  },
  {
    _id: "app_2",
    jobTitle: "Full Stack Engineer",
    company: "StartUp Inc",
    appliedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    matchScore: 72,
    status: "applied",
  },
  {
    _id: "app_3",
    jobTitle: "React Developer",
    company: "Digital Solutions",
    appliedDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    matchScore: 65,
    status: "interview-scheduled",
  },
];

export const FALLBACK_RECOMMENDED_JOBS = [
  {
    _id: "job_1",
    title: "Senior Frontend Developer",
    company: "Tech Corp",
    location: "Remote",
    salary: 120000,
    matchScore: 88,
    readiness: "high",
    skills: ["React", "TypeScript", "Node.js"],
  },
  {
    _id: "job_2",
    title: "Full Stack Engineer",
    company: "StartUp Inc",
    location: "Bangalore",
    salary: 100000,
    matchScore: 75,
    readiness: "medium",
    skills: ["MERN Stack", "MongoDB", "AWS"],
  },
  {
    _id: "job_3",
    title: "Backend Developer",
    company: "Enterprise Solutions",
    location: "Remote",
    salary: 95000,
    matchScore: 68,
    readiness: "medium",
    skills: ["Node.js", "Express", "PostgreSQL"],
  },
];

export const FALLBACK_PROFILE = {
  name: "Demo User",
  email: "demo@example.com",
  role: "candidate",
  profileCompleteness: 60,
  skills: ["React", "Node.js", "MongoDB"],
  fieldOfInterest: ["Full Stack", "Frontend"],
  currentLocation: "Bangalore",
  linkedinUrl: "",
  resumeUrl: "",
};

export const FALLBACK_STATS = {
  totalApplications: FALLBACK_CANDIDATE_APPLICATIONS.length,
  avgMatchScore: Math.round(
    FALLBACK_CANDIDATE_APPLICATIONS.reduce((sum, app) => sum + (app.matchScore || 0), 0) /
      FALLBACK_CANDIDATE_APPLICATIONS.length
  ),
  topMatch: Math.max(...FALLBACK_CANDIDATE_APPLICATIONS.map((app) => app.matchScore || 0)),
};
