import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../services/api";
import { motion } from "framer-motion";
import { LogOut, ShieldAlert } from "lucide-react";
import API from "../services/api";

const SessionHistory = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?._id) {
      fetchLoginHistory();
    }
  }, [user?._id]);

  const fetchLoginHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get(`/audit/logs/login-history/${user._id}?limit=10`);
      if (response.data.success) {
        setSessions(response.data.data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load session history:", err);
      setError("Could not load session history. It might be your first session.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading session history...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-3 rounded-lg bg-muted/50 text-muted-foreground text-sm">
          {error}
        </div>
      )}

      {!loading && sessions.length === 0 && !error && (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">
            No previous sessions. You're all set! 🎉
          </p>
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sessions.map((session, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <LogOut className={`w-4 h-4 ${
                    session.action === "login"
                      ? "text-green-500"
                      : "text-blue-500"
                  }`} />
                  <span className="font-medium capitalize text-foreground">
                    {session.action}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    session.status === "success"
                      ? "bg-green-500/20 text-green-700"
                      : "bg-red-500/20 text-red-700"
                  }`}>
                    {session.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(session.timestamp).toLocaleString()}
                </p>
                {session.ipAddress !== "unknown" && (
                  <p className="text-xs text-muted-foreground">
                    IP: {session.ipAddress}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <button
        onClick={fetchLoginHistory}
        disabled={loading}
        className="w-full mt-4 px-4 py-2 text-sm rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors disabled:opacity-50"
      >
        Refresh Session History
      </button>
    </motion.div>
  );
};

export default SessionHistory;
