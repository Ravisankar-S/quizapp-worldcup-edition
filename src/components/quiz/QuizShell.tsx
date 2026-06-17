import React, { useState, useEffect, useRef } from 'react';
import { QUESTIONS, type Question } from '../../data/questions';
import { EVENT_NAME, QUIZ_DURATION_SECONDS } from '../../data/eventConfig';
import { 
  getParticipant, 
  saveResult, 
  clearSession, 
  type AnsweredQuestion,
  type QuizResultData
} from '../../utils/sessionState';
import { markQuizActive, markQuizComplete, wasQuizActiveBeforeReload } from '../../utils/antiCheat';
import { shuffleArray } from '../../utils/shuffle';

import InstructionsModal from './InstructionsModal';
import CheatWarningModal from './CheatWarningModal';
import TimerDisplay from './TimerDisplay';
import ProgressBar from './ProgressBar';
import QuestionCard from './QuestionCard';

export default function QuizShell() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCheatWarning, setShowCheatWarning] = useState(false);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnsweredQuestion[]>([]);
  const [currentSelection, setCurrentSelection] = useState<number | null>(null);
  
  const [secondsLeft, setSecondsLeft] = useState(QUIZ_DURATION_SECONDS);
  const [isQuizActive, setIsQuizActive] = useState(false);

  // Use refs for values that need to be accessed in event listeners without stale closures
  const isQuizActiveRef = useRef(false);
  const violationCountRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep ref up to date
  useEffect(() => {
    isQuizActiveRef.current = isQuizActive;
  }, [isQuizActive]);

  // Initialization & Reload Check
  useEffect(() => {
    const participant = getParticipant();
    if (!participant) {
      window.location.replace('/register');
      return;
    }

    if (wasQuizActiveBeforeReload()) {
      // User reloaded mid-quiz -> immediate ejection
      handleEjection();
      return;
    }

    setShowInstructions(true);
    setIsInitializing(false);

    // Add CSS utility dynamically or rely on global.css (we use quiz-no-select classes inline too)
    document.body.classList.add('select-none');
    return () => {
      document.body.classList.remove('select-none');
    };
  }, []);

  // Anti-cheat Listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isQuizActiveRef.current) return;
      if (document.hidden) {
        handleViolation();
      }
    };

    const handleBlur = () => {
      if (!isQuizActiveRef.current) return;
      // Note: blur can sometimes fire falsely on mobile when touching UI, 
      // but standard is to track it.
      handleViolation();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Timer Logic
  useEffect(() => {
    if (isQuizActive && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isQuizActive && timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isQuizActive]);

  const handleStart = () => {
    setShowInstructions(false);
    setQuestions(shuffleArray(QUESTIONS));
    setIsQuizActive(true);
    markQuizActive();
  };

  const handleViolation = () => {
    violationCountRef.current += 1;
    if (violationCountRef.current === 1) {
      setShowCheatWarning(true);
    } else {
      handleEjection();
    }
  };

  const handleEjection = () => {
    setIsQuizActive(false);
    clearSession();
    window.location.replace('/');
  };

  const recordAnswer = (selectedIndex: number | null) => {
    const q = questions[currentIndex];
    setAnswers(prev => [...prev, {
      questionId: q.id,
      selectedIndex
    }]);
  };

  const advanceQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentSelection(null);
    } else {
      finishQuiz();
    }
  };

  const handleNext = () => {
    if (currentSelection === null) return;
    recordAnswer(currentSelection);
    advanceQuestion();
  };

  const handleSkip = () => {
    recordAnswer(null);
    advanceQuestion();
  };

  const handleTimeUp = () => {
    setIsQuizActive(false);
    // Treat the current unsubmitted selection as submitted if it exists, otherwise skipped
    recordAnswer(currentSelection);
    finishQuiz(true);
  };

  const finishQuiz = (fromTimeout = false) => {
    setIsQuizActive(false);
    markQuizComplete();

    // Use current state for calculations if not from timeout, 
    // but if from timeout we might have just appended the last answer in handleTimeUp.
    // Wait for state to settle, or calculate directly using the accumulated list + current selection.
    
    // Calculate safely using the callback approach to ensure we have the absolute final answers array
    setAnswers(finalAnswers => {
      let score = 0;
      let skippedCount = 0;
      
      finalAnswers.forEach(ans => {
        if (ans.selectedIndex === null) {
          skippedCount++;
        } else {
          // Find original question to check correct index
          const q = QUESTIONS.find(q => q.id === ans.questionId);
          if (q && q.correctAnswerIndex === ans.selectedIndex) {
            score += 1; // 1 point per correct answer
          }
        }
      });

      // Fill in remaining unreached questions as skipped
      const unreachedCount = questions.length - finalAnswers.length;
      skippedCount += unreachedCount;

      const resultData: QuizResultData = {
        score,
        maxScore: questions.length,
        skippedCount,
        answers: finalAnswers,
        shuffledQuestionIds: questions.map(q => q.id)
      };

      saveResult(resultData);
      window.location.replace('/result');
      return finalAnswers;
    });
  };

  if (isInitializing) return null;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-brand-surface-container flex flex-col font-sans">
      {showInstructions && <InstructionsModal onStart={handleStart} />}
      {showCheatWarning && <CheatWarningModal onDismiss={() => setShowCheatWarning(false)} />}

      {/* Header */}
      <header className="bg-brand-surface py-3 px-5 flex items-center justify-between border-b border-gray-200 shadow-sm relative z-10">
        <h1 className="font-serif font-black text-xl text-brand-primary tracking-wider uppercase">
          STUDENTS INDIA
        </h1>
        {isQuizActive && <TimerDisplay secondsLeft={secondsLeft} />}
      </header>

      {/* Main Quiz Area */}
      {isQuizActive && currentQuestion && (
        <main className="flex-grow flex flex-col px-4 py-6 md:px-8 max-w-lg mx-auto w-full relative z-0">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
          
          <QuestionCard
            question={currentQuestion}
            selectedIndex={currentSelection}
            onSelectOption={setCurrentSelection}
            onSkip={handleSkip}
            onNext={handleNext}
            isLastQuestion={currentIndex === questions.length - 1}
          />
        </main>
      )}
    </div>
  );
}
