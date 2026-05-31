import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import ExperienceHubSection from "../components/ExperienceHubSection";

const ExperienceHubPage = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 md:px-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
            <Sparkles size={12} /> Interactive preview
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl gradient-text">Recruiter and candidate journey hub</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            Explore how the platform feels from both sides before you sign in. Switch the view, inspect the actions, and jump straight into the right flow.
          </p>
        </div>

        <Link to="/" className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 md:inline-flex">
          <ArrowLeft size={16} /> Back home
        </Link>
      </div>

      <ExperienceHubSection className="mx-4 md:mx-6" />
    </main>
  );
};

export default ExperienceHubPage;
