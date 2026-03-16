import React, { useEffect, useState } from "react";

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "info",
      title: "Welcome Back! 👋",
      message: "Continue exploring amazing job opportunities",
      icon: "📬"
    },
    {
      id: 2,
      type: "success",
      title: "Profile Complete ✨",
      message: "Your profile looks great. Ready to apply?",
      icon: "✅"
    }
  ]);
  const [showDetails, setShowDetails] = useState(false);

  const removeNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const notificationCount = notifications.length;

  return (
    <div style={{ position: "relative" }}>
      {/* Notification Bell Icon - Position Fixed in top-right corner */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          cursor: "pointer"
        }}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div
          style={{
            fontSize: "1.8rem",
            position: "relative",
            transition: "transform 0.3s ease"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          🔔
          {notificationCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-5px",
                right: "-10px",
                background: "linear-gradient(135deg, #f5576c, #f093fb)",
                color: "white",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: "700",
                padding: 0,
                animation: "pulse 1s infinite"
              }}
            >
              {notificationCount}
            </span>
          )}
        </div>
      </div>

      {/* Notifications Panel */}
      {showDetails && (
        <div
          style={{
            position: "fixed",
            top: "60px",
            right: "20px",
            width: "350px",
            maxHeight: "400px",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 249, 250, 0.98))",
            borderRadius: "12px",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
            zIndex: 1001,
            animation: "slideInAlert 0.3s ease-out",
            overflow: "auto"
          }}
        >
          <div
            style={{
              padding: "1rem",
              borderBottom: "1px solid #e1e8ed",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: "600",
              color: "#667eea"
            }}
          >
            <h3 style={{ margin: 0 }}>Notifications</h3>
            <button
              onClick={() => setShowDetails(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
                color: "#999"
              }}
            >
              ✕
            </button>
          </div>

          {notifications.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "#999"
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📭</div>
              <p>All caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid #f1f3f5",
                  display: "flex",
                  gap: "0.75rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                  "&:hover": {
                    backgroundColor: "#f9fafb"
                  }
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div style={{ fontSize: "1.5rem" }}>{notification.icon}</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 0.25rem 0", color: "#2c3e50" }}>
                    {notification.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ccc",
                    cursor: "pointer",
                    fontSize: "0.9rem"
                  }}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
