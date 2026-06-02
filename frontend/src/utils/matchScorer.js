export function extractProfileVector(profile) {
  const expVal = profile.experience || profile.totalExp || 0;
  const experienceYears = (typeof expVal === 'number' || typeof expVal === 'string')
    ? (typeof expVal === 'string' ? parseFloat(expVal) || 0 : expVal)
    : extractYears(expVal);

  return {
    skills: (profile.skills || [])
      .map(s => s.toLowerCase().trim()),
    experienceYears,
    education: extractEducation(profile),
    location: (profile.location || profile.currentLocation || '')
      .toLowerCase().trim(),
    jobTitles: extractTitles(profile.experience || [])
  }
}

function extractYears(experience) {
  if (!experience || !experience.length) return 0;
  if (typeof experience === 'number') return experience;
  if (typeof experience === 'string') {
    const parsed = parseFloat(experience);
    return isNaN(parsed) ? 0 : parsed;
  }
  return experience.reduce((total, exp) => {
    if (!exp) return total;
    const start = new Date(exp.startDate || 0)
    const end = exp.current ? 
      new Date() : new Date(exp.endDate || 0)
    return total + Math.max(0,
      (end - start) / (1000 * 60 * 60 * 24 * 365))
  }, 0)
}

function extractEducation(profile) {
  const eduVal = profile.education;
  if (typeof eduVal === 'string') {
    const eduLower = eduVal.toLowerCase();
    if (eduLower.includes('phd') || eduLower.includes('doctorate')) return 'phd';
    if (eduLower.includes('master') || eduLower.includes('mba') || eduLower.includes('mtech')) return 'masters';
    if (eduLower.includes('bachelor') || eduLower.includes('btech') || eduLower.includes('be') || eduLower.includes('bsc')) return 'bachelors';
    return 'other';
  }
  const edu = (profile.education || [])
    .map(e => {
      if (!e) return '';
      if (typeof e === 'string') return e.toLowerCase();
      return e.degree?.toLowerCase() || '';
    });
  if (edu.some(e => e.includes('phd') || 
    e.includes('doctorate'))) return 'phd'
  if (edu.some(e => e.includes('master') || 
    e.includes('mba') || e.includes('mtech')))
    return 'masters'
  if (edu.some(e => e.includes('bachelor') || 
    e.includes('btech') || e.includes('be') ||
    e.includes('bsc'))) return 'bachelors'
  return 'other'
}

function extractTitles(experience) {
  if (!experience || !Array.isArray(experience)) return [];
  return experience
    .map(e => (e && e.title || '').toLowerCase())
}

export function extractJDRequirements(jdText) {
  const text = jdText.toLowerCase()
  
  const TECH_SKILLS = [
    'react','angular','vue','next.js','typescript',
    'javascript','node.js','python','java','go',
    'rust','aws','gcp','azure','docker','kubernetes',
    'graphql','rest','sql','postgresql','mongodb',
    'redis','git','ci/cd','machine learning',
    'tensorflow','pytorch','figma','sketch',
    'tailwind','css','html','express','django',
    'spring','flutter','react native','swift',
    'kotlin','php','laravel','rails','elasticsearch'
  ]

  const foundSkills = TECH_SKILLS.filter(s =>
    text.includes(s.toLowerCase())
  )

  const expMatch = text.match(
    /(\d+)\+?\s*(?:to\s*\d+\s*)?years?\s*(?:of\s*)?(?:experience|exp)/i
  )
  const requiredExp = expMatch ? 
    parseInt(expMatch[1]) : 0

  const requiresDegree = 
    text.includes('bachelor') ||
    text.includes('b.tech') ||
    text.includes('degree') ||
    text.includes('graduate')

  const requiresMasters =
    text.includes('master') ||
    text.includes('mba') ||
    text.includes('postgraduate')

  const locationSignals = {
    remote: text.includes('remote') ||
      text.includes('work from home') ||
      text.includes('wfh'),
    hybrid: text.includes('hybrid'),
    onsite: text.includes('on-site') ||
      text.includes('onsite') ||
      text.includes('in-office')
  }

  return {
    requiredSkills: foundSkills,
    requiredExperienceYears: requiredExp,
    requiresDegree,
    requiresMasters,
    locationSignals
  }
}

export function calculateLocalScore(profile, jd) {
  const pv = extractProfileVector(profile)
  const jdr = extractJDRequirements(jd)

  if (!jdr.requiredSkills.length) return null

  const matchedSkills = jdr.requiredSkills
    .filter(s => pv.skills.some(ps =>
      ps.includes(s) || s.includes(ps) ||
      areSynonyms(ps, s)
    ))

  const keywordScore = jdr.requiredSkills.length > 0
    ? Math.round(
        (matchedSkills.length /
         jdr.requiredSkills.length) * 100
      )
    : 50

  let expScore = 100
  if (jdr.requiredExperienceYears > 0) {
    const ratio = pv.experienceYears /
      jdr.requiredExperienceYears
    expScore = Math.min(100,
      Math.round(ratio * 100))
  }

  let eduScore = 100
  if (jdr.requiresMasters) {
    eduScore = pv.education === 'phd' ||
      pv.education === 'masters' ? 100 : 60
  } else if (jdr.requiresDegree) {
    eduScore = pv.education !== 'other' ? 100 : 70
  }

  let locScore = 75
  if (jdr.locationSignals.remote) locScore = 100
  else if (jdr.locationSignals.hybrid) locScore = 85

  return {
    keywordScore,
    expScore,
    eduScore,
    locScore,
    matchedSkills,
    missingSkills: jdr.requiredSkills
      .filter(s => !matchedSkills.includes(s)),
    localTotal: Math.round(
      keywordScore * 0.40 +
      expScore * 0.30 +
      eduScore * 0.20 +
      locScore * 0.10
    )
  }
}

function areSynonyms(a, b) {
  const synonyms = {
    'react': ['react.js','reactjs'],
    'node.js': ['nodejs','node'],
    'next.js': ['nextjs'],
    'javascript': ['js','es6'],
    'typescript': ['ts'],
    'postgresql': ['postgres','psql'],
    'machine learning': ['ml','ai/ml'],
    'kubernetes': ['k8s'],
    'continuous integration': ['ci/cd','cicd']
  }
  for (const [key, vals] of
    Object.entries(synonyms)) {
    if ((a === key || vals.includes(a)) &&
        (b === key || vals.includes(b)))
      return true
  }
  return false
}
