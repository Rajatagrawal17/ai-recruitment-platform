const Anthropic = require("@anthropic-ai/sdk");
const Job = require("../models/Job");

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

class AIResumeAnalyzer {
  /**
   * Analyze resume using Claude AI
   * @param {string} resumeText - The full resume text
   * @returns {object} - Complete resume analysis
   */
  static async analyzeResume(resumeText) {
    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error("Resume text is empty or invalid");
    }

    if (!process.env.CLAUDE_API_KEY) {
      throw new Error("CLAUDE_API_KEY not configured");
    }

    try {
      const prompt = `You are an expert resume analyst and recruiter. Analyze the following resume and provide a detailed assessment.

RESUME TEXT:
${resumeText}

Provide a comprehensive analysis in the following JSON format (return ONLY valid JSON, no markdown, no explanations):
{
  "authenticity_score": <number 0-100, higher means more likely to be genuine/well-written>,
  "authenticity_assessment": "<brief assessment of whether the resume appears genuine>",
  "skills": [<array of identified skills as strings>],
  "skill_categories": {
    "programming_languages": [<skills>],
    "frameworks": [<skills>],
    "databases": [<skills>],
    "cloud_platforms": [<skills>],
    "tools": [<skills>],
    "soft_skills": [<skills>],
    "other": [<skills>]
  },
  "experience": {
    "years": <number of years of experience>,
    "summary": "<brief summary of career trajectory>"
  },
  "education": {
    "degrees": [
      {
        "degree": "<e.g., Bachelor of Science>",
        "field": "<e.g., Computer Science>",
        "institution": "<university name>"
      }
    ],
    "certifications": [<relevant certifications>]
  },
  "strengths": [<top 3 strengths identified from resume>],
  "weaknesses": [<top 3 areas for improvement>],
  "red_flags": [<any concerning patterns, inconsistencies, or red flags found>],
  "ats_score": <number 0-100>,
  "ats_reasons": [<specific reasons for the ATS score>],
  "overall_quality": "<excellent/good/average/poor>",
  "suggestions": [
    {
      "type": "<improvement/warning/tip>",
      "message": "<specific actionable suggestion>"
    }
  ]
}

Focus on:
1. Authenticity: Are claims realistic? Do dates/roles make sense?
2. Content quality: Is the writing professional? Are achievements quantifiable?
3. Relevance: Are skills current and in-demand?
4. ATS optimization: Does it have keywords, good formatting clues?
5. Red flags: Unexplained gaps, inflated claims, inconsistencies`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      // Extract the text response
      const analysisText = response.content[0].type === "text" ? response.content[0].text : "";

      // Parse JSON response
      let analysis;
      try {
        analysis = JSON.parse(analysisText);
      } catch (parseError) {
        console.error("Failed to parse Claude response:", analysisText);
        throw new Error("Failed to parse AI analysis response");
      }

      return {
        ...analysis,
        analyzed_at: new Date().toISOString(),
        model: "claude-3-5-sonnet-20241022",
      };
    } catch (error) {
      console.error("Claude API Error:", error.message);
      throw new Error(`Resume analysis failed: ${error.message}`);
    }
  }

  /**
   * Match resume to job using Claude AI
   * @param {string} resumeText - Resume content
   * @param {object} job - Job object with title, description, requirements
   * @returns {object} - Match analysis with score and insights
   */
  static async matchResumeToJob(resumeText, job) {
    if (!resumeText || !job) {
      throw new Error("Resume text and job are required");
    }

    try {
      const prompt = `You are an expert recruiter matching resumes to job positions. Analyze how well this resume matches the job posting.

RESUME:
${resumeText}

JOB TITLE: ${job.title}
JOB DESCRIPTION: ${job.description}
REQUIRED SKILLS: ${job.requirements || "Not specified"}
COMPANY: ${job.company || "Not specified"}

Provide analysis in JSON format (ONLY valid JSON):
{
  "match_score": <number 0-100, higher = better match>,
  "match_level": "<excellent/good/fair/poor>",
  "matched_skills": [<skills from resume that match job>],
  "missing_skills": [<required skills not in resume>],
  "nice_to_have_skills": [<optional skills candidate has>],
  "experience_fit": "<assessment of whether experience level matches>",
  "culture_fit_indicators": [<positive indicators for culture fit>],
  "strengths_for_role": [<candidate strengths relevant to this job>],
  "concerns": [<any concerns about the fit>],
  "overall_assessment": "<detailed paragraph on why this is/isn't a good match>",
  "recommendation": "<strong hire/consider/maybe/unlikely>"
}`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const matchText = response.content[0].type === "text" ? response.content[0].text : "";

      let matchAnalysis;
      try {
        matchAnalysis = JSON.parse(matchText);
      } catch (parseError) {
        console.error("Failed to parse match response:", matchText);
        throw new Error("Failed to parse match analysis response");
      }

      return {
        jobId: job._id,
        jobTitle: job.title,
        ...matchAnalysis,
        analyzed_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Claude Match Error:", error.message);
      throw new Error(`Job matching failed: ${error.message}`);
    }
  }

  /**
   * Generate improvement suggestions using Claude
   * @param {object} analysis - Resume analysis object from analyzeResume
   * @returns {object} - Detailed improvement plan
   */
  static async generateImprovements(analysis) {
    if (!analysis || !analysis.weaknesses) {
      throw new Error("Analysis object with weaknesses is required");
    }

    try {
      const prompt = `Based on this resume analysis, generate a detailed improvement plan:

CURRENT ANALYSIS:
- ATS Score: ${analysis.ats_score}/100
- Weaknesses: ${analysis.weaknesses.join(", ")}
- Red Flags: ${analysis.red_flags?.join(", ") || "None"}
- Overall Quality: ${analysis.overall_quality}

Provide a JSON improvement plan:
{
  "quick_wins": [
    {
      "action": "<specific action>",
      "expected_improvement": "<what improves>",
      "effort": "<low/medium/high>"
    }
  ],
  "major_improvements": [
    {
      "area": "<area to improve>",
      "current_state": "<what's wrong>",
      "target_state": "<what should be>",
      "steps": [<actionable steps>],
      "timeline_weeks": <estimated weeks>
    }
  ],
  "ats_optimization": [<specific ATS improvements>],
  "content_improvements": [<writing/clarity improvements>],
  "skill_development_plan": [
    {
      "skill": "<skill to learn>",
      "priority": "<high/medium/low>",
      "resources": [<learning resources>],
      "estimated_time_weeks": <weeks>
    }
  ]
}`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const improvementText = response.content[0].type === "text" ? response.content[0].text : "";

      let improvements;
      try {
        improvements = JSON.parse(improvementText);
      } catch (parseError) {
        console.error("Failed to parse improvements:", improvementText);
        throw new Error("Failed to parse improvements response");
      }

      return improvements;
    } catch (error) {
      console.error("Claude Improvement Error:", error.message);
      throw new Error(`Improvement generation failed: ${error.message}`);
    }
  }

  /**
   * Detect resume authenticity issues
   * @param {string} resumeText - Resume content
   * @returns {object} - Authenticity assessment
   */
  static async detectAuthenticity(resumeText) {
    if (!resumeText) {
      throw new Error("Resume text is required");
    }

    try {
      const prompt = `You are an expert at detecting resume fraud and authenticity issues. Analyze this resume for red flags that indicate fabricated claims, inflated credentials, or dishonesty.

RESUME:
${resumeText}

Provide assessment in JSON format (ONLY JSON):
{
  "authenticity_score": <0-100, higher = more trustworthy>,
  "risk_level": "<low/medium/high>",
  "detected_issues": [
    {
      "issue": "<specific issue found>",
      "severity": "<low/medium/high>",
      "reasoning": "<why this is a concern>",
      "verification_method": "<how to verify>"
    }
  ],
  "red_flags": {
    "timeline_inconsistencies": [<any gaps or overlaps in timeline>],
    "inflated_claims": [<suspiciously ambitious achievements>],
    "generic_language": [<overly generic or AI-sounding phrases>],
    "missing_details": [<important details that are vague>],
    "skill_inconsistencies": [<skills that don't align with experience>]
  },
  "trustworthiness_assessment": "<paragraph assessing overall trustworthiness>",
  "recommended_verifications": [<suggested background check items>]
}`;

      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const authText = response.content[0].type === "text" ? response.content[0].text : "";

      let authenticity;
      try {
        authenticity = JSON.parse(authText);
      } catch (parseError) {
        console.error("Failed to parse authenticity:", authText);
        throw new Error("Failed to parse authenticity response");
      }

      return authenticity;
    } catch (error) {
      console.error("Claude Authenticity Error:", error.message);
      throw new Error(`Authenticity detection failed: ${error.message}`);
    }
  }
}

module.exports = AIResumeAnalyzer;
