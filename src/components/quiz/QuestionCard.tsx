import React from 'react';
import type { Question } from '../../data/questions';

interface QuestionCardProps {
  question: Question;
  selectedIndex: number | null;
  onSelectOption: (index: number) => void;
  onSkip: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

export default function QuestionCard({
  question,
  selectedIndex,
  onSelectOption,
  onSkip,
  onNext,
  isLastQuestion
}: QuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-brand-surface-container overflow-hidden flex flex-col flex-grow">
      {/* Question Text Area */}
      <div className="p-6 pb-4 flex-grow flex items-center justify-center min-h-[160px] quiz-no-select"
           onContextMenu={(e) => e.preventDefault()}
           onCopy={(e) => e.preventDefault()}>
        <h3 className="text-center font-bold text-xl leading-snug text-gray-900">
          {question.text}
        </h3>
      </div>

      {/* Divider */}
      <div className="px-6">
        <div className="w-full h-px bg-gray-100 mb-4"></div>
      </div>

      {/* Options */}
      <div className="px-6 space-y-3 pb-6 quiz-no-select"
           onContextMenu={(e) => e.preventDefault()}
           onCopy={(e) => e.preventDefault()}>
        {question.options.map((optionText, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => onSelectOption(idx)}
              className={`w-full text-center py-3.5 px-4 rounded-xl border-2 transition-all duration-200 font-semibold text-sm
                ${isSelected 
                  ? 'border-brand-primary bg-brand-surface text-brand-primary shadow-sm' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              {optionText}
            </button>
          );
        })}
      </div>

      {/* Actions (Skip / Next) */}
      <div className="mt-auto px-6 py-5 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
        <button
          onClick={onSkip}
          className="flex-1 py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-colors text-brand-primary bg-red-50 hover:bg-red-100 border border-red-100"
        >
          SKIP
        </button>
        <button
          onClick={onNext}
          disabled={selectedIndex === null}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-colors flex justify-center items-center gap-1.5
            ${selectedIndex === null
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-brand-primary hover:bg-[#8e221f] text-white shadow-md'
            }`}
        >
          {isLastQuestion ? 'SUBMIT' : 'NEXT'}
          {selectedIndex !== null && !isLastQuestion && (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          )}
        </button>
      </div>
    </div>
  );
}
