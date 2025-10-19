"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  delta?: string;
  sparklineData?: number[];
  lastUpdated?: string;
}

export function KPICard({ title, value, delta, sparklineData = [], lastUpdated }: KPICardProps) {
  const isPositive = delta?.startsWith("+");
  const hasSparkline = sparklineData.length >= 2;

  const points = (() => {
    if (!hasSparkline) {
      return "";
    }
    const localMin = Math.min(...sparklineData);
    const localMax = Math.max(...sparklineData);
    const range = localMax - localMin || 1;
    return sparklineData
      .map((val, idx) => {
        const x = (idx / (sparklineData.length - 1)) * 100;
        const y = 100 - ((val - localMin) / range) * 100;
        return `${x},${y}`;
      })
      .join(" ");
  })();

  return (
    <div className="kpi-card group">
      <div className="text-text-muted text-sm mb-2">{title}</div>

      <div className="flex items-end justify-between mb-4">
        <div className="text-3xl font-display text-text-primary">{value}</div>
        {delta && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-pill text-xs font-medium ${
              isPositive ? "bg-success/20 text-success" : "bg-error/20 text-error"
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {delta}
          </div>
        )}
      </div>

      {hasSparkline && (
        <div className="h-12 mb-2">
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            <polyline
              points={points}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-accent-gold opacity-70"
            />
            <polyline
              points={`0,100 ${points} 100,100`}
              fill="currentColor"
              className="text-accent-gold opacity-10"
            />
          </svg>
        </div>
      )}

      {lastUpdated && <div className="text-xs text-text-muted">Updated {lastUpdated}</div>}
    </div>
  );
}
