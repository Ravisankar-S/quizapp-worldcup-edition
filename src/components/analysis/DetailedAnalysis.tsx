import React, { useEffect, useState } from 'react';
import { QUESTIONS, type Question } from '../../data/questions';
import { getResult, getParticipant } from '../../utils/sessionState';
import { TEAMS } from '../../data/registrationData';

type Tab = 'WRONG' | 'RIGHT' | 'ALL';

export default function DetailedAnalysis() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [participant, setParticipant] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>('ALL');

  useEffect(() => {
    const r = getResult();
    const p = getParticipant();
    if (!r) {
      window.location.replace('/');
      return;
    }
    setResult(r);
    setParticipant(p);
    setIsInitializing(false);
  }, []);

  if (isInitializing || !result) return null;

  // Reconstruct the ordered list of questions as presented to the user
  const orderedQuestions: { question: Question; selectedIndex: number | null }[] = [];

  result.shuffledQuestionIds.forEach((id: number) => {
    const q = QUESTIONS.find(q => q.id === id);
    if (q) {
      const answerRecord = result.answers.find((a: any) => a.questionId === id);
      orderedQuestions.push({
        question: q,
        selectedIndex: answerRecord ? answerRecord.selectedIndex : null
      });
    }
  });

  const filteredQuestions = orderedQuestions.filter(item => {
    const isCorrect = item.selectedIndex === item.question.correctAnswerIndex;
    if (activeTab === 'RIGHT') return isCorrect;
    if (activeTab === 'WRONG') return !isCorrect; // Includes skipped (null) and actually wrong
    return true; // 'ALL'
  });

  const rightCount = orderedQuestions.filter(item => item.selectedIndex === item.question.correctAnswerIndex).length;
  const wrongCount = orderedQuestions.length - rightCount; // Includes skipped

  return (
    <div className="min-h-screen bg-brand-surface-container flex flex-col font-sans pb-16">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-brand-primary/10 py-3 px-4 flex items-center justify-center">
        <button 
          onClick={() => window.location.href = '/result'}
          className="flex items-center justify-center text-brand-primary hover:bg-gray-50 w-10 h-10 rounded-lg transition-colors absolute left-4"
          aria-label="Back to Results"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        
        <div className="flex items-center gap-2 md:gap-3">
          <img src="/images/title-logo.png" alt="Logo" className="h-6 md:h-8 w-auto object-contain" />
          <h1 className="font-heading font-black text-brand-primary text-base md:text-xl tracking-wider uppercase">
            STUDENTS INDIA
          </h1>
        </div>
        
        {participant?.team && (
          <div className="absolute right-4 md:right-8 text-2xl pointer-events-none" title={participant.team}>
            {TEAMS.find(t => t.name === participant.team)?.emoji}
          </div>
        )}
      </header>

      <main className="flex-grow w-full max-w-xl mx-auto px-4 py-6">

        {/* Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm border border-brand-surface-container p-1.5 mb-6">
          <button
            onClick={() => setActiveTab('WRONG')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors flex justify-center items-center gap-1.5
              ${activeTab === 'WRONG' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            Wrong/Skip <span className="opacity-60 text-xs px-1.5 py-0.5 bg-black/5 rounded-full">{wrongCount}</span>
          </button>
          <button
            onClick={() => setActiveTab('RIGHT')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors flex justify-center items-center gap-1.5
              ${activeTab === 'RIGHT' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            Right <span className="opacity-60 text-xs px-1.5 py-0.5 bg-black/5 rounded-full">{rightCount}</span>
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors flex justify-center items-center gap-1.5
              ${activeTab === 'ALL' ? 'bg-brand-surface text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            All <span className="opacity-60 text-xs px-1.5 py-0.5 bg-black/5 rounded-full">{orderedQuestions.length}</span>
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No questions found for this category.
            </div>
          ) : (
            filteredQuestions.map((item, idx) => {
              const q = item.question;
              const selectedIdx = item.selectedIndex;
              const correctIdx = q.correctAnswerIndex;
              const isCorrectlyAnswered = selectedIdx === correctIdx;
              const isSkipped = selectedIdx === null;

              return (
                <div key={q.id} className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-brand-surface-container">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold tracking-widest text-brand-neutral uppercase">
                      Question {orderedQuestions.findIndex(oq => oq.question.id === q.id) + 1}
                    </span>
                    {isSkipped && (
                      <span className="text-[10px] font-bold tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded-md uppercase">
                        Skipped
                      </span>
                    )}
                    {!isSkipped && isCorrectlyAnswered && (
                      <span className="text-[10px] font-bold tracking-wider text-green-700 bg-green-100 px-2 py-1 rounded-md uppercase flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        Correct
                      </span>
                    )}
                    {!isSkipped && !isCorrectlyAnswered && (
                      <span className="text-[10px] font-bold tracking-wider text-red-600 bg-red-100 px-2 py-1 rounded-md uppercase flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        Incorrect
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg md:text-xl leading-snug mb-5">
                    {q.text}
                  </h3>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedIdx === optIdx;
                      const isCorrectOpt = correctIdx === optIdx;

                      // Base classes
                      let bgClass = "bg-gray-50";
                      let borderClass = "border-gray-100";
                      let textClass = "text-gray-700";
                      let icon = null;

                      if (isCorrectOpt) {
                        bgClass = "bg-green-50";
                        borderClass = "border-green-300";
                        textClass = "text-green-800 font-bold";
                        icon = <svg className="text-green-600 ml-auto" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
                      } else if (isSelected && !isCorrectOpt) {
                        bgClass = "bg-red-50";
                        borderClass = "border-red-300";
                        textClass = "text-red-700 font-bold";
                        icon = <svg className="text-red-600 ml-auto" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
                      }

                      return (
                        <div key={optIdx} className={`w-full text-left py-3.5 px-4 rounded-xl border flex items-center gap-3 text-sm md:text-base ${bgClass} ${borderClass} ${textClass}`}>
                          <span className="flex-grow">{opt}</span>
                          {icon}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={() => window.location.href = '/result'}
          className="w-full mt-8 bg-brand-primary hover:bg-[#8e221f] text-white font-bold py-4 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2 uppercase tracking-wide text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          BACK TO RESULTS
        </button>

      </main>
    </div>
  );
}
