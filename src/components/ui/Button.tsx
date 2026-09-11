"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "soft" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  full?: boolean;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-[#1c1410] text-[#fff8f1] shadow-[0_12px_30px_rgba(28,20,16,0.22)] hover:bg-[#2a2018] active:scale-[0.98]",
  ghost:
    "bg-transparent text-current border border-current/25 hover:bg-black/5 active:scale-[0.98]",
  soft: "bg-white/70 text-[#1c1410] backdrop-blur-md border border-white/50 shadow-[0_8px_24px_rgba(28,20,16,0.08)] hover:bg-white/90 active:scale-[0.98]",
  danger:
    "bg-[#c44536] text-white shadow-[0_10px_24px_rgba(196,69,54,0.28)] hover:bg-[#a8382b] active:scale-[0.98]",
};

export function Button({
  children,
  variant = "primary",
  full = true,
  className = "",
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-2xl px-5 py-4 text-[15px] font-semibold tracking-[0.08em] uppercase transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${full ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
