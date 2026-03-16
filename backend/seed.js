const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Job = require("./models/Job");
const User = require("./models/User");

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get an admin user (or create one for seeding)
    let adminUser = await User.findOne({ role: "admin" });
    
    if (!adminUser) {
      adminUser = await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: "password123",
        role: "admin"
      });
      console.log("Created admin user");
    }

    // Clear existing jobs
    await Job.deleteMany({});
    console.log("Cleared existing jobs");

    // Create sample jobs
    const jobs = [
      {
        title: "Senior Backend Developer",
        description: "We are looking for an experienced backend developer with expertise in Node.js and MongoDB. Experience with AWS is a plus.",
        company: "TechCorp",
        createdBy: adminUser._id
      },
      {
        title: "Frontend Engineer",
        description: "Join our frontend team to build beautiful React applications. Must have 3+ years of experience with React and TypeScript.",
        company: "WebStudio",
        createdBy: adminUser._id
      },
      {
        title: "Full Stack Developer",
        description: "We need a full stack developer comfortable with both frontend and backend. Experience with MERN stack preferred.",
        company: "StartupXYZ",
        createdBy: adminUser._id
      },
      {
        title: "DevOps Engineer",
        description: "Looking for a DevOps engineer to manage our cloud infrastructure. Docker, Kubernetes, and AWS experience required.",
        company: "CloudSystems",
        createdBy: adminUser._id
      },
      {
        title: "Machine Learning Engineer",
        description: "Join our AI team to work on cutting-edge machine learning projects. Python, TensorFlow, and PyTorch experience needed.",
        company: "AI Innovations",
        createdBy: adminUser._id
      },
      {
        title: "UI/UX Designer",
        description: "Creative designer needed to create amazing user experiences. Portfolio required. Experience with Figma is a must.",
        company: "DesignHub",
        createdBy: adminUser._id
      }
    ];

    const createdJobs = await Job.insertMany(jobs);
    console.log(`Created ${createdJobs.length} jobs successfully`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding jobs:", error.message);
    process.exit(1);
  }
};

seedJobs();
