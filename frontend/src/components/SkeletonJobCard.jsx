import React from "react";

const SkeletonJobCard = () => {
  return (
    <article className="glass-card relative rounded-2xl border border-white/8 bg-white/4 p-6">
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        .skeleton-shimmer {
          background: linear-gradient(90deg, #1a1a2e 25%, #2a2a4e 50%, #1a1a2e 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>

      {/* Header Section - Company Avatar + Title + Save Button */}
      <div className="mb-5 flex items-start gap-4">
        {/* Company Avatar Skeleton */}
        <div className="skeleton-shimmer flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" />

        {/* Title and Company Skeleton */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="skeleton-shimmer h-6 w-3/4 rounded-lg" />
          <div className="skeleton-shimmer h-4 w-1/2 rounded" />
        </div>

        {/* Save Button Skeleton */}
        <div className="skeleton-shimmer h-10 w-10 rounded-full shrink-0" />
      </div>

      {/* Meta Pills - Location, Type, Posted */}
      <div className="flex flex-wrap gap-2">
        <div className="skeleton-shimmer h-8 w-32 rounded-full" />
        <div className="skeleton-shimmer h-8 w-32 rounded-full" />
        <div className="skeleton-shimmer h-8 w-32 rounded-full" />
      </div>

      {/* Skills Section */}
      <div className="mt-5 flex flex-wrap gap-2">
        <div className="skeleton-shimmer h-6 w-20 rounded-full" />
        <div className="skeleton-shimmer h-6 w-24 rounded-full" />
        <div className="skeleton-shimmer h-6 w-28 rounded-full" />
        <div className="skeleton-shimmer h-6 w-20 rounded-full" />
      </div>

      {/* Salary and Experience Section */}
      <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/8 pt-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="skeleton-shimmer h-4 w-32 rounded" />
          <span className="h-4 w-px bg-white/10" />
          <div className="skeleton-shimmer h-4 w-24 rounded" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="skeleton-shimmer h-12 rounded-2xl" />
        <div className="skeleton-shimmer h-12 rounded-2xl" />
      </div>

      {/* Compare Checkbox Section */}
      <div className="mt-4 flex items-center gap-3">
        <div className="skeleton-shimmer h-4 w-4 rounded" />
        <div className="skeleton-shimmer h-4 w-32 rounded" />
        <span className="h-3 w-px bg-white/10" />
        <div className="skeleton-shimmer h-4 w-20 rounded" />
      </div>
    </article>
  );
};

export default SkeletonJobCard;
