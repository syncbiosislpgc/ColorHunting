"use client";

export function ProgressPill({ current, total }: { current: number; total: number }) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60">
          Prueba {current} de {total}
        </p>
        <p className="text-[11px] opacity-50">{pct}%</p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
        <div
          className="h-full rounded-full bg-current transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
