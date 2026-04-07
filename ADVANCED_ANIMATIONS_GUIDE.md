# Advanced Scroll Animations Implementation Guide

## 🎯 Overview

This document outlines the modern, scroll-driven animation system implemented for the AI Recruitment Platform. The system combines **Framer Motion**, **GSAP + ScrollTrigger**, and **Lenis smooth scrolling** for a professional SaaS-quality experience.

---

## 📦 New Dependencies Installed

```json
{
  "gsap": "^3.x",                    // Advanced animations & scroll triggers
  "lenis": "^1.x",                   // Smooth scrolling
  "lottie-react": "^2.x",            // Lightweight animations (optional)
  "react-use-measure": "^2.x"        // Measure component dimensions
}
```

---

## 🏗️ Architecture

### File Structure

```
frontend/src/
├── components/
│   ├── AdvancedScrollAnimations.jsx    # Main scroll animation components
│   ├── ScrollAnimations.jsx            # Simple scroll components  
│   └── SmoothScrollProvider.jsx        # Lenis smooth scroll wrapper
├── hooks/
│   ├── useScrollAnimations.js          # Framer Motion scroll hooks
│   ├── useGSAPScroll.js                # GSAP scroll animation hooks
│   └── useLenis.js                     # Lenis integration hook
├── pages/
│   └── LandingPage.js                  # Enhanced with scroll animations
└── ...
```

---

## 🎬 Animation Components

### 1. **ParallaxHeroSection**
Advanced hero section with parallax background and staggered text reveals.

```jsx
import { ParallaxHeroSection } from '../components/AdvancedScrollAnimations';

<ParallaxHeroSection
  title="Find the Right Talent"
  subtitle="Using AI-powered matching"
  backgroundImage="https://..."
>
  {/* Optional children for CTA buttons, etc */}
</ParallaxHeroSection>
```

**Features:**
- Parallax background scrolling effect
- Fade + slide animation for title
- Delay animation for subtitle
- GPU-accelerated for performance

---

### 2. **WorkflowSection**
Step-by-step animated workflow display.

```jsx
import { WorkflowSection } from '../components/AdvancedScrollAnimations';

const steps = [
  { title: 'Upload', description: 'Upload your resume' },
  { title: 'Analyze', description: 'AI analyzes your profile' },
  { title: 'Match', description: 'Get matched with jobs' },
  { title: 'Apply', description: 'Apply in one click' }
];

<WorkflowSection steps={steps} />
```

**Features:**
- Numbered circles for each step
- Animated connector lines between steps
- Staggered entrance animations
- Responsive grid (1 column on mobile, 4 on desktop)

---

### 3. **StickyScrollSection**
Fixed left element with scrolling content on right (uncommon on landing pages, but useful for in-app features).

```jsx
import { StickyScrollSection } from '../components/AdvancedScrollAnimations';

const content = [
  { title: 'Feature 1', description: 'Description here' },
  { title: 'Feature 2', description: 'Description here' },
];

<StickyScrollSection
  visualElement={<YourComponent />}
  content={content}
/>
```

---

### 4. **CardStackSection**
Stacked cards with staggered entrance animations and hover effects.

```jsx
import { CardStackSection } from '../components/AdvancedScrollAnimations';

const cards = [
  { icon: '🚀', title: 'Feature', description: 'Desc' },
  { icon: '📊', title: 'Feature', description: 'Desc' },
];

<CardStackSection cards={cards} />
```

**Features:**
- Opacity, scale, rotation on entrance
- Scale transform on hover
- Shadow effect on hover
- Smooth spring animations

---

### 5. **StatsSection**
Animated counter stats with gradient background.

```jsx
import { StatsSection } from '../components/AdvancedScrollAnimations';

const stats = [
  { value: 10000, label: 'Users' },
  { value: 5000, label: 'Jobs' },
];

<StatsSection stats={stats} />
```

**Features:**
- Counts up on scroll into view
- Thousand separator formatting
- Gradient background
- 2.5s animation duration

---

## 🎨 Custom Animation Hooks

### GSAP Hooks (`useGSAPScroll.js`)

#### `useParallaxGSAP(elementRef, speed)`
```jsx
import { useParallaxGSAP } from '../hooks/useGSAPScroll';

const Background = () => {
  const bgRef = useRef(null);
  useParallaxGSAP(bgRef, 0.5);
  
  return <div ref={bgRef}>Parallax content</div>;
};
```

#### `useTextRevealGSAP(elementRef)`
```jsx
const Section = () => {
  const textRef = useRef(null);
  useTextRevealGSAP(textRef);
  
  return (
    <div ref={textRef}>
      <h1>Reveals on scroll</h1>
      <p>With fade + slide animation</p>
    </div>
  );
};
```

#### `useStaggerGSAP(containerRef, itemSelector)`
```jsx
const Gallery = () => {
  const containerRef = useRef(null);
  useStaggerGSAP(containerRef, '.gallery-item');
  
  return (
    <div ref={containerRef}>
      <div className="gallery-item">Item 1</div>
      <div className="gallery-item">Item 2</div>
    </div>
  );
};
```

#### `useCounterGSAP(elementRef, endValue, duration)`
```jsx
const StatBox = () => {
  const counterRef = useRef(null);
  useCounterGSAP(counterRef, 1000, 2);
  
  return <div ref={counterRef}>0</div>;
};
```

---

