import React from "react";

const CognifitLogo = ({ size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginRight: "8px", verticalAlign: "middle" }}
    >
      {/* Outer circle rings */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="url(#gradient1)" strokeWidth="2" opacity="0.6" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#gradient2)" strokeWidth="2" opacity="0.4" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="url(#gradient1)" strokeWidth="2" opacity="0.2" />

      {/* Center circle */}
      <circle cx="50" cy="50" r="28" fill="none" stroke="url(#gradient2)" strokeWidth="1.5" />

      {/* Network molecule center */}
      <circle cx="50" cy="50" r="5" fill="url(#gradient1)" />

      {/* Network nodes - represents AI/connectivity */}
      <circle cx="35" cy="35" r="2.5" fill="#9C6ED3" opacity="0.9" />
      <circle cx="65" cy="35" r="2.5" fill="#9C6ED3" opacity="0.9" />
      <circle cx="65" cy="65" r="2.5" fill="#A8D5F7" opacity="0.9" />
      <circle cx="35" cy="65" r="2.5" fill="#A8D5F7" opacity="0.9" />
      <circle cx="50" cy="30" r="2" fill="#B8956A" opacity="0.8" />
      <circle cx="70" cy="50" r="2" fill="#B8956A" opacity="0.8" />

      {/* Network connection lines */}
      <line x1="50" y1="50" x2="35" y2="35" stroke="url(#gradient1)" strokeWidth="0.8" opacity="0.6" />
      <line x1="50" y1="50" x2="65" y2="35" stroke="url(#gradient2)" strokeWidth="0.8" opacity="0.6" />
      <line x1="50" y1="50" x2="65" y2="65" stroke="url(#gradient1)" strokeWidth="0.8" opacity="0.6" />
      <line x1="50" y1="50" x2="35" y2="65" stroke="url(#gradient2)" strokeWidth="0.8" opacity="0.6" />
      <line x1="50" y1="50" x2="50" y2="30" stroke="url(#gradient1)" strokeWidth="0.8" opacity="0.6" />
      <line x1="50" y1="50" x2="70" y2="50" stroke="url(#gradient2)" strokeWidth="0.8" opacity="0.6" />

      {/* Gradients */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0D5A6D" />
          <stop offset="50%" stopColor="#B8956A" />
          <stop offset="100%" stopColor="#9C6ED3" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B8956A" />
          <stop offset="50%" stopColor="#A8D5F7" />
          <stop offset="100%" stopColor="#9C6ED3" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default CognifitLogo;
