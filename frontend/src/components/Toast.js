import React from "react";

const Toast = ({ message, type = "success", onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        padding: "1rem 1.5rem",
        borderRadius: "8px",
        background:
          type === "success"
            ? "linear-gradient(135deg, #28a745, #20c997)"
            : type === "error"
            ? "linear-gradient(135deg, #dc3545, #fd7e14)"
            : "linear-gradient(135deg, #667eea, #764ba2)",
        color: "white",
        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
        animation: "slideInAlert 0.4s ease-out",
        zIndex: 9999,
        maxWidth: "400px"
      }}
    >
      {type === "success" && "✅ "}
      {type === "error" && "❌ "}
      {type === "info" && "ℹ️ "}
      {message}
    </div>
  );
};

export default Toast;