### Framer Motion Hooks (`useScrollAnimations.js`)

#### `useFadeInOnScroll()`
*Framer Motion-based fade + slide animation on scroll*

#### `useScaleOnScroll()`
*Scale and fade animation with spring physics*

#### `useRotateOnScroll()`
*3D rotation effect on scroll*

---

## 🌊 Smooth Scrolling with Lenis

### Setup
Wrap your app root with the `SmoothScrollProvider`:

```jsx
import { SmoothScrollProvider } from './components/SmoothScrollProvider';

<SmoothScrollProvider>
  <App />
</SmoothScrollProvider>
```

**No additional configuration needed!** Lenis handles all smooth scrolling automatically.

### Customization
Edit `frontend/src/components/SmoothScrollProvider.jsx` to adjust:
- `duration`: Scroll animation duration (default: 1.2s)
- `easing`: Animation easing function
- `smoothTouch`: Touch scroll smoothing (default: true)
- `touchMultiplier`: Touch scroll speed multiplier

---

## 🔧 Usage Examples

### Example 1: Scroll Progress Bar
```jsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const ScrollProgressBar = () => {
  const progressRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      gsap.to(progressRef.current, {
        scaleX: scrolled / 100,
        duration: 0.1,
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full h-1 bg-gray-200">
      <div
        ref={progressRef}
        className="h-full bg-gradient"
        style={{ transformOrigin: 'left', scaleX: 0 }}
      />
    </div>
  );
};
```

### Example 2: Animated Button
```jsx
<motion.button
  whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
  whileTap={{ scale: 0.95 }}
  className="px-6 py-3 bg-indigo-600 text-white rounded-lg"
>
  Click Me
</motion.button>
```

---

## 📊 Performance Optimizations

All animations use these optimizations:

✅ **GPU Acceleration**
- `transform: translateZ(0)`
- `backface-visibility: hidden`
- `perspective: 1000px`

✅ **CSS Containment**
- `contain: layout style paint` (where supported)

✅ **Will-Change**
- Applied selectively to animated elements

✅ **Lazy Loading**
- Animations trigger only when scrolling into view

✅ **ScrollTrigger Cleanup**
- All timelines are properly killed on unmount

---

## 🎯 Best Practices

### 1. Keep Animations Short
```jsx
// ✅ Good (0.6-0.8s)
transition={{ duration: 0.6 }}

// ❌ Avoid (too slow)
transition={{ duration: 2 }}
```

### 2. Use Spring Animations for Interactions
```jsx
// ✅ Natural feeling
transition={{ type: 'spring', stiffness: 100, damping: 15 }}
```

### 3. Stagger Child Elements
```jsx
variants={{
  visible: {
    transition: { staggerChildren: 0.1 }
  }
}}
```

### 4. Respect Prefers-Reduced-Motion
```jsx
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🚀 Advanced Features

### Scroll Trigger with Markers (Debug)
```jsx
ScrollTrigger.create({
  trigger: ref.current,
  markers: true  // Shows debug markers
});
```

### Horizontal Scroll
```jsx
import { useHorizontalScrollGSAP } from '../hooks/useGSAPScroll';

const Carousel = () => {
  const containerRef = useRef(null);
  useHorizontalScrollGSAP(containerRef);
  
  return <div ref={containerRef}>...</div>;
};
```

---

## 🎬 Testing Animations Locally

```bash
cd frontend
npm start

# Visit http://localhost:3000
# Open DevTools and experiment with scroll speeds
```

---

## 📱 Responsive Behavior

All animations adapt to screen size:
- **Desktop**: Full 3D effects, parallax, complex animations
- **Tablet**: Simplified transforms, maintained smoothness
- **Mobile**: GPU optimized, reduced motion on weak devices

---

## 🐛 Troubleshooting

### Animations Not Triggering?
1. Check element is in viewport
2. Verify ref is properly connected
3. Check ScrollTrigger is registered globally

### Performance Issues?
1. Reduce number of animated elements
2. Use `will-change` sparingly
3. Profile with DevTools Performance tab
4. Check for memory leaks (kill timelines on unmount)

### Scroll Feels Jerky?
1. Ensure Lenis smooth scroll is enabled
2. Check for blocking JS operations
3. Reduce animation complexity
4. Use `scrub: 1` instead of `scrub: 0` in GSAP

---

## 📚 Resources

- **GSAP Docs**: https://greensock.com/docs/
- **ScrollTrigger**: https://greensock.com/scrolltrigger/
- **Framer Motion**: https://www.framer.com/motion/
- **Lenis**: https://lenis.darkroom.engineering/

---

## 🎉 What's Implemented

✅ Parallax hero section with text reveals
✅ Step-by-step workflow animation
✅ Animated stats counters on scroll
✅ Card stack effects with hover interactions
✅ Smooth page scrolling with Lenis
✅ Scroll progress indicator
✅ Mobile-responsive animations
✅ GPU-accelerated performance
✅ Accessibility (prefers-reduced-motion support)
✅ Clean, reusable component architecture

---

## 🔄 Future Enhancements

- [ ] Lottie animation integration
- [ ] Advanced canvas-based animations
- [ ] Scroll-synced video playback
- [ ] 3D transforms (Three.js integration)
- [ ] SVG morphing animations
- [ ] Gesture-based animations (mobile)

---

**Last Updated:** April 7, 2026
**Version:** 2.0
