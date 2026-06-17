import React, { useState, useEffect, useRef } from 'react';
import { QUESTIONS, type Question } from '../../data/questions';
import { EVENT_NAME, QUESTION_TIMER_SECONDS, TOTAL_QUESTIONS_PER_QUIZ } from '../../data/eventConfig';
import { 
  getParticipant, 
  saveResult, 
  clearSession, 
  type AnsweredQuestion,
  type QuizResultData
} from '../../utils/sessionState';
import { submitParticipant } from '../../utils/submission';
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
  
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_TIMER_SECONDS);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);

  // Use refs for values that need to be accessed in event listeners without stale closures
  const isQuizActiveRef = useRef(false);
  const violationCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const currentSelectionRef = useRef(currentSelection);
  const currentIndexRef = useRef(currentIndex);
  const questionsRef = useRef(questions);
  const hasSubmittedRef = useRef(false);

  // Keep refs up to date
  useEffect(() => {
    isQuizActiveRef.current = isQuizActive;
    currentSelectionRef.current = currentSelection;
    currentIndexRef.current = currentIndex;
    questionsRef.current = questions;
  }, [isQuizActive, currentSelection, currentIndex, questions]);

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
            if (timerRef.current !== null) {
              clearInterval(timerRef.current);
            }
            // Defer side effect outside of the React state updater
            setTimeout(handleTimeUp, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isQuizActive && timerRef.current !== null) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [isQuizActive, currentIndex]); // Restart interval on new question

  const handleStart = () => {
    setShowInstructions(false);
    setQuestions(shuffleArray(QUESTIONS).slice(0, TOTAL_QUESTIONS_PER_QUIZ));
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

  const recordAnswer = (selectedIndex: number | null, overrideIndex?: number) => {
    const idx = overrideIndex !== undefined ? overrideIndex : currentIndex;
    const q = questionsRef.current[idx];
    if (!q) return;
    setAnswers(prev => [...prev, {
      questionId: q.id,
      selectedIndex
    }]);
  };

  const advanceQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentSelection(null);
      setSecondsLeft(QUESTION_TIMER_SECONDS);
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
    const idx = currentIndexRef.current;
    // Treat the current unsubmitted selection as submitted if it exists, otherwise skipped
    recordAnswer(currentSelectionRef.current, idx);
    
    if (idx < questionsRef.current.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentSelection(null);
      setSecondsLeft(QUESTION_TIMER_SECONDS);
    } else {
      finishQuiz(true);
    }
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

      if (!hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        const participant = getParticipant();
        if (participant) {
          const hasAlreadySubmittedScore = typeof sessionStorage !== 'undefined' && sessionStorage.getItem("score_submitted") === "true";
          
          if (!hasAlreadySubmittedScore) {
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.setItem("score_submitted", "true");
            }
            
            // Show loader
            setIsSubmittingScore(true);

            // Submit the final score before redirecting
            submitParticipant({ ...participant, team: participant.team || '', score, action: 'update_score' }).then(() => {
              window.location.replace('/result');
            }).catch(err => {
              console.error("Score submission failed:", err);
              window.location.replace('/result');
            });
          } else {
            // Already submitted the first attempt, just go to results
            window.location.replace('/result');
          }
        } else {
          window.location.replace('/result');
        }
      }

      return finalAnswers;
    });
  };

  if (isInitializing) return null;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-brand-surface-container flex flex-col font-sans relative">
      {isSubmittingScore && (
        <div className="absolute inset-0 z-[100] bg-brand-surface/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold text-brand-primary font-heading uppercase tracking-wider">Calculating Final Score...</h2>
          <p className="text-brand-on-surface/70 mt-2 text-sm">Please wait while we secure your results.</p>
        </div>
      )}

      {showInstructions && <InstructionsModal onStart={handleStart} />}
      {showCheatWarning && <CheatWarningModal onDismiss={() => setShowCheatWarning(false)} />}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand-surface py-3 px-5 flex items-center justify-between border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/images/title-logo.png" alt="Logo" className="h-7 w-auto object-contain" />
          <h1 className="font-serif font-black text-xl text-brand-primary tracking-wider uppercase">
            STUDENTS INDIA
          </h1>
        </div>
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
