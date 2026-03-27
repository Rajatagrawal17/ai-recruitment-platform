# Design Tokens System

## Overview

This design system provides a centralized source of truth for all design values in HireAI. It ensures consistency across colors, typography, spacing, and other UI elements.

## Structure

```
tokens/
├── design-tokens.json      # Master token definition
├── design-tokens.css       # CSS custom properties (auto-generated)
└── index.ts               # JavaScript exports for React
```

## Usage Guide

### 1. CSS Method (Recommended for CSS/SCSS)

Import the CSS custom properties in your component:

```css
/* In your component CSS file */
@import '@/tokens/design-tokens.css';

.my-component {
  background-color: var(--color-primary-500);
  color: var(--color-text);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  font-size: var(--text-base);
  font-family: var(--font-family-base);
  transition: all var(--transition-base);
}
```

### 2. JavaScript Method (For React Components)

Import tokens directly in your React components:

```jsx
import { Colors, Spacing, Shadows, Typography } from '@/tokens';

const MyComponent = () => {
  return (
    <div style={{
      backgroundColor: Colors.primary(),
      color: Colors.text,
      padding: Spacing[4],
      borderRadius: '12px',
      boxShadow: Shadows.md,
    }}>
      Hello World
    </div>
  );
};
```

## Available Tokens

### Colors

**Primary Palette** (Main brand color - Purple/Indigo)
```javascript
Colors.primary('50')   // #f0f4ff   - Lightest
Colors.primary('500')  // #6366f1   - Base (default)
Colors.primary('900')  // #312e81   - Darkest
```

**Secondary** (Purple accent)
**Success** (Green - for positive actions)
**Warning** (Amber - for alerts)
**Danger** (Red - for errors)
**Neutral** (Grayscale)

**Semantic Colors:**
```javascript
Colors.background    // White (#ffffff)
Colors.surface       // Light gray background (#f9fafb)
Colors.border        // Border gray (#e5e7eb)
Colors.text          // Dark text (#111827)
Colors.textSecondary // Secondary text (#6b7280)
Colors.textMuted     // Muted text (#9ca3af)
```

### Typography

**Font Sizes:**
```javascript
Typography.fontSize.xs    // 12px (small labels)
Typography.fontSize.sm    // 14px (help text)
Typography.fontSize.base  // 16px (body text - default)
Typography.fontSize.lg    // 18px
Typography.fontSize.xl    // 20px
Typography.fontSize.2xl   // 24px (subheadings)
Typography.fontSize.3xl   // 30px
Typography.fontSize.4xl   // 36px (main headings)
```

**Font Weights:**
```javascript
Typography.fontWeight.light      // 300
Typography.fontWeight.normal     // 400
Typography.fontWeight.medium     // 500
Typography.fontWeight.semibold   // 600
Typography.fontWeight.bold       // 700
Typography.fontWeight.extrabold  // 800
```

**Font Family:**
```javascript
Typography.fontFamily.base   // System fonts (default)
Typography.fontFamily.mono   // Monospace (code)
```

### Spacing

Spacing scale from 0-96px:
```javascript
Spacing[0]    // 0px
Spacing[1]    // 4px (xs)
Spacing[2]    // 8px (sm)
Spacing[3]    // 12px
Spacing[4]    // 16px (base)
Spacing[6]    // 24px (md)
Spacing[8]    // 32px (lg)
Spacing[12]   // 48px (xl)
Spacing[16]   // 64px (2xl)
Spacing[24]   // 96px (3xl)
```

### Border Radius

```javascript
BorderRadius.none      // 0px
BorderRadius.sm        // 4px (small)
BorderRadius.base      // 6px
BorderRadius.md        // 8px (standard)
BorderRadius.lg        // 12px
BorderRadius.xl        // 16px
BorderRadius.2xl       // 20px
BorderRadius.3xl       // 24px
BorderRadius.full      // 9999px (fully rounded)
```

### Shadows

```javascript
Shadows.none          // No shadow
Shadows.sm            // Subtle shadow
Shadows.base          // Light shadow (default)
Shadows.md            // Medium shadow
Shadows.lg            // Large shadow
Shadows.xl            // Extra large shadow
Shadows.2xl           // Huge shadow (modals)
Shadows.card          // Card-specific shadow
```

### Transitions

```javascript
Transitions.fast       // 150ms (quick interactions)
Transitions.base       // 300ms (standard)
Transitions.slow       // 500ms (page transitions)
```

### Breakpoints (Responsive Design)

```javascript
Breakpoints.sm         // 640px  (small phones)
Breakpoints.md         // 768px  (tablets)
Breakpoints.lg         // 1024px (small laptops)
Breakpoints.xl         // 1280px (laptops)
Breakpoints.2xl        // 1536px (desktops)
```

### Gradients (Pre-made)

```javascript
Gradients.primary      // Purple to indigo
Gradients.success      // Green gradient
Gradients.warning      // Amber gradient
Gradients.danger       // Red gradient
Gradients.neutral      // Gray gradient
```

### Media Queries

```javascript
// Mobile-first approach
Media.mdUp             // @media (min-width: 768px)
Media.lgUp             // @media (min-width: 1024px)

// Max-width queries
Media.md               // @media (max-width: 768px)
Media.lg               // @media (max-width: 1024px)
```

## Examples

### Button Component

**CSS Approach:**
```css
.button {
  padding: var(--spacing-3) var(--spacing-4);
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

**React Approach:**
```jsx
import { Colors, Spacing, Shadows, Gradients } from '@/tokens';

export const Button = ({ children }) => (
  <button style={{
    padding: `${Spacing[3]} ${Spacing[4]}`,
    background: Gradients.primary,
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    boxShadow: Shadows.md,
    cursor: 'pointer',
  }}>
    {children}
  </button>
);
```

### Card Component

```jsx
export const Card = ({ children, variant = 'default' }) => {
  const bgColor = variant === 'soft' ? Colors.surface : Colors.background;
  
  return (
    <div style={{
      backgroundColor: bgColor,
      borderRadius: BorderRadius.lg,
      padding: Spacing[6],
      border: `1px solid ${Colors.border}`,
      boxShadow: Shadows.card,
    }}>
      {children}
    </div>
  );
};
```

## Syncing with Figma

To keep these tokens in sync with Figma:

1. **Export from Figma** (recommended tools):
   - [Figma Tokens](https://www.figma.com/community/plugin/843461159747178978/figma-tokens) plugin
   - [Design Tokens](https://github.com/tokens-studio/figma-tokens)

2. **Update process**:
   - Export tokens from Figma as JSON
   - Replace `design-tokens.json`
   - The CSS and JS files will auto-work with new values

3. **CI/CD Integration**:
   - Set up GitHub Actions to auto-convert Figma exports
   - Automatically generate CSS custom properties

## Best Practices

✅ **Do:**
- Use tokens for all design values
- Keep tokens updated when design changes
- Use semantic color names (primary, success, danger)
- Leverage spacing scale for consistency
- Use short-hand CSS custom properties

❌ **Don't:**
- Hardcode colors, spacing, or shadows
- Create new arbitrary values
- Mix token systems
- Use different naming conventions

## Adding New Tokens

1. Update `design-tokens.json` with new values
2. Run token generation script (if set up)
3. CSS and JS exports update automatically
4. Import and use in components

## Questions?

Refer to individual component CSS files for token usage examples.
