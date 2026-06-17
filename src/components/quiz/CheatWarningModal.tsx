import React from 'react';

interface CheatWarningModalProps {
  onDismiss: () => void;
}

export default function CheatWarningModal({ onDismiss }: CheatWarningModalProps) {
  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border-2 border-brand-primary animate-shake">
        <div className="w-16 h-16 bg-red-100 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        </div>
        
        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Warning: Tab Switch Detected</h2>
        
        <p className="text-gray-600 text-center text-sm mb-6 leading-relaxed">
          We noticed you left the quiz screen. Please stay on this page! 
          <br/><br/>
          <strong className="text-brand-primary">Leaving again will automatically end your attempt.</strong>
        </p>

        <button 
          onClick={onDismiss}
          className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-lg shadow-md transition-colors uppercase tracking-wide text-sm"
        >
          I Understand — Continue Quiz
        </button>
      </div>
    </div>
  );
}
