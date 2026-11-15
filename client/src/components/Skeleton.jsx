import { neoCardClass } from "../lib/theme";

// A gray placeholder bar. Skeletons copy the shape of the content that is
// about to load, so the page doesn't jump when the real thing arrives.
// motion-reduce turns the pulse off for people who ask for less motion.
export function SkeletonBlock({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-full bg-slate-900/15 dark:bg-slate-100/15 animate-pulse motion-reduce:animate-none ${className}`}
    />
  );
}

const ROW_WIDTHS = ["w-56", "w-40", "w-48"];

// Same outline as the resume list on the dashboard: one card, divided rows,
// a title on the left and a small badge on the right.
export function DashboardSkeleton() {
  return (
    <div role="status" className={`divide-y-[3px] divide-slate-900 dark:divide-slate-100 overflow-hidden ${neoCardClass}`}>
      <span className="sr-only">Loading your resumes...</span>
      {ROW_WIDTHS.map((width) => (
        <div key={width} className="px-5 py-4 flex items-center justify-between gap-3">
          <SkeletonBlock className={`h-5 max-w-[60%] ${width}`} />
          <SkeletonBlock className="h-5 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

function SectionSkeleton({ children }) {
  return (
    <div className={`p-5 mb-6 ${neoCardClass}`}>
      <SkeletonBlock className="h-5 w-32 mb-4" />
      {children}
    </div>
  );
}

// Same outline as the resume editor: the top bar, the template picker with
// three previews, then the first form sections.
export function EditorSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Loading your resume...</span>
      <div className="flex items-center justify-between mb-6">
        <SkeletonBlock className="h-4 w-36" />
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-9 w-28" />
          <SkeletonBlock className="h-9 w-40 hidden sm:block" />
        </div>
      </div>

      <SectionSkeleton>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border-[3px] border-slate-900/20 dark:border-slate-100/20 p-3">
              <SkeletonBlock className="h-36 w-full rounded-lg mb-3" />
              <SkeletonBlock className="h-4 w-20 mb-2" />
              <SkeletonBlock className="h-3 w-full" />
            </div>
          ))}
        </div>
      </SectionSkeleton>

      <SectionSkeleton>
        <SkeletonBlock className="h-11 w-full" />
      </SectionSkeleton>

      <SectionSkeleton>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-11 w-full" />
          ))}
        </div>
      </SectionSkeleton>
    </div>
  );
}
