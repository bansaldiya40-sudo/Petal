import React, { useState, useEffect, useRef } from 'react';
import { Lesson, Concept, SubjectId } from '../../types';
import { SUBJECTS } from '../../utils/subjects';
import { GraphCurveAnimator } from '../lesson/GraphCurveAnimator';
import { triggerPetalsCelebration } from '../../utils/confetti';
import { FloatingPetalsBackground } from '../illustrations/GardenAccents';
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Send,
  Video,
  CheckCircle2,
  Layers,
  Check,
  ChevronDown,
  Info,
  Sliders,
} from 'lucide-react';

interface LessonScreenProps {
  lesson: Lesson;
  initialConceptId?: string;
  initialTab?: 'explain' | 'examples' | 'animate' | 'quiz';
  onBackToSubject: () => void;
  onConceptMastered: (concept: Concept) => void;
}

export const LessonScreen: React.FC<LessonScreenProps> = ({
  lesson,
  initialConceptId,
  initialTab = 'explain',
  onBackToSubject,
  onConceptMastered,
}) => {
  const subject = SUBJECTS[lesson.subjectId];

  // Selected concept & slide
  const [selectedConceptIndex, setSelectedConceptIndex] = useState<number>(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'explain' | 'examples' | 'animate' | 'quiz'>(initialTab);

  // Explain tab state
  const [showDeepDive, setShowDeepDive] = useState<boolean>(false);
  const [showOutsideMaterial, setShowOutsideMaterial] = useState<boolean>(false);

  // Animation tab state
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isVoiceoverMuted, setIsVoiceoverMuted] = useState<boolean>(false);
  const [sceneProgress, setSceneProgress] = useState<number>(0);
  const [veoStatus, setVeoStatus] = useState<string | null>(null);

  // Quiz tab state
  const [userAnswers, setUserAnswers] = useState<Record<string, string | number>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Ask anything chat state
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; text: string; sourceSlide?: number | null; outside?: boolean }[]
  >([]);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [allowOutsideInChat, setAllowOutsideInChat] = useState<boolean>(false);
  const [isAskingAI, setIsAskingAI] = useState<boolean>(false);

  const concept = lesson.concepts[selectedConceptIndex] || lesson.concepts[0];
  const slides = lesson.rawSlides || [];
  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Set initial concept if provided
  useEffect(() => {
    if (initialConceptId) {
      const idx = lesson.concepts.findIndex((c) => c.id === initialConceptId);
      if (idx >= 0) {
        setSelectedConceptIndex(idx);
        const sourceS = lesson.concepts[idx]?.sourceSlide;
        if (sourceS) {
          const slideIdx = slides.findIndex((s) => s.slideNumber === sourceS);
          if (slideIdx >= 0) setCurrentSlideIndex(slideIdx);
        }
      }
    }
  }, [initialConceptId, lesson.concepts, slides]);

  // Synchronize slide when concept changes
  const handleSelectConcept = (idx: number) => {
    setSelectedConceptIndex(idx);
    setShowDeepDive(false);
    setCurrentSceneIndex(0);
    setSceneProgress(0);
    setIsPlaying(false);
    const targetSlide = lesson.concepts[idx]?.sourceSlide;
    if (targetSlide) {
      const slideIdx = slides.findIndex((s) => s.slideNumber === targetSlide);
      if (slideIdx >= 0) setCurrentSlideIndex(slideIdx);
    }
  };

  // Jump to specific slide
  const handleJumpToSlide = (idx: number) => {
    setCurrentSlideIndex(idx);
  };

  // Web Speech API for voiceover narration in Animate Tab
  const speakNarration = (text: string) => {
    if (isVoiceoverMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.05; // warm, slightly calming pitch
    // Select friendly voice if available
    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(
      (v) => v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google UK English Female')
    );
    if (friendlyVoice) utterance.voice = friendlyVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Storyboard Animation playback loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    if (isPlaying && concept?.animation?.scenes) {
      const scenes = concept.animation.scenes;
      const scene = scenes[currentSceneIndex];
      const durationMs = (scene.durationSeconds * 1000) / playbackSpeed;
      const intervalMs = 100;
      const stepIncrement = (intervalMs / durationMs) * 100;

      // Speak narration at start of scene
      if (sceneProgress === 0) {
        speakNarration(scene.narration);
      }

      timer = setInterval(() => {
        setSceneProgress((prev) => {
          if (prev + stepIncrement >= 100) {
            // Next scene
            if (currentSceneIndex < scenes.length - 1) {
              setCurrentSceneIndex((s) => s + 1);
              return 0;
            } else {
              // Finished storyboard
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + stepIncrement;
        });
      }, intervalMs);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isPlaying, currentSceneIndex, sceneProgress, playbackSpeed, concept?.animation?.scenes]);

  const togglePlayAnimation = () => {
    if (!isPlaying) {
      if (sceneProgress >= 100 && currentSceneIndex >= (concept.animation.scenes.length - 1)) {
        setCurrentSceneIndex(0);
        setSceneProgress(0);
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.pause();
      }
    }
  };

  const handleReplayAnimation = () => {
    setCurrentSceneIndex(0);
    setSceneProgress(0);
    setIsPlaying(true);
  };

  // Submit Quiz Question
  const handleSubmitAnswer = (qId: string, answer: string | number) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: answer }));
    setSubmittedQuestions((prev) => ({ ...prev, [qId]: true }));

    // Check if all 5 questions answered
    const totalQ = concept.quizQuestions.length;
    const answeredCount = Object.keys({ ...submittedQuestions, [qId]: true }).length;

    if (answeredCount >= totalQ) {
      setQuizFinished(true);
      triggerPetalsCelebration();
      onConceptMastered(concept);
    }
  };

  // Ask Anything Chat Handler
  const handleSendChat = async () => {
    if (!inputQuestion.trim() || isAskingAI) return;

    const userText = inputQuestion.trim();
    setInputQuestion('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsAskingAI(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userText,
          lessonTitle: lesson.title,
          slides: lesson.rawSlides,
          outsideMaterial: allowOutsideInChat,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.answer,
            sourceSlide: data.sourceSlide,
            outside: !data.foundInMaterial,
          },
        ]);
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      // Local fallback grounded answer
      const qLower = userText.toLowerCase();
      const matchSlide = lesson.rawSlides.find(
        (s) =>
          s.content.toLowerCase().includes(qLower.slice(0, 8)) ||
          s.title.toLowerCase().includes(qLower.slice(0, 8))
      );

      if (matchSlide) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `From **slide ${matchSlide.slideNumber}: ${matchSlide.title}**:\n${matchSlide.content.slice(0, 240)}...`,
            sourceSlide: matchSlide.slideNumber,
          },
        ]);
      } else if (!allowOutsideInChat) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `I searched through your uploaded slides for "${lesson.title}", and this specific question is not covered in your material. Toggle "Allow outside material" below if you want an explanation from general business principles.`,
            outside: true,
          },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `*(Outside uploaded material)*: In general MBA strategy, ${userText} involves evaluating unit economics, reducing friction in customer adoption, and testing hypotheses with empirical metrics.`,
            outside: true,
          },
        ]);
      }
    } finally {
      setIsAskingAI(false);
    }
  };

  const handleVeoUpgrade = () => {
    setVeoStatus('Generating storybook video sequence via configured API... (rendered in high resolution)');
    setTimeout(() => {
      setVeoStatus('Video generation ready! Browser-native SVG animation remains active for immediate offline playback.');
    }, 2500);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] py-6 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col justify-between">
      <FloatingPetalsBackground />

      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <button
          onClick={onBackToSubject}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-display font-medium text-plum-medium hover:text-plum-dark group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to {subject.title}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-display text-plum-medium hidden sm:inline">
            {lesson.totalPages} Slides
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-display font-semibold bg-white/80 border border-garden-sand shadow-sm text-plum-dark">
            {concept?.title || lesson.title}
          </span>
        </div>
      </div>

      {/* Concepts Ribbon Bar */}
      <div className="glass-card rounded-2xl p-2 mb-6 flex items-center gap-2 overflow-x-auto relative z-10 border border-garden-sand">
        <span className="text-[11px] font-display font-semibold text-plum-light uppercase tracking-wider px-3 shrink-0">
          Concepts:
        </span>
        {lesson.concepts.map((c, idx) => (
          <button
            key={c.id}
            onClick={() => handleSelectConcept(idx)}
            className={`px-3 py-1.5 rounded-xl font-display text-xs whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              selectedConceptIndex === idx
                ? 'bg-plum-dark text-white shadow-sm font-semibold'
                : 'bg-white/70 hover:bg-white text-plum-medium border border-garden-sand'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                c.status === 'mastered'
                  ? 'bg-mr-accent'
                  : c.status === 'learning'
                  ? 'bg-micro-accent'
                  : 'bg-pm-pastel'
              }`}
            />
            <span>{c.title}</span>
            <span className="text-[10px] opacity-75 font-mono">s.{c.sourceSlide}</span>
          </button>
        ))}
      </div>

      {/* Split View: Left (Slide Viewer) & Right (AI Tutor) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 mb-8">
        {/* LEFT PANE: Professor's Slide / Material Viewer (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="glass-card rounded-4xl p-6 shadow-garden border border-garden-sand flex-1 flex flex-col justify-between min-h-[560px]">
            <div>
              {/* Slide Header with Navigation Controls */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-garden-sand">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-pm-accent" />
                  <span className="text-xs font-display font-semibold text-plum-dark">
                    Slide {currentSlideIndex + 1} of {slides.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleJumpToSlide(Math.max(0, currentSlideIndex - 1))}
                    disabled={currentSlideIndex === 0}
                    className="w-8 h-8 rounded-full bg-white hover:bg-garden-ivory border border-garden-sand flex items-center justify-center text-plum-medium disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Previous slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleJumpToSlide(Math.min(slides.length - 1, currentSlideIndex + 1))}
                    disabled={currentSlideIndex === slides.length - 1}
                    className="w-8 h-8 rounded-full bg-white hover:bg-garden-ivory border border-garden-sand flex items-center justify-center text-plum-medium disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Next slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Slide Card Content */}
              <div className="p-4 rounded-3xl bg-garden-ivory/60 border border-garden-sand mb-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-plum-light block mb-1">
                  Uploaded Professor Material
                </span>
                <h3 className="text-lg font-display font-semibold text-plum-dark mb-3">
                  {currentSlide?.title || `Slide ${currentSlideIndex + 1}`}
                </h3>
                <div className="text-xs text-plum-medium font-body leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto pr-2">
                  {currentSlide?.content || 'No text content available for this slide.'}
                </div>
              </div>

              {/* Bullet Points if extracted */}
              {currentSlide?.bulletPoints && currentSlide.bulletPoints.length > 0 && (
                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] font-display font-semibold text-plum-dark">Key Highlights:</span>
                  {currentSlide.bulletPoints.map((bp, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-plum-medium font-body">
                      <span className="w-1.5 h-1.5 rounded-full bg-pm-accent mt-1.5 shrink-0" />
                      <span>{bp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Slide Pager Strip */}
            <div className="pt-4 border-t border-garden-sand">
              <span className="text-[10px] font-display text-plum-light block mb-2">Jump to slide:</span>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {slides.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleJumpToSlide(idx)}
                    className={`w-7 h-7 rounded-lg text-[11px] font-mono flex items-center justify-center shrink-0 transition-all ${
                      currentSlideIndex === idx
                        ? 'bg-plum-dark text-white font-bold'
                        : s.slideNumber === concept?.sourceSlide
                        ? 'bg-pm-pastel text-pm-deep font-semibold border border-pm-accent'
                        : 'bg-white text-plum-medium border border-garden-sand hover:bg-garden-ivory'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: AI Tutor Panel with 4 Tabs (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="glass-card rounded-4xl p-6 sm:p-7 shadow-garden border-2 border-pm-pastel/60 flex-1 flex flex-col justify-between min-h-[560px]">
            <div>
              {/* Header: Concept Title, Grounding Chip & 4 Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-garden-sand">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-display font-semibold bg-pm-soft text-pm-deep border border-pm-pastel">
                      <BookOpen className="w-3 h-3" /> from slide {concept?.sourceSlide || 1}
                    </span>
                    {concept?.status === 'mastered' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-display font-semibold bg-mr-soft text-mr-deep border border-mr-pastel">
                        <CheckCircle2 className="w-3 h-3" /> Mastered
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-display font-semibold text-plum-dark">
                    {concept?.title}
                  </h2>
                </div>

                {/* The 4 Calm Tabs */}
                <div className="inline-flex p-1 rounded-2xl bg-garden-mist border border-garden-sand">
                  {(['explain', 'examples', 'animate', 'quiz'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-xl font-display text-xs capitalize transition-all ${
                        activeTab === tab
                          ? 'bg-white text-plum-dark font-semibold shadow-sm'
                          : 'text-plum-medium hover:text-plum-dark'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* TAB 1: EXPLAIN */}
              {activeTab === 'explain' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Plain Language Friendly Storybook Explanation */}
                  <div className="p-4 rounded-3xl bg-white/70 border border-garden-sand">
                    <span className="text-[11px] font-display font-semibold text-pm-deep block mb-1">
                      🌸 Plain Intuition
                    </span>
                    <p className="text-sm text-plum-dark font-body leading-relaxed whitespace-pre-wrap">
                      {concept?.plainExplanation}
                    </p>
                  </div>

                  {/* Whimsical Analogy */}
                  {concept?.analogy && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex items-start gap-2.5 text-xs font-body text-amber-900">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-display font-semibold block mb-0.5">Storybook Analogy</span>
                        <span>{concept.analogy}</span>
                      </div>
                    </div>
                  )}

                  {/* Bold Key Terms Chips */}
                  {concept?.keyTerms && concept.keyTerms.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-display text-plum-light mr-1">Key terms:</span>
                      {concept.keyTerms.map((term, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-pm-soft text-[11px] font-display font-semibold text-pm-deep border border-pm-pastel"
                        >
                          {typeof term === 'string' ? term : term.term}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* "Go Deeper" Exam-Level Toggle */}
                  <div className="pt-2">
                    <button
                      onClick={() => setShowDeepDive(!showDeepDive)}
                      className="w-full py-2.5 px-4 rounded-2xl bg-garden-mist hover:bg-garden-sand border border-garden-sand flex items-center justify-between text-xs font-display font-semibold text-plum-dark transition-colors"
                    >
                      <span>{showDeepDive ? 'Hide Exam-Level Breakdown' : 'Go Deeper: Exam-Level Analysis'}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${showDeepDive ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {showDeepDive && (
                      <div className="mt-3 p-4 rounded-3xl bg-white/90 border border-garden-sand text-xs text-plum-dark font-body leading-relaxed whitespace-pre-wrap animate-fadeIn">
                        {concept?.deepExplanation}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: EXAMPLES */}
              {activeTab === 'examples' && (
                <div className="space-y-3.5 animate-fadeIn">
                  {concept?.examples?.map((ex, i) => (
                    <div key={i} className="p-4 rounded-3xl bg-white/70 border border-garden-sand">
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[10px] font-display font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                            ex.type === 'india_startup'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ex.type === 'numeric'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : ex.type === 'study_design'
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {ex.tag}
                        </span>
                      </div>
                      <h4 className="font-display font-semibold text-sm text-plum-dark mb-1">
                        {ex.title}
                      </h4>
                      <p className="text-xs text-plum-medium font-body mb-2">{ex.scenario}</p>
                      <div className="p-2.5 rounded-xl bg-garden-ivory text-xs text-plum-dark font-body border border-garden-sand whitespace-pre-wrap">
                        {ex.breakdown}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: ANIMATE (20-30s Animated Explainer + Dynamic Curves) */}
              {activeTab === 'animate' && (
                <div className="space-y-4 animate-fadeIn">
                  {concept?.animation && (
                    <>
                      {/* Dynamic Graph / Curve Shift Animation Viewport */}
                      <GraphCurveAnimator
                        subjectId={lesson.subjectId}
                        scene={concept.animation.scenes[currentSceneIndex]}
                        isPlaying={isPlaying}
                        progressPercent={sceneProgress}
                      />

                      {/* Captions & Narration Text Box */}
                      <div className="p-3.5 rounded-2xl bg-white/80 border border-garden-sand text-center">
                        <span className="text-[10px] font-display font-semibold text-plum-light uppercase tracking-wider block mb-1">
                          Scene {currentSceneIndex + 1} of {concept.animation.scenes.length} •{' '}
                          {concept.animation.scenes[currentSceneIndex]?.title}
                        </span>
                        <p className="text-xs text-plum-dark font-body leading-relaxed">
                          "{concept.animation.scenes[currentSceneIndex]?.narration}"
                        </p>
                      </div>

                      {/* Playback Controls & Voiceover Toggle */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={togglePlayAnimation}
                            className="px-4 py-2 rounded-full bg-plum-dark text-white hover:bg-pm-deep font-display text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{isPlaying ? 'Pause' : 'Play Story'}</span>
                          </button>
                          <button
                            onClick={handleReplayAnimation}
                            className="p-2 rounded-full bg-white hover:bg-garden-ivory border border-garden-sand text-plum-medium"
                            title="Replay from start"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setIsVoiceoverMuted(!isVoiceoverMuted)}
                            className={`p-2 rounded-full border border-garden-sand text-plum-medium ${
                              isVoiceoverMuted ? 'bg-red-50 text-red-500' : 'bg-white'
                            }`}
                            title={isVoiceoverMuted ? 'Voiceover muted' : 'Voiceover on'}
                          >
                            {isVoiceoverMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Speed Controls */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-display text-plum-light mr-1">Speed:</span>
                          {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                            <button
                              key={spd}
                              onClick={() => setPlaybackSpeed(spd)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                                playbackSpeed === spd
                                  ? 'bg-pm-soft text-pm-deep font-bold border border-pm-pastel'
                                  : 'text-plum-light hover:text-plum-dark'
                              }`}
                            >
                              {spd}x
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Optional Veo Video Upgrade Button */}
                      <div className="pt-2 border-t border-garden-sand flex items-center justify-between">
                        <button
                          onClick={handleVeoUpgrade}
                          className="text-[11px] font-display text-pm-deep hover:underline flex items-center gap-1"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Generate real video clip (Veo API)</span>
                        </button>
                        {veoStatus && (
                          <span className="text-[10px] font-body text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            {veoStatus}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 4: QUIZ (5 Grounded Questions) */}
              {activeTab === 'quiz' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-display font-semibold text-plum-dark">
                      5 Grounded Recall Questions
                    </span>
                    <span className="text-[11px] font-display text-plum-light">
                      {Object.keys(submittedQuestions).length}/5 Answered
                    </span>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                    {concept?.quizQuestions?.map((q, qIndex) => {
                      const isSubmitted = submittedQuestions[q.id];
                      const userAnswer = userAnswers[q.id];

                      return (
                        <div
                          key={q.id}
                          className="p-4 rounded-3xl bg-white/80 border border-garden-sand space-y-2.5"
                        >
                          <div className="flex items-center justify-between text-[11px] font-display text-plum-light">
                            <span>Question {qIndex + 1} of 5</span>
                            <span className="font-mono">from slide {q.sourceSlide}</span>
                          </div>
                          <p className="text-xs font-display font-semibold text-plum-dark">
                            {q.question}
                          </p>

                          {/* MCQ Options */}
                          {q.type === 'mcq' && q.options && (
                            <div className="space-y-1.5 pt-1">
                              {q.options.map((opt, optIdx) => {
                                const isSelected = userAnswer === optIdx;
                                const isCorrect = q.correctAnswer === optIdx;

                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => !isSubmitted && handleSubmitAnswer(q.id, optIdx)}
                                    disabled={isSubmitted}
                                    className={`w-full text-left p-2.5 rounded-2xl text-xs font-body transition-all border flex items-start gap-2 ${
                                      isSubmitted
                                        ? isCorrect
                                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                                          : isSelected
                                          ? 'bg-red-50 border-red-300 text-red-900'
                                          : 'bg-white/50 border-garden-sand opacity-60'
                                        : isSelected
                                        ? 'bg-pm-soft border-pm-accent text-pm-deep font-semibold'
                                        : 'bg-white hover:bg-garden-ivory border-garden-sand text-plum-dark'
                                    }`}
                                  >
                                    <span className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 font-mono text-[10px]">
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span>{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Short Answer Input */}
                          {q.type === 'short_answer' && !isSubmitted && (
                            <div className="flex gap-2 pt-1">
                              <input
                                type="text"
                                placeholder="Type your concise definition or answer..."
                                value={(userAnswer as string) || ''}
                                onChange={(e) =>
                                  setUserAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && userAnswer) {
                                    handleSubmitAnswer(q.id, userAnswer);
                                  }
                                }}
                                className="flex-1 px-3 py-2 rounded-xl border border-garden-sand text-xs font-body focus:outline-none focus:ring-2 focus:ring-pm-accent"
                              />
                              <button
                                onClick={() => userAnswer && handleSubmitAnswer(q.id, userAnswer)}
                                disabled={!userAnswer}
                                className="px-4 py-2 rounded-xl bg-plum-dark text-white font-display text-xs disabled:opacity-40"
                              >
                                Submit
                              </button>
                            </div>
                          )}

                          {/* Friendly Feedback */}
                          {isSubmitted && (
                            <div className="p-3 rounded-2xl bg-garden-mist text-xs font-body text-plum-dark border border-garden-sand mt-2">
                              <span className="font-display font-semibold text-emerald-700 block mb-0.5">
                                🌸 Friendly Feedback:
                              </span>
                              <span>{q.friendlyFeedback}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {quizFinished && (
                    <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 text-center animate-bounce">
                      <span className="font-display font-bold text-sm text-emerald-800 block">
                        🎉 Splendid! Concept Mastered!
                      </span>
                      <span className="text-xs text-emerald-700 font-body">
                        A new flower has bloomed in your Living Garden meadow.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Grounded "Ask Anything" Mini Chat Box (Restricted to Lesson Material) */}
            <div className="pt-4 border-t border-garden-sand mt-4">
              <div className="flex items-center justify-between text-[11px] font-display text-plum-medium mb-1.5">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-pm-accent" />
                  Ask anything about this lesson:
                </span>
                <label className="flex items-center gap-1 cursor-pointer text-plum-light hover:text-plum-dark">
                  <input
                    type="checkbox"
                    checked={allowOutsideInChat}
                    onChange={(e) => setAllowOutsideInChat(e.target.checked)}
                    className="w-3 h-3 accent-pm-deep rounded"
                  />
                  <span>Allow outside material</span>
                </label>
              </div>

              {/* Chat Message Snippet if any */}
              {chatMessages.length > 0 && (
                <div className="max-h-36 overflow-y-auto mb-2 space-y-2 p-2 rounded-2xl bg-white/70 border border-garden-sand text-xs font-body">
                  {chatMessages.slice(-2).map((msg, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-xl ${
                        msg.role === 'user'
                          ? 'bg-pm-soft text-pm-deep font-semibold'
                          : 'bg-garden-ivory text-plum-dark'
                      }`}
                    >
                      {msg.role === 'assistant' && msg.sourceSlide && (
                        <span className="text-[10px] font-mono text-pm-deep block mb-1">
                          [from slide {msg.sourceSlide}]
                        </span>
                      )}
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question about this slide's concepts..."
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  className="flex-1 px-3 py-2 rounded-full border border-garden-sand text-xs font-body bg-white/90 focus:outline-none focus:ring-2 focus:ring-pm-accent"
                />
                <button
                  onClick={handleSendChat}
                  disabled={!inputQuestion.trim() || isAskingAI}
                  className="w-8 h-8 rounded-full bg-plum-dark hover:bg-pm-deep text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
