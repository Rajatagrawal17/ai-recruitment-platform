// Script to seed sample jobs and users to MongoDB
// Run this once to populate your database with test data

const mongoose = require("mongoose");
require("dotenv").config();

const Job = require("./models/Job");
const User = require("./models/User");

const SAMPLE_JOBS = [
  {
    title: "Senior React Developer",
    company: "Tech Innovations Ltd",
    location: "Bangalore, India",
    salary: 1200000,
    description: "We're looking for an experienced React developer to lead our frontend team.",
    requirements: "5+ years React, TypeScript, Redux",
    category: "Frontend",
    type: "full-time",
    skills: ["React", "JavaScript", "TypeScript", "CSS", "REST APIs"],
    experience: 5,
    education: "Bachelor's in Computer Science",
    postedDate: new Date(),
  },
  {
    title: "Full Stack Developer",
    company: "StartUp Hub",
    location: "Remote",
    salary: 1000000,
    description: "Join our growing startup building AI-powered tools.",
    requirements: "Node.js, React, MongoDB",
    category: "Full Stack",
    type: "full-time",
    skills: ["Node.js", "React", "MongoDB", "Express", "JavaScript"],
    experience: 3,
    education: "Bachelor's in CS or related field",
    postedDate: new Date(),
  },
  {
    title: "Backend Engineer",
    company: "Enterprise Solutions",
    location: "Delhi, India",
    salary: 950000,
    description: "Build scalable backend systems for our enterprise clients.",
    requirements: "Node.js, AWS, PostgreSQL",
    category: "Backend",
    type: "full-time",
    skills: ["Node.js", "Express", "PostgreSQL", "AWS", "Docker"],
    experience: 4,
    education: "Bachelor's in Computer Science",
    postedDate: new Date(),
  },
  {
    title: "Mobile App Developer (React Native)",
    company: "MobileFirst Apps",
    location: "Hyderabad, India",
    salary: 900000,
    description: "Develop cross-platform mobile apps using React Native.",
    requirements: "React Native, JavaScript, Firebase",
    category: "Mobile",
    type: "full-time",
    skills: ["React Native", "JavaScript", "Firebase", "Redux", "Git"],
    experience: 2,
    education: "Bachelor's degree",
    postedDate: new Date(),
  },
  {
    title: "DevOps Engineer",
    company: "Cloud First Co",
    location: "Pune, India",
    salary: 1100000,
    description: "Manage and optimize our cloud infrastructure.",
    requirements: "Docker, Kubernetes, AWS/GCP, CI/CD",
    category: "DevOps",
    type: "full-time",
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
    experience: 3,
    education: "Bachelor's in IT",
    postedDate: new Date(),
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing jobs (optional)
    // await Job.deleteMany({});
    // console.log("🗑️ Cleared existing jobs");

    // Find admin user or create one
    let adminUser = await User.findOne({ role: "recruiter" });
    
    if (!adminUser) {
      adminUser = await User.create({
        name: "Admin Recruiter",
        email: "recruiter@cognifit.com",
        password: "TestPassword123",
        role: "recruiter",
        verified: true,
      });
      console.log("✅ Created admin recruiter user");
    }

    // Add createdBy to jobs
    const jobsWithCreator = SAMPLE_JOBS.map(job => ({
      ...job,
      createdBy: adminUser._id,
    }));

    // Insert sample jobs
    const createdJobs = await Job.insertMany(jobsWithCreator);
    console.log(`✅ Created ${createdJobs.length} sample jobs`);

    console.log("\n📋 Sample Jobs Created:");
    createdJobs.forEach((job, i) => {
      console.log(`${i + 1}. ${job.title} at ${job.company} - ₹${job.salary}`);
    });

    console.log("\n✅ Database seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
}

seedDatabase();
