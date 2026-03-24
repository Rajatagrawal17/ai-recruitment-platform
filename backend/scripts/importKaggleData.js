require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { parse } = require("csv-parse/sync");

const User = require("../models/User");
const Candidate = require("../models/Candidate");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Company = require("../models/Company");

const args = process.argv.slice(2);

const getArgValue = (name, fallback = "") => {
  const direct = args.find((arg) => arg.startsWith(`${name}=`));
  if (direct) {
    return direct.split("=").slice(1).join("=").trim();
  }

  const index = args.findIndex((arg) => arg === name);
  if (index >= 0 && args[index + 1]) {
    return String(args[index + 1]).trim();
  }

  return fallback;
};

const hasFlag = (name) => args.includes(name);

const resolvePath = (inputPath) => {
  if (!inputPath) return "";
  return path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(process.cwd(), inputPath);
};

const readCsvRows = (csvPath) => {
  const raw = fs.readFileSync(csvPath, "utf8");
  return parse(raw, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
    relax_quotes: true,
  });
};

const norm = (value) => String(value ?? "").trim();
const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const toLower = (value) => norm(value).toLowerCase();

const pick = (row, aliases = []) => {
  const entries = Object.entries(row || {});
  const byLower = Object.fromEntries(entries.map(([k, v]) => [toLower(k), v]));

  for (const alias of aliases) {
    const value = byLower[toLower(alias)];
    if (value !== undefined && norm(value)) {
      return norm(value);
    }
  }

  return "";
};

