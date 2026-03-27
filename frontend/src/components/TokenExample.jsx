import React from 'react';
import { Colors, Spacing, Shadows, BorderRadius, Gradients } from '@/tokens';
import './TokenExample.css';

/**
 * TokenExample Component
 * 
 * This component demonstrates how to use design tokens
 * in different ways: CSS custom properties, inline styles, and utility classes.
 */

export const TokenExample = () => {
  return (
    <div className="token-example-container">
      <h1>Design Tokens Example</h1>

      {/* Example 1: Using CSS Custom Properties */}
      <section className="example-section">
        <h2>1. CSS Custom Properties</h2>
        <div className="card-example css-method">
          <h3>Card using CSS Variables</h3>
          <p>This card uses CSS custom properties defined in design-tokens.css</p>
          <button className="button-example">Learn More</button>
        </div>
        <p className="code-label">
          Uses: background: var(--color-primary-500), padding: var(--spacing-6), etc.
        </p>
      </section>

      {/* Example 2: Using JavaScript/React */}
      <section className="example-section">
        <h2>2. JavaScript/React Tokens</h2>
        <div
          style={{
            background: Gradients.primary,
            color: Colors.background,
            padding: `${Spacing[6]} ${Spacing[8]}`,
            borderRadius: BorderRadius.lg,
            boxShadow: Shadows.lg,
          }}
        >
          <h3>Card using JavaScript Tokens</h3>
          <p>This card is styled with tokens imported in JavaScript</p>
        </div>
      </section>

      {/* Example 3: Color Palette */}
      <section className="example-section">
        <h2>3. Color Palette</h2>
        <div className="color-grid">
          {['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'].map((shade) => (
            <div
              key={shade}
              style={{
                background: Colors.primary(shade),
                padding: Spacing[6],
                borderRadius: BorderRadius.md,
                textAlign: 'center',
                color: parseInt(shade) > 500 ? '#fff' : '#000',
                fontSize: Typography.fontSize.sm,
              }}
            >
              Primary {shade}
            </div>
          ))}
        </div>
      </section>

      {/* Example 4: Typography */}
      <section className="example-section">
        <h2>4. Typography</h2>
        <div className="typography-demo">
          <p className="text-xs">Extra Small (12px) - xs</p>
          <p className="text-sm">Small (14px) - sm</p>
          <p className="text-base">Base (16px) - base</p>
          <p className="text-lg">Large (18px) - lg</p>
          <p className="text-xl">Extra Large (20px) - xl</p>
          <p className="text-2xl">2XL (24px) - 2xl</p>
          <p className="text-3xl">3XL (30px) - 3xl</p>
          <p className="text-4xl">4XL (36px) - 4xl</p>
        </div>
      </section>

      {/* Example 5: Spacing Scale */}
      <section className="example-section">
        <h2>5. Spacing Scale</h2>
        <div className="spacing-demo">
          {[0, 1, 2, 3, 4, 6, 8, 12, 16, 24].map((value) => (
            <div
              key={value}
              style={{
                background: Colors.primary(),
                width: `${value * 10}px` || '10px',
                height: '24px',
                borderRadius: BorderRadius.sm,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '10px',
                transition: `all var(--transition-base)`,
              }}
              title={`Spacing: ${value}`}
            >
              {value}
            </div>
          ))}
        </div>
      </section>

      {/* Example 6: Shadows */}
      <section className="example-section">
        <h2>6. Shadow Variants</h2>
        <div className="shadows-grid">
          {['sm', 'base', 'md', 'lg', 'xl', '2xl'].map((shadow) => (
            <div
              key={shadow}
              style={{
                background: Colors.background,
                padding: Spacing[8],
                borderRadius: BorderRadius.lg,
                boxShadow: Shadows[shadow],
                textAlign: 'center',
                minHeight: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              shadow-{shadow}
            </div>
          ))}
        </div>
      </section>

      {/* Example 7: Buttons with Different States */}
      <section className="example-section">
        <h2>7. Button Variants</h2>
        <div className="buttons-demo gap-4">
          <button className="btn btn-primary">Primary Button</button>
          <button className="btn btn-secondary">Secondary Button</button>
          <button className="btn btn-success">Success Button</button>
          <button className="btn btn-warning">Warning Button</button>
          <button className="btn btn-danger">Danger Button</button>
        </div>
      </section>
    </div>
  );
};

export default TokenExample;
