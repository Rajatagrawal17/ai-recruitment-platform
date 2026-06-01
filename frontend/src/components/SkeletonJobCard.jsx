import React from "react";

const SkeletonJobCard = () => {
  return (
    <article 
      style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
        padding: "20px 24px",
        borderRadius: "16px",
        background: "rgba(22,33,62,0.5)",
        marginBottom: "10px",
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid rgba(255,255,255,0.06)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        .skeleton-shimmer {
          background: linear-gradient(90deg, 
            rgba(255,255,255,0.03) 25%, 
            rgba(255,255,255,0.08) 50%, 
            rgba(255,255,255,0.03) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>

      {/* Circle 48px avatar placeholder */}
      <div 
        className="skeleton-shimmer" 
        style={{ 
          width: "48px", 
          height: "48px", 
          borderRadius: "50%", 
          flexShrink: 0 
        }} 
      />

      {/* Left block (which is center in horizontal layout): title + subtitle */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
        <div className="skeleton-shimmer" style={{ height: "18px", width: "40%", borderRadius: "4px" }} />
        <div className="skeleton-shimmer" style={{ height: "12px", width: "25%", borderRadius: "4px" }} />
      </div>

      {/* Right block: two shimmer pills + one shimmer button */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        {/* Shimmer Pill 1 */}
        <div className="skeleton-shimmer" style={{ height: "24px", width: "70px", borderRadius: "12px" }} />
        {/* Shimmer Pill 2 */}
        <div className="skeleton-shimmer" style={{ height: "24px", width: "80px", borderRadius: "12px" }} />
        {/* Shimmer Button */}
        <div className="skeleton-shimmer" style={{ height: "36px", width: "90px", borderRadius: "18px" }} />
        {/* Shimmer Bookmark Icon */}
        <div className="skeleton-shimmer" style={{ height: "34px", width: "34px", borderRadius: "8px" }} />
      </div>
    </article>
  );
};

export default SkeletonJobCard;
