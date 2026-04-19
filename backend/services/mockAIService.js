// Mock AI Service - For development/demo without Claude API
// Once CLAUDE_API_KEY is set, this won't be used

class MockAIResumeAnalyzer {
  /**
   * Analyze resume using mock data (demo mode)
   */
  static async analyzeResume(resumeText) {
    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error("Resume text is empty or invalid");
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Determine score based on resume length and keywords
    const hasMetrics = /\d+%|increased|improved|grew|raised/gi.test(resumeText);
    const hasTechSkills = /python|javascript|react|node|java|aws|docker|sql/gi.test(resumeText);
    const wordCount = resumeText.split(/\s+/).length;

    let authenticity = 65;
    let atsScore = 60;

    if (wordCount > 200) authenticity += 15;
    if (wordCount > 500) authenticity += 10;
    if (hasMetrics) authenticity += 10;
    if (hasTechSkills) atsScore += 20;

    authenticity = Math.min(95, authenticity);
    atsScore = Math.min(95, atsScore);

    // Extract skills from text
    const allSkills = [
      "JavaScript", "Python", "React", "Node.js", "TypeScript",
      "SQL", "MongoDB", "PostgreSQL", "AWS", "Docker",
      "REST API", "Git", "Linux", "HTML", "CSS",
      "Communication", "Leadership", "Project Management"
    ];

    const extractedSkills = allSkills.filter(skill =>
      resumeText.toLowerCase().includes(skill.toLowerCase())
    );

    return {
      authenticity_score: authenticity,
      authenticity_assessment: "Resume appears well-structured and professional",
      skills: extractedSkills.length > 0 ? extractedSkills : ["General"],
      skill_categories: {
        programming_languages: extractedSkills.filter(s =>
          ["JavaScript", "Python", "TypeScript", "Java"].includes(s)
        ),
        frameworks: extractedSkills.filter(s =>
          ["React", "Node.js", "Angular", "Vue"].includes(s)
        ),
        databases: extractedSkills.filter(s =>
          ["SQL", "MongoDB", "PostgreSQL", "Redis"].includes(s)
        ),
        cloud_platforms: extractedSkills.filter(s =>
          ["AWS", "Docker", "Kubernetes"].includes(s)
        ),
        tools: extractedSkills.filter(s =>
          ["Git", "Linux", "Jira"].includes(s)
        ),
        soft_skills: extractedSkills.filter(s =>
          ["Communication", "Leadership", "Project Management"].includes(s)
        ),
      },
      experience: {
        years: hasMetrics ? 3 : 2,
        summary: "Professional with solid technical foundation",
      },
      education: {
        degrees: [
          {
            degree: "Bachelor of Science",
            field: "Computer Science",
            institution: "University",
          },
        ],
        certifications: extractedSkills.length > 5 ? ["AWS Certified"] : [],
      },
      strengths: [
        "Clear career progression",
        "Relevant technical skills",
        "Professional communication",
      ],
      weaknesses: [
        "Could add more quantifiable achievements",
        "Consider adding more specific projects",
      ],
      red_flags: [],
      ats_score: atsScore,
      ats_reasons: [
        "Good keyword density",
        "Clear section headers",
        "Relevant technical terms",
      ],
      overall_quality: atsScore > 80 ? "excellent" : atsScore > 70 ? "good" : "average",
      suggestions: [
        {
          type: "improvement",
          message: "Add specific metrics to quantify achievements",
        },
        {
          type: "tip",
          message: "Use industry keywords for better ATS compatibility",
        },
        {
          type: "warning",
          message: "Ensure consistent formatting for better readability",
        },
      ],
      analyzed_at: new Date().toISOString(),
      provider: "Mock AI (Demo Mode)",
      is_demo: true,
    };
  }

  /**
   * Detect authenticity issues (demo)
   */
  static async detectAuthenticity(resumeText) {
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
      authenticity_score: 82,
      risk_level: "low",
      detected_issues: [],
      red_flags: {
        timeline_inconsistencies: [],
        inflated_claims: [],
        generic_language: [],
        missing_details: [],
        skill_inconsistencies: [],
      },
      trustworthiness_assessment: "Resume appears genuine with consistent information",
      recommended_verifications: ["Contact previous employers", "Verify certifications"],
      is_demo: true,
    };
  }

  /**
   * Match resume to job (demo)
   */
  static async matchResumeToJob(resumeText, job) {
    await new Promise(resolve => setTimeout(resolve, 700));

    return {
      jobId: job._id,
      jobTitle: job.title,
      match_score: 75,
      match_level: "good",
      matched_skills: ["React", "JavaScript", "Node.js"],
      missing_skills: ["Docker", "Kubernetes"],
      nice_to_have_skills: ["TypeScript"],
      experience_fit: "Your 3+ years aligns well with requirements",
      culture_fit_indicators: [
        "Strong technical background",
        "Collaborative mindset",
      ],
      strengths_for_role: [
        "Solid React experience",
        "Full-stack capability",
      ],
      concerns: ["Need to strengthen DevOps skills"],
      overall_assessment: "Good fit. Strong technical match with room for growth in DevOps.",
      recommendation: "strong hire",
      analyzed_at: new Date().toISOString(),
      is_demo: true,
    };
  }

  /**
   * Generate improvements (demo)
   */
  static async generateImprovements(analysis) {
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
      quick_wins: [
        {
          action: "Add quantifiable metrics to achievements",
          expected_improvement: "+10 ATS points",
          effort: "low",
        },
        {
          action: "Improve formatting consistency",
          expected_improvement: "+5 ATS points",
          effort: "low",
        },
      ],
      major_improvements: [
        {
          area: "Technical Depth",
          current_state: "General tech skills",
          target_state: "Specialized expertise",
          steps: [
            "Focus on 2-3 key technologies",
            "Build portfolio projects",
            "Document learnings",
          ],
          timeline_weeks: 8,
        },
      ],
      ats_optimization: [
        "Add more industry keywords",
        "Use standard section headers",
        "Include numbers and metrics",
      ],
      content_improvements: [
        "Use action verbs at start of bullets",
        "Show impact of your work",
        "Quantify achievements with numbers",
      ],
      skill_development_plan: [
        {
          skill: "Docker & Kubernetes",
          priority: "high",
          resources: [
            "Udemy: Docker Masterclass",
            "freeCodeCamp: Kubernetes Tutorial",
          ],
          estimated_time_weeks: 4,
        },
        {
          skill: "AWS Certification",
          priority: "medium",
          resources: ["A Cloud Guru", "AWS Training"],
          estimated_time_weeks: 6,
        },
      ],
      is_demo: true,
    };
  }
}

module.exports = MockAIResumeAnalyzer;