const splitList = (value) => {
  if (!value) return [];

  return String(value)
    .split(/[|,;/]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 25);
};

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;

  const cleaned = String(value).replace(/[^\d.-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normalizeStatus = (value) => {
  const status = toLower(value);
  if (["accepted", "hired", "offer", "selected"].includes(status)) {
    return "accepted";
  }
  if (["shortlisted", "shortlist", "interview", "review"].includes(status)) {
    return "shortlisted";
  }
  if (["rejected", "declined"].includes(status)) {
    return "rejected";
  }
  return "pending";
};

const normalizeType = (value) => {
  const raw = toLower(value);
  if (raw.includes("remote")) return "remote";
  if (raw.includes("contract")) return "contract";
  if (raw.includes("part")) return "part-time";
  return "full-time";
};

const sanitizeUserName = (value) => {
  const base = norm(value).replace(/\s+/g, " ");
  if (!base) return "User001";

  if (base.length < 3) {
    return `${base}001`.slice(0, 20);
  }

  return base.slice(0, 20);
};

const slugify = (value) =>
  norm(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "") || "candidate";

const buildSyntheticEmail = (name, index) => {
  return `${slugify(name)}.${index}@kaggledata.com`;
};

const sanitizeEmail = (value, fallbackIndex = 1) => {
  const normalized = norm(value).toLowerCase();
  if (EMAIL_REGEX.test(normalized)) {
    return normalized;
  }

  return `candidate.${Date.now()}.${fallbackIndex}@seed.com`;
};

const parseOptions = () => {
  const mode = toLower(getArgValue("--mode", "safe")) === "replace" ? "replace" : "safe";
  const jobsPath = resolvePath(getArgValue("--jobs"));
  const companiesPath = resolvePath(getArgValue("--companies"));
  const jobSkillsPath = resolvePath(getArgValue("--job-skills"));
  const candidatesPath = resolvePath(getArgValue("--candidates"));
  const applicationsPath = resolvePath(getArgValue("--applications"));
  const limit = Math.max(0, toNumber(getArgValue("--limit"), 0));
  const generateCandidates = Math.max(0, toNumber(getArgValue("--generate-candidates"), 0));
  const maxApplicationsPerCandidate = clamp(
    Math.max(1, toNumber(getArgValue("--max-applications-per-candidate"), 3)),
    1,
    10
  );
  const syntheticPassword = getArgValue("--candidate-password", "candidate123");

  return {
    mode,
    jobsPath,
    companiesPath,
    jobSkillsPath,
    candidatesPath,
    applicationsPath,
    limit,
    generateCandidates,
    maxApplicationsPerCandidate,
    syntheticPassword,
    dryRun: hasFlag("--dry-run"),
    recruiterEmail: getArgValue("--recruiter-email", "recruiter.kaggle@hireai.com").toLowerCase(),
    recruiterPassword: getArgValue("--recruiter-password", "recruiter123"),
  };
};

const FIRST_NAMES = [
  "Arjun",
  "Riya",
  "Kabir",
  "Meera",
  "Ayaan",
  "Nisha",
  "Ishaan",
  "Kriti",
  "Rohan",
  "Anaya",
  "Vihaan",
  "Sara",
  "Aditya",
  "Diya",
  "Reyansh",
  "Neha",
  "Karan",
  "Pooja",
  "Rahul",
  "Aditi",
];

const LAST_NAMES = [
  "Sharma",
  "Verma",
  "Singh",
  "Patel",
  "Kapoor",
  "Gupta",
  "Khan",
  "Nair",
  "Reddy",
  "Joshi",
  "Roy",
  "Das",
  "Mishra",
  "Yadav",
  "Malhotra",
  "Bose",
  "Saxena",
  "Bhat",
  "Arora",
  "Jain",
];

const PHONE_PREFIXES = ["98", "97", "96", "95", "94", "93", "92"];

const shuffle = (items) => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const pickRandom = (items) => {
  if (!items.length) return "";
  const index = Math.floor(Math.random() * items.length);
  return items[index];
};

const sampleUnique = (items, count) => {
  if (!items.length) return [];
  if (count >= items.length) return shuffle(items);
  return shuffle(items).slice(0, count);
};

const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const buildPhone = () => {
  const prefix = pickRandom(PHONE_PREFIXES) || "98";
  const suffix = String(randomInt(10000000, 99999999));
  return `+91${prefix}${suffix}`;
};

const buildSyntheticName = () => {
  return `${pickRandom(FIRST_NAMES)} ${pickRandom(LAST_NAMES)}`;
};

const synthStatusFromScore = (score) => {
  if (score >= 88) return "accepted";
  if (score >= 72) return "shortlisted";
  if (score <= 40) return "rejected";
  return "pending";
};

const buildCompanyLookup = (rows) => {
  const map = new Map();

  for (const row of rows) {
    const id = pick(row, ["company_id", "id"]);
    const name = pick(row, ["name", "company", "company_name"]);
    if (!id || !name) continue;
    map.set(id, name);
  }

  return map;
};

const buildJobSkillsLookup = (rows) => {
  const map = new Map();

  for (const row of rows) {
    const jobId = pick(row, ["job_id", "id"]);
    const skill = pick(row, ["skill", "skill_name", "skill_abr", "skills"]);
    if (!jobId || !skill) continue;

    if (!map.has(jobId)) {
      map.set(jobId, new Set());
    }

    map.get(jobId).add(skill);
  }

  return map;
};

const ensureRecruiter = async (email, password, dryRun) => {
  const existing = await User.findOne({ email });
  if (existing) {
    return existing;
  }

  if (dryRun) {
    return { _id: new mongoose.Types.ObjectId(), email, role: "recruiter" };
  }

  return User.create({
    name: "Kaggle Recruiter",
    email,
    password,
    role: "recruiter",
    verified: true,
    mobileVerified: true,
    emailVerified: true,
  });
};

const upsertCompany = async (name, dryRun) => {
  if (!name) return null;
  if (dryRun) {
    return { _id: new mongoose.Types.ObjectId(), name };
  }

  await Company.updateOne(
    { name },
    { $set: { name } },
    { upsert: true }
  );

  return Company.findOne({ name });
};

const importJobs = async (rows, recruiter, options, stats, datasetContext = {}) => {
  for (let index = 0; index < rows.length; index += 1) {
    if (options.limit && index >= options.limit) break;

    const row = rows[index];
    const title = pick(row, ["job_title", "title", "position", "role", "Job Title"]);
    const companyId = pick(row, ["company_id"]);
    const companyName =
      pick(row, ["company", "company_name", "employer", "organization", "Company"]) ||
      datasetContext.companyById?.get(companyId) ||
      "Kaggle Company";
    const description =
      pick(row, ["description", "job_description", "requirements", "summary", "skills_desc"]) ||
      `Imported from Kaggle dataset for ${title || "job"}`;

    if (!title || !description) {
      stats.jobs.skipped += 1;
      continue;
    }

    const rowSkills = splitList(
      pick(row, ["skills", "required_skills", "tags", "skill_set", "skill_abr"])
    );
    const linkedSkills = Array.from(datasetContext.skillsByJobId?.get(pick(row, ["job_id"])) || []);
    const skills = Array.from(new Set([...rowSkills, ...linkedSkills])).slice(0, 25);
    const location = pick(row, ["location", "city", "state", "country"]) || "Not specified";
    const salary = toNumber(
      pick(row, ["salary", "salary_usd", "avg_salary", "pay", "med_salary", "max_salary", "min_salary"]),
      0
    );
    const experience = toNumber(
      pick(row, [
        "experience",
        "years_experience",
        "experience_years",
        "minimum_experience",
        "formatted_experience_level",
      ]),
      0
    );

    const companyRef = await upsertCompany(companyName, options.dryRun);

    const payload = {
      title,
      description,
      company: companyName,
      companyRef: companyRef?._id,
      location,
      type: normalizeType(pick(row, ["employment_type", "job_type", "type"])),
      salary,
      skills,
      experience,
      yearsOfExperience: experience,
      createdBy: recruiter._id,
      status: "open",
    };

    if (options.dryRun) {
      stats.jobs.created += 1;
      continue;
    }

    const before = await Job.findOne({ title, company: companyName, location });
    await Job.updateOne(
      { title, company: companyName, location },
      { $set: payload },
      { upsert: true }
    );

    if (before) stats.jobs.updated += 1;
    else stats.jobs.created += 1;
  }
};

const ensureCandidateUser = async ({ name, email, fallbackIndex, password }, options, stats) => {
  const finalEmail = sanitizeEmail(email || buildSyntheticEmail(name, fallbackIndex), fallbackIndex);
  let user = await User.findOne({ email: finalEmail });

  if (!user && options.dryRun) {
    stats.users.created += 1;
    return {
      _id: new mongoose.Types.ObjectId(),
      email: finalEmail,
      name,
    };
  }

  if (!user) {
    user = await User.create({
      name: sanitizeUserName(name),
      email: finalEmail,
      password,
      role: "candidate",
      verified: true,
      mobileVerified: true,
      emailVerified: true,
    });
    stats.users.created += 1;
  } else {
    const nextName = sanitizeUserName(name);
    if (user.name !== nextName || user.role !== "candidate") {
      await User.updateOne(
        { _id: user._id },
        { $set: { name: nextName, role: "candidate" } }
      );
      stats.users.updated += 1;
      user = await User.findById(user._id);
    }
  }

  return user;
};

const importCandidates = async (rows, options, stats) => {
  for (let index = 0; index < rows.length; index += 1) {
    if (options.limit && index >= options.limit) break;

    const row = rows[index];
    const name = pick(row, ["candidate_name", "name", "full_name", "candidate"]);
    if (!name) {
      stats.candidates.skipped += 1;
      continue;
    }

    const email = pick(row, ["email", "candidate_email", "mail"]);
    const skills = splitList(
      pick(row, ["skills", "candidate_skills", "resume_skills", "skill_set"])
    );
    const education = splitList(pick(row, ["education", "degree", "qualification"]));
    const experience = toNumber(
      pick(row, ["experience", "years_experience", "experience_years"]),
      0
    );

    const user = await ensureCandidateUser(
      {
        name,
        email,
        fallbackIndex: index + 1,
        password: "candidate123",
      },
      options,
      stats
    );

    const payload = {
      name,
      email: user.email,
      skills,
      education,
      experience,
      resumeParsedAt: new Date(),
      user: user._id,
    };

    if (options.dryRun) {
      stats.candidates.created += 1;
      continue;
    }

    const before = await Candidate.findOne({ email: user.email });
    await Candidate.updateOne({ email: user.email }, { $set: payload }, { upsert: true });

    if (before) stats.candidates.updated += 1;
    else stats.candidates.created += 1;
  }
};

const importApplications = async (rows, options, stats) => {
  for (let index = 0; index < rows.length; index += 1) {
    if (options.limit && index >= options.limit) break;

    const row = rows[index];
    const candidateEmail = pick(row, ["candidate_email", "email", "applicant_email"]).toLowerCase();
    const candidateName =
      pick(row, ["candidate_name", "name", "full_name", "applicant"]) || "Kaggle Candidate";
    const jobTitle = pick(row, ["job_title", "title", "position", "role"]);
    const company = pick(row, ["company", "company_name", "employer"]) || "Kaggle Company";

    if (!jobTitle) {
      stats.applications.skipped += 1;
      continue;
    }

    const candidateUser = await ensureCandidateUser(
      {
        name: candidateName,
        email: candidateEmail,
        fallbackIndex: index + 1,
        password: "candidate123",
      },
      options,
      stats
    );

    const job = await Job.findOne({ title: jobTitle, company });
    if (!job) {
      const fallbackJob = await Job.findOne({ title: jobTitle });
      if (!fallbackJob) {
        stats.applications.skipped += 1;
        continue;
      }

      const payloadFallback = {
        candidateName,
        jobTitle,
        company: fallbackJob.company,
        job: fallbackJob._id,
        candidate: candidateUser._id,
        fullName: candidateName,
        email: candidateUser.email,
        phone: pick(row, ["phone", "mobile", "contact"]),
        yearsExperience: toNumber(
          pick(row, ["experience", "years_experience", "experience_years"]),
          0
        ),
        matchScore: clamp(
          toNumber(pick(row, ["match_score", "score", "ai_score"]), 65),
          0,
          100
        ),
        status: normalizeStatus(pick(row, ["status", "application_status", "result"])),
      };

      if (options.dryRun) {
        stats.applications.created += 1;
        continue;
      }

      const before = await Application.findOne({
        candidate: candidateUser._id,
        job: fallbackJob._id,
      });

      await Application.updateOne(
        { candidate: candidateUser._id, job: fallbackJob._id },
        { $set: payloadFallback },
        { upsert: true }
      );

      if (before) stats.applications.updated += 1;
      else stats.applications.created += 1;

      continue;
    }

    const payload = {
      candidateName,
      jobTitle,
      company,
      job: job._id,
      candidate: candidateUser._id,
      fullName: candidateName,
      email: candidateUser.email,
      phone: pick(row, ["phone", "mobile", "contact"]),
      yearsExperience: toNumber(
        pick(row, ["experience", "years_experience", "experience_years"]),
        0
      ),
      matchScore: clamp(toNumber(pick(row, ["match_score", "score", "ai_score"]), 65), 0, 100),
      status: normalizeStatus(pick(row, ["status", "application_status", "result"])),
      resumeText: pick(row, ["resume_text", "resume", "summary"]),
    };

    if (options.dryRun) {
      stats.applications.created += 1;
      continue;
    }

    const before = await Application.findOne({
      candidate: candidateUser._id,
      job: job._id,
    });

    await Application.updateOne(
      { candidate: candidateUser._id, job: job._id },
      { $set: payload },
      { upsert: true }
    );

    if (before) stats.applications.updated += 1;
    else stats.applications.created += 1;
  }
};

const generateSyntheticCandidatesAndApplications = async (options, stats) => {
  if (!options.generateCandidates) {
    return;
  }

  const jobs = await Job.find({ status: "open" }).lean();
  if (!jobs.length) {
    console.log("No jobs found for synthetic candidate/application generation.");
    return;
  }

  const skillPool = Array.from(
    new Set(
      jobs
        .flatMap((job) => (Array.isArray(job.skills) ? job.skills : []))
        .map((skill) => norm(skill))
        .filter(Boolean)
    )
  );

  const generatedAt = Date.now();

  for (let i = 0; i < options.generateCandidates; i += 1) {
    const name = buildSyntheticName();
    const email = `${slugify(name)}.${generatedAt}.${i + 1}@seed.com`;
    const experience = randomInt(0, 12);
    const education = sampleUnique(
      [
        "B.Tech Computer Science",
        "B.Sc Information Technology",
        "MCA",
        "BBA",
        "MBA",
        "B.E. Electronics",
        "Diploma in Software Engineering",
      ],
      randomInt(1, 2)
    );
    const skills = sampleUnique(skillPool, randomInt(3, 8));

    const user = await ensureCandidateUser(
      {
        name,
        email,
        fallbackIndex: i + 1,
        password: options.syntheticPassword,
      },
      options,
      stats
    );

    const candidatePayload = {
      name,
      email: user.email,
      skills,
      education,
      experience,
      resumeParsedAt: new Date(),
      user: user._id,
    };

    if (options.dryRun) {
      stats.candidates.created += 1;
    } else {
      const beforeCandidate = await Candidate.findOne({ email: user.email });
      await Candidate.updateOne(
        { email: user.email },
        { $set: candidatePayload },
        { upsert: true }
      );

      if (beforeCandidate) stats.candidates.updated += 1;
      else stats.candidates.created += 1;
    }

    const maxForThisCandidate = Math.min(options.maxApplicationsPerCandidate, jobs.length);
    const applicationCount = randomInt(1, Math.max(1, maxForThisCandidate));
    const selectedJobs = sampleUnique(jobs, applicationCount);

    for (const job of selectedJobs) {
      const score = randomInt(35, 97);
      const payload = {
        candidateName: name,
        jobTitle: job.title,
        company: job.company,
        job: job._id,
        candidate: user._id,
        fullName: name,
        email: user.email,
        phone: buildPhone(),
        yearsExperience: experience,
        matchScore: score,
        status: synthStatusFromScore(score),
        resumeText: `${name} has ${experience} years of experience with ${skills.join(", ")}.`,
      };

      if (options.dryRun) {
        stats.applications.created += 1;
        continue;
      }

      const beforeApp = await Application.findOne({ candidate: user._id, job: job._id });
      await Application.updateOne(
        { candidate: user._id, job: job._id },
        { $set: payload },
        { upsert: true }
      );

      if (beforeApp) stats.applications.updated += 1;
      else stats.applications.created += 1;
    }
  }
};

const clearCollectionsForReplace = async (options) => {
  if (options.mode !== "replace") return;

  if (options.dryRun) {
    return;
  }

  await Promise.all([
    Application.deleteMany({}),
    Job.deleteMany({}),
    Candidate.deleteMany({}),
    Company.deleteMany({}),
  ]);
};

const showUsage = () => {
  console.log("Usage:");
  console.log(
    "node scripts/importKaggleData.js --jobs=./data/jobs.csv --candidates=./data/candidates.csv --applications=./data/applications.csv"
  );
  console.log("");
  console.log("Optional flags:");
  console.log("--mode=safe|replace       Default: safe");
  console.log("--limit=100               Import first N rows from each file");
  console.log("--dry-run                 Parse and simulate import without writing DB");
  console.log("--recruiter-email=...     Recruiter owner for imported jobs");
  console.log("--recruiter-password=...  Recruiter password if account is created");
  console.log("--generate-candidates=300 Generate synthetic candidates linked to jobs");
  console.log("--max-applications-per-candidate=3  Max job applications per generated candidate");
  console.log("--candidate-password=...  Password used for generated candidate users");
  console.log("--companies=...           Optional companies CSV (for company_id mapping)");
  console.log("--job-skills=...          Optional job skills CSV (for job_id mapping)");
};

const run = async () => {
  const options = parseOptions();

  if (hasFlag("--help") || hasFlag("-h")) {
    showUsage();
    return;
  }

  if (
    !options.jobsPath &&
    !options.candidatesPath &&
    !options.applicationsPath
  ) {
    showUsage();
    throw new Error("Please provide at least one CSV path.");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required in backend/.env");
  }

  const stats = {
    users: { created: 0, updated: 0 },
    jobs: { created: 0, updated: 0, skipped: 0 },
    candidates: { created: 0, updated: 0, skipped: 0 },
    applications: { created: 0, updated: 0, skipped: 0 },
  };

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
  console.log(`Mode: ${options.mode}${options.dryRun ? " (dry-run)" : ""}`);

  try {
    await clearCollectionsForReplace(options);

    const recruiter = await ensureRecruiter(
      options.recruiterEmail,
      options.recruiterPassword,
      options.dryRun
    );

    if (options.jobsPath) {
      const datasetContext = {
        companyById: new Map(),
        skillsByJobId: new Map(),
      };

      if (options.companiesPath) {
        const companyRows = readCsvRows(options.companiesPath);
        datasetContext.companyById = buildCompanyLookup(companyRows);
        console.log(
          `Loaded companies from ${options.companiesPath} (${companyRows.length} rows)`
        );
      }

      if (options.jobSkillsPath) {
        const skillRows = readCsvRows(options.jobSkillsPath);
        datasetContext.skillsByJobId = buildJobSkillsLookup(skillRows);
        console.log(
          `Loaded job skills from ${options.jobSkillsPath} (${skillRows.length} rows)`
        );
      }

      const rows = readCsvRows(options.jobsPath);
      console.log(`Importing jobs from ${options.jobsPath} (${rows.length} rows)`);
      await importJobs(rows, recruiter, options, stats, datasetContext);
    }

    if (options.candidatesPath) {
      const rows = readCsvRows(options.candidatesPath);
      console.log(`Importing candidates from ${options.candidatesPath} (${rows.length} rows)`);
      await importCandidates(rows, options, stats);
    }

    if (options.applicationsPath) {
      const rows = readCsvRows(options.applicationsPath);
      console.log(`Importing applications from ${options.applicationsPath} (${rows.length} rows)`);
      await importApplications(rows, options, stats);
    }

    if (options.generateCandidates > 0) {
      console.log(
        `Generating ${options.generateCandidates} synthetic candidates with up to ${options.maxApplicationsPerCandidate} applications each`
      );
      await generateSyntheticCandidatesAndApplications(options, stats);
    }

    console.log("Import complete");
    console.log(JSON.stringify(stats, null, 2));
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error("Import failed:", error.message);
  process.exit(1);
});
