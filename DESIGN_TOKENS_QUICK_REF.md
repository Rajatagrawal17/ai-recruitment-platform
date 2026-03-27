# Design Tokens Quick Reference

## What Are Design Tokens?

Design tokens are reusable design decisions (colors, spacing, typography) stored as variables. They ensure consistency across your entire application and make updates easier.

## File Structure

```
frontend/src/tokens/
├── design-tokens.json      ← Master source of truth
├── design-tokens.css       ← CSS custom properties
├── index.ts               ← JavaScript exports
└── README.md              ← Full documentation
```

## 3 Ways to Use Tokens

### 1️⃣ CSS Custom Properties (Most Common in CSS files)

```css
.my-component {
  background: var(--color-primary-500);
  color: var(--color-text);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
}
```

### 2️⃣ React/JavaScript Imports

```jsx
import { Colors, Spacing, Shadows } from '@/tokens';

<div style={{
  backgroundColor: Colors.primary(),
  padding: Spacing[4],
  boxShadow: Shadows.md,
}} />
```

### 3️⃣ Utility Classes (Tailwind-like)

```html
<div class="p-4 shadow-md rounded-lg">
  Content
</div>
```

## Color Tokens

| Palette | Purpose | Example |
|---------|---------|---------|
| `--color-primary-*` | Main brand (Purple) | Buttons, headers |
| `--color-secondary-*` | Accents (Purple) | Highlights |
| `--color-success-*` | Success states (Green) | Confirmations |
| `--color-warning-*` | Warnings (Amber) | Alerts |
| `--color-danger-*` | Errors (Red) | Errors |
| `--color-neutral-*` | Grayscale | Text, dividers |

**Shade Variants:** 50, 100, 200, 300, 400, 500, 600, 700, 800, 900

## Spacing Scale

| Token | Size | Use Case |
|-------|------|----------|
| `--spacing-1` | 4px | Tight spacing |
| `--spacing-2` | 8px | Small gaps |
| `--spacing-3` | 12px | Padding inside buttons |
| `--spacing-4` | 16px | Standard padding |
| `--spacing-6` | 24px | Card padding |
| `--spacing-8` | 32px | Large sections |
| `--spacing-12` | 48px | Section spacing |

## Typography

```css
/* Sizes */
var(--text-xs)    → 12px
var(--text-sm)    → 14px
var(--text-base)  → 16px (default)
var(--text-lg)    → 18px
var(--text-2xl)   → 24px
var(--text-4xl)   → 36px (headings)

/* Weights */
var(--font-light)      → 300
var(--font-normal)     → 400
var(--font-semibold)   → 600
var(--font-bold)       → 700

/* Families */
var(--font-family-base)  → System fonts
var(--font-family-mono)  → Monospace code
```

## Border Radius

```css
var(--radius-sm)   → 4px
var(--radius-md)   → 8px (standard)
var(--radius-lg)   → 12px (cards)
var(--radius-xl)   → 16px
var(--radius-full) → 50% (pills, avatars)
```

## Shadows

```css
var(--shadow-sm)     → Subtle
var(--shadow-base)   → Default
var(--shadow-md)     → Medium
var(--shadow-lg)     → Large
var(--shadow-xl)     → Extra large
var(--shadow-card)   → Card specific
```

## Transitions

```css
var(--transition-fast)   → 150ms (quick UI feedback)
var(--transition-base)   → 300ms (standard)
var(--transition-slow)   → 500ms (page transitions)
```

## Common Patterns

### Button
```css
.button {
  padding: var(--spacing-3) var(--spacing-6);
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-md);
}
```

### Card
```css
.card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  padding: var(--spacing-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}
```

### Input
```css
.input {
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  color: var(--color-text);
}
```

## Responsive Breakpoints

```javascript
Breakpoints.sm   → 640px
Breakpoints.md   → 768px
Breakpoints.lg   → 1024px
Breakpoints.xl   → 1280px
```

## Adding New Tokens

1. Edit `frontend/src/tokens/design-tokens.json`
2. Add your token value
3. Tokens are automatically available in:
   - CSS: `var(--new-token-name)`
   - JS: `import { ... }` from tokens

## Tips & Tricks

✅ **Do:**
- Use tokens for everything
- Follow naming conventions
- Update tokens, not individual values
- Use semantic names

❌ **Don't:**
- Hardcode colors/spacing
- Create random values
- Mix measurement units
- Ignore token system

## Quick Links

- 📄 [Tokens Documentation](./README.md)
- 🎨 [Figma Integration Guide](../FIGMA_INTEGRATION.md)
- 💻 [View Component Examples](./components/TokenExample.jsx)
- 🔧 [Token JSON Source](./design-tokens.json)

---

**Remember**: Consistency = Better UX + Faster Development!
