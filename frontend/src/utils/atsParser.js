export function extractJDKeywords(jdText) {
  const text = (jdText || "").toLowerCase()
  
  const techSkills = [
    'react','node.js','python','typescript','javascript',
    'java','aws','docker','kubernetes','graphql','sql',
    'mongodb','postgresql','redis','git','ci/cd','agile',
    'rest api','microservices','machine learning','tensorflow',
    'vue','angular','next.js','express','django','spring',
    'azure','gcp','linux','figma','sketch','jira'
  ]
  
  const softSkills = [
    'leadership','communication','teamwork','problem solving',
    'analytical','detail oriented','proactive','collaborative',
    'mentoring','cross-functional'
  ]
  
  const experienceMatch = text.match(
    /(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i
  )
  const requiredExp = experienceMatch ? 
    parseInt(experienceMatch[1]) : null
  
  const educationKeywords = []
  if (text.includes('bachelor')) educationKeywords.push('bachelor')
  if (text.includes('master')) educationKeywords.push('master')
  if (text.includes('phd') || text.includes('doctorate')) 
    educationKeywords.push('phd')
  if (text.includes('b.tech') || text.includes('b.e')) 
    educationKeywords.push('engineering degree')
  
  const foundTechSkills = techSkills.filter(s => 
    text.includes(s.toLowerCase())
  )
  const foundSoftSkills = softSkills.filter(s => 
    text.includes(s.toLowerCase())
  )
  
  return {
    techSkills: foundTechSkills,
    softSkills: foundSoftSkills,
    requiredExperience: requiredExp,
    education: educationKeywords,
    allKeywords: [...foundTechSkills, ...foundSoftSkills]
  }
}

export function checkCVKeywords(cvText, keywords) {
  const text = (cvText || "").toLowerCase()
  const found = []
  const missing = []
  
  keywords.forEach(kw => {
    if (text.includes(kw.toLowerCase())) {
      found.push(kw)
    } else {
      missing.push(kw)
    }
  })
  
  const score = keywords.length > 0 
    ? Math.round((found.length / keywords.length) * 100)
    : 0;
  
  return { found, missing, score }
}

export function checkATSFormat(cvText) {
  const text = cvText || ""
  const issues = []
  const warnings = []
  
  if (text.includes('|') || text.includes('│')) {
    issues.push('Tables detected — ATS cannot parse table content')
  }
  if ((text.match(/\n/g) || []).length < 20) {
    issues.push('Very little structure detected — add clear sections')
  }
  if (!text.match(/\b[\w.]+@[\w.]+\.\w+\b/)) {
    issues.push('No email address found')
  }
  if (!text.match(/\b\d{10}\b|\+\d{10,}/)) {
    warnings.push('Phone number not clearly visible')
  }
  
  const sections = ['experience','education','skills',
    'projects','certifications']
  const foundSections = sections.filter(s => 
    text.toLowerCase().includes(s)
  )
  if (foundSections.length < 3) {
    issues.push('Missing clear section headings (Experience, Education, Skills)')
  }
  
  const wordCount = text.split(/\s+/).length
  if (wordCount > 800) {
    warnings.push(`CV is ${wordCount} words — aim for under 600`)
  }
  if (text.trim().length === 0 || wordCount < 150) {
    issues.push('CV seems too short — add more detail')
  }
  
  const formatScore = Math.max(0, 
    100 - (issues.length * 20) - (warnings.length * 10)
  )
  
  return { issues, warnings, formatScore }
}
