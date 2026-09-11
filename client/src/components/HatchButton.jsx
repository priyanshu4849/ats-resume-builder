export function hatchButtonClass(size = "md", className = "") {
  const sizing = size === "sm" ? "px-4 py-1.5 text-sm" : "px-6 py-2.5";
  return `inline-flex items-center justify-center rounded-full border-[3px] border-slate-900 dark:border-slate-100 font-semibold text-white shadow-[4px_4px_0_0] shadow-slate-900 dark:shadow-slate-100 bg-[repeating-linear-gradient(45deg,#4f46e5_0px,#4f46e5_6px,#818cf8_6px,#818cf8_12px)] transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none ${sizing} ${className}`;
}

export function HatchButton({ children, className = "", size = "md", ...props }) {
  return (
    <button {...props} className={hatchButtonClass(size, className)}>
      {children}
    </button>
  );
}
