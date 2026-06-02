import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarX, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../services/api";

export default function DeclineInterviewModal({ isOpen, onClose, application, onDeclined }) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  if (!isOpen || !application) return null;

  const handleDecline = async () => {
    setIsSubmitting(true);
    setModalError("");

    // Optimistically update the UI to declined state
    const revert = onDeclined(application._id, {
      status: "interview_declined",
      declineMessage: message || "Candidate declined interview"
    });

    try {
      const response = await API.patch(`/applications/${application._id}`, {
        status: "interview_declined",
        declineMessage: message || "Candidate declined interview"
      });

      if (response.data.success) {
        toast.success("Interview declined. The recruiter has been notified.");
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to decline interview");
      }
    } catch (err) {
      console.error("Error declining interview:", err);
      if (revert) revert();
      const errorMsg = err.response?.data?.message || err.message || "Unable to decline interview";
      setModalError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const companyInitials = (application.company || "J").charAt(0).toUpperCase();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f1a] p-6 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-base font-bold text-white">Decline Interview</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-white/5 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Job Info */}
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/5 p-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center font-bold text-white text-base">
              {companyInitials}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-white truncate">{application.jobTitle}</h4>
              <p className="text-xs text-slate-400 truncate">{application.company}</p>
            </div>
          </div>

          {/* Error Message inside Modal */}
          {modalError && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{modalError}</span>
            </div>
          )}

          {/* Warning Message */}
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-400">
            <CalendarX size={16} className="shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-semibold">Decline Interview Invitation</p>
              <p className="mt-0.5 text-[11px] text-amber-400/80 leading-relaxed">
                Are you sure you want to decline this interview? This action cannot be undone, and the recruiter will be notified.
              </p>
            </div>
          </div>

          {/* Optional Message to Recruiter */}
          <div className="mt-4 space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Optional message to recruiter:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., I appreciate the opportunity but I have accepted another offer..."
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-[#0d1321]/50 p-3 text-xs text-white placeholder-slate-500 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] outline-none resize-none transition"
            />
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={handleDecline}
              disabled={isSubmitting}
              className="w-full rounded-xl bg-red-600 hover:bg-red-500 py-3 text-sm font-semibold text-white transition disabled:opacity-40"
            >
              {isSubmitting ? "Declining..." : "Yes, decline interview"}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition font-medium"
            >
              Keep my interview
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
