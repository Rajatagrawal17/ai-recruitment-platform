const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Job = require("./models/Job");
const User = require("./models/User");
const Application = require("./models/Application");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create admin user
    const adminUser = await User.create({
      name: "Cognifit Admin",
      email: "admin@cognifit.com",
      password: "admin123",
      role: "admin",
      phoneNumber: "+919876543210"
    });
    console.log("👤 Created admin user");

    // Create recruiter user
    const recruiterUser = await User.create({
      name: "John Recruiter",
      email: "recruiter@cognifit.com",
      password: "recruiter123",
      role: "recruiter",
      phoneNumber: "+919123456789"
    });
    console.log("👔 Created recruiter user");

    // Create candidate users
    const candidates = await User.insertMany([
      {
        name: "Raj Kumar",
        email: "raj@example.com",
        password: "raj123",
        role: "candidate",
        phoneNumber: "+919876543211"
      },
      {
        name: "Priya Singh",
        email: "priya@example.com",
        password: "priya123",
        role: "candidate",
        phoneNumber: "+919876543212"
      },
      {
        name: "Amit Patel",
        email: "amit@example.com",
        password: "amit123",
        role: "candidate",
        phoneNumber: "+919876543213"
      },
      {
        name: "Sarah Johnson",
        email: "sarah@example.com",
        password: "sarah123",
        role: "candidate",
        phoneNumber: "+919876543214"
      }
    ]);
    console.log("👥 Created 4 candidate users");

    // Create sample jobs
    const jobs = await Job.insertMany([
      {
        title: "Senior Backend Developer",
        description: "We are looking for an experienced backend developer with expertise in Node.js and MongoDB. Experience with AWS is a plus. Competitive salary, flexible work hours.",
        company: "TechCorp",
        location: "Bangalore, India",
        type: "full-time",
        salary: 150000,
        skills: ["Node.js", "MongoDB", "AWS", "REST APIs"],
        createdBy: recruiterUser._id
      },
      {
        title: "Frontend Engineer (React)",
        description: "Join our frontend team to build beautiful React applications. Must have 3+ years of experience with React and TypeScript. Work on cutting-edge projects.",
        company: "WebStudio",
        location: "Mumbai, India",
        type: "full-time",
        salary: 120000,
        skills: ["React", "TypeScript", "CSS", "JavaScript"],
        createdBy: recruiterUser._id
      },
      {
        title: "Full Stack Developer",
        description: "We need a full stack developer comfortable with both frontend and backend. Experience with MERN stack preferred. Great work-life balance.",
        company: "StartupXYZ",
        location: "Delhi, India",
        type: "full-time",
        salary: 130000,
        skills: ["React", "Node.js", "MongoDB", "JavaScript"],
        createdBy: recruiterUser._id
      },
      {
        title: "DevOps Engineer",
        description: "Looking for a DevOps engineer to manage our cloud infrastructure. Docker, Kubernetes, and AWS experience required. Remote friendly.",
        company: "CloudSystems",
        location: "Remote",
        type: "full-time",
        salary: 140000,
        skills: ["Docker", "Kubernetes", "AWS", "Linux"],
        createdBy: recruiterUser._id
      },
      {
        title: "UI/UX Designer",
        description: "Creative designer needed to create amazing user experiences. Portfolio required. Experience with Figma is a must. Flexible hours available.",
        company: "DesignHub",
        location: "Bangalore, India",
        type: "full-time",
        salary: 100000,
        skills: ["Figma", "UI Design", "UX Research", "Prototyping"],
        createdBy: recruiterUser._id
      },
      {
        title: "Machine Learning Engineer",
        description: "Join our AI team to work on cutting-edge machine learning projects. Python, TensorFlow, and PyTorch experience needed. Innovation-driven role.",
        company: "AI Innovations",
        location: "Hyderabad, India",
        type: "full-time",
        salary: 160000,
        skills: ["Python", "TensorFlow", "PyTorch", "Data Science"],
        createdBy: recruiterUser._id
      }
    ]);
    console.log(`📋 Created ${jobs.length} job listings`);

    // Create applications
    const applications = await Application.insertMany([
      {
        candidate: candidates[0]._id,
        job: jobs[0]._id,
        status: "accepted",
        fullName: candidates[0].name,
        email: candidates[0].email,
        phone: candidates[0].phoneNumber,
        yearsExperience: 5,
        matchScore: 95
      },
      {
        candidate: candidates[1]._id,
        job: jobs[1]._id,
        status: "pending",
        fullName: candidates[1].name,
        email: candidates[1].email,
        phone: candidates[1].phoneNumber,
        yearsExperience: 3,
        matchScore: 85
      },
      {
        candidate: candidates[2]._id,
        job: jobs[2]._id,
        status: "rejected",
        fullName: candidates[2].name,
        email: candidates[2].email,
        phone: candidates[2].phoneNumber,
        yearsExperience: 1,
        matchScore: 40
      },
      {
        candidate: candidates[3]._id,
        job: jobs[3]._id,
        status: "pending",
        fullName: candidates[3].name,
        email: candidates[3].email,
        phone: candidates[3].phoneNumber,
        yearsExperience: 4,
        matchScore: 88
      },
      {
        candidate: candidates[0]._id,
        job: jobs[4]._id,
        status: "accepted",
        fullName: candidates[0].name,
        email: candidates[0].email,
        phone: candidates[0].phoneNumber,
        yearsExperience: 5,
        matchScore: 92
      }
    ]);
    console.log(`📝 Created ${applications.length} job applications`);

    await mongoose.disconnect();
    console.log("✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
};

seedDatabase();
