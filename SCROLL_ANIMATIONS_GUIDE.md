# 🎬 Advanced Scroll Animations with Framer Motion

Complete guide to implementing heavy-duty scroll animations with depth and sophistication using Framer Motion's scroll hooks.

---

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Scroll Animation Hooks](#scroll-animation-hooks)
3. [Pre-Built Components](#pre-built-components)
4. [Advanced Patterns](#advanced-patterns)
5. [Best Practices](#best-practices)
6. [Performance Tips](#performance-tips)
7. [Real-World Examples](#real-world-examples)

---

## 🚀 Quick Start

### 1. Import the hook or component

```jsx
import { useFadeInOnScroll, FadeInOnScroll } from '../hooks/useScrollAnimations';
import { ScaleOnScroll, ParallaxSection } from '../components/ScrollAnimations';
```

### 2. Use in your component

**Option A: Using Hooks (More Control)**
```jsx
function MyComponent() {
  const { ref, opacity, y } = useFadeInOnScroll();
  
  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
    >
      Content fades in when scrolled into view
    </motion.div>
  );
}
```

**Option B: Using Components (Simpler)**
```jsx
function MyPage() {
  return (
    <FadeInOnScroll>
      <h2>This content fades in on scroll</h2>
    </FadeInOnScroll>
  );
}
```

---

## 🎯 Scroll Animation Hooks

### 1. `useParallax(offset = 50)`
**Effect**: Elements move at different speeds, creating depth

```jsx
const { ref, y } = useParallax(30);

<motion.section ref={ref} style={{ y }}>
  Background moves slower than scroll
</motion.section>
```

### 2. `useFadeInOnScroll()`
**Effect**: Fade in from transparent + slide up

```jsx
const { ref, opacity, y } = useFadeInOnScroll();

<motion.div ref={ref} style={{ opacity, y }}>
  Fades in while sliding up
</motion.div>
```

### 3. `useScaleOnScroll()`
**Effect**: Scale from small to normal

```jsx
const { ref, scale, opacity } = useScaleOnScroll();

<motion.div ref={ref} style={{ scale, opacity }}>
  Zooms in from smaller size
</motion.div>
```

### 4. `useRotateOnScroll()`
**Effect**: 3D rotation effect

```jsx
const { ref, rotateX, rotateY } = useRotateOnScroll();

<motion.div ref={ref} style={{ rotateX, rotateY }}>
  Rotates on scroll
</motion.div>
```

### 5. `useScrollProgress()`
**Effect**: Get raw scroll progress (0-1)

```jsx
const { scaleX } = useScrollProgress();

<motion.div style={{ scaleX }}>
  Progress bar showing page scroll
</motion.div>
```

### 6. `useBlurOnScroll()`
**Effect**: Blur increases then decreases

```jsx
const { ref, blur } = useBlurOnScroll();

<motion.img ref={ref} style={{ filter: blur }}>
  Blurs in and out while scrolling
</motion.img>
```

### 7. `useHueRotateOnScroll()`
**Effect**: Color shifts through rainbow on scroll

```jsx
const { ref, hueRotate } = useHueRotateOnScroll();

<motion.div ref={ref} style={{ filter: hueRotate }}>
  Colors shift as you scroll
</motion.div>
```

### 8. `useParallaxFade(multiplier = 0.5)`
**Effect**: Combined parallax + fade + scale

```jsx
const { ref, opacity, y, scale } = useParallaxFade(0.5);

<motion.div ref={ref} style={{ opacity, y, scale }}>
  Complex layered animation
</motion.div>
```

### 9. `useSlidingText()`
**Effect**: Text slides left to right

```jsx
const { ref, x } = useSlidingText();

<motion.h1 ref={ref} style={{ x }}>
  Sliding text effect
</motion.h1>
```

### 10. `useGradientOnScroll()`
**Effect**: Gradient background shifts

```jsx
const { ref, backgroundPosition } = useGradientOnScroll();

<motion.div ref={ref} style={{ backgroundPosition }}>
  Gradient flows across element
</motion.div>
```

### 11. `useClipPathOnScroll()`
**Effect**: Content reveals with clip-path

```jsx
const { ref, clipPath } = useClipPathOnScroll();

<motion.img ref={ref} style={{ clipPath }} src="image.jpg" />
```

### 12. `useShadowDepthOnScroll()`
**Effect**: Shadow grows and shrinks

```jsx
const { ref, shadowBlur, shadowOpacity } = useShadowDepthOnScroll();

<motion.div ref={ref} style={{ /*shadow styles*/ }}>
  Shadow increases on scroll
</motion.div>
```

### 13. `usePerspectiveScroll()`
**Effect**: 3D card flip effect

```jsx
const { ref, rotateX, rotateY, z } = usePerspectiveScroll();

<motion.div ref={ref} style={{ rotateX, rotateY, z }}>
  3D perspective card
</motion.div>
```

### 14. `useMorphOnScroll()`
**Effect**: Border radius changes

```jsx
const { ref, borderRadius } = useMorphOnScroll();

<motion.div ref={ref} style={{ borderRadius }}>
  Shape morphs from square to circle
</motion.div>
```

---

## 🎨 Pre-Built Components

### 1. `<ParallaxSection>`
Parallax background effect

```jsx
<ParallexSection offset={30}>
  <h1>Content with parallax background</h1>
</ParallexSection>
```

### 2. `<FadeInOnScroll>`
Simple fade-in + slide-up

```jsx
<FadeInOnScroll>
  <Card>Content</Card>
</FadeInOnScroll>
```

### 3. `<ScaleOnScroll>`
Zoom in effect

```jsx
<ScaleOnScroll>
  <Image src="photo.jpg" />
</ScaleOnScroll>
```

### 4. `<RotatingCardScroll>`
3D rotation card

```jsx
<RotatingCardScroll>
  <div className="card">
    <h3>Rotating Card</h3>
  </div>
</RotatingCardScroll>
```

### 5. `<Perspective3DCard>`
Advanced 3D perspective

```jsx
<Perspective3DCard>
  <ProductCard />
</Perspective3DCard>
```

### 6. `<ScrollRevealGrid>`
Grid items reveal on scroll

```jsx
<ScrollRevealGrid
  items={jobs}
  columns={3}
  renderItem={(job) => <JobCard job={job} />}
/>
```

### 7. `<ScrollCounter>`
Animated counter on scroll

```jsx
<ScrollCounter from={0} to={500} duration={2} />
// Counts from 0 to 500
```

### 8. `<ParallaxHero>`
Full-screen hero section

```jsx
<ParallaxHero
  title="Welcome"
  subtitle="Parallax hero section"
  backgroundImage="bg.jpg"
/>
```

---

## 💪 Advanced Patterns

### Pattern 1: Staggered List with Scroll
```jsx
<motion.ul
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
  variants={{
    visible: {
      transition: { staggerChildren: 0.1 }
    }
  }}
>
  {items.map((item) => (
    <motion.li
      key={item.id}
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### Pattern 2: Timeline Animation
```jsx
<div className="timeline">
  {events.map((event, idx) => (
    <FadeInOnScroll key={idx}>
      <div className="timeline-item">
        <div className="dot" />
        <div className="content">
          <h3>{event.title}</h3>
          <p>{event.description}</p>
        </div>
      </div>
    </FadeInOnScroll>
  ))}
</div>
```

### Pattern 3: Section Transitions
```jsx
<motion.section
  initial={{ opacity: 0, y: 100 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true, margin: "-100px" }}
>
  <h2>New Section</h2>
  <p>Content reveals smoothly</p>
</motion.section>
```

### Pattern 4: Image Gallery with Scroll
```jsx
<ScrollRevealGrid
  items={images}
  columns={3}
  renderItem={(img) => (
    <Perspective3DCard>
      <img src={img.url} alt={img.title} />
    </Perspective3DCard>
  )}
/>
```

---

## ✅ Best Practices

### 1. Use `whileInView` for Better Performance
❌ **Bad**: Animates continuously
```jsx
<motion.div
  animate={{ opacity: 1 }}
/>
```

✅ **Good**: Only animates when in view
```jsx
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
/>
```

### 2. Add Margin to `viewport`
Triggers animation slightly before element reaches viewport

```jsx
viewport={{ 
  once: true,
  margin: "-100px"  // Trigger 100px before visible
}}
```

### 3. Don't Animate Everything
Too many animations can feel overwhelming

```jsx
// Focus animations on hero, key sections, CTAs
<FadeInOnScroll>Only animate important content</FadeInOnScroll>
```

### 4. Respect Reduced Motion Preference
```jsx
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}
```

### 5. Use Transform + Opacity
GPU-accelerated properties for smooth 60fps

```jsx
// ✅ Good (GPU accelerated)
style={{ transform: translateY(y), opacity }}

// ❌ Bad (CPU intensive, causes jank)
style={{ top: y }}
```

---

## 🚀 Performance Tips

### 1. Enable `will-change` wisely
```css
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0);  /* GPU acceleration */
}
```

### 2. Use `once: true` to save memory
```jsx
viewport={{ once: true }}  // Animation only runs once
```

### 3. Lazy load heavy components
```jsx
import dynamic from 'next/dynamic';

const ScrollAnimatedSection = dynamic(
  () => import('./ScrollAnimatedSection'),
  { loading: () => <Skeleton /> }
);
```

### 4. Monitor with DevTools
1. Open Chrome DevTools → Performance
2. Record scroll interaction
3. Check for 60fps (should be smooth)
4. Look for long tasks > 50ms

### 5. Test on low-end devices
Animations should be smooth even on older phones

---

## 🎯 Real-World Examples

### Example 1: Job Card Grid
```jsx
import { ScrollRevealGrid } from '../components/ScrollAnimations';

<ScrollRevealGrid
  items={jobListings}
  columns={3}
  renderItem={(job) => (
    <div className="job-card">
      <h3>{job.title}</h3>
      <p>{job.company}</p>
      <p>${job.salary}</p>
    </div>
  )}
/>
```

### Example 2: Feature Showcase
```jsx
{features.map((feature, idx) => (
  <FadeInOnScroll key={idx}>
    <div className="feature-card">
      <Icon icon={feature.icon} />
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
    </div>
  </FadeInOnScroll>
))}
```

### Example 3: Stats Counter Section
```jsx
<ParallaxSection offset={20}>
  <div className="stats-grid">
    <ScrollCounter from={0} to={1000} />
    <ScrollCounter from={0} to={500} />
    <ScrollCounter from={0} to={250} />
  </div>
</ParallaxSection>
```

### Example 4: Product Hero
```jsx
<ParallaxHero
  title="Revolutionary Platform"
  subtitle="Find jobs that match you"
  backgroundImage="/hero-bg.jpg"
/>
```

### Example 5: Testimonials
```jsx
<motion.div className="testimonials">
  {testimonials.map((testimonial) => (
    <ScaleOnScroll key={testimonial.id}>
      <div className="testimonial-card">
        <p>"{testimonial.text}"</p>
        <p className="author">{testimonial.author}</p>
      </div>
    </ScaleOnScroll>
  ))}
</motion.div>
```

---

## 📊 Animation Reference

| Hook | Effect | Use Case |
|------|--------|----------|
| `useParallax` | Depth/layering | Background parallax |
| `useFadeInOnScroll` | Fade + slide up | Content reveal |
| `useScaleOnScroll` | Zoom effect | Image emphasis |
| `useRotateOnScroll` | 3D rotation | Card flips |
| `useBlurOnScroll` | Blur in/out | Focus shift |
| `useHueRotateOnScroll` | Color shift | Accent sequ |
| `usePerspectiveScroll` | 3D card | Product showcase |
| `useMorphOnScroll` | Shape change | Interactive elements |

---

## 🔗 Integration Examples

### Jobs Page with Scroll Animations
```jsx
import { ScrollRevealGrid, FadeInOnScroll } from '../components/ScrollAnimations';

<FadeInOnScroll>
  <h1>Available Positions</h1>
</FadeInOnScroll>

<ScrollRevealGrid
  items={jobs}
  columns={3}
  renderItem={(job) => <JobCard job={job} />}
/>
```

### PersonalizedDashboard Enhancement
```jsx
import { ScaleOnScroll, FadeInOnScroll } from '../components/ScrollAnimations';

// Wrap job cards
<ScaleOnScroll>
  <PersonalizedJobCard job={job} />
</ScaleOnScroll>

// Wrap header
<FadeInOnScroll>
  <div className="dashboard-header">
    <h1>Your Recommendations</h1>
  </div>
</FadeInOnScroll>
```

---

## 🎓 Learning Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [useScroll Hook Guide](https://www.framer.com/docs/scroll)
- [useTransform Examples](https://www.framer.com/docs/motionvalue/)
- [Performance Best Practices](https://web.dev/animations-guide/)

---

## 🚀 Next Steps

1. **Implement in Jobs page** - Add scroll reveals to job cards
2. **Enhance hero sections** - Use ParallaxHero for landing
3. **Create login animations** - Form field animations
4. **Add timeline** - Staggered event timeline
5. **Product showcase** - 3D card perspectives

---

**Last Updated**: April 2026  
**Version**: 1.0.0  
**Status**: Production Ready
