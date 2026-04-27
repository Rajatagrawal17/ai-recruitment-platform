import React from "react";

// Very small deterministic sparkline generator based on a seed string
const seededRandom = (seed) => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return () => {
    h += 0x6D2B79F5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967295;
  };
};

const Sparkline = ({ seed = "x", width = 80, height = 24, stroke = "#60a5fa" }) => {
  const rand = seededRandom(String(seed));
  const points = Array.from({ length: 16 }).map(() => Math.round(rand() * (height - 6)) + 3);
  const stepX = width / (points.length - 1 || 1);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${Math.round(i * stepX)} ${height - p}`).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="inline-block align-middle">
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default Sparkline;
