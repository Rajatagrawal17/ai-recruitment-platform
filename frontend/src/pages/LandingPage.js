import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, BarChart3, Users, CheckCircle } from 'lucide-react';
import {
  ParallaxHeroSection,
  WorkflowSection,
  CardStackSection,
  StatsSection,
} from '../components/AdvancedScrollAnimations';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './RecruitmentPages.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollProgressBar - Shows scroll percentage at top
 */
const ScrollProgressBar = () => {
  const progressRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!progressRef.current) return;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      gsap.to(progressRef.current, {
        scaleX: scrolled / 100,
        duration: 0.1,
        overwrite: 'auto',
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div
        ref={progressRef}
        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
        style={{
          transformOrigin: 'left',
          scaleX: 0,
        }}
      />
    </div>
  );
};

/**
 * Enhanced LandingPage with advanced scroll animations
 */
const LandingPage = () => {
  // Data for workflow section
  const workflowSteps = [
    {
      title: 'Upload Resume',
      description: 'Candidates upload their resume securely to the platform',
    },
    {
      title: 'AI Analysis',
      description: 'Our AI extracts skills, experience, and qualifications',
    },
    {
      title: 'Smart Matching',
      description: 'Match with relevant job opportunities instantly',
    },
    {
      title: 'Quick Decisions',
      description: 'Recruiters make faster hiring decisions with AI insights',
    },
  ];

  // Data for features/cards
  const features = [
    {
      icon: '🚀',
      title: 'Smart Resume Screening',
      description: 'Extract skills and experience from resumes and compare them against job requirements.',
    },
    {
      icon: '📊',
      title: 'Role-Based Dashboards',
      description: 'Separate flows for candidates and recruiters to keep actions focused and secure.',
    },
    {
      icon: '📈',
      title: 'Hiring Insights',
      description: 'Track applicant pipelines, match percentages, and candidate rankings from one place.',
    },
    {
      icon: '⚡',
      title: 'Real-time Ranking',
      description: 'AI-powered scoring system that instantly ranks candidates based on job requirements.',
    },
    {
      icon: '🔒',
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security for resume uploads and candidate data.',
    },
    {
      icon: '🎯',
      title: 'Smart Matching',
      description: 'Advanced NLP technology that understands job requirements and matches them accurately.',
    },
  ];

  // Stats data
  const stats = [
    { value: 10000, label: 'Active Users' },
    { value: 5000, label: 'Jobs Posted' },
    { value: 50000, label: 'Candidates' },
    { value: 85, label: 'Match Success %' },
  ];

  return (
    <>
      <ScrollProgressBar />

      <main className="w-full">
        {/* ===== HERO SECTION ===== */}
        <ParallaxHeroSection
          title="Find the Right Talent. Find the Right Job."
          subtitle="HireAI helps recruiters post jobs, screen resumes, and rank candidates with AI match scoring. Candidates can apply instantly, track status, and view match scores."
          backgroundImage="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop"
        >
          <motion.div
            className="flex gap-4 flex-wrap justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Link
              to="/register?role=candidate"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg flex items-center gap-2 group"
            >
              I'm a Candidate
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register?role=recruiter"
              className="px-8 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/30 flex items-center gap-2 group"
            >
              I'm a Recruiter
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Hero stats strip */}
          <motion.div
            className="mt-12 flex flex-wrap justify-center gap-8 text-white text-sm font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <span className="flex items-center gap-2">
              <Zap className="text-yellow-400" size={18} />
              Real-time Ranking
            </span>
            <span className="flex items-center gap-2">
              <Users className="text-blue-400" size={18} />
              Role-Based Dashboards
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="text-green-400" size={18} />
              Faster Decisions
            </span>
          </motion.div>
        </ParallaxHeroSection>

        {/* ===== WORKFLOW SECTION ===== */}
        <WorkflowSection steps={workflowSteps} />

        {/* ===== STATS SECTION ===== */}
        <StatsSection stats={stats} />

        {/* ===== FEATURES SECTION ===== */}
        <CardStackSection cards={features} />

        {/* ===== DETAILED RECRUITER SECTION ===== */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20"
            >
              <div>
                <h2 className="text-4xl font-bold mb-6">Recruiter Experience</h2>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  Prioritize candidates by skill fit and readiness. Surface high-potential applicants
                  instantly with transparent match scoring and streamlined status management.
                </p>
                <ul className="space-y-3">
                  {[
                    'Smart resume screening with AI',
                    'Real-time candidate ranking',
                    'Match score transparency',
                    'Batch candidate processing',
                  ].map((item, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <CheckCircle className="text-indigo-600 flex-shrink-0" size={20} />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg p-12 h-72 flex items-center justify-center"
              >
                <BarChart3 size={120} className="text-indigo-600 opacity-20" />
              </motion.div>
            </motion.div>

            {/* ===== DETAILED CANDIDATE SECTION ===== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg p-12 h-72 flex items-center justify-center order-2 md:order-1"
              >
                <Users size={120} className="text-indigo-600 opacity-20" />
              </motion.div>
              <div className="order-1 md:order-2">
                <h2 className="text-4xl font-bold mb-6">Candidate Experience</h2>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  Apply faster with clarity on your score. Candidates can track applications, review
                  match quality, and focus on roles aligned with their profile.
                </p>
                <ul className="space-y-3">
                  {[
                    'One-click job applications',
                    'Real-time match scores visible',
                    'Application status tracking',
                    'Personalized job recommendations',
                  ].map((item, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <CheckCircle className="text-indigo-600 flex-shrink-0" size={20} />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== CTA SECTION ===== */}
        <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Ready to Transform Your Hiring?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg mb-8 text-indigo-100"
            >
              Join thousands of recruiters and candidates using HireAI to find better matches faster.
            </motion.p>

            <motion.div
              className="flex gap-4 justify-center flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link
                to="/register?role=recruiter"
                className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Start Recruiting Now
              </Link>
              <Link
                to="/register?role=candidate"
                className="px-8 py-3 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-800 transition-colors shadow-lg"
              >
                Find Your Next Job
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
};

export default LandingPage;
