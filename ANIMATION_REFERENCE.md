# 🎬 Animation Implementation Guide

## Quick Start

### Use CSS Animations
```html
<!-- Apply animation directly -->
<div class="animate-fadeInUp">Hello</div>

<!-- Or combine animations -->
<div class="animate-float" style="animation: float 3s ease-in-out infinite;">
  Floating Element
</div>
```

### Use CSS Variables for Custom Animations
```css
.my-animated-element {
  animation: customAnimation var(--anim-duration-base) var(--anim-ease-bounce);
}

@keyframes customAnimation {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Use Framer Motion (React)
```jsx
import { motion } from 'framer-motion';

// Simple animation
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Stagger animation
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

## Animation Library

### Fade Animations
| Class | Effect |
|-------|--------|
| `.animate-fadeIn` | Fade in from transparent |
| `.animate-fadeInUp` | Fade in while sliding up |
| `.animate-fadeInDown` | Fade in while sliding down |
| `.animate-fadeInLeft` | Fade in from left |
| `.animate-fadeInRight` | Fade in from right |

### Slide Animations
| Animation | CSS | Effect |
|-----------|-----|--------|
| `slideInDown` | Full screen to top | Slide down from above |
| `slideInUp` | Full screen from bottom | Slide up from below |
| `slideInLeft` | Full screen from left | Slide in from left edge |
| `slideInRight` | Full screen from right | Slide in from right edge |

### Scale Animations
| Class | Effect |
|-------|--------|
| `.animate-scaleIn` | Zoom in from center |
| `.animate-bounceIn` | Scale with bounce effect |
| `.animate-pulse` | Pulsing opacity effect |

### Motion Animations
| Class | Effect |
|-------|--------|
| `.animate-float` | Subtle floating up/down |
| `.animate-bounce` | Bouncing motion |
| `.animate-glow` | Glowing box-shadow pulse |

### Rotation Animations
| Class | Effect |
|-------|--------|
| `.animate-spin` | Continuous rotation |
| `.animate-spin-reverse` | Counter-clockwise rotation |

### Special Effects
| Animation | Purpose |
|-----------|---------|
| `gradientShift` | Animated gradient background |
| `shimmer` | Light shine across element |
| `ripple` | Click ripple effect |
| `shine` | Light sweep effect |

---

## Animation Variables

### Durations
```css
--anim-duration-micro: 150ms;    /* Hover states */
--anim-duration-base: 300ms;     /* Standard transitions */
--anim-duration-macro: 500ms;    /* Complex animations */
--anim-duration-slow: 1000ms;    /* Background effects */
```

### Easing Functions
```css
--anim-ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);  /* Bounce effect */
--anim-ease-smooth: ease;                                 /* Standard ease */
--anim-ease-inout: ease-in-out;                          /* Smooth in/out */
--anim-ease-linear: linear;                              /* No acceleration */
```

### Transform Values
```css
--anim-translate-xs: 4px;
--anim-translate-sm: 8px;
--anim-translate-md: 12px;
--anim-translate-lg: 20px;

--anim-scale-sm: 0.95;      /* 95% */
--anim-scale-md: 1.05;      /* 105% */
--anim-scale-lg: 1.1;       /* 110% */
```

---

## Best Practices

### ✅ DO

```jsx
// ✓ Use transform and opacity (GPU accelerated)
<motion.div
  animate={{ 
    opacity: 1, 
    transform: 'translateY(0px)' 
  }}
/>

// ✓ Use stagger for list items
variants={{
  visible: {
    transition: { staggerChildren: 0.1 }
  }
}}

// ✓ Respect user preferences
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}

// ✓ Use meaningful animation names
@keyframes slideInFromLeft { ... }
```

### ❌ DON'T

```jsx
// ✗ Avoid animating width/height (causes reflow)
animate={{ width: '100px', height: '100px' }}

// ✗ Avoid long durations (feels sluggish)
transition={{ duration: 2 }} 

// ✗ Don't use setTimeout for animations
setTimeout(() => setVisible(true), 500)

// ✗ Avoid animating too many elements at once
// Causes janky 30fps instead of smooth 60fps
```

---

## Real-World Examples

### Example 1: Animated Button
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  Click Me
</motion.button>
```

CSS Version:
```css
button {
  transition: transform 0.2s var(--anim-ease-bounce);
}

button:hover {
  transform: scale(1.05);
}

button:active {
  transform: scale(0.95);
}
```

### Example 2: Card Entrance
```jsx
<motion.div
  card
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  whileHover={{ y: -5 }}
>
  Card Content
</motion.div>
```

### Example 3: Staggered List
```jsx
<motion.ul
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: { staggerChildren: 0.08 }
    }
  }}
>
  {items.map(item => (
    <motion.li
      key={item.id}
      variants={{
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1 }
      }}
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### Example 4: Gradient Animation
```css
.gradient-bg {
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7);
  background-size: 200% 200%;
  animation: gradientFlow 3s ease infinite;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### Example 5: Floating Badge
```css
.floating-badge {
  animation: float 3s ease-in-out infinite;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}
```

---

## Performance Optimization

### Monitor Performance
1. Open DevTools → Performance tab
2. Record animation playback
3. Check FPS (should be 60)
4. Look for jank in the frame timeline

### Optimize if Needed
```css
/* Enable 3D acceleration */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

### Reduce Animations on Low-End Devices
```javascript
// Detect if reduce-motion is preferred
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Use simpler animations or none at all
}
```

---

## Figma Integration

### Export Animations from Figma
1. Create interaction prototypes in Figma
2. Document easing curves and durations
3. Export timing specifications
4. Implement matching CSS/Framer Motion

### Animation Specs Template
```
Animation: Button Hover
Trigger: Mouse hover
Duration: 300ms
Easing: cubic-bezier(0.34, 1.56, 0.64, 1)
Properties: transform (scale 1 → 1.05)
Curve: Bounce
```

---

## Testing Animations

### Visual Testing Checklist
- [ ] Animations run at 60fps
- [ ] No jank or stuttering
- [ ] Hover states feel responsive
- [ ] Page transitions are smooth
- [ ] Loading states animate properly
- [ ] Works on low-end devices
- [ ] Respects `prefers-reduced-motion`

### Browser DevTools Tips
```javascript
// Slow down animations for inspection
document.documentElement.style.animationDuration = '10s';

// Pause all animations
document.documentElement.style.animationPlayState = 'paused';

// Resume
document.documentElement.style.animationPlayState = 'running';
```

---

## Common Issues & Solutions

### Issue: Animation Stutters
**Solution**: Use `translate()` instead of `left/top`, enable hardware acceleration with `will-change`

### Issue: Animation Too Fast
**Solution**: Increase `duration` property or use slower easing function

### Issue: Animation Too Slow
**Solution**: Decrease duration, use bounce easing for perceived speed

### Issue: Z-index Problems During Animation
**Solution**: Set `will-change: z-index` or adjust stack context

### Issue: Animation Not Starting
**Solution**: Check if element has `display: none`, use `initial` state in Framer Motion

---

## Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [CSS Animations MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Easing Functions](https://easings.net/)
- [Web Animation Performance](https://web.dev/animations-guide/)
- [Animation Design System](./FIGMA_DESIGN_GUIDE.md)

---

**Version**: 1.0.0  
**Last Updated**: March 2026  
**Maintained By**: HireAI Design System Team
