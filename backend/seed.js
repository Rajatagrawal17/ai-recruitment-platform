const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Company = require("./models/Company");
const Candidate = require("./models/Candidate");
const Job = require("./models/Job");
const User = require("./models/User");
const Application = require("./models/Application");

const SEED_MODE = (process.env.SEED_MODE || "safe").toLowerCase();

const adminUserPayload = {
  name: "HireAI Admin",
  email: "admin@hireai.com",
  password: "admin123",
  role: "admin",
  phoneNumber: "+919876543210",
};

const recruiterPayloads = [
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
];

const candidateUserPayloads = [
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
];

const companiesPayload = [
  {
    name: "Google",
    description:
      "Google builds products that organize the world's information and make it universally accessible and useful.",
    industry: "Internet & Software",
    location: "Bengaluru, India",
    website: "https://about.google",
  },
  {
    name: "Amazon",
    description:
      "Amazon focuses on e-commerce, cloud computing, and AI solutions at global scale.",
    industry: "E-commerce & Cloud",
    location: "Hyderabad, India",
    website: "https://www.amazon.jobs",
  },
  {
    name: "Microsoft",
    description:
      "Microsoft empowers every person and every organization on the planet to achieve more.",
    industry: "Enterprise Software & Cloud",
    location: "Noida, India",
    website: "https://careers.microsoft.com",
  },
];

const candidateProfilesPayload = [
  {
    name: "Arjun Sharma",
    email: "arjun.sharma@demo.com",
    skills: ["Node.js", "MongoDB", "JavaScript", "System Design"],
    experience: 3,
  },
  {
    name: "Meera Iyer",
    email: "meera.iyer@demo.com",
    skills: ["Python", "TensorFlow", "MLOps", "SQL"],
    experience: 4,
  },
  {
    name: "Karan Singh",
    email: "karan.singh@demo.com",
    skills: ["Java", "Spring Boot", "AWS", "MySQL"],
    experience: 2,
  },
  {
    name: "Sneha Patel",
    email: "sneha.patel@demo.com",
    skills: ["Azure", "Kubernetes", "Terraform", "Linux"],
    experience: 5,
  },
  {
    name: "David Roy",
    email: "david.roy@demo.com",
    skills: ["JavaScript", "AWS", "Docker", "CI/CD"],
    experience: 3,
  },
];

const jobsPayload = [
  {
    title: "Software Engineer",
    company: "Google",
    location: "Bengaluru, India",
    skills: ["JavaScript", "Node.js", "System Design", "MongoDB"],
    experience: 2,
    yearsOfExperience: 2,
    description:
      "Build and scale backend services for high-traffic Google products.",
    type: "full-time",
    salary: 2400000,
  },
  {
    title: "Machine Learning Engineer",
    company: "Google",
    location: "Bengaluru, India",
    skills: ["Python", "TensorFlow", "MLOps", "Data Structures"],
    experience: 3,
    yearsOfExperience: 3,
    description:
      "Design and deploy machine learning models for recommendation and ranking systems.",
    type: "full-time",
    salary: 2800000,
  },
  {
    title: "Backend Developer",
    company: "Amazon",
    location: "Hyderabad, India",
    skills: ["Java", "Spring Boot", "AWS", "MySQL"],
    experience: 2,
    yearsOfExperience: 2,
    description:
      "Own backend APIs for Amazon fulfillment and logistics workflows.",
    type: "full-time",
    salary: 2200000,
  },
  {
    title: "Cloud Engineer",
    company: "Microsoft",
    location: "Noida, India",
    skills: ["Azure", "Kubernetes", "Terraform", "Linux"],
    experience: 4,
    yearsOfExperience: 4,
    description:
      "Improve cloud reliability, observability, and CI/CD infrastructure for enterprise workloads.",
    type: "full-time",
    salary: 2600000,
  },
];

const applicationPayloads = [
  {
    candidateEmail: "arjun.sharma@demo.com",
    jobTitle: "Software Engineer",
    company: "Google",
    candidateName: "Arjun Sharma",
    fullName: "Arjun Sharma",
    email: "arjun.sharma@demo.com",
    phone: "+919876543201",
    yearsExperience: 3,
    matchScore: 92,
    status: "shortlisted",
  },
  {
    candidateEmail: "meera.iyer@demo.com",
    jobTitle: "Machine Learning Engineer",
    company: "Google",
    candidateName: "Meera Iyer",
    fullName: "Meera Iyer",
    email: "meera.iyer@demo.com",
    phone: "+919876543202",
    yearsExperience: 4,
    matchScore: 95,
    status: "accepted",
  },
  {
    candidateEmail: "karan.singh@demo.com",
    jobTitle: "Backend Developer",
    company: "Amazon",
    candidateName: "Karan Singh",
    fullName: "Karan Singh",
    email: "karan.singh@demo.com",
    phone: "+919876543203",
    yearsExperience: 2,
    matchScore: 88,
    status: "pending",
  },
  {
    candidateEmail: "sneha.patel@demo.com",
    jobTitle: "Cloud Engineer",
    company: "Microsoft",
    candidateName: "Sneha Patel",
    fullName: "Sneha Patel",
    email: "sneha.patel@demo.com",
    phone: "+919876543204",
    yearsExperience: 5,
    matchScore: 97,
    status: "accepted",
  },
  {
    candidateEmail: "david.roy@demo.com",
    jobTitle: "Software Engineer",
    company: "Google",
    candidateName: "David Roy",
    fullName: "David Roy",
    email: "david.roy@demo.com",
    phone: "+919876543205",
    yearsExperience: 3,
    matchScore: 54,
    status: "rejected",
  },
];

