const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Company = require("./models/Company");
const Candidate = require("./models/Candidate");
const Job = require("./models/Job");
const User = require("./models/User");
const Application = require("./models/Application");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Company.deleteMany({});
    await Candidate.deleteMany({});
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create admin user
    const adminUser = await User.create({
      name: "HireAI Admin",
      email: "admin@hireai.com",
      password: "admin123",
      role: "admin",
      phoneNumber: "+919876543210"
    });
    console.log("👤 Created admin user");

    // Create recruiter users for each company
    const recruiterUsers = await User.insertMany([
      {
        name: "Aanya Mehta",
        email: "recruiter.google@hireai.com",
        password: "recruiter123",
        role: "recruiter",
        phoneNumber: "+919123456781",
      },
      {
        name: "Rahul Verma",
        email: "recruiter.amazon@hireai.com",
        password: "recruiter123",
        role: "recruiter",
        phoneNumber: "+919123456782",
      },
      {
        name: "Nisha Kapoor",
        email: "recruiter.microsoft@hireai.com",
        password: "recruiter123",
        role: "recruiter",
        phoneNumber: "+919123456783",
      },
    ]);
    console.log(`👔 Created ${recruiterUsers.length} recruiter users`);

    // Create companies
    const companies = await Company.insertMany([
      {
        name: "Google",
        description: "Google builds products that organize the world's information and make it universally accessible and useful.",
        industry: "Internet & Software",
        location: "Bengaluru, India",
        website: "https://about.google",
      },
      {
        name: "Amazon",
        description: "Amazon focuses on e-commerce, cloud computing, and AI solutions at global scale.",
        industry: "E-commerce & Cloud",
        location: "Hyderabad, India",
        website: "https://www.amazon.jobs",
      },
      {
        name: "Microsoft",
        description: "Microsoft empowers every person and every organization on the planet to achieve more.",
        industry: "Enterprise Software & Cloud",
        location: "Noida, India",
        website: "https://careers.microsoft.com",
      },
    ]);
    console.log(`🏢 Created ${companies.length} companies`);

    const companyByName = Object.fromEntries(companies.map((company) => [company.name, company]));
    const recruiterByCompany = {
      Google: recruiterUsers[0],
      Amazon: recruiterUsers[1],
      Microsoft: recruiterUsers[2],
    };

    // Create jobs
    const jobs = await Job.insertMany([
      {
        title: "Software Engineer",
        company: "Google",
        companyRef: companyByName.Google._id,
        location: "Bengaluru, India",
        skills: ["JavaScript", "Node.js", "System Design", "MongoDB"],
        experience: 2,
        yearsOfExperience: 2,
        description: "Build and scale backend services for high-traffic Google products.",
        type: "full-time",
        salary: 2400000,
        createdBy: recruiterByCompany.Google._id,
      },
      {
        title: "Machine Learning Engineer",
        company: "Google",
        companyRef: companyByName.Google._id,
        location: "Bengaluru, India",
        skills: ["Python", "TensorFlow", "MLOps", "Data Structures"],
        experience: 3,
        yearsOfExperience: 3,
        description: "Design and deploy machine learning models for recommendation and ranking systems.",
        type: "full-time",
        salary: 2800000,
        createdBy: recruiterByCompany.Google._id,
      },
      {
        title: "Backend Developer",
        company: "Amazon",
        companyRef: companyByName.Amazon._id,
        location: "Hyderabad, India",
        skills: ["Java", "Spring Boot", "AWS", "MySQL"],
        experience: 2,
        yearsOfExperience: 2,
        description: "Own backend APIs for Amazon fulfillment and logistics workflows.",
        type: "full-time",
        salary: 2200000,
        createdBy: recruiterByCompany.Amazon._id,
      },
      {
        title: "Cloud Engineer",
        company: "Microsoft",
        companyRef: companyByName.Microsoft._id,
        location: "Noida, India",
        skills: ["Azure", "Kubernetes", "Terraform", "Linux"],
        experience: 4,
        yearsOfExperience: 4,
        description: "Improve cloud reliability, observability, and CI/CD infrastructure for enterprise workloads.",
        type: "full-time",
        salary: 2600000,
        createdBy: recruiterByCompany.Microsoft._id,
      },
    ]);
    console.log(`📋 Created ${jobs.length} jobs`);

    // Create candidate users
    const candidateUsers = await User.insertMany([
      {
        name: "Arjun Sharma",
        email: "arjun.sharma@demo.com",
        password: "candidate123",
        role: "candidate",
        phoneNumber: "+919876543201",
      },
      {
        name: "Meera Iyer",
        email: "meera.iyer@demo.com",
        password: "candidate123",
        role: "candidate",
        phoneNumber: "+919876543202",
      },
      {
        name: "Karan Singh",
        email: "karan.singh@demo.com",
        password: "candidate123",
        role: "candidate",
        phoneNumber: "+919876543203",
      },
      {
        name: "Sneha Patel",
        email: "sneha.patel@demo.com",
        password: "candidate123",
        role: "candidate",
        phoneNumber: "+919876543204",
      },
      {
        name: "David Roy",
        email: "david.roy@demo.com",
        password: "candidate123",
        role: "candidate",
        phoneNumber: "+919876543205",
      },
    ]);
    console.log(`👥 Created ${candidateUsers.length} candidate users`);

    // Create candidate profiles
    const candidates = await Candidate.insertMany([
      {
        name: "Arjun Sharma",
        email: "arjun.sharma@demo.com",
        skills: ["Node.js", "MongoDB", "JavaScript", "System Design"],
        experience: 3,
        user: candidateUsers[0]._id,
      },
      {
        name: "Meera Iyer",
        email: "meera.iyer@demo.com",
        skills: ["Python", "TensorFlow", "MLOps", "SQL"],
        experience: 4,
        user: candidateUsers[1]._id,
      },
      {
        name: "Karan Singh",
        email: "karan.singh@demo.com",
        skills: ["Java", "Spring Boot", "AWS", "MySQL"],
        experience: 2,
        user: candidateUsers[2]._id,
      },
      {
        name: "Sneha Patel",
        email: "sneha.patel@demo.com",
        skills: ["Azure", "Kubernetes", "Terraform", "Linux"],
        experience: 5,
        user: candidateUsers[3]._id,
      },
      {
        name: "David Roy",
        email: "david.roy@demo.com",
        skills: ["JavaScript", "AWS", "Docker", "CI/CD"],
        experience: 3,
        user: candidateUsers[4]._id,
      },
    ]);
    console.log(`🧑‍💻 Created ${candidates.length} candidate profiles`);

    const userByEmail = Object.fromEntries(candidateUsers.map((candidate) => [candidate.email, candidate]));
    const jobByTitle = Object.fromEntries(jobs.map((job) => [job.title, job]));

    // Create applications with HR-style statuses and match scores
    const applications = await Application.insertMany([
      {
        candidateName: "Arjun Sharma",
        jobTitle: "Software Engineer",
        company: "Google",
        candidate: userByEmail["arjun.sharma@demo.com"]._id,
        job: jobByTitle["Software Engineer"]._id,
        fullName: "Arjun Sharma",
        email: "arjun.sharma@demo.com",
        phone: "+919876543201",
        yearsExperience: 3,
        matchScore: 92,
        status: "shortlisted",
      },
      {
        candidateName: "Meera Iyer",
        jobTitle: "Machine Learning Engineer",
        company: "Google",
        candidate: userByEmail["meera.iyer@demo.com"]._id,
        job: jobByTitle["Machine Learning Engineer"]._id,
        fullName: "Meera Iyer",
        email: "meera.iyer@demo.com",
        phone: "+919876543202",
        yearsExperience: 4,
        matchScore: 95,
        status: "accepted",
      },
      {
        candidateName: "Karan Singh",
        jobTitle: "Backend Developer",
        company: "Amazon",
        candidate: userByEmail["karan.singh@demo.com"]._id,
        job: jobByTitle["Backend Developer"]._id,
        fullName: "Karan Singh",
        email: "karan.singh@demo.com",
        phone: "+919876543203",
        yearsExperience: 2,
        matchScore: 88,
        status: "pending",
      },
      {
        candidateName: "Sneha Patel",
        jobTitle: "Cloud Engineer",
        company: "Microsoft",
        candidate: userByEmail["sneha.patel@demo.com"]._id,
        job: jobByTitle["Cloud Engineer"]._id,
        fullName: "Sneha Patel",
        email: "sneha.patel@demo.com",
        phone: "+919876543204",
        yearsExperience: 5,
        matchScore: 97,
        status: "accepted",
      },
      {
        candidateName: "David Roy",
        jobTitle: "Software Engineer",
        company: "Google",
        candidate: userByEmail["david.roy@demo.com"]._id,
        job: jobByTitle["Software Engineer"]._id,
        fullName: "David Roy",
        email: "david.roy@demo.com",
        phone: "+919876543205",
        yearsExperience: 3,
        matchScore: 54,
        status: "rejected",
      },
    ]);
    console.log(`📝 Created ${applications.length} applications`);

    await mongoose.disconnect();
    console.log("✅ Database seeded successfully!");
    console.log("🔐 Demo Login Credentials:");
    console.log("Admin: admin@hireai.com / admin123");
    console.log("Recruiter: recruiter.google@hireai.com / recruiter123");
    console.log("Candidate: arjun.sharma@demo.com / candidate123");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
};

seedDatabase();
