export function NeoButton({ children, className = "", size = "md", ...props }) {
  const sizing = size === "sm" ? "px-3 py-1 text-sm" : "px-4 py-2";

  return (
    <button
      {...props}
      className={`rounded-full border-[3px] border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold shadow-[3px_3px_0_0] shadow-slate-900 dark:shadow-slate-100 transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none ${sizing} ${className}`}
    >
      {children}
    </button>
  );
}
