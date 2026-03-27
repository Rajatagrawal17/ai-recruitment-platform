# 🎨 Figma Design System & Animation Guide

## Overview

This guide documents the design system, color combinations, and animations implemented in the HireAI recruitment platform. All designs follow modern Figma design principles with subtle animations and sophisticated color palettes.

---

## 📋 Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Animation Principles](#animation-principles)
4. [Component Animations](#component-animations)
5. [Page Transitions](#page-transitions)
6. [Figma Integration](#figma-integration)

---

## 🎨 Color System

### Primary Gradient (Indigo → Purple → Pink)
**Usage**: Headers, primary buttons, badges, highlights

```css
/* Main gradient */
background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);

/* Component: PersonalizedDashboard Header */
background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
```

**Color Breakdown**:
- **Indigo-500**: `#6366f1` - Primary brand color
- **Violet-600**: `#8b5cf6` - Secondary accent
- **Violet-700**: `#a855f7` - Bold highlight

### Secondary Gradient (Green - Success)
**Usage**: Success states, positive indicators, confirmations

```css
background: linear-gradient(90deg, #10b981, #34d399);
```

**Color Values**:
- **Emerald-500**: `#10b981` - Success baseline
- **Emerald-300**: `#34d399` - Lighter accent

### Tertiary Gradient (Amber - Warning)
**Usage**: Warnings, alerts, important notices

```css
background: linear-gradient(90deg, #f59e0b, #fbbf24);
```

**Color Values**:
- **Amber-500**: `#f59e0b` - Warning baseline
- **Amber-300**: `#fbbf24` - Light accent

### Background Colors
**Subtle, accessible backgrounds using design tokens**:

```css
/* Dashboard background */
background: linear-gradient(135deg, #f9f7ff 0%, #f3f4ff 50%, #f0f9ff 100%);

/* Card background */
background: linear-gradient(135deg, #ffffff 0%, #f9f5ff 100%);

/* Muted backgrounds */
background: rgba(255, 255, 255, 0.95);
```

### Border Colors
**Subtle, refined borders**:

```css
/* Primary border */
border: 1px solid rgba(99, 102, 241, 0.12);

/* Secondary border */
border: 1px solid rgba(99, 102, 241, 0.25);

/* Muted border */
border: 1px solid #e5e7eb;
```

### Text Colors
**Accessibility-focused text hierarchy**:

- **Primary Text**: `#111827` - Main content
- **Secondary Text**: `#4b5563` - Secondary content  
- **Muted Text**: `#6b7280` - Helper text
- **Light Text**: `#94a3b8` - Smallest text
- **White Text**: `#ffffff` - On dark backgrounds

---

## ✍️ Typography

### Typography Scale
```
Heading 1 (H1): 32px, Bold (700)
Heading 2 (H2): 28px, Bold (700)
Heading 3 (H3): 18px, Bold (700)
Body Large:     16px, Regular (400)
Body Regular:   14px, Regular (400)
Body Small:     12px, Regular (400)
Label:          11px, Semibold (600)
```

### Font Weights
- **Light**: 300 - Rarely used
- **Regular**: 400 - Body text
- **Medium**: 500 - Small headings
- **Semibold**: 600 - Labels, highlights
- **Bold**: 700 - Headings
- **Extrabold**: 800 - Hero text

### Font Families
- **Primary**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`
- **Display**: `"Clash Display"` (optional, for hero sections)

---

## 🎬 Animation Principles

### Core Animation Values

| Purpose | Duration | Easing | Use Case |
|---------|----------|--------|----------|
| **Micro** | 150ms | ease | Hover states, small transitions |
| **Base** | 300ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Standard interactions |
| **Macro** | 500ms | ease-in-out | Page transitions, complex animations |
| **Slow** | 1000ms+ | ease | Background effects, ambient animations |

### Easing Functions

**Standard Easing** (most interactions):
```css
transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
```
This creates a subtle bounce effect that feels modern and responsive.

**Linear Easing** (rotating elements):
```css
animation: rotate 2s linear infinite;
```

**Ease In-Out** (floating elements):
```css
animation: float 6s ease-in-out infinite;
```

---

## 🎪 Component Animations

### 1. Personalized Job Card

**Component**: `PersonalizedJobCard.jsx`

#### Badge Float Animation
```css
@keyframes badgeFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}

.match-score-badge {
  animation: badgeFloat 3s ease-in-out infinite;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
}
```
**Effect**: Subtle floating motion on score badge

#### Gradient Header Animation
```css
@keyframes gradientShift {
  0% { background-position: 0% 0%; }
  50% { background-position: 100% 0%; }
  100% { background-position: 0% 0%; }
}

.personalized-job-card::before {
  animation: gradientShift 3s ease infinite;
}
```
**Effect**: Animated top border with shifting gradient colors

#### Skill Tag Stagger
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.skill-tag {
  animation: slideIn 0.3s ease backwards;
  animation-delay: calc(0.05s * var(--skill-index));
}
```
**Effect**: Skills slide in from left with staggered timing

#### Apply Button Shine Effect
```css
.apply-btn::before {
  content: "";
  position: absolute;
  left: -100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.apply-btn:hover::before {
  left: 100%;
}
```
**Effect**: Shine passes across button on hover

#### Hover State
```css
.apply-btn:hover {
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
  transform: translateY(-2px);
}
```

### 2. Job Card

**Component**: `JobCard.jsx`

#### Smooth Hover Lift
```css
.job-card {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.job-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 48px rgba(99, 102, 241, 0.2);
}
```
**Effect**: Card lifts 6px with enhanced shadow on hover

#### Background Gradient Overlay
```css
.job-card::before {
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    rgba(168, 85, 247, 0.04)
  );
  opacity: 0;
  transition: opacity 0.4s ease;
}

.job-card:hover::before {
  opacity: 1;
}
```
**Effect**: Purple gradient appears on hover

#### Score Animation
```javascript
// CSS Animation for SVG circle
.match-bar {
  animation: fillBar 0.5s ease forwards;
  animation-delay: 0.2s;
}
```

### 3. Dashboard Components

**Component**: `PersonalizedDashboard.jsx`

#### Header Glow Animation
```css
@keyframes headerGlow {
  0%, 100% {
    box-shadow: 0 20px 60px rgba(99, 102, 241, 0.25);
  }
  50% {
    box-shadow: 0 20px 80px rgba(168, 85, 247, 0.35);
  }
}

.header-content {
  animation: headerGlow 4s ease-in-out infinite;
}
```
**Effect**: Header shadow pulses between normal and enhanced

#### Floating Orb
```css
@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -20px); }
}

.header-content::before {
  animation: float 6s ease-in-out infinite;
}
```
**Effect**: Glowing orb floats gently in background

#### Profile Button Ripple
```css
.goto-profile-btn::after {
  content: "";
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: width 0.6s, height 0.6s;
}

.goto-profile-btn:hover::after {
  width: 300px;
  height: 300px;
}
```
**Effect**: Ripple effect expands from button center

#### Background Shift Animation
```css
@keyframes backgroundShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.personalized-dashboard {
  animation: backgroundShift 8s ease infinite;
}
```
**Effect**: Subtle gradient shift in background (very slow)

---

## 📱 Page Transitions

### Entry Animations
```javascript
// Framer Motion setup
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
```

**Sequence**:
1. Page fades in
2. Content slides up gently
3. Components stagger in with delays

### Stagger Animation Pattern
```javascript
// Container
initial="hidden"
animate="visible"
variants={{
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}}

// Child
variants={{
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}}
```

---

## 🎯 Color Combinations in Context

### Job Cards
- **Background**: White with subtle purple tint
- **Border**: Indigo with low opacity (12%)
- **Hover Gradient**: Indigo + Violet
- **Score Badge**: Color-coded (Green ≥80, Amber 60-79, Red <60)

### Dashboard
- **Header**: Indigo → Violet → Pink gradient
- **Background**: Subtle multi-color gradient
- **Buttons**: Indigo → Violet
- **Icons**: Indigo primary, with semantic colors for status

### Skills & Tags
- **Background**: Indigo → Violet gradient
- **Text**: White
- **Hover**: Slight lift with purple shadow

### Inputs & Forms
- **Border**: Indigo with opacity
- **Focus**: Indigo solid border, blue shadow
- **Success**: Green state
- **Error**: Red state

---

## 🔄 Animation Performance Tips

1. **Use `transform` and `opacity`** - GPU accelerated, smooth 60fps
2. **Avoid animating** - `width`, `height`, `box-shadow` (use sparingly)
3. **Respect `prefers-reduced-motion`** - For accessibility
4. **Use `will-change` sparingly** - Only on animated elements
5. **Batch animations** - Group related animations together

```css
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0); /* Enable 3D acceleration */
}
```

---

## 🎯 Figma Design Integration Steps

### 1. Create Figma Components
- [ ] Create component library matching color system
- [ ] Use design tokens from `design-tokens.json`
- [ ] Set up component variants for states (hover, active, disabled)
- [ ] Document interactions and animations

### 2. Set Up Token Sync
- [ ] Install Figma Tokens Plugin
- [ ] Connect to `frontend/src/tokens/design-tokens.json`
- [ ] Sync colors, typography, spacing
- [ ] Enable auto-sync to update code

### 3. Animation Documentation
- [ ] Document all micro-interactions
- [ ] Create interaction prototypes
- [ ] Specify easing curves and durations
- [ ] Test on actual devices

### 4. Design Handoff
- [ ] Export components as code
- [ ] Generate design specs
- [ ] Create developer documentation
- [ ] Set up version control

---

## 🚀 Implementation Checklist

- [x] Design tokens created (`design-tokens.json`)
- [x] CSS custom properties generated (`design-tokens.css`)
- [x] Color system implemented
- [x] Component animations added
- [x] Dashboard page enhanced
- [ ] Create Figma design file
- [ ] Set up Figma token sync
- [ ] Migrate all components to tokens
- [ ] Add reduced motion support
- [ ] Performance test animations

---

## 📚 Resources

- [Figma Design System Best Practices](https://www.figma.com/best-practices/components/)
- [Web Animation Performance](https://web.dev/animations-guide/)
- [WCAG Animation Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions)
- [Easing Functions](https://easings.net/)
- [Framer Motion Docs](https://www.framer.com/motion/)

---

## 🎨 Quick Reference

### Most Used Animations
```css
/* Bounce easing */
cubic-bezier(0.34, 1.56, 0.64, 1)

/* Smooth fade */
transition: opacity 0.3s ease

/* Lift on hover */
transform: translateY(-4px) to translateY(-6px)

/* Gradient animation */
animation: gradientShift 3s ease infinite

/* Floating motion */
animation: float 6s ease-in-out infinite
```

### Testing Animations
1. Open DevTools → Performance tab
2. Record animation playback
3. Check FPS (should be 60)
4. Look for janky frames
5. Optimize if needed

---

**Last Updated**: March 2026  
**Design System Version**: 1.0.0  
**Status**: Active & Production Ready
