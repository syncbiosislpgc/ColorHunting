"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playReveal, playTick, vibrate } from "@/lib/utils/feedback";

interface RouletteProps<T extends { id: string; label: string; color?: string }> {
  items: T[];
  spinning: boolean;
  resultId: string | null;
  onSpinEnd?: () => void;
  durationMs?: number;
}

export function VisualRoulette<T extends { id: string; label: string; color?: string }>({
  items,
  spinning,
  resultId,
  onSpinEnd,
  durationMs = 3200,
}: RouletteProps<T>) {
  const [rotation, setRotation] = useState(0);
  const endRef = useRef(onSpinEnd);
  endRef.current = onSpinEnd;

  const segment = 360 / Math.max(items.length, 1);

  const gradient = useMemo(() => {
    if (items.length === 0) return "#ccc";
    const stops = items
      .map((item, i) => {
        const start = (i / items.length) * 100;
        const end = ((i + 1) / items.length) * 100;
        const color = item.color || (i % 2 === 0 ? "#ff8a6a" : "#2a9d8f");
        return `${color} ${start}% ${end}%`;
      })
      .join(", ");
    return `conic-gradient(from -90deg, ${stops})`;
  }, [items]);

  useEffect(() => {
    if (!spinning || !resultId) return;
    const index = items.findIndex((i) => i.id === resultId);
    if (index < 0) return;

    const targetCenter = index * segment + segment / 2;
    // Pointer at top (-90deg in conic); we rotate wheel so target lands at top
    const extraTurns = 5 + Math.floor(Math.random() * 3);
    const final = extraTurns * 360 + (360 - targetCenter);

    let ticks = 0;
    const tickInterval = setInterval(() => {
      playTick(0.05);
      vibrate(8);
      ticks += 1;
      if (ticks > 40) clearInterval(tickInterval);
    }, 70);

    setRotation((prev) => prev + final);

    const timeout = setTimeout(() => {
      clearInterval(tickInterval);
      playReveal();
      vibrate([20, 40, 20]);
      endRef.current?.();
    }, durationMs);

    return () => {
      clearInterval(tickInterval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, resultId]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px]">
      <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1">
        <div className="h-0 w-0 border-l-[12px] border-r-[12px] border-t-[22px] border-l-transparent border-r-transparent border-t-[#1c1410]" />
      </div>
      <motion.div
        className="relative h-full w-full rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-4 ring-white/50"
        style={{ background: gradient }}
        animate={{ rotate: rotation }}
        transition={{ duration: durationMs / 1000, ease: [0.12, 0.8, 0.2, 1] }}
      >
        <div className="absolute inset-[18%] rounded-full bg-[#fff8f1]/70 backdrop-blur-sm" />
        <div className="absolute inset-0">
          {items.map((item, i) => {
            const angle = i * segment + segment / 2;
            return (
              <div
                key={item.id}
                className="absolute left-1/2 top-1/2 origin-bottom text-center"
                style={{
                  height: "46%",
                  width: 64,
                  marginLeft: -32,
                  marginTop: "-46%",
                  transform: `rotate(${angle}deg)`,
                }}
              >
                <span
                  className="block text-[10px] font-bold uppercase tracking-wide text-[#1c1410]/90"
                  style={{ transform: "translateY(8px)" }}
                >
                  {item.label.length > 10 ? item.label.slice(0, 9) + "…" : item.label}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
