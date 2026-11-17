import type { ReactNode } from "react";

export function Button({ children, variant = "primary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost"; children: ReactNode }) {
  const styles = {
    primary: "bg-[#087F6D] text-white hover:bg-[#066a5d]",
    secondary: "bg-white text-[#172B4D] border border-[#E5E7EB] hover:bg-[#F7F8FA]",
    ghost: "bg-transparent text-[#172B4D] hover:bg-[#F7F8FA]",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

export function Badge({ children, kind = "neutral" }: { children: ReactNode; kind?: "neutral" | "green" | "amber" | "red" | "blue" }) {
  const styles = {
    neutral: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-sky-100 text-sky-700",
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[kind]}`}>{children}</span>;
}

export function StatCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#64748B]">{label}</div>
      <div className="mt-3 text-2xl font-semibold tabular-nums text-[#172B4D]">{value}</div>
      {detail ? <div className="mt-1 text-xs text-[#64748B]">{detail}</div> : null}
    </div>
  );
}

export function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-sm font-medium text-[#172B4D]">
      <span className="mb-1.5 block">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#172B4D] outline-none ring-0 transition focus:border-[#087F6D]"
      />
    </label>
  );
}

export function Select({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[#172B4D]">
      <span className="mb-1.5 block">{label}</span>
      <select
        {...props}
        className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#172B4D] outline-none transition focus:border-[#087F6D]"
      >
        {children}
      </select>
    </label>
  );
}

export function TextArea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block text-sm font-medium text-[#172B4D]">
      <span className="mb-1.5 block">{label}</span>
      <textarea
        {...props}
        className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#172B4D] outline-none transition focus:border-[#087F6D]"
      />
    </label>
  );
}
