import React, { useState, useEffect } from 'react';
import { Material, MaterialQuizQuestion, SubjectId } from '../../types';
import { submitQuizAttempt, generateMoreQuizQuestions, regenerateMaterial } from '../../services/api';
import { triggerPetalsCelebration } from '../../utils/confetti';
import {
  Sparkles,
  Timer,
  CheckCircle2,
  XCircle,
  RotateCcw,
  PlusCircle,
  Award,
  ChevronRight,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Flame,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizTabProps {
  material: Material;
  subjectId: SubjectId;
  onRefreshMaterial: () => Promise<void>;
  reducedMotion?: boolean;
}

export const QuizTab: React.FC<QuizTabProps> = ({
  material,
  subjectId,
  onRefreshMaterial,
  reducedMotion = false,
}) => {
  const [questions, setQuestions] = useState<MaterialQuizQuestion[]>(
    material.quizQuestions || []
  );
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<
    { questionId: string; selectedIndex: number; isCorrect: boolean }[]
  >([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Timer toggle
  const [isTimerEnabled, setIsTimerEnabled] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  // Filter mode: "all" or "missed_only"
  const [isRetryingMissed, setIsRetryingMissed] = useState<boolean>(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState<boolean>(false);

  const handleRetryQuiz = async () => {
    setIsGeneratingMore(true);
    try {
      await regenerateMaterial(material.id, 'quiz');
      await onRefreshMaterial();
    } catch (e) {
      console.error('Quiz regenerate failed', e);
    } finally {
      setIsGeneratingMore(false);
    }
  };

  // Sync questions from prop if material updates
  useEffect(() => {
    if (material.quizQuestions && material.quizQuestions.length > 0) {
      setQuestions(material.quizQuestions);
    }
  }, [material.quizQuestions]);

  // Stopwatch timer
  useEffect(() => {
    if (!isTimerEnabled || isFinished) return;
    const interval = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerEnabled, isFinished]);

  // ========================================================
  // EXPLICIT STATES: QUEUED, PROCESSING, FAILED, EMPTY
  // ========================================================

  if (material.quizStatus === 'queued') {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-fadeIn">
        <div className="p-8 sm:p-10 rounded-[32px] bg-gradient-to-br from-[#FFF9F0] via-[#FFFDF9] to-[#F5EDFA] border-2 border-[#EADBBF] shadow-storybook space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#E7DCFF] border-2 border-[#B196F5] flex items-center justify-center shadow-md animate-pulse">
            <Sparkles className="w-9 h-9 text-[#6C3FE0]" />
          </div>
          <span className="px-4 py-1.5 rounded-full bg-white border border-[#EADBBF] text-[15px] font-display font-bold text-[#6C3FE0] inline-block">
            Quiz Queued 🌾
          </span>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#4A3566]">
            Questions Waiting in Garden Queue
          </h3>
          <p className="text-[17px] font-body text-[#6C538C] leading-relaxed max-w-lg mx-auto">
            Preparing 12 strictly grounded questions based directly on your professor's slides. Sprouting shortly...
          </p>
          <div className="flex items-center justify-center gap-2 text-xs font-display font-bold text-[#855627] pt-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#855627]" />
            <span>Connecting with garden engine...</span>
          </div>
        </div>
      </div>
    );
  }

  if (material.quizStatus === 'processing') {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-fadeIn">
        <div className="p-8 sm:p-10 rounded-[32px] bg-gradient-to-br from-[#FFF9F0] via-[#FFFDF9] to-[#DBF5E7] border-2 border-[#83D9A7] shadow-storybook space-y-5">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#E7DCFF] border-2 border-[#B196F5] flex items-center justify-center shadow-md">
            <Loader2 className="w-10 h-10 text-[#6C3FE0] animate-spin" />
          </div>
          <span className="px-4 py-1.5 rounded-full bg-white border border-[#83D9A7] text-[15px] font-display font-bold text-[#1F8C4F] inline-block">
            Crafting Questions 🌸
          </span>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#4A3566]">
            Formulating Grounded Questions
          </h3>
          <p className="text-[17px] font-body text-[#6C538C] max-w-md mx-auto leading-relaxed">
            Drafting 12 scenario-based multiple choice questions and detailed explanations grounded in your lecture notes.
          </p>
          <div className="space-y-1.5 max-w-md mx-auto">
            <div className="relative w-full h-3 rounded-full bg-[#EAD7BA] p-0.5 border border-[#855627]/30 shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-500 animate-pulse"
                style={{
                  width: '65%',
                  background: 'linear-gradient(90deg, #83D9A7 0%, #9670F5 100%)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (material.quizStatus === 'failed') {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-fadeIn">
        <div className="p-8 sm:p-10 rounded-[32px] bg-[#FFF5F5] border-2 border-[#FEB2B2] shadow-storybook space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-white border-2 border-[#FC8181] flex items-center justify-center shadow-md">
            <AlertTriangle className="w-10 h-10 text-[#C53030]" />
          </div>
          <span className="px-4 py-1.5 rounded-full bg-white border border-[#FEB2B2] text-[15px] font-display font-bold text-[#C53030] inline-block">
            Quiz Generation Issue 🥀
          </span>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#742A2A]">
            Couldn't generate quiz questions
          </h3>
          <p className="text-[17px] font-body text-[#742A2A] leading-relaxed max-w-lg mx-auto">
            We encountered an issue generating grounded questions. Tap below to retry formulating quiz questions.
          </p>
          <div className="pt-2">
            <button
              onClick={handleRetryQuiz}
              disabled={isGeneratingMore}
              className="btn-storybook min-h-[48px] px-6 bg-gradient-to-r from-[#DBF5E7] to-[#FFF0B8] border-2 border-[#83D9A7] text-[#1F8C4F] text-[16px] font-bold shadow-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isGeneratingMore ? 'animate-spin' : ''}`} />
              <span>{isGeneratingMore ? 'Retrying Quiz...' : 'Retry Quiz Generation'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (material.quizStatus === 'empty' || questions.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-fadeIn">
        <div className="p-8 sm:p-10 rounded-[32px] bg-gradient-to-br from-[#FFF9F0] via-[#FFFDF9] to-[#F5EDFA] border-2 border-[#EADBBF] shadow-storybook space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#E7DCFF] border-2 border-[#B196F5] flex items-center justify-center shadow-md">
            <Sparkles className="w-9 h-9 text-[#6C3FE0]" />
          </div>
          <span className="px-4 py-1.5 rounded-full bg-white border border-[#EADBBF] text-[15px] font-display font-bold text-[#6C3FE0] inline-block">
            Quiz Ready to Bloom 🌸
          </span>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#4A3566]">
            12 Grounded Quiz Questions
          </h3>
          <p className="text-[17px] font-body text-[#6C538C] leading-relaxed max-w-lg mx-auto">
            Test your mastery of the frameworks, metrics, and concepts in this lecture with interactive multiple-choice questions.
          </p>
          <div className="pt-2">
            <button
              onClick={handleRetryQuiz}
              disabled={isGeneratingMore}
              className="btn-storybook min-h-[48px] px-6 bg-gradient-to-r from-[#DBF5E7] to-[#E7DCFF] border-2 border-[#83D9A7] text-[#1F8C4F] text-[16px] font-bold shadow-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGeneratingMore ? 'Formulating Questions...' : 'Generate 12 Grounded Questions'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  if (!currentQ) return null;

  const progressPercent = Math.min(
    100,
    ((currentIdx + 1) / Math.max(1, questions.length)) * 100
  );

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctAnswerIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
      triggerPetalsCelebration();
    }

    setUserAnswers((prev) => [
      ...prev,
      { questionId: currentQ.id, selectedIndex: idx, isCorrect },
    ]);
  };

  const handleNextQuestion = async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Quiz complete!
      setIsFinished(true);
      triggerPetalsCelebration();

      // Compute section breakdown & weak sections
      const sectionScores: Record<
        string,
        { sectionTitle: string; correct: number; total: number }
      > = {};

      questions.forEach((q) => {
        if (!sectionScores[q.sectionId]) {
          sectionScores[q.sectionId] = {
            sectionTitle: q.sectionTitle,
            correct: 0,
            total: 0,
          };
        }
        sectionScores[q.sectionId].total += 1;
      });

      userAnswers.forEach((ans) => {
        const q = questions.find((item) => item.id === ans.questionId);
        if (q && ans.isCorrect && sectionScores[q.sectionId]) {
          sectionScores[q.sectionId].correct += 1;
        }
      });

      const weakSections = Object.entries(sectionScores)
        .filter(([_, stats]) => stats.total > 0 && stats.correct / stats.total < 0.7)
        .map(([secId, stats]) => ({
          sectionId: secId,
          sectionTitle: stats.sectionTitle,
          correct: stats.correct,
          total: stats.total,
        }));

      const missedQuestionIds = userAnswers
        .filter((ans) => !ans.isCorrect)
        .map((ans) => ans.questionId);

      // Save attempt in SQLite
      await submitQuizAttempt(material.id, {
        score,
        totalQuestions: questions.length,
        weakSections,
        missedQuestionIds,
      });

      await onRefreshMaterial();
    }
  };

  const handleRetryMissed = () => {
    const missedIds = userAnswers
      .filter((ans) => !ans.isCorrect)
      .map((ans) => ans.questionId);
    const filtered = (material.quizQuestions || []).filter((q) =>
      missedIds.includes(q.id)
    );

    if (filtered.length > 0) {
      setQuestions(filtered);
      setCurrentIdx(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setUserAnswers([]);
      setIsFinished(false);
      setIsRetryingMissed(true);
    }
  };

  const handleGenerateMore = async () => {
    setIsGeneratingMore(true);
    try {
      const res = await generateMoreQuizQuestions(material.id);
      if (res.questions) {
        setQuestions(res.questions);
        setCurrentIdx(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setUserAnswers([]);
        setIsFinished(false);
        setIsRetryingMissed(false);
        await onRefreshMaterial();
      }
    } finally {
      setIsGeneratingMore(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Render Final Score Screen
  if (isFinished) {
    const percentage = Math.round((score / Math.max(1, questions.length)) * 100);
    const missedCount = questions.length - score;

    return (
      <div className="w-full max-w-2xl mx-auto py-8 px-4 text-center space-y-8 animate-fadeIn">
        <div className="p-8 sm:p-10 rounded-[32px] bg-gradient-to-br from-[#FFF9F0] via-[#FFFDF9] to-[#DBF5E7] border-2 border-[#83D9A7] shadow-storybook">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#FFF0B8] border-2 border-[#E6CB67] flex items-center justify-center shadow-md mb-4 animate-bob">
            <Award className="w-10 h-10 text-[#A67C0D]" />
          </div>

          <span className="px-4 py-1.5 rounded-full bg-white border border-[#83D9A7] text-[15px] font-display font-bold text-[#1F8C4F]">
            Garden Quiz Complete 🌸
          </span>

          <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#4A3566] mt-4 mb-2">
            Your Score: {score} / {questions.length}
          </h2>

          <p className="text-[18px] font-display font-bold text-[#1F8C4F]">
            {percentage}% Mastery • {percentage >= 85 ? 'Outstanding Scholarship!' : 'Great Practice Effort!'}
          </p>

          <p className="text-[16px] font-body text-[#6C538C] max-w-md mx-auto mt-2 leading-relaxed">
            Your quiz results and section mastery have been saved permanently in your garden database.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center flex-wrap gap-4">
          {missedCount > 0 && (
            <button
              onClick={handleRetryMissed}
              className="btn-storybook min-h-[50px] px-6 bg-white hover:bg-[#FFFDF0] border-2 border-[#EADBBF] text-[#855627] text-[16px] font-bold flex items-center gap-2 shadow-sm"
            >
              <RotateCcw className="w-4 h-4 text-[#855627]" />
              <span>Retry Missed Questions ({missedCount})</span>
            </button>
          )}

          <button
            onClick={handleGenerateMore}
            disabled={isGeneratingMore}
            className="btn-storybook min-h-[50px] px-7 bg-gradient-to-r from-[#D9C8FF] to-[#FFD6E0] border-2 border-[#B196F5] text-[#4A3566] text-[16px] font-bold flex items-center gap-2 shadow-storybook hover:scale-105 transition-all"
          >
            <PlusCircle className={`w-4 h-4 text-[#6C3FE0] ${isGeneratingMore ? 'animate-spin' : ''}`} />
            <span>Generate 10 More Questions</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="p-8 text-center text-[17px] font-display text-[#855627]">
        Loading quiz questions from this material...
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-6 px-4 space-y-6">
      {/* Top Quiz Header: Difficulty badge, Source Chip, Timer toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-[#FFF9F0] border border-[#EADBBF]">
        <div className="flex items-center gap-2">
          {/* Difficulty Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-wider border shadow-2xs ${
              currentQ.difficulty === 'very_hard'
                ? 'bg-[#FED7D7] border-[#FEB2B2] text-[#9B2C2C]'
                : currentQ.difficulty === 'hard'
                ? 'bg-[#FEEBC8] border-[#FBD38D] text-[#C05621]'
                : 'bg-[#C6F6D5] border-[#9AE6B4] text-[#22543D]'
            }`}
          >
            {currentQ.difficulty === 'very_hard'
              ? 'Very Hard • Case Analysis'
              : currentQ.difficulty === 'hard'
              ? 'Hard Application'
              : 'Medium Difficulty'}
          </span>

          {/* Source Chip */}
          <span className="px-3 py-1 rounded-full text-xs font-display font-bold bg-white border border-[#EADBBF] text-[#855627]">
            {currentQ.sourceChip}
          </span>
        </div>

        {/* Right: Question counter & Timer */}
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-display font-bold text-[#855627]">
            Question {currentIdx + 1} of {questions.length}
          </span>

          <button
            onClick={() => setIsTimerEnabled(!isTimerEnabled)}
            className={`px-3 py-1 rounded-full text-xs font-display font-semibold border flex items-center gap-1.5 transition-colors ${
              isTimerEnabled
                ? 'bg-[#E7DCFF] border-[#B196F5] text-[#6C3FE0]'
                : 'bg-white border-[#EADBBF] text-[#855627]'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>{isTimerEnabled ? formatTimer(secondsElapsed) : 'Timer'}</span>
          </button>
        </div>
      </div>

      {/* Gentle Botanical Vine Progress Bar */}
      <div className="relative w-full h-3 rounded-full bg-[#EAD7BA] p-0.5 border border-[#855627]/30 shadow-inner">
        <div
          className="h-full rounded-full transition-all duration-300 flex items-center justify-end"
          style={{
            width: `${Math.max(5, progressPercent)}%`,
            background: 'linear-gradient(90deg, #83D9A7 0%, #9670F5 50%, #FFD6E0 100%)',
          }}
        >
          <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-[#9670F5] shadow-xs translate-x-1" />
        </div>
      </div>

      {/* Question Card (20px font, highly readable) */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-white border-2 border-[#EADBBF] shadow-sm space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-display font-bold text-[#855627] uppercase tracking-wider">
            {currentQ.sectionTitle}
          </span>
          <h3 className="text-[20px] sm:text-[22px] font-display font-bold text-[#3B234A] leading-[1.6]">
            {currentQ.question}
          </h3>
        </div>

        {/* Options list */}
        <div className="space-y-3">
          {currentQ.options?.map((option, optIdx) => {
            const isSelected = selectedOption === optIdx;
            const isCorrect = optIdx === currentQ.correctAnswerIndex;

            let btnStyle = 'bg-[#FFFDF9] border-2 border-[#EADBBF] text-[#3B234A] hover:bg-[#FFF5E4] hover:border-[#D4A373]';

            if (isAnswered) {
              if (isCorrect) {
                btnStyle = 'bg-[#DEF7EC] border-2 border-[#31C48D] text-[#03543F] font-bold shadow-xs';
              } else if (isSelected && !isCorrect) {
                btnStyle = 'bg-[#FDE8E8] border-2 border-[#F98080] text-[#9B1C1C]';
              } else {
                btnStyle = 'bg-[#F9FAFB] border border-[#E5E7EB] text-[#9CA3AF] opacity-60';
              }
            }

            return (
              <button
                key={optIdx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl transition-all flex items-start gap-3.5 text-[17px] font-body leading-[1.6] ${btnStyle}`}
              >
                <span className="w-7 h-7 rounded-full bg-white/90 border border-current flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="flex-1">{option}</span>
                {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-[#31C48D] shrink-0 mt-1" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-[#F98080] shrink-0 mt-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Instant Feedback & Step-by-Step Explanation */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className={`p-6 sm:p-7 rounded-[28px] border-2 shadow-sm space-y-4 ${
              selectedOption === currentQ.correctAnswerIndex
                ? 'bg-[#DEF7EC]/80 border-[#31C48D]'
                : 'bg-[#FFF5E4] border-[#F5A97D]'
            }`}
          >
            {/* Encouraging Feedback Heading */}
            <div className="flex items-center gap-2.5">
              {selectedOption === currentQ.correctAnswerIndex ? (
                <>
                  <Sparkles className="w-6 h-6 text-[#1F8C4F]" />
                  <h4 className="font-display font-bold text-[20px] text-[#03543F]">
                    Sparkling Insight! Correct!
                  </h4>
                </>
              ) : (
                <>
                  <BookOpen className="w-6 h-6 text-[#855627]" />
                  <h4 className="font-display font-bold text-[20px] text-[#855627]">
                    Good learning attempt! Here is the slide breakdown:
                  </h4>
                </>
              )}
            </div>

            {/* Simple Step-by-Step Explanation */}
            <div className="p-4 rounded-2xl bg-white border border-[#EADBBF] space-y-1">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[#1F8C4F]">
                Step-by-step simple explanation
              </span>
              <p className="text-[17px] font-body text-[#3B234A] leading-[1.65]">
                {currentQ.explanationSimple}
              </p>
            </div>

            {/* Why Each Wrong Option is Wrong */}
            {currentQ.wrongOptionsAnalysis && currentQ.wrongOptionsAnalysis.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/90 border border-[#EADBBF] space-y-2">
                <span className="text-xs font-display font-bold uppercase tracking-wider text-[#C05621]">
                  Why other choices are incorrect:
                </span>
                <ul className="space-y-1.5 text-[15px] font-body text-[#4A3566]">
                  {currentQ.wrongOptionsAnalysis.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-bold text-[#855627] shrink-0">•</span>
                      <span>
                        <strong>"{item.optionText.slice(0, 36)}...":</strong> {item.whyWrong}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Question Action Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNextQuestion}
                className="btn-storybook min-h-[48px] px-7 bg-gradient-to-r from-[#D9C8FF] to-[#FFD6E0] border-2 border-[#B196F5] text-[#4A3566] text-[16px] font-bold shadow-storybook flex items-center gap-2 hover:scale-105 transition-all"
              >
                <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'View Results 🌸'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
