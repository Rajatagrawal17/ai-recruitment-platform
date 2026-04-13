import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Zap,
  TrendingUp,
  Shield,
} from "lucide-react";
import {
  ModernButton,
  GradientText,
  AnimatedTitle,
  ModernCard,
  AnimatedGradientBg,
} from "../components/UI/ModernComponents";

gsap.registerPlugin(ScrollTrigger);

const ModernLandingPage = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    // Hero gradient animation
    if (heroRef.current) {
      gsap.to(heroRef.current, {
        backgroundPosition: "200% center",
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    // Scroll animations for feature cards
    const cards = document.querySelectorAll("[data-card]");
    cards.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }, []);

  const features = [
    {
      icon: Users,
      title: "Smart Matching",
      description: "AI-powered candidate matching with 95% accuracy",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process applications 10x faster with automation",
    },
    {
      icon: TrendingUp,
      title: "Analytics",
      description: "Real-time insights on your hiring pipeline",
    },
    {
      icon: Shield,
      title: "Secure",
      description: "Enterprise-grade security for sensitive data",
    },
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "50K+", label: "Jobs Posted" },
    { number: "95%", label: "Match Rate" },
    { number: "24/7", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 origin-left z-50"
        style={{
          scaleX: useMotionValue(0),
        }}
      />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950 pt-20"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-20 right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
              delay: 1,
            }}
            className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:border-blue-500/50 transition-colors"
          >
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-sm text-gray-300">Transform Your Hiring Process</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            The Future of{" "}
            <GradientText from="from-blue-400" to="to-purple-600">
              Recruitment
            </GradientText>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
          >
            AI-powered hiring platform that finds and matches the perfect candidates in minutes, not weeks.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link to="/register">
              <ModernButton size="lg" glow>
                Get Started for Free <ArrowRight size={20} />
              </ModernButton>
            </Link>
            <Link to="/jobs">
              <ModernButton variant="secondary" size="lg">
                Explore Jobs
              </ModernButton>
            </Link>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                  {stat.number}
                </div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Why Choose <GradientText>CogniFit</GradientText>?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-gray-400 text-lg max-w-2xl mx-auto"
            >
              Built for modern teams who demand speed, accuracy, and simplicity
            </motion.p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  data-card
                  whileHover={{ y: -4 }}
                  className="group"
                >
                  <ModernCard hover glow>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                        <Icon size={24} className="text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                        <p className="text-gray-400 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  </ModernCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AnimatedGradientBg className="p-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Hiring?</h2>
              <p className="text-gray-300 mb-8 text-lg">
                Join thousands of companies that trust CogniFit for their recruitment needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <ModernButton size="lg" glow>
                    Start Your Free Trial
                  </ModernButton>
                </Link>
                <button className="text-blue-400 hover:text-blue-300 font-semibold flex items-center justify-center gap-2">
                  Learn More <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          </AnimatedGradientBg>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center text-gray-400 text-sm">
          <p>© 2024 CogniFit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// Hook for motion with scroll progress
const useMotionValue = (initialValue) => {
  const [value, setValue] = React.useState(initialValue);

  useEffect(() => {
    const handleScroll = () => {
      const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setValue(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return value;
};

export default ModernLandingPage;
