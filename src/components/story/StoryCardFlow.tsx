import React, { useState, useEffect } from 'react';
import { Concept, SubjectId, SlideContent, Storyboard, ClipMeta, VideoSpendInfo } from '../../types';
import { SUBJECTS } from '../../utils/subjects';
import { ConceptAnimatorPlayer } from '../animator/ConceptAnimatorPlayer';
import {
  fetchStoryboard,
  regenerateStoryboard,
  fetchClips,
  fetchSpendInfo,
  generateVideoClip,
  deleteVideoClip,
} from '../../services/api';
import { triggerPetalsCelebration } from '../../utils/confetti';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  BookOpen,
  Play,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Layers,
  ArrowRight,
  Flower2,
  FileText,
  Film,
  Download,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface StoryCardFlowProps {
  subjectId: SubjectId;
  concept: Concept;
  slides: SlideContent[];
  onClose: () => void;
  onConceptBloomed: (concept: Concept) => void;
}

export const StoryCardFlow: React.FC<StoryCardFlowProps> = ({
  subjectId,
  concept,
  slides,
  onClose,
  onConceptBloomed,
}) => {
  const subject = SUBJECTS[subjectId];
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [selectedQuickAnswer, setSelectedQuickAnswer] = useState<number | null>(null);
  const [quickCheckSubmitted, setQuickCheckSubmitted] = useState<boolean>(false);
  const [showOriginalSlides, setShowOriginalSlides] = useState<boolean>(false);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState<boolean>(true);
  const [animationSceneIdx, setAnimationSceneIdx] = useState<number>(0);

  // Concept Animator (Track 1 & Track 2) State
  const [activeStoryboard, setActiveStoryboard] = useState<Storyboard | null>(null);
  const [isAnimatorOpen, setIsAnimatorOpen] = useState<boolean>(false);
  const [isLoadingStoryboard, setIsLoadingStoryboard] = useState<boolean>(false);
  const [existingClips, setExistingClips] = useState<ClipMeta[]>([]);
  const [selectedClip, setSelectedClip] = useState<ClipMeta | null>(null);
  const [isMovieConfirmOpen, setIsMovieConfirmOpen] = useState<boolean>(false);
  const [spendInfo, setSpendInfo] = useState<VideoSpendInfo | null>(null);
  const [isGeneratingClip, setIsGeneratingClip] = useState<boolean>(false);
  const [clipErrorMessage, setClipErrorMessage] = useState<string | null>(null);

  // Fetch clips for this concept on mount
  useEffect(() => {
    fetchClips(concept.id).then(setExistingClips).catch(() => {});
  }, [concept.id]);

  const handleOpenWatchItBloom = async () => {
    setIsLoadingStoryboard(true);
    try {
      const sb = await fetchStoryboard(concept.id);
      setActiveStoryboard(sb);
      setSelectedClip(null);
      setIsAnimatorOpen(true);
    } catch (e) {
      console.error('Failed to load storyboard:', e);
    } finally {
      setIsLoadingStoryboard(false);
    }
  };

  const handleRegenerateStoryboard = async () => {
    const sb = await regenerateStoryboard(concept.id);
    setActiveStoryboard(sb);
  };

  const handleOpenMovieConfirm = async () => {
    try {
      const spend = await fetchSpendInfo();
      setSpendInfo(spend);
      setIsMovieConfirmOpen(true);
    } catch (e) {
      console.error('Failed to fetch spend:', e);
    }
  };

  const handleConfirmGenerateMovie = async () => {
    setIsGeneratingClip(true);
    setClipErrorMessage(null);
    try {
      const newClip = await generateVideoClip(concept.id, 20);
      setExistingClips((prev) => [newClip, ...prev]);
      setIsMovieConfirmOpen(false);

      // Open in player
      const sb = await fetchStoryboard(concept.id);
      setActiveStoryboard(sb);
      setSelectedClip(newClip);
      setIsAnimatorOpen(true);
    } catch (err: any) {
      setClipErrorMessage(err.message || 'Video generation failed. Falling back to in-app animated explainer.');
      setTimeout(async () => {
        setIsMovieConfirmOpen(false);
        handleOpenWatchItBloom();
      }, 1600);
    } finally {
      setIsGeneratingClip(false);
    }
  };

  const handleDeleteClip = async (clipId: string) => {
    await deleteVideoClip(clipId);
    setExistingClips((prev) => prev.filter((c) => c.id !== clipId));
    if (selectedClip?.id === clipId) setSelectedClip(null);
  };

  const totalSteps = 6;
  const stepTitles = [
    'The Idea',
    'Intuition & Analogy',
    'Real-World Cases',
    'Collectible Petals',
    'Quick Check',
    'Animated Story',
  ];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // Final step: Bloom concept!
      handleCompleteQuest();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleCompleteQuest = () => {
    triggerPetalsCelebration();
    onConceptBloomed(concept);
    onClose();
  };

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Find original slide
  const sourceSlideContent = slides.find((s) => s.slideNumber === concept.sourceSlide) || slides[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#FFF9F2]/75 backdrop-blur-md animate-fadeIn">
      {/* Story Card Container */}
      <div className="w-full max-w-3xl min-h-[580px] max-h-[92vh] flex flex-col justify-between rounded-organic-md bg-[#FFF8EE] border-2 border-[#855627] shadow-[0_24px_60px_rgba(74,53,102,0.3)] relative overflow-hidden">
        {/* ======================================================== */}
        {/* STORY HEADER (Progress Bar & Controls)                   */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-6 pb-2 border-b border-[#E8D4B0] bg-[#FFF5E4]/80">
          {/* 6 Segmented Progress Bars (Instagram Stories style) */}
          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className="h-1.5 rounded-full overflow-hidden bg-[#EAD7BA]"
              >
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    idx <= currentStep ? 'bg-[#9670F5]' : 'bg-transparent'
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-display font-bold px-3 py-1 rounded-full bg-[#E7DCFF] text-[#6C3FE0] border border-[#B196F5]">
                Card {currentStep + 1} of 6: {stepTitles[currentStep]}
              </span>
              <button
                onClick={() => setShowOriginalSlides(true)}
                className="text-[13px] font-display font-semibold text-[#855627] hover:text-[#4A3566] underline decoration-dotted flex items-center gap-1"
                title="View original uploaded slide text"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>from slide {concept.sourceSlide}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#EAD7BA] hover:bg-[#DFC29D] text-[#855627] flex items-center justify-center transition-colors"
              title="Close story"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* STORY CARD BODY: 1 IDEA PER SCREEN                       */}
        {/* ======================================================== */}
        <div className="flex-1 p-6 sm:p-10 overflow-y-auto flex flex-col justify-center max-w-[70ch] mx-auto w-full">
          {/* ---------------- CARD 1: THE IDEA IN ONE SENTENCE ---------------- */}
          {currentStep === 0 && (
            <div className="text-center space-y-6 animate-fadeIn">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#FFF0B8] border-2 border-[#E6CB67] flex items-center justify-center shadow-storybook animate-bob">
                <Sparkles className="w-10 h-10 text-[#A67C0D]" />
              </div>

              <span className="text-[14px] font-display font-bold uppercase tracking-widest px-4 py-1 rounded-full bg-[#E7DCFF] text-[#6C3FE0]">
                {concept.title}
              </span>

              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#4A3566] leading-tight">
                "{concept.oneSentenceSummary}"
              </h2>

              <p className="text-[17px] text-[#6C538C] font-body leading-[1.6]">
                This is the core insight of this concept. Tap next to discover how it works in the real world through intuitive analogies.
              </p>
            </div>
          )}

          {/* ---------------- CARD 2: INTUITION & STORYBOOK ANALOGY ---------------- */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-organic-md bg-[#FFFDF9] border-2 border-[#E8D4B0] shadow-sm">
                <span className="text-[14px] font-display font-bold text-[#9670F5] block mb-2">
                  🌸 Plain Language Intuition
                </span>
                <p className="text-[18px] text-[#4A3566] font-body leading-[1.6]">
                  {concept.plainExplanation}
                </p>
              </div>

              {concept.analogy && (
                <div className="p-5 rounded-2xl bg-[#FFF8CE]/60 border-2 border-[#E6CB67] flex items-start gap-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#FFF0B8] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[#A67C0D]" />
                  </div>
                  <div>
                    <span className="text-[15px] font-display font-bold text-[#A67C0D] block mb-1">
                      Storybook Analogy
                    </span>
                    <p className="text-[17px] text-[#4A3566] font-body leading-[1.6]">
                      {concept.analogy}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------------- CARD 3: REAL-WORLD EXAMPLES ---------------- */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <h3 className="text-[24px] font-display font-bold text-[#4A3566] text-center mb-2">
                Real-World MBA Applications
              </h3>

              <div className="space-y-4">
                {concept.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-[#FFFDF9] border-2 border-[#E8D4B0] shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-display font-bold px-3 py-0.5 rounded-full bg-[#DBF5E7] text-[#1F8C4F] border border-[#83D9A7]">
                        {ex.tag}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-[18px] text-[#4A3566] mb-1.5">
                      {ex.title}
                    </h4>

                    <p className="text-[16px] text-[#6C538C] font-body mb-2 leading-[1.6]">
                      {ex.scenario}
                    </p>

                    <div className="p-3.5 rounded-xl bg-[#FFF5E4] text-[16px] text-[#4A3566] font-body border border-[#E8D4B0] leading-[1.6]">
                      <strong>Breakdown:</strong> {ex.breakdown}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------- CARD 4: COLLECTIBLE KEY TERMS / SEED PETALS ---------------- */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <h3 className="text-[24px] font-display font-bold text-[#4A3566]">
                  Collectible Key Term Petals
                </h3>
                <p className="text-[16px] text-[#6C538C] font-body mt-1">
                  Tap each petal card to flip and reveal its exam definition:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {concept.keyTerms.map((rawTerm, i) => {
                  const termObj = typeof rawTerm === 'string' ? { term: rawTerm, definition: 'Foundational concept in this lesson.' } : rawTerm;
                  const isFlipped = flippedCards[i];
                  return (
                    <div
                      key={i}
                      onClick={() => toggleFlip(i)}
                      className="cursor-pointer min-h-[120px] rounded-2xl border-2 p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] shadow-sm"
                      style={{
                        backgroundColor: isFlipped ? '#FFF5E4' : '#FFFDF9',
                        borderColor: isFlipped ? '#B196F5' : '#E8D4B0',
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[12px] font-display font-bold text-[#9B83BA] mb-1">
                          <span>Seed Petal #{i + 1}</span>
                          <span className="text-[11px] underline">
                            {isFlipped ? 'Tap to hide' : 'Tap to flip'}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-[18px] text-[#4A3566]">
                          {termObj.term}
                        </h4>
                      </div>

                      {isFlipped ? (
                        <p className="text-[15px] text-[#4A3566] font-body mt-2 leading-[1.5] animate-fadeIn">
                          {termObj.definition}
                        </p>
                      ) : (
                        <span className="text-[13px] text-[#9B83BA] font-body mt-2">
                          (Click to reveal definition)
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------- CARD 5: QUICK PLAYFUL CHECK ---------------- */}
          {currentStep === 4 && concept.quickCheck && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <span className="text-[14px] font-display font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FFF0B8] text-[#A67C0D] border border-[#E6CB67]">
                  Sparkle Check
                </span>
                <h3 className="text-[24px] font-display font-bold text-[#4A3566] mt-2">
                  {concept.quickCheck.question}
                </h3>
              </div>

              <div className="space-y-3 pt-2">
                {concept.quickCheck.options?.map((opt, i) => {
                  const isSelected = selectedQuickAnswer === i;
                  const isCorrect = concept.quickCheck?.correctAnswer === i;

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedQuickAnswer(i);
                        setQuickCheckSubmitted(true);
                        if (isCorrect) triggerPetalsCelebration();
                      }}
                      className={`w-full min-h-[52px] text-left p-4 rounded-2xl border-2 text-[16px] font-body transition-all duration-200 flex items-center gap-3 ${
                        quickCheckSubmitted
                          ? isCorrect
                            ? 'bg-[#CFF2E0] border-[#83D9A7] text-[#1F8C4F] font-bold shadow-sm'
                            : isSelected
                            ? 'bg-[#FFD6E0] border-[#F2A8BC] text-[#855627]'
                            : 'bg-white/60 border-[#E8D4B0] opacity-60'
                          : isSelected
                          ? 'bg-[#E7DCFF] border-[#B196F5] text-[#6C3FE0] font-bold'
                          : 'bg-[#FFFDF9] hover:bg-[#FFF5E4] border-[#E8D4B0] text-[#4A3566]'
                      }`}
                    >
                      <span className="w-7 h-7 rounded-full border border-current flex items-center justify-center shrink-0 font-display font-bold text-[13px]">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {quickCheckSubmitted && (
                <div className="p-4 rounded-2xl bg-[#CFF2E0]/70 border-2 border-[#83D9A7] text-[16px] text-[#1F8C4F] font-body animate-fadeIn">
                  <span className="font-display font-bold block mb-1">
                    ✨ Sparkle Feedback:
                  </span>
                  <span>{concept.quickCheck.sparkleFeedback}</span>
                </div>
              )}
            </div>
          )}

          {/* ---------------- CARD 6: 15-30s ANIMATED EXPLAINER (CONCEPT ANIMATOR) ---------------- */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn max-w-xl mx-auto w-full text-center">
              <div>
                <span className="text-[13px] font-display font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-[#E7DCFF] text-[#6C3FE0] border border-[#B196F5]">
                  Enchanted Concept Animator
                </span>
                <h3 className="text-[26px] sm:text-[30px] font-display font-bold text-[#4A3566] mt-2 mb-1">
                  {concept.title}
                </h3>
                <p className="text-[16px] text-[#6C538C] font-body leading-relaxed max-w-md mx-auto">
                  Watch this 15-30 second animated storybook explainer with synchronized narration, analytical charts, and blooming takeaways.
                </p>
              </div>

              {/* Primary Prominent "Watch it bloom" Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleOpenWatchItBloom}
                  disabled={isLoadingStoryboard}
                  className="btn-storybook w-full min-h-[64px] px-8 bg-gradient-to-r from-[#D9C8FF] via-[#FFD6E0] to-[#FFF0B8] border-2 border-[#B196F5] text-[#4A3566] text-[18px] sm:text-[20px] font-display font-bold shadow-storybook-hover hover:scale-[1.02] transition-all flex items-center justify-center gap-3.5"
                >
                  <Flower2 className={`w-6 h-6 text-[#9670F5] ${isLoadingStoryboard ? 'animate-spin' : 'animate-bounce'}`} />
                  <span>{isLoadingStoryboard ? 'Preparing Your Storyboard...' : 'Watch it bloom'}</span>
                  <Sparkles className="w-5 h-5 text-[#E6B82E]" />
                </button>
                <span className="text-[13px] font-display font-medium text-[#9B83BA] block mt-1.5">
                  Free in-app animated explainer • Web Speech API Narration
                </span>
              </div>

              {/* Secondary Quiet "Make a movie clip" Action (Track 2) */}
              <div className="pt-3 border-t border-[#E8D4B0]/60 flex flex-col items-center gap-2">
                <button
                  onClick={handleOpenMovieConfirm}
                  className="px-5 py-2.5 rounded-full bg-white/90 hover:bg-[#FFFDF0] border border-[#E8D4B0] text-[#6C538C] hover:text-[#4A3566] text-[14px] font-display font-semibold transition-all flex items-center gap-2 shadow-xs"
                >
                  <Film className="w-4 h-4 text-[#9670F5]" />
                  <span>Make a movie clip (AI Video)</span>
                </button>

                {existingClips.length > 0 && (
                  <div className="flex items-center gap-2 text-[12px] font-display text-[#1F8C4F] bg-[#DBF5E7]/80 px-3 py-1 rounded-full border border-[#83D9A7]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{existingClips.length} movie clip saved</span>
                    <button
                      onClick={() => {
                        setSelectedClip(existingClips[0]);
                        handleOpenWatchItBloom();
                      }}
                      className="underline font-bold hover:text-[#059669] ml-1"
                    >
                      Play Clip
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* STORY FOOTER CONTROLS                                    */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-6 pt-3 border-t border-[#E8D4B0] bg-[#FFF5E4]/80 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="btn-storybook min-h-[48px] px-5 bg-white hover:bg-[#FFFDF0] border-2 border-[#E8D4B0] text-[#4A3566] disabled:opacity-30 disabled:cursor-not-allowed text-[16px]"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          {/* Center progress indicator */}
          <span className="text-[15px] font-display font-bold text-[#6C538C]">
            {currentStep + 1} of {totalSteps}
          </span>

          <button
            onClick={handleNext}
            className="btn-storybook min-h-[48px] px-6 bg-gradient-to-r from-[#D9C8FF] to-[#FFD6E0] border-2 border-[#B196F5] text-[#4A3566] text-[16px] shadow-storybook hover:shadow-storybook-hover"
          >
            <span>{currentStep === totalSteps - 1 ? 'Bloom Concept 🌸' : 'Next Card'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quiet "View Original Slides" Side Drawer */}
      {showOriginalSlides && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#FFF5E4] border-l-2 border-[#855627] shadow-[0_0_50px_rgba(74,53,102,0.3)] p-6 overflow-y-auto flex flex-col justify-between animate-fadeIn">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8D4B0]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#855627]" />
                <h4 className="font-display font-bold text-[20px] text-[#4A3566]">
                  Original Lecture Material
                </h4>
              </div>
              <button
                onClick={() => setShowOriginalSlides(false)}
                className="w-8 h-8 rounded-full bg-[#EAD7BA] text-[#855627] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E8D4B0] mb-4">
              <span className="text-[13px] font-mono text-[#9B83BA] block mb-1">
                Slide {sourceSlideContent.slideNumber} of {slides.length}
              </span>
              <h5 className="font-display font-bold text-[18px] text-[#4A3566] mb-2">
                {sourceSlideContent.title}
              </h5>
              <p className="text-[16px] text-[#4A3566] font-body leading-[1.6] whitespace-pre-wrap">
                {sourceSlideContent.content}
              </p>
            </div>

            <p className="text-[13px] text-[#9B83BA] font-body leading-relaxed">
              🔒 Grounding Guarantee: Every definition, story, and question in this Story Card was distilled directly from this slide.
            </p>
          </div>

          <button
            onClick={() => setShowOriginalSlides(false)}
            className="btn-storybook min-h-[48px] w-full bg-[#EAD7BA] text-[#855627] text-[16px] mt-6"
          >
            Close Material Drawer
          </button>
        </div>
      )}

      {/* Concept Animator Full Timeline Player */}
      {isAnimatorOpen && activeStoryboard && (
        <ConceptAnimatorPlayer
          storyboard={activeStoryboard}
          subjectId={subjectId}
          activeClip={selectedClip}
          onClose={() => setIsAnimatorOpen(false)}
          onBloomConcept={() => {
            setIsAnimatorOpen(false);
            handleCompleteQuest();
          }}
          onRegenerate={handleRegenerateStoryboard}
          onDeleteClip={handleDeleteClip}
        />
      )}

      {/* Track 2 Movie Clip Cost Confirmation Modal */}
      {isMovieConfirmOpen && spendInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FFF9F2]/75 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-organic-md bg-[#FFF8EE] border-2 border-[#855627] p-6 shadow-storybook-hover">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#E7DCFF] border border-[#B196F5] flex items-center justify-center">
                <Film className="w-5 h-5 text-[#6C3FE0]" />
              </div>
              <h4 className="font-display font-bold text-[20px] text-[#4A3566]">
                Make an AI Storybook Movie Clip?
              </h4>
            </div>

            <p className="text-[15px] text-[#6C538C] font-body leading-relaxed mb-4">
              This will request short scene clips from the configured video provider (<strong>{spendInfo.videoModel}</strong>) and stitch them together in the Enchanted Garden watercolor style.
            </p>

            {/* Estimated Cost Breakdown Box */}
            <div className="p-4 rounded-2xl bg-[#FFF5E4] border-2 border-[#E8D4B0] space-y-2 mb-4 text-[14px]">
              <div className="flex justify-between font-display text-[#4A3566]">
                <span>Estimated duration:</span>
                <span className="font-bold">20 seconds</span>
              </div>
              <div className="flex justify-between font-display text-[#4A3566]">
                <span>Price per second:</span>
                <span className="font-mono">${Number(spendInfo.pricePerSecondUsd).toFixed(2)} / sec</span>
              </div>
              <div className="flex justify-between font-display text-[#6C3FE0] pt-1 border-t border-[#E8D4B0] font-bold">
                <span>Estimated generation cost:</span>
                <span>${(20 * Number(spendInfo.pricePerSecondUsd)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[12px] text-[#855627] pt-1">
                <span>Daily Spend Today:</span>
                <span>${Number(spendInfo.spentTodayUsd).toFixed(2)} / ${Number(spendInfo.dailySpendCapUsd).toFixed(2)} cap</span>
              </div>
            </div>

            {clipErrorMessage && (
              <div className="p-3 rounded-xl bg-[#FFD6E0] border border-[#F2A8BC] text-[13px] text-[#855627] mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{clipErrorMessage}</span>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsMovieConfirmOpen(false)}
                disabled={isGeneratingClip}
                className="btn-storybook min-h-[46px] px-4 bg-white border border-[#E8D4B0] text-[#4A3566] text-[15px]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmGenerateMovie}
                disabled={isGeneratingClip}
                className="btn-storybook min-h-[46px] px-6 bg-gradient-to-r from-[#D9C8FF] to-[#FFD6E0] border-2 border-[#B196F5] text-[#4A3566] font-bold text-[15px] shadow-sm flex items-center gap-2"
              >
                {isGeneratingClip ? (
                  <>
                    <Flower2 className="w-4 h-4 animate-spin text-[#6C3FE0]" />
                    <span>Stitching Clip...</span>
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4 text-[#6C3FE0]" />
                    <span>Confirm & Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
