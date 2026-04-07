import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ParallaxHeroSection - Advanced parallax hero with text reveals
 */
export const ParallaxHeroSection = ({
  title,
  subtitle,
  backgroundImage,
  children,
  className = '',
}) => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Parallax background
    gsap.to(sectionRef.current, {
      backgroundPosition: '50% 100%',
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        scrub: 1,
        start: 'top top',
        end: 'bottom top',
      },
    });

    // Title animation
    if (titleRef.current) {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 100,
        duration: 1.2,
        ease: 'back.out',
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    // Subtitle animation
    if (subtitleRef.current) {
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 60,
        duration: 1.2,
        delay: 0.2,
        ease: 'back.out',
        scrollTrigger: {
          trigger: subtitleRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-screen w-full overflow-hidden ${className}`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: '50% 0%',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 py-20">
        <motion.h1
          ref={titleRef}
          className="text-5xl md:text-7xl font-bold text-white text-center mb-6 max-w-4xl leading-tight"
        >
          {title}
        </motion.h1>

        <motion.p
          ref={subtitleRef}
          className="text-lg md:text-xl text-gray-200 text-center max-w-2xl mb-12"
        >
          {subtitle}
        </motion.p>

        {children}
      </div>
    </section>
  );
};

/**
 * WorkflowSection - Animated step-by-step workflow
 */
export const WorkflowSection = ({ steps = [] }) => {
  const containerRef = useRef(null);
  const stepsRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    stepsRef.current.forEach((step, index) => {
      gsap.from(step, {
        opacity: 0,
        x: -100,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: step,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      // Animated line connector
      if (index < steps.length - 1) {
        const nextStep = stepsRef.current[index + 1];
        gsap.from(step.querySelector('.connector'), {
          scaleX: 0,
          transformOrigin: 'left',
          duration: 0.8,
          delay: 0.2,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: step,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
      }
    });
  }, [steps]);

  return (
    <section ref={containerRef} className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center mb-16"
        >
          How It Works
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {steps.map((step, index) => (
            <div
              key={index}
              ref={(el) => (stepsRef.current[index] = el)}
              className="flex flex-col items-center"
            >
              <div className="relative mb-6 w-full">
                {/* Step circle */}
                <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">
                  {index + 1}
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className="connector absolute top-10 left-1/2 w-full h-1 bg-gradient-to-r from-indigo-600 to-purple-600 hidden md:block"
                    style={{
                      width: 'calc(200% + 1.5rem)',
                      left: 'calc(50% + 2.5rem)',
                    }}
                  />
                )}
              </div>

              <h3 className="text-xl font-semibold text-center mb-2">{step.title}</h3>
              <p className="text-gray-600 text-center text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * StickyScrollSection - Fixed element with scrolling content
 */
export const StickyScrollSection = ({
  visualElement,
  content = [],
}) => {
  const containerRef = useRef(null);
  const visualRef = useRef(null);
  const contentRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: `+=${content.length * 400}`,
        pin: true,
        scrub: 1,
        markers: false,
      },
    });

    // Animate visual element
    if (visualRef.current) {
      contentRef.current.forEach((item, index) => {
        tl.fromTo(
          visualRef.current,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
          },
          index * 0.3
        );

        if (index < content.length - 1) {
          tl.to(visualRef.current, { opacity: 0, duration: 0.4 }, `+=${1.5}`);
        }
      });
    }
  }, [content]);

  return (
    <section ref={containerRef} className="relative min-h-screen bg-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 h-screen sticky top-0">
          {/* Visual side */}
          <div
            ref={visualRef}
            className="hidden md:flex items-center justify-center"
          >
            {visualElement}
          </div>

          {/* Content side */}
          <div className="flex flex-col justify-center space-y-12">
            {content.map((item, index) => (
              <motion.div
                key={index}
                ref={(el) => (contentRef.current[index] = el)}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-2xl font-bold">{item.title}</h3>
                </div>
                <p className="text-gray-600 text-lg">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * CardStackSection - Stacked cards effect on scroll
 */
export const CardStackSection = ({ cards = [] }) => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    cardsRef.current.forEach((card, index) => {
      gsap.from(card, {
        opacity: 0,
        y: 100,
        rotation: 5,
        scale: 0.9,
        duration: 0.8,
        ease: 'back.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
        delay: index * 0.15,
      });
    });
  }, [cards]);

  return (
    <section ref={containerRef} className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center mb-16"
        >
          Features
        </motion.h2>

        <div className="space-y-8">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              ref={(el) => (cardsRef.current[index] = el)}
              whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)' }}
              className="bg-white rounded-lg p-8 shadow-md border border-gray-100 cursor-pointer"
            >
              <div className="flex items-start gap-6">
                <div className="text-4xl">{card.icon}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{card.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * StatsSection - Animated counter stats
 */
export const StatsSection = ({ stats = [] }) => {
  const containerRef = useRef(null);
  const countersRef = useRef([]);

  useEffect(() => {
    countersRef.current.forEach((counter) => {
      const endValue = parseInt(counter.dataset.value);
      const obj = { value: 0 };

      gsap.to(obj, {
        value: endValue,
        duration: 2.5,
        ease: 'power2.out',
        onUpdate: () => {
          counter.textContent = Math.floor(obj.value).toLocaleString();
        },
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    });
  }, [stats]);

  return (
    <section
      ref={containerRef}
      className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="text-center"
          >
            <div
              ref={(el) => (countersRef.current[index] = el)}
              data-value={stat.value}
              className="text-5xl font-bold mb-2"
            >
              0
            </div>
            <p className="text-lg text-indigo-100">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default {
  ParallaxHeroSection,
  WorkflowSection,
  StickyScrollSection,
  CardStackSection,
  StatsSection,
};
