import React from 'react';

interface TimerDisplayProps {
  secondsLeft: number;
}

export default function TimerDisplay({ secondsLeft }: TimerDisplayProps) {
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  const formattedTime = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  let bgClass = "bg-[#110e0e]"; // Dark rounded pill
  let textClass = "text-white";
  let pulseClass = "";

  if (secondsLeft <= 30) {
    bgClass = "bg-red-600";
    pulseClass = "animate-pulse";
  } else if (secondsLeft <= 120) {
    bgClass = "bg-orange-500";
  }

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${bgClass} ${textClass} ${pulseClass} shadow-sm transition-colors duration-500`}>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <span className="font-mono font-bold text-sm leading-none">{formattedTime}</span>
    </div>
  );
}
