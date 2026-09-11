import { useState } from "react";

export function PasswordInput({ value, onChange, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        {...props}
        className="w-full px-4 py-2 pr-11 border-[3px] border-slate-900 dark:border-slate-100 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm"
      >
        {visible ? "🙈" : "👁️"}
      </button>
    </div>
  );
}