const recruiterByCompanyEmail = {
  Google: "recruiter.google@hireai.com",
  Amazon: "recruiter.amazon@hireai.com",
  Microsoft: "recruiter.microsoft@hireai.com",
};

const getOrCreateUser = async (payload) => {
  const existing = await User.findOne({ email: payload.email });

  if (!existing) {
    const created = await User.create(payload);
    return { doc: created, created: true, updated: false };
  }

  await User.updateOne(
    { _id: existing._id },
    {
      $set: {
        name: payload.name,
        role: payload.role,
        phoneNumber: payload.phoneNumber,
      },
    }
  );

  const refreshed = await User.findById(existing._id);
  return { doc: refreshed, created: false, updated: true };
};

const upsertByQuery = async (Model, query, payload) => {
  const writeResult = await Model.updateOne(
    query,
    {
      $set: payload,
    },
    { upsert: true }
  );

  const doc = await Model.findOne(query);

  return {
    doc,
    created: writeResult.upsertedCount === 1,
    updated: writeResult.modifiedCount > 0,
  };
};

const countDocuments = async () => {
  const [users, companies, candidates, jobs, applications] = await Promise.all([
    User.countDocuments(),
    Company.countDocuments(),
    Candidate.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
  ]);

  return { users, companies, candidates, jobs, applications };
};

const seedDatabase = async () => {
  const stats = {
    usersCreated: 0,
    usersUpdated: 0,
    companiesCreated: 0,
    companiesUpdated: 0,
    candidatesCreated: 0,
    candidatesUpdated: 0,
    jobsCreated: 0,
    jobsUpdated: 0,
    applicationsCreated: 0,
    applicationsUpdated: 0,
  };

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    console.log(`🌱 Seed mode: ${SEED_MODE}`);

    if (SEED_MODE === "reset") {
      await Company.deleteMany({});
      await Candidate.deleteMany({});
      await User.deleteMany({});
      await Job.deleteMany({});
      await Application.deleteMany({});
      console.log("🗑️  Reset mode enabled: existing data removed");
    } else {
      console.log("🛡️  Safe mode enabled: existing data preserved");
    }

    const beforeCounts = await countDocuments();
    console.log("📊 Counts before seed:", beforeCounts);

    const adminResult = await getOrCreateUser(adminUserPayload);
    if (adminResult.created) stats.usersCreated += 1;
    if (adminResult.updated) stats.usersUpdated += 1;

    const recruiters = [];
    for (const payload of recruiterPayloads) {
      const result = await getOrCreateUser(payload);
      recruiters.push(result.doc);
      if (result.created) stats.usersCreated += 1;
      if (result.updated) stats.usersUpdated += 1;
    }

    const candidatesUsers = [];
    for (const payload of candidateUserPayloads) {
      const result = await getOrCreateUser(payload);
      candidatesUsers.push(result.doc);
      if (result.created) stats.usersCreated += 1;
      if (result.updated) stats.usersUpdated += 1;
    }

    const companyMap = {};
    for (const payload of companiesPayload) {
      const result = await upsertByQuery(Company, { name: payload.name }, payload);
      companyMap[payload.name] = result.doc;
      if (result.created) stats.companiesCreated += 1;
      if (result.updated) stats.companiesUpdated += 1;
    }

    const candidateUserByEmail = Object.fromEntries(
      candidatesUsers.map((user) => [user.email, user])
    );

    for (const payload of candidateProfilesPayload) {
      const result = await upsertByQuery(
        Candidate,
        { email: payload.email },
        {
          ...payload,
          user: candidateUserByEmail[payload.email]?._id,
        }
      );

      if (result.created) stats.candidatesCreated += 1;
      if (result.updated) stats.candidatesUpdated += 1;
    }

    const recruiterByEmail = Object.fromEntries(
      recruiters.map((user) => [user.email, user])
    );

    const jobMap = {};
    for (const payload of jobsPayload) {
      const recruiterEmail = recruiterByCompanyEmail[payload.company];
      const recruiter = recruiterByEmail[recruiterEmail];

      const result = await upsertByQuery(
        Job,
        { title: payload.title, company: payload.company },
        {
          ...payload,
          companyRef: companyMap[payload.company]?._id,
          createdBy: recruiter?._id,
        }
      );

      jobMap[payload.title] = result.doc;
      if (result.created) stats.jobsCreated += 1;
      if (result.updated) stats.jobsUpdated += 1;
    }

    for (const payload of applicationPayloads) {
      const candidateUser = candidateUserByEmail[payload.candidateEmail];
      const job = jobMap[payload.jobTitle];

      if (!candidateUser || !job) {
        continue;
      }

      const result = await upsertByQuery(
        Application,
        { candidate: candidateUser._id, job: job._id },
        {
          candidate: candidateUser._id,
          job: job._id,
          candidateName: payload.candidateName,
          jobTitle: payload.jobTitle,
          company: payload.company,
          fullName: payload.fullName,
          email: payload.email,
          phone: payload.phone,
          yearsExperience: payload.yearsExperience,
          matchScore: payload.matchScore,
          status: payload.status,
        }
      );

      if (result.created) stats.applicationsCreated += 1;
      if (result.updated) stats.applicationsUpdated += 1;
    }

    const afterCounts = await countDocuments();

    console.log("✅ Seed completed");
    console.log("📈 Seed changes:", stats);
    console.log("📊 Counts after seed:", afterCounts);

    console.log("🔐 Demo login credentials:");
    console.log("Admin: admin@hireai.com / admin123");
    console.log("Recruiter: recruiter.google@hireai.com / recruiter123");
    console.log("Candidate: arjun.sharma@demo.com / candidate123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();
