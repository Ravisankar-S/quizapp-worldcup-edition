import React from 'react';

interface InstructionsModalProps {
  onStart: () => void;
}

export default function InstructionsModal({ onStart }: InstructionsModalProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-brand-surface w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-brand-surface-container animate-fade-in-up">
        <h2 className="text-xl font-bold text-brand-primary mb-4 text-center">Before You Begin</h2>
        
        <div className="space-y-4 text-sm text-brand-on-surface mb-8">
          <div className="bg-red-50 p-3 rounded-lg border border-red-100">
            <h3 className="font-bold text-red-700 flex items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              Anti-Cheat Active
            </h3>
            <p className="text-red-600 leading-relaxed">
              This quiz is timed and monitored. Please do not switch tabs, minimize this window, or reload the page once you begin — doing so may immediately end your attempt.
            </p>
          </div>
          
          <ul className="space-y-2 list-disc list-inside">
            <li>You have exactly <strong>10 minutes</strong>.</li>
            <li>Questions appear one at a time. No going back.</li>
            <li>You may skip questions if unsure.</li>
          </ul>
          
          <p className="text-center font-bold text-lg pt-2">Good luck! 🍀</p>
        </div>

        <button 
          onClick={onStart}
          className="w-full bg-brand-primary hover:bg-[#8e221f] text-white font-bold py-3.5 rounded-lg shadow-md transition-colors uppercase tracking-wide text-sm"
        >
          I'm Ready — Start Quiz
        </button>
      </div>
    </div>
  );
}
