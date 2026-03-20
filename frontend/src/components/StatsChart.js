import React from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const StatsChart = ({ type = "line", data, title, delay = 0 }) => {
  const chartVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: delay * 0.1
      }
    }
  };

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="custom-tooltip"
          style={{
            background: "rgba(10, 14, 26, 0.95)",
            border: "1px solid rgba(79, 70, 229, 0.3)",
            borderRadius: "8px",
            padding: "10px 15px",
            color: "#fff"
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>
            {payload[0].payload.name || `Value: ${payload[0].value}`}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: "5px 0", color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div
      variants={chartVariants}
      initial="hidden"
      animate="visible"
      style={{
        background: "linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(118, 75, 162, 0.05))",
        border: "1px solid rgba(79, 70, 229, 0.2)",
        borderRadius: "12px",
        padding: "1.5rem",
        backdropFilter: "blur(10px)"
      }}
    >
      {title && <h3 style={{ marginBottom: "1.5rem", color: "#fff" }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        {type === "line" && (
          <LineChart data={data}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip content={<customTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ fill: "#4f46e5", r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              animationDuration={1000}
            />
          </LineChart>
        )}
        {type === "area" && (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#764ba2" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#764ba2" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip content={<customTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#764ba2"
              fill="url(#areaGradient)"
              isAnimationActive={true}
              animationDuration={1000}
            />
          </AreaChart>
        )}
        {type === "bar" && (
          <BarChart data={data}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#764ba2" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip content={<customTooltip />} />
            <Legend />
            <Bar
              dataKey="value"
              fill="url(#barGradient)"
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
              animationDuration={1000}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
};

export default StatsChart;
