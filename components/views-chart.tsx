"use client";

import { useState } from "react";

interface DailyView {
  date: string;
  label: string;
  count: number;
}

interface ViewsChartProps {
  data: DailyView[];
}

export function ViewsChart({ data }: ViewsChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const chartHeight = 160;
  const barWidth = 100 / data.length;
  const gap = barWidth * 0.3;
  const actualBarWidth = barWidth - gap;

  const totalViews = data.reduce((sum, d) => sum + d.count, 0);
  const avgViews = Math.round(totalViews / data.length);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Visitas por día</span>
          <span className="text-xs text-muted-foreground">(últimos 14 días)</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Total: <strong className="text-foreground">{totalViews}</strong></span>
          <span>Promedio: <strong className="text-foreground">{avgViews}/día</strong></span>
        </div>
      </div>

      <div className="relative">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between" style={{ height: chartHeight }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-t border-border/40" />
          ))}
        </div>

        {/* Bars */}
        <div className="relative flex items-end gap-1" style={{ height: chartHeight }}>
          {data.map((d, i) => {
            const heightPct = (d.count / maxCount) * 100;
            const isHovered = hovered === i;
            return (
              <div
                key={i}
                className="group relative flex flex-1 cursor-pointer flex-col items-center justify-end"
                style={{ height: "100%" }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Tooltip */}
                {isHovered && d.count > 0 && (
                  <div className="absolute -top-10 z-10 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-xs font-medium text-background shadow-lg">
                    {d.count} {d.count === 1 ? "visita" : "visitas"}
                    <div className="text-[10px] opacity-70">{d.label}</div>
                  </div>
                )}

                {/* Bar */}
                <div
                  className={`w-full max-w-[28px] rounded-t-md transition-all duration-200 ${
                    isHovered
                      ? "bg-primary"
                      : d.count > 0
                        ? "bg-primary/60 group-hover:bg-primary"
                        : "bg-muted"
                  }`}
                  style={{
                    height: `${d.count > 0 ? Math.max(heightPct, 3) : 2}%`,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="mt-2 flex gap-1">
          {data.map((d, i) => (
            <div
              key={i}
              className={`flex-1 text-center text-[10px] transition-colors ${
                hovered === i ? "font-semibold text-foreground" : "text-muted-foreground"
              }`}
            >
              {i % 2 === 0 ? d.label.split("/").slice(0, 2).join("/") : ""}
            </div>
          ))}
        </div>
      </div>

      {totalViews === 0 && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Aún no hay visitas registradas en este período.
        </p>
      )}
    </div>
  );
}
