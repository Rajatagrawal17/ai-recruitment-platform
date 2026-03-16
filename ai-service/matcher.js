// Simple string matching algorithm without 'natural' dependency
exports.calculateMatchScore = (resumeText, jobDescription) => {
  if (!resumeText || !jobDescription) return 0;

  // Convert to lowercase for comparison
  const resume = resumeText.toLowerCase();
  const job = jobDescription.toLowerCase();

  // Extract keywords (words longer than 3 characters)
  const getKeywords = (text) => {
    return text
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .map((word) => word.replace(/[^\w]/g, ""));
  };

  const resumeKeywords = new Set(getKeywords(resume));
  const jobKeywords = new Set(getKeywords(job));

  // Calculate matching keywords
  let matches = 0;
  jobKeywords.forEach((keyword) => {
    if (resumeKeywords.has(keyword)) {
      matches++;
    }
  });

  // Calculate percentage (max 100)
  const percentage = Math.min(
    Math.round((matches / Math.max(jobKeywords.size, 1)) * 100),
    100
  );

  return percentage;
};