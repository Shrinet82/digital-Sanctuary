"use client";

import { intensityLabel } from "@/lib/recommend";

export function Slider({
  id,
  label,
  lowLabel,
  highLabel,
  value,
  onChange,
}: {
  id: string;
  label: string;
  lowLabel: string;
  highLabel: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="my-6">
      <div className="flex justify-between items-baseline mb-2">
        <label htmlFor={id} className="font-bold text-[15px]">
          {label}
        </label>
        <span className="ds-pill bg-sand">
          {value === null ? "skipped" : `${value} · ${intensityLabel(value)}`}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={10}
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-3.5 rounded-full border-2 border-ink appearance-none cursor-pointer
                   bg-gradient-to-r from-mint via-violet-soft to-coral-soft
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7
                   [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px]
                   [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:shadow-pop-sm
                   [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6
                   [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
                   [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-ink"
      />
      <div className="flex justify-between text-xs text-ink-faint font-bold mt-1.5">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
