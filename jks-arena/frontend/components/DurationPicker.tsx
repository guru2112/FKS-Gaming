"use client";
import React from "react";

interface DurationPickerProps {
  value: number; // in hours (e.g. 1.5)
  onChange: (val: number) => void;
  theme?: "light" | "dark";
}

export default function DurationPicker({ value, onChange, theme = "light" }: DurationPickerProps) {
  // Safe parsing in case value is NaN or null
  const safeValue = value || 0;
  const hours = Math.floor(safeValue);
  const minutes = Math.round((safeValue - hours) * 60);

  const setTime = (h: number, m: number) => {
    if (h === 0 && m === 0) h = 0; // Or allow it but we might want to prevent 0 booking
    if (h < 0) h = 0;
    if (h > 12) h = 12;
    if (m < 0) m = 59;
    if (m >= 60) m = 0;
    
    if (h === 0 && m === 0) {
      onChange(0.5); // Minimum 30 mins
    } else {
      onChange(h + m / 60);
    }
  };

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-black/50 border-white/10 text-white" : "bg-white border-black/10 text-[#1A1A1A]";
  const labelClass = isDark ? "text-slate-400" : "text-slate-500";
  const hoverClass = isDark ? "hover:bg-white/10 text-slate-300" : "hover:bg-black/5 text-slate-600";
  const colonClass = isDark ? "text-white" : "text-[#1A1A1A]";

  const Stepper = ({ val, label, onUp, onDown, format }: { val: number, label: string, onUp: () => void, onDown: () => void, format?: boolean }) => (
    <div className={`flex-1 grid grid-cols-[1fr_auto] items-stretch rounded-xl border ${bgClass} overflow-hidden`}>
      <div className="flex flex-col items-center justify-center py-2.5">
        <span className="text-xl font-black leading-none">{format ? String(val).padStart(2, '0') : val}</span>
        <span className={`text-[9px] font-bold mt-1 leading-none ${labelClass}`}>{label}</span>
      </div>
      <div className={`flex flex-col border-l ${isDark ? "border-white/10" : "border-black/10"}`}>
        <button 
          onClick={(e) => { e.preventDefault(); onUp(); }} 
          className={`flex-1 px-2.5 flex items-center justify-center transition-colors border-b ${isDark ? "border-white/10" : "border-black/10"} ${hoverClass}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); onDown(); }} 
          className={`flex-1 px-2.5 flex items-center justify-center transition-colors ${hoverClass}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <Stepper 
        val={hours} 
        label="HRS" 
        onUp={() => setTime(hours + 1, minutes)} 
        onDown={() => setTime(hours - 1, minutes)} 
      />
      <span className={`font-black text-xl mb-3 ${colonClass}`}>:</span>
      <Stepper 
        val={minutes} 
        label="MIN" 
        format={true}
        onUp={() => setTime(hours, minutes + 1)} 
        onDown={() => setTime(hours, minutes - 1)} 
      />
    </div>
  );
}
