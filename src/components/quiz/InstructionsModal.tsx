import React from 'react';

interface InstructionsModalProps {
  onStart: () => void;
}

export default function InstructionsModal({ onStart }: InstructionsModalProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-brand-surface w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-brand-surface-container animate-fade-in-up">
        <h2 className="text-xl font-bold text-brand-primary mb-4 text-center">Before You Begin</h2>
        
        <div className="space-y-5 text-sm text-gray-700 mb-8 px-2">
          <ul className="space-y-4 list-none">
            <li className="flex items-start gap-3">
              <span className="text-brand-primary mt-0.5 text-xl">⚽</span>
              <p>You will be asked <strong>5 random questions</strong>.</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-primary mt-0.5 text-xl">⏳</span>
              <p>You have exactly <strong>20 seconds per question</strong> to lock in your answer.</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-brand-primary mt-0.5 text-xl">🤝</span>
              <p>
                <strong>Football is all about sportsmanship. So don't cheat.</strong><br/>
                Please do not switch tabs, minimize this window, or reload the page, as doing so will end your attempt.
              </p>
            </li>
          </ul>
        </div>  
        <p className="text-center font-bold text-lg pt-2">Good luck! 🍀</p>

        <button 
          onClick={onStart}
          className="w-full mt-6 bg-brand-primary hover:bg-[#8e221f] text-white font-bold py-3.5 rounded-lg shadow-md transition-colors uppercase tracking-wide text-sm"
        >
          I'm Ready — Start Quiz
        </button>
      </div>
    </div>
  );
}
