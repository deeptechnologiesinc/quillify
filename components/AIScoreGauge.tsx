"use client";

import { useEffect, useRef } from "react";

interface AIScoreGaugeProps {
  score: number;
  animated?: boolean;
}

export function AIScoreGauge({ score, animated = true }: AIScoreGaugeProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score > 60 ? "#EF4444" : score > 30 ? "#F59E0B" : "#10B981";

  const label =
    score > 75
      ? "Likely AI"
      : score > 50
      ? "AI-Assisted"
      : score > 25
      ? "Mixed"
      : "Human-Like";

  useEffect(() => {
    if (!animated || !circleRef.current) return;
    circleRef.current.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)";
    circleRef.current.style.strokeDashoffset = String(offset);
  }, [score, offset, animated]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="130" height="130" viewBox="0 0 130 130">
          {/* Track */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke="#E0E7FF"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            ref={circleRef}
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? circumference : offset}
            transform="rotate(-90 65 65)"
            style={{ transition: animated ? undefined : "none" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color, fontFamily: "Inter, sans-serif" }}>
            {score}%
          </span>
          <span className="text-xs font-medium text-gray-500 mt-0.5">{label}</span>
        </div>
      </div>
      <p className="text-sm font-medium" style={{ color }}>
        AI Detection Score
      </p>
    </div>
  );
}
