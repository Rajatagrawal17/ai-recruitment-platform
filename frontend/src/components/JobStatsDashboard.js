import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const JobStatsDashboard = ({ jobs }) => {
  const statsRef = useRef(null);

  useEffect(() => {
    if (statsRef.current) {
      gsap.from(statsRef.current.children, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    }
  }, []);

  // Calculate stats
  const jobStats = {
    total: jobs.length,
    byType: {
      "full-time": jobs.filter((j) => j.type === "full-time").length,
      "part-time": jobs.filter((j) => j.type === "part-time").length,
      contract: jobs.filter((j) => j.type === "contract").length,
      remote: jobs.filter((j) => j.location?.toLowerCase().includes("remote")).length,
    },
    salaryRanges: {
      low: jobs.filter((j) => j.salary && j.salary < 50000).length,
      medium: jobs.filter((j) => j.salary && j.salary >= 50000 && j.salary < 100000).length,
      high: jobs.filter((j) => j.salary && j.salary >= 100000).length,
    },
  };

  // Chart data
  const typeChartData = {
    labels: Object.keys(jobStats.byType),
    datasets: [
      {
        label: "Jobs by Type",
        data: Object.values(jobStats.byType),
        backgroundColor: ["#3b82f6", "#f59e0b", "#a855f7", "#06b6d4"],
        borderColor: ["#1e40af", "#d97706", "#6b21a8", "#0891b2"],
        borderWidth: 2,
      },
    ],
  };

  const salaryChartData = {
    labels: ["< $50K", "$50K - $100K", "> $100K"],
    datasets: [
      {
        label: "Positions",
        data: [jobStats.salaryRanges.low, jobStats.salaryRanges.medium, jobStats.salaryRanges.high],
        backgroundColor: ["#fbbf24", "#60a5fa", "#34d399"],
        borderColor: ["#d97706", "#1e40af", "#059669"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { size: 12, weight: "600" },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 12 },
        borderRadius: 8,
      },
    },
  };

  return (
    <motion.div
      ref={statsRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
    >
      {/* Total Jobs Card */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg"
      >
        <div className="text-4xl font-bold mb-2">{jobStats.total}</div>
        <p className="text-blue-100">Total Positions</p>
      </motion.div>

      {/* Job Types Doughnut Chart */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="font-bold text-gray-900 mb-4 text-sm">Job Types Distribution</h3>
        <div style={{ height: "180px" }}>
          <Doughnut data={typeChartData} options={chartOptions} />
        </div>
      </motion.div>

      {/* Salary Ranges Bar Chart */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="font-bold text-gray-900 mb-4 text-sm">Salary Distribution</h3>
        <div style={{ height: "180px" }}>
          <Bar data={salaryChartData} options={chartOptions} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default JobStatsDashboard;
