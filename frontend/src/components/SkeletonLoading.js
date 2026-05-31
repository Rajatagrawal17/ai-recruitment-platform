import React from "react";
import { motion } from "framer-motion";

const SkeletonLoading = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-4 w-32 skeleton-shimmer rounded-full"></div>
            <div className="h-8 w-64 skeleton-shimmer rounded-lg"></div>
          </div>
          <div className="h-10 w-24 skeleton-shimmer rounded-full"></div>
        </div>

        {/* Hero Card Skeleton */}
        <div className="h-48 w-full skeleton-shimmer border border-slate-800/50 rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-6 w-3/4 skeleton-shimmer rounded-lg"></div>
            <div className="h-4 w-1/2 skeleton-shimmer rounded-lg"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-8 w-24 skeleton-shimmer rounded-full"></div>
            <div className="h-8 w-24 skeleton-shimmer rounded-full"></div>
            <div className="h-8 w-24 skeleton-shimmer rounded-full"></div>
          </div>
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-slate-800/50 skeleton-shimmer rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 skeleton-shimmer rounded-xl"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-2/3 skeleton-shimmer rounded-md"></div>
                  <div className="h-3 w-1/2 skeleton-shimmer rounded-md"></div>
                </div>
              </div>
              <div className="h-3 w-full skeleton-shimmer rounded-md"></div>
              <div className="h-3 w-5/6 skeleton-shimmer rounded-md"></div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/40">
                <div className="h-4 w-20 skeleton-shimmer rounded-md"></div>
                <div className="h-8 w-20 skeleton-shimmer rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoading;
