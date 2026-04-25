import React, { useEffect, useState } from "react";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import API from "../services/api";
import "./ConnectionStatus.css";

const ConnectionStatus = () => {
  const [status, setStatus] = useState("checking"); // checking, connected, disconnected
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await API.get("/health", { timeout: 5000 });
        if (response.data?.status === "ok") {
          setStatus("connected");
          setShowBanner(false);
        } else {
          setStatus("disconnected");
        }
      } catch (error) {
        console.log("⚠️ Backend not responding - using demo data");
        setStatus("disconnected");
      }
    };

    // Initial check
    checkConnection();

    // Re-check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  if (status === "connected" || !showBanner) {
    return null;
  }

  return (
    <div className="connection-status-banner">
      <div className="connection-status-content">
        <WifiOff size={18} className="status-icon disconnected-icon" />
        <div className="status-text">
          <span className="status-label">Demo Data Mode</span>
          <span className="status-message">
            Backend is currently unavailable. You're viewing sample data. Try refreshing in a moment.
          </span>
        </div>
        <button 
          className="status-close"
          onClick={() => setShowBanner(false)}
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ConnectionStatus;
