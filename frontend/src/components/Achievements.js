import React from "react";

const Achievement = ({ icon, title, description, unlocked = true }) => {
  return (
    <div
      style={{
        background: unlocked
          ? "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))"
          : "linear-gradient(135deg, rgba(200, 200, 200, 0.1), rgba(150, 150, 150, 0.1))",
        border: `2px solid ${unlocked ? "#667eea" : "#ccc"}`,
        borderRadius: "10px",
        padding: "1.5rem",
        textAlign: "center",
        cursor: "pointer",
        opacity: unlocked ? 1 : 0.6,
        transition: "all 0.3s ease",
        position: "relative"
      }}
      onMouseEnter={(e) => {
        if (unlocked) {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.3)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{icon}</div>
      <h4 style={{ color: "#667eea", marginBottom: "0.5rem" }}>{title}</h4>
      <p style={{ fontSize: "0.9rem", color: "#666", margin: 0 }}>{description}</p>
      {!unlocked && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0, 0, 0, 0.5)",
            color: "white",
            padding: "0.25rem 0.5rem",
            borderRadius: "4px",
            fontSize: "0.8rem",
            fontWeight: "600"
          }}
        >
          Locked
        </div>
      )}
    </div>
  );
};

const Achievements = ({ applications = [], accepted = 0 }) => {
  const achievements = [
    {
      id: 1,
      icon: "🚀",
      title: "First Step",
      description: "Submit your first application",
      unlocked: applications.length > 0
    },
    {
      id: 2,
      icon: "⭐",
      title: "Star Performer",
      description: "Get 5 applications accepted",
      unlocked: accepted >= 5
    },
    {
      id: 3,
      icon: "🎯",
      title: "Dream Job",
      description: "Submit 10 applications",
      unlocked: applications.length >= 10
    },
    {
      id: 4,
      icon: "💎",
      title: "Elite Candidate",
      description: "Get 10 applications accepted",
      unlocked: accepted >= 10
    },
    {
      id: 5,
      icon: "🏆",
      title: "Unstoppable",
      description: "Get 20 applications accepted",
      unlocked: accepted >= 20
    },
    {
      id: 6,
      icon: "👑",
      title: "Legendary",
      description: "Submit 50 applications",
      unlocked: applications.length >= 50
    }
  ];

  return (
    <div style={{ animation: "slideUpContainer 0.6s ease-out" }}>
      <h3 style={{ marginBottom: "1.5rem", color: "#667eea" }}>🏅 Achievements</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "1rem"
        }}
      >
        {achievements.map((achievement) => (
          <Achievement key={achievement.id} {...achievement} />
        ))}
      </div>
    </div>
  );
};

export default Achievements;
