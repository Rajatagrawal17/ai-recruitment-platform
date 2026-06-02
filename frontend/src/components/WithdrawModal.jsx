import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../services/api";

const REASONS = [
  "Found another job",
  "Role not a fit",
  "Salary mismatch",
  "Location issues",
  "Personal reasons",
  "Other"
];

export default function WithdrawModal({ isOpen, onClose, application, onWithdrawn }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withinWindow, setWithinWindow] = useState(true);
  const [hoursLeft, setHoursLeft] = useState(24);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    if (isOpen && application) {
      setModalError("");
      setSelectedReason("");
      
      const createdAt = new Date(application.createdAt);
      const elapsed = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
      const left = Math.max(0, 24 - elapsed);
      setHoursLeft(left);
      setWithinWindow(left > 0);
    }
  }, [isOpen, application]);

  if (!isOpen || !application) return null;

  const handleWithdraw = async () => {
    setIsSubmitting(true);
    setModalError("");

    // Optimistically update the UI to withdrawn state
    const revert = onWithdrawn ? onWithdrawn(application._id, {
      status: "withdrawn",
      withdrawnAt: new Date().toISOString(),
      withdrawReason: selectedReason || "Candidate withdrew application",
      selfWithdrawn: true
    }) : null;
    
    try {
      const response = await API.delete(`/applications/${application._id}`, {
        data: { reason: selectedReason || "Candidate withdrew application" }
      });

      if (response.data.success) {
        toast.success("Application withdrawn successfully");
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to withdraw application");
      }
    } catch (err) {
      console.error("Error withdrawing application:", err);
      if (revert) revert();
      const errorMsg = err.response?.data?.message || err.message || "Unable to withdraw application";
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

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f1a] p-6 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-base font-bold text-white">Withdraw Application</h3>
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

          {/* Warning Message based on age */}
          <div className="mt-4">
            {withinWindow ? (
              <div className="flex items-start gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                <div>
                  <p className="font-semibold">Within 24h undo window</p>
                  <p className="mt-0.5 text-[11px] text-emerald-400/80 leading-relaxed">
                    You can withdraw this application. The recruiter will be notified. (about {Math.round(hoursLeft)}h remaining to undo).
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-400">
                <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <p className="font-semibold">Beyond 24h window</p>
                  <p className="mt-0.5 text-[11px] text-amber-400/80 leading-relaxed">
                    Your application has been with the recruiter for over 24 hours. You can still withdraw but we recommend contacting them directly.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Reason Selector */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Why are you withdrawing?</label>
              <button 
                onClick={() => setSelectedReason("")} 
                className="text-[10px] text-slate-500 hover:text-slate-300 transition"
              >
                Clear reason
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {REASONS.map(reason => {
                const isActive = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className={`rounded-full px-3 py-1.5 text-xs transition border ${
                      isActive
                        ? "bg-[#6366f1]/20 border-[#6366f1] text-[#a5b4fc] font-medium"
                        : "bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300"
                    }`}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={handleWithdraw}
              disabled={isSubmitting}
              className="w-full rounded-xl bg-red-600 hover:bg-red-500 py-3 text-sm font-semibold text-white transition disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? "Withdrawing..." : "Withdraw application"}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
