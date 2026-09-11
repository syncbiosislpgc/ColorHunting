"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ScreenShellProps {
  children: ReactNode;
  className?: string;
  tone?: "ink" | "cream" | "sunset" | "ocean" | "night";
}

const tones: Record<NonNullable<ScreenShellProps["tone"]>, string> = {
  ink: "bg-[radial-gradient(ellipse_at_top,_#2a2438_0%,_#121018_55%,_#0b0a0f_100%)] text-[#f7f2ea]",
  cream:
    "bg-[radial-gradient(ellipse_at_top,_#fff6ef_0%,_#ffe8dc_45%,_#f5dcc8_100%)] text-[#1c1410]",
  sunset:
    "bg-[radial-gradient(ellipse_at_bottom_right,_#ff8a6a_0%,_#ffb088_35%,_#ffe1c9_70%,_#fff5ee_100%)] text-[#1c1410]",
  ocean:
    "bg-[radial-gradient(ellipse_at_top,_#1f6f78_0%,_#134e56_40%,_#0c2f36_100%)] text-[#eef8f7]",
  night:
    "bg-[radial-gradient(ellipse_at_center,_#243047_0%,_#121826_60%,_#0a0e16_100%)] text-[#f3efe7]",
};

export function ScreenShell({ children, className = "", tone = "cream" }: ScreenShellProps) {
  return (
    <div
      className={`relative min-h-dvh w-full overflow-hidden ${tones[tone]} ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]"
      >
        {children}
      </motion.div>
    </div>
  );
}
