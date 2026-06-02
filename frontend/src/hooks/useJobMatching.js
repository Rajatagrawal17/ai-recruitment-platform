import { useState, useRef, useCallback, useEffect } from 'react';
import { calculateLocalScore } from '../utils/matchScorer';

const scoreCache = new Map();

export function useJobMatching(jobs, userProfile) {
  const [scores, setScores] = useState({});
  const pendingRef = useRef(new Set());

  const scoreJob = useCallback(
    async (job) => {
      if (!userProfile?.skills?.length) return;
      if (scoreCache.has(job._id)) {
        setScores(prev => ({
          ...prev,
          [job._id]: scoreCache.get(job._id)
        }));
        return;
      }
      if (pendingRef.current.has(job._id)) return;
      pendingRef.current.add(job._id);

      const jdText = [
        job.title,
        job.description,
        job.requirements
      ].filter(Boolean).join(' ');

      const localResult = calculateLocalScore(userProfile, jdText);

      if (localResult && localResult.matchedSkills.length > 0) {
        const result = {
          score: localResult.localTotal,
          reason: generateReason(localResult),
          matchedSkills: localResult.matchedSkills,
          missingSkills: localResult.missingSkills,
          breakdown: {
            keywords: localResult.keywordScore,
            experience: localResult.expScore,
            education: localResult.eduScore,
            location: localResult.locScore
          },
          source: 'local'
        };
        scoreCache.set(job._id, result);
        pendingRef.current.delete(job._id);
        setScores(prev => ({
          ...prev,
          [job._id]: result
        }));
        return;
      }

      try {
        const res = await fetch(
          'https://api.anthropic.com/v1/messages',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 150,
              temperature: 0,
              system: `You are a precise recruitment scoring engine. Score candidate-job fit. Be strict and consistent.`,
              messages: [{
                role: 'user',
                content: `Score 0-100.
                Candidate skills: ${(userProfile.skills || []).slice(0, 15).join(', ')}
                Experience: ${Math.round(userProfile.totalExp || 0)} years
                Job: ${job.title}
                Requirements: ${jdText.slice(0, 400)}
                Return ONLY JSON:
                {"score":number,
                "reason":"max 8 words",
                "tier":"A"or"B"or"C"}`
              }]
            })
          }
        );
        const data = await res.json();
        const text = data.content?.[0]?.text || '{}';
        const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
        const result = {
          score: parsed.score || 50,
          reason: parsed.reason || 'Calculated fit',
          tier: parsed.tier || 'C',
          source: 'claude'
        };
        scoreCache.set(job._id, result);
        setScores(prev => ({
          ...prev,
          [job._id]: result
        }));
      } catch (e) {
        const fallback = {
          score: localResult?.localTotal || 50,
          reason: 'Estimated from profile',
          source: 'fallback'
        };
        scoreCache.set(job._id, fallback);
        setScores(prev => ({
          ...prev,
          [job._id]: fallback
        }));
      }
      pendingRef.current.delete(job._id);
    },
    [userProfile]
  );

  // Auto-score all jobs when they are loaded and profile is available
  useEffect(() => {
    if (jobs && jobs.length > 0 && userProfile?.skills?.length) {
      jobs.forEach(job => {
        scoreJob(job);
      });
    }
  }, [jobs, userProfile, scoreJob]);

  return { scores, scoreJob };
}

function generateReason(result) {
  const matched = result.matchedSkills.length;
  const missing = result.missingSkills.length;
  if (matched === 0) return 'Few skills match this role';
  if (missing === 0) return 'Strong skill alignment';
  if (matched > missing) return `${matched} of ${matched + missing} skills match`;
  return `Missing ${result.missingSkills.slice(0, 2).join(', ')}`;
}
