# Kaggle Dataset Import For Testing

Use this when you want realistic test data in your local database.

## 1) Download CSV files from Kaggle

Export one or more CSV files for:
- jobs
- candidates
- applications

You can use separate datasets. The importer maps common column names automatically.

## 2) Place files in backend/data (example)

Example:
- backend/data/jobs.csv
- backend/data/candidates.csv
- backend/data/applications.csv

## 3) Run import (safe mode)

Safe mode upserts records and keeps existing records.

```bash
cd backend
npm run import:kaggle -- --jobs=./data/jobs.csv --candidates=./data/candidates.csv --applications=./data/applications.csv
```

## 4) Optional modes

Dry-run (no DB writes):

```bash
npm run import:kaggle -- --jobs=./data/jobs.csv --dry-run
```

Replace mode (clears Application, Job, Candidate, Company first):

```bash
npm run import:kaggle -- --jobs=./data/jobs.csv --candidates=./data/candidates.csv --mode=replace
```

Import only first N rows:

```bash
npm run import:kaggle -- --jobs=./data/jobs.csv --limit=200
```

Use a custom recruiter owner for imported jobs:

```bash
npm run import:kaggle -- --jobs=./data/jobs.csv --recruiter-email=recruiter.demo@hireai.com --recruiter-password=recruiter123
```

LinkedIn Kaggle dataset style (job_postings + companies + job_skills):

```bash
npm run import:kaggle -- --jobs="C:/Users/kanik/Downloads/archive/job_postings.csv" --companies="C:/Users/kanik/Downloads/archive/companies.csv" --job-skills="C:/Users/kanik/Downloads/archive/job_skills.csv" --limit=2000
```

## Supported column aliases

The importer tries common aliases such as:
- Job title: job_title, title, position, role
- Company: company, company_name, employer
- Description: description, job_description, requirements
- Candidate name: candidate_name, name, full_name
- Candidate email: candidate_email, email, applicant_email
- Status: status, application_status, result
- Score: match_score, score, ai_score
- Company mapping: company_id (from jobs) + name (from companies)
- Job skills mapping: job_id + skill_abr/skill

If your CSV uses unusual column names, rename headers in CSV and rerun.

## Notes

- Requires `MONGO_URI` in backend `.env`.
- If candidate email is missing, synthetic email is generated (`@kaggledata.com`).
- Application rows are skipped when no matching job can be found by title/company.
