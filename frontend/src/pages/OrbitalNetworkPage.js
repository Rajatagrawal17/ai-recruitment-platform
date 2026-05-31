import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const OrbitalNetworkPage = () => {
  const containerRef = useRef(null);
  const [d3Lib, setD3Lib] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamically load D3 on mount
  useEffect(() => {
    console.log("🌐 [Orbital Network] Dynamically importing D3...");
    const startTime = performance.now();

    import("d3")
      .then((d3) => {
        console.log(`🚀 [Orbital Network] D3 successfully loaded in ${(performance.now() - startTime).toFixed(1)}ms`);
        setD3Lib(d3);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to load D3:", err);
        setLoading(false);
      });
  }, []);

  // Render the D3 interactive visualization once D3 is loaded
  useEffect(() => {
    if (!d3Lib || !containerRef.current) return;

    const d3 = d3Lib;
    const width = containerRef.current.clientWidth || 800;
    const height = 500;

    // Clear previous SVG
    d3.select(containerRef.current).selectAll("svg").remove();

    const svg = d3
      .select(containerRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "transparent");

    // Sample data: Center (Job Title) and orbiting items (Skills, Requirements)
    const nodes = [
      { id: "Job", label: "Staff AI Engineer", type: "center", radius: 40 },
      { id: "Skill1", label: "React & Vite", type: "skill", radius: 24, orbitalRadius: 120 },
      { id: "Skill2", label: "D3 Data Visualization", type: "skill", radius: 24, orbitalRadius: 120 },
      { id: "Skill3", label: "Recruitment Automation", type: "skill", radius: 24, orbitalRadius: 120 },
      { id: "Skill4", label: "LLM Orchestration", type: "skill", radius: 24, orbitalRadius: 180 },
      { id: "Skill5", label: "TensorFlow / PyTorch", type: "skill", radius: 24, orbitalRadius: 180 },
      { id: "Skill6", label: "Node.js Microservices", type: "skill", radius: 24, orbitalRadius: 180 },
    ];

    // Links connecting nodes to the center
    const links = nodes
      .filter((n) => n.type !== "center")
      .map((n) => ({ source: "Job", target: n.id }));

    // Draw orbital path rings
    const rings = [120, 180];
    svg
      .selectAll("circle.ring")
      .data(rings)
      .enter()
      .append("circle")
      .attr("class", "ring")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", (d) => d)
      .style("fill", "none")
      .style("stroke", "rgba(34, 211, 238, 0.15)")
      .style("stroke-width", 2)
      .style("stroke-dasharray", "4,4");

    // Force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id).distance((d) => d.target.orbitalRadius || 120))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);

    // Render links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .style("stroke", "rgba(0, 212, 255, 0.2)")
      .style("stroke-width", 2);

    // Render nodes
    const node = svg
      .append("g")
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // Node circles with gradients
    node
      .append("circle")
      .attr("r", (d) => d.radius)
      .style("fill", (d) => {
        if (d.type === "center") return "url(#centerGradient)";
        return "url(#orbitalGradient)";
      })
      .style("stroke", (d) => (d.type === "center" ? "#22d3ee" : "#818cf8"))
      .style("stroke-width", 2);

    // Text labels
    node
      .append("text")
      .attr("dy", (d) => (d.type === "center" ? 4 : 32))
      .attr("text-anchor", "middle")
      .text((d) => d.label)
      .style("fill", "#fff")
      .style("font-size", (d) => (d.type === "center" ? "13px" : "11px"))
      .style("font-weight", (d) => (d.type === "center" ? "bold" : "normal"))
      .style("pointer-events", "none")
      .style("text-shadow", "0 2px 4px rgba(0,0,0,0.8)");

    // Add SVG Gradients
    const defs = svg.append("defs");
    
    const centerGradient = defs
      .append("linearGradient")
      .attr("id", "centerGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    centerGradient.append("stop").attr("offset", "0%").attr("stop-color", "#06b6d4");
    centerGradient.append("stop").attr("offset", "100%").attr("stop-color", "#0891b2");

    const orbitalGradient = defs
      .append("linearGradient")
      .attr("id", "orbitalGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    orbitalGradient.append("stop").attr("offset", "0%").attr("stop-color", "#4f46e5");
    orbitalGradient.append("stop").attr("offset", "100%").attr("stop-color", "#3730a3");

    // Drag handlers
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    function ticked() {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    }

    // Window resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      svg.attr("width", w).attr("viewBox", `0 0 ${w} ${height}`);
      simulation.force("center", d3.forceCenter(w / 2, height / 2));
      simulation.alpha(0.3).restart();
      rings.forEach((r) => {
        svg.selectAll("circle.ring").attr("cx", w / 2);
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [d3Lib]);

  return (
    <main className="min-h-screen bg-slate-950 text-white py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10">
            <ArrowLeft size={16} /> Back Home
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
            <Sparkles size={12} /> Interactive Graph
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">Orbital Skills Network</h1>
          <p className="mt-2 text-slate-400 max-w-2xl text-sm md:text-base">
            Visualize how job specifications connect to candidate skill sets. Click and drag nodes to explore the gravitational forces of match criteria.
          </p>
        </div>

        {loading ? (
          <div className="h-[500px] border border-white/10 bg-slate-900/40 rounded-3xl flex flex-col items-center justify-center gap-4">
            <RefreshCw className="animate-spin text-cyan-400" size={32} />
            <p className="text-slate-400 text-sm">Loading dynamic visualization library (D3.js)...</p>
          </div>
        ) : (
          <div className="relative rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.08),_transparent_40%)] bg-slate-900/40 p-4 shadow-2xl overflow-hidden">
            <div ref={containerRef} className="w-full cursor-grab active:cursor-grabbing" />
            <div className="absolute bottom-4 right-4 bg-slate-950/80 border border-white/5 rounded-xl px-4 py-3 backdrop-blur text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-white">Interactive Legend:</p>
              <p>🟢 Center Node: Core Job Role</p>
              <p>🟣 Orbiting Nodes: Required Candidate Skills</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default OrbitalNetworkPage;
