import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { Star, MapPin, Briefcase, DollarSign, ChevronDown, X } from "lucide-react";

const EnhancedJobCard = ({ job, onApply, isFavorite, onFavoriteToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef(null);
  const detailsRef = useRef(null);

  // GSAP animations
  useEffect(() => {
    if (cardRef.current) {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.6,
        ease: "power2.out",
      });
    }
  }, []);

  useEffect(() => {
    if (isExpanded && detailsRef.current) {
      gsap.to(detailsRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isExpanded]);

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  };

  const handleApply = (e) => {
    e.stopPropagation();
    onApply?.(job._id);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    onFavoriteToggle?.(job._id);
  };

  const typeColors = {
    "full-time": "bg-blue-100 text-blue-800",
    "part-time": "bg-amber-100 text-amber-800",
    contract: "bg-purple-100 text-purple-800",
    remote: "bg-teal-100 text-teal-800",
    hybrid: "bg-indigo-100 text-indigo-800",
  };

  const typeColor = typeColors[job.type?.toLowerCase()] || typeColors["full-time"];

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      {/* Collapsed Card */}
      <motion.div
        onClick={handleCardClick}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
          isExpanded
            ? "border-primary bg-primary/5 shadow-lg"
            : "border-gray-200 bg-white hover:border-primary hover:shadow-md"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <Briefcase size={14} />
              <span className="truncate">{job.company}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${typeColor}`}>
              {job.type}
            </span>
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavorite}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Star
                size={18}
                fill={isFavorite ? "currentColor" : "none"}
                className={isFavorite ? "text-yellow-500" : "text-gray-400"}
              />
            </motion.button>
            <motion.button
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="p-2"
            >
              <ChevronDown size={20} className="text-gray-400" />
            </motion.button>
          </div>
        </div>

        {/* Quick Info - Always Visible */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          {job.salary && (
            <div className="flex items-center gap-1">
              <DollarSign size={12} />
              <span className="font-semibold">{formatSalary(job.salary)}</span>
            </div>
          )}
          {job.location && (
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              <span className="truncate">{job.location}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            ref={detailsRef}
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3 }}
            className="border-2 border-primary bg-gradient-to-br from-primary/5 to-blue-50/50 rounded-xl p-6 space-y-4"
          >
            {/* Close Button */}
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Description */}
            {job.description && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {job.description}
                </p>
              </div>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Level */}
            {job.experienceLevel && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Experience</h4>
                  <p className="text-sm text-gray-600">{job.experienceLevel}</p>
                </div>
                {job.deadline && (
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Application Deadline</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(job.deadline).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleApply}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                Apply Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const formatSalary = (salary) => {
  if (typeof salary === "number") return `$${salary.toLocaleString()}`;
  if (Array.isArray(salary)) {
    return `$${salary[0]?.toLocaleString()} - $${salary[1]?.toLocaleString()}`;
  }
  return salary;
};

export default EnhancedJobCard;
