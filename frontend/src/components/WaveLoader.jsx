import React from 'react';

const sizeDimensions = {
  sm: {
    maxHeight: '16px',
    barWidth: '3px',
    gap: '3px',
    heights: [10, 14, 12, 16, 10],
  },
  md: {
    maxHeight: '24px',
    barWidth: '4px',
    gap: '4px',
    heights: [15, 21, 18, 24, 15],
  },
  lg: {
    maxHeight: '32px',
    barWidth: '6px',
    gap: '6px',
    heights: [20, 28, 24, 32, 20],
  },
};

export default function WaveLoader({ size = 'md', className = '' }) {
  const dim = sizeDimensions[size] || sizeDimensions.md;

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dim.gap,
        height: dim.maxHeight,
      }}
    >
      <style>{`
        @keyframes wave-bounce {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
        .wave-bar-anim {
          background: linear-gradient(180deg, #6366f1, #8b5cf6);
          animation: wave-bounce 0.9s ease-in-out infinite;
          transform-origin: center;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
        }
      `}</style>
      {dim.heights.map((h, i) => (
        <div
          key={i}
          className="wave-bar-anim"
          style={{
            width: dim.barWidth,
            height: `${h}px`,
            borderRadius: '2px',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
