import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Users,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { createJob, getJobs, getJobCandidates } from "../services/api";
import toast from "react-hot-toast";

const SimpleRecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company: "Your Company",
    location: "Remote",
    type: "full-time",
    salary: "",
    skills: "",
  });

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      loadCandidates(selectedJob);
    }
  }, [selectedJob]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await getJobs();
      setJobs(response.data || response);
    } catch (error) {
      console.error("Error loading jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async (jobId) => {
    try {
      const response = await getJobCandidates(jobId);
      setCandidates(response.data || response);
    } catch (error) {
      console.error("Error loading candidates:", error);
      toast.error("Failed to load candidates");
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Job title is required");
      return;
    }

    try {
      setLoading(true);
      await createJob(formData);
      toast.success("Job posted successfully!");
      setFormData({
        title: "",
        description: "",
        company: "Your Company",
        location: "Remote",
        type: "full-time",
        salary: "",
        skills: "",
      });
      setShowJobForm(false);
      loadJobs();
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Total Jobs", value: jobs.length, icon: Briefcase, color: "from-blue-500 to-blue-600" },
    { label: "Total Candidates", value: candidates.length, icon: Users, color: "from-emerald-500 to-emerald-600" },
    { label: "Pending Reviews", value: candidates.filter((c) => c.status === "pending").length, icon: TrendingUp, color: "from-amber-500 to-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Recruiter Dashboard</h1>
        <p className="text-gray-400">Manage your job postings and candidate applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg`}>
                <stat.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Jobs List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Job Postings</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowJobForm(!showJobForm)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <Plus size={20} /> Post Job
            </motion.button>
          </div>

          {/* Job Form */}
          {showJobForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateJob}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 space-y-4"
            >
              <input
                type="text"
                placeholder="Job Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <textarea
                placeholder="Job Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Salary (e.g., $50k-$80k)"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Required Skills (comma separated)"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-all"
                >
                  {loading ? "Posting..." : "Post Job"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJobForm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}

          {/* Jobs List */}
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-gray-400">No jobs posted yet</p>
              </div>
            ) : (
              jobs.map((job) => (
                <motion.div
                  key={job._id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedJob(job._id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedJob === job._id
                      ? "bg-blue-500/20 border-blue-500/50"
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <p className="text-gray-400 text-sm">
                        {job.location} • {job.type} • ₹{job.salary}
                      </p>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{job.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right: Candidates for Selected Job */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold mb-6">
            {selectedJob ? "Candidates" : "Select a job"}
          </h2>

          {selectedJob && (
            <div className="space-y-3">
              {candidates.length === 0 ? (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-gray-400">No applications yet</p>
                </div>
              ) : (
                candidates.map((candidate) => (
                  <motion.div
                    key={candidate._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        {(candidate.candidateName || "C").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {candidate.candidateName || "Candidate"}
                        </p>
                        <p className="text-gray-400 text-sm truncate">
                          {candidate.candidateEmail}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              candidate.status === "pending"
                                ? "bg-amber-500/20 text-amber-300"
                                : candidate.status === "shortlisted"
                                ? "bg-blue-500/20 text-blue-300"
                                : candidate.status === "accepted"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {candidate.status || "pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleRecruiterDashboard;
