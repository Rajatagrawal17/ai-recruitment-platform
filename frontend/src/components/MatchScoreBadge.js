import React from "react";

const getScoreMeta = (score) => {
  const value = Number(score || 0);

  if (value >= 80) {
    return { label: "Highly Recommended", color: "#16a34a", bg: "#dcfce7" };
  }

  if (value >= 60) {
    return { label: "Good Match", color: "#a16207", bg: "#fef9c3" };
  }

  if (value >= 40) {
    return { label: "Consider Further", color: "#c2410c", bg: "#ffedd5" };
  }

  return { label: "Weak Match", color: "#b91c1c", bg: "#fee2e2" };
};

const MatchScoreBadge = ({ score = 0 }) => {
  const meta = getScoreMeta(score);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color: meta.color,
        backgroundColor: meta.bg,
      }}
    >
      {Number(score || 0)}% - {meta.label}
    </span>
  );
};

export default MatchScoreBadge;
