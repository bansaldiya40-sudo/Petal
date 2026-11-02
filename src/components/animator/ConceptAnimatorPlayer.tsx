import React, { useState, useEffect, useCallback } from 'react';
import { Storyboard, SubjectId, ClipMeta } from '../../types';
import { StoryStageView } from './StoryStageView';
import { TemplateDispatcher } from './templates/TemplateDispatcher';
import { triggerPetalsCelebration } from '../../utils/confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Subtitles,
  Sparkles,
  Flower2,
  Film,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConceptAnimatorPlayerProps {
  storyboard: Storyboard;
  subjectId: SubjectId;
  activeClip?: ClipMeta | null;
  onClose: () => void;
  onBloomConcept: () => void;
  onRegenerate: () => Promise<void>;
  onDeleteClip?: (clipId: string) => Promise<void>;
  reducedMotion?: boolean;
}

export const ConceptAnimatorPlayer: React.FC<ConceptAnimatorPlayerProps> = ({
  storyboard,
  subjectId,
  activeClip,
  onClose,
  onBloomConcept,
  onRegenerate,
  reducedMotion = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [elapsedSceneTime, setElapsedSceneTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  const scenes = storyboard.scenes || [];
  const currentScene = scenes[currentSceneIdx] || scenes[0];
  const totalDuration = storyboard.totalDuration || storyboard.totalDurationSeconds || 25;

  // Scene duration (supports duration or durationSeconds)
  const getSceneDuration = (s: any) => s?.duration || s?.durationSeconds || 7;

  // Compute accumulated elapsed time across previous scenes
  const priorTime = scenes.slice(0, currentSceneIdx).reduce((acc, s) => acc + getSceneDuration(s), 0);
  const currentTotalElapsed = Math.min(totalDuration, priorTime + elapsedSceneTime);
  const progressPercent = Math.min(100, (currentTotalElapsed / Math.max(1, totalDuration)) * 100);

  // Web Speech API Text-to-Speech narration
  const speakNarration = useCallback(
    (text: string) => {
      if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = playbackSpeed;
        utterance.pitch = 1.05; // Gentle friendly storybook pitch
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('TTS narration error:', e);
      }
    },
    [isMuted, playbackSpeed]
  );

  // Handle scene change and trigger narration
  useEffect(() => {
    const textToSpeak = currentScene?.caption || currentScene?.narration;
    if (isPlaying && textToSpeak) {
      speakNarration(textToSpeak);
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentSceneIdx, isPlaying, speakNarration, currentScene?.caption, currentScene?.narration]);

  // Timer loop for scene advancement
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 100;
    const interval = setInterval(() => {
      setElapsedSceneTime((prev) => {
        const next = prev + (intervalMs / 1000) * playbackSpeed;
        const sceneDuration = getSceneDuration(currentScene);

        if (next >= sceneDuration) {
          if (currentSceneIdx < scenes.length - 1) {
            setCurrentSceneIdx((idx) => idx + 1);
            return 0;
          } else {
            // Finished all scenes!
            setIsPlaying(false);
            triggerPetalsCelebration();
            return sceneDuration;
          }
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, currentSceneIdx, currentScene, scenes.length, playbackSpeed]);

  // Keyboard controls (Space to play/pause, Left/Right arrows to seek)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextScene();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevScene();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSceneIdx, scenes.length]);

  const handleNextScene = () => {
    if (currentSceneIdx < scenes.length - 1) {
      setCurrentSceneIdx((i) => i + 1);
      setElapsedSceneTime(0);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIdx > 0) {
      setCurrentSceneIdx((i) => i - 1);
      setElapsedSceneTime(0);
    }
  };

  const handleReplay = () => {
    setCurrentSceneIdx(0);
    setElapsedSceneTime(0);
    setIsPlaying(true);
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = ratio * totalDuration;

    let accumulated = 0;
    for (let i = 0; i < scenes.length; i++) {
      const dur = getSceneDuration(scenes[i]);
      accumulated += dur;
      if (targetSeconds <= accumulated) {
        setCurrentSceneIdx(i);
        setElapsedSceneTime(Math.max(0, dur - (accumulated - targetSeconds)));
        break;
      }
    }
  };

  const handleRegenerateClick = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerate();
      setCurrentSceneIdx(0);
      setElapsedSceneTime(0);
    } finally {
      setIsRegenerating(false);
    }
  };

  const hasCharacterStage = Boolean(currentScene?.actors && currentScene.actors.length > 0);
  const inRealLifeText =
    currentScene?.in_real_life || storyboard.inRealLifeBridge || (currentScene as any)?.data?.speechBubble;

  return (
    // FULL LIGHT THEME: Soft blurred pastel background, NO dark purple backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#FFF9F2]/75 backdrop-blur-md animate-fadeIn">
      {/* Cozy Storybook Window */}
      <div className="w-full max-w-4xl min-h-[520px] max-h-[96vh] flex flex-col justify-between rounded-[28px] bg-[#FFFDF9] border-2 border-[#D4A373] shadow-[0_24px_60px_rgba(180,140,100,0.22)] relative overflow-y-auto">
        {/* ======================================================== */}
        {/* PLAYER TOP BAR                                           */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 border-b border-[#EADBBF] bg-[#FFF9F0]/95 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF0B8] border border-[#E6CB67] flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-[#A67C0D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-display font-bold px-3 py-0.5 rounded-full bg-[#E7DCFF] text-[#6C3FE0] border border-[#B196F5]">
                  Scene {currentSceneIdx + 1} of {scenes.length}
                </span>
                <span className="text-[14px] sm:text-[16px] font-display font-bold text-[#5D4037] truncate max-w-[130px] sm:max-w-md">
                  {storyboard.conceptTitle}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Small Regenerate Action */}
            <button
              onClick={handleRegenerateClick}
              disabled={isRegenerating}
              className="text-[13px] font-display font-semibold px-3 py-1.5 rounded-full bg-white hover:bg-[#FFFDF0] border border-[#EADBBF] text-[#5D4037] flex items-center gap-1.5 transition-colors shadow-xs"
              title="Regenerate animated storyboard"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#9670F5] ${isRegenerating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#EAD7BA] hover:bg-[#DFC29D] text-[#855627] flex items-center justify-center transition-colors shadow-xs"
              title="Close storybook animator"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN STAGE (Illustrated Stage with Rigged Characters)     */}
        {/* ======================================================== */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center items-center relative overflow-hidden">
          {/* Active Movie Clip overlay if enabled */}
          {activeClip ? (
            <div className="w-full h-full relative rounded-3xl overflow-hidden border-2 border-[#D4A373] shadow-inner flex items-center justify-center bg-[#FFFDF9]">
              <div className="text-center p-6">
                <Film className="w-12 h-12 text-[#9670F5] mx-auto mb-2 animate-bounce" />
                <h4 className="font-display font-bold text-[18px] text-[#4A3566]">
                  Storybook Movie Clip Active
                </h4>
                <p className="text-[14px] text-[#6C538C] font-body mt-1">
                  Rendered with character dialogue and animated garden props.
                </p>
              </div>
            </div>
          ) : hasCharacterStage ? (
            /* Track 1 Character-Driven Stage (Director Engine) */
            <div className="w-full h-full max-w-3xl flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSceneIdx}
                  initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: reducedMotion ? 1 : 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex flex-col justify-center"
                >
                  <StoryStageView
                    scene={currentScene as any}
                    elapsedTime={elapsedSceneTime}
                    reducedMotion={reducedMotion}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            /* Fallback Dispatcher for older legacy scenes */
            <div className="w-full h-full max-w-3xl flex flex-col justify-center">
              <TemplateDispatcher
                scene={currentScene as any}
                subjectId={subjectId}
                reducedMotion={reducedMotion}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* ON-SCREEN CAPTION RIBBON (20px+, spoken-style, deep plum) */}
          {/* ======================================================== */}
          {showCaptions && currentScene?.caption && (
            <div className="w-full max-w-2xl mx-auto mt-3 px-4 z-20">
              <motion.div
                key={currentScene.caption}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-3 px-6 rounded-2xl bg-[#FFFBF4]/95 border-2 border-[#EADBBF] shadow-sm text-center backdrop-blur-sm"
              >
                <p className="font-display font-bold text-[20px] sm:text-[22px] text-[#3B234A] tracking-tight leading-snug">
                  "{currentScene.caption}"
                </p>
              </motion.div>
            </div>
          )}

          {/* ======================================================== */}
          {/* "IN REAL LIFE" BRIDGE (Shows connection to syllabus)     */}
          {/* ======================================================== */}
          {inRealLifeText && (currentSceneIdx === scenes.length - 1 || !isPlaying) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-2xl mx-auto mt-2 px-4 z-20"
            >
              <div className="p-3 px-5 rounded-2xl bg-gradient-to-r from-[#DBF5E7]/90 to-[#FFF0B8]/90 border border-[#83D9A7] shadow-xs flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-[#1F8C4F] shrink-0" />
                <p className="text-[14px] sm:text-[15px] font-body text-[#1F8C4F] leading-snug">
                  <span className="font-bold">In real life: </span>
                  {inRealLifeText.replace(/^In real life:\s*/i, '')}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* ======================================================== */}
        {/* TIMELINE PLAYER CONTROLS & BOTANICAL VINE SCRUBBER       */}
        {/* ======================================================== */}
        <div className="p-3 sm:p-5 pt-2 sm:pt-3 border-t border-[#EADBBF] bg-[#FFF9F0]/95 space-y-2 sm:space-y-3 shrink-0">
          {/* Botanical Vine Scrubber */}
          <div className="px-2">
            <div className="flex items-center justify-between text-[13px] font-display font-bold text-[#855627] mb-1">
              <span>{Math.round(currentTotalElapsed)}s</span>
              <span>{totalDuration}s</span>
            </div>

            {/* Vine Track */}
            <div
              onClick={handleSeek}
              className="relative w-full h-4 rounded-full bg-[#EAD7BA] cursor-pointer p-0.5 border-2 border-[#855627]/30 shadow-inner group"
              title="Click anywhere on the vine to seek"
            >
              {/* Sprouting Vine Progress Fill */}
              <div
                className="h-full rounded-full transition-all duration-150 flex items-center justify-end pr-0.5"
                style={{
                  width: `${Math.max(4, progressPercent)}%`,
                  background: 'linear-gradient(90deg, #83D9A7 0%, #9670F5 50%, #FFD6E0 100%)',
                }}
              >
                {/* Flower Head Cursor */}
                <div className="w-4 h-4 rounded-full bg-white border-2 border-[#9670F5] shadow-sm transform translate-x-1 group-hover:scale-125 transition-transform flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E6B82E]" />
                </div>
              </div>
            </div>
          </div>

          {/* Control Buttons Row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Left Controls: Prev, Play/Pause, Next, Replay */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevScene}
                disabled={currentSceneIdx === 0}
                className="w-10 h-10 rounded-full bg-white hover:bg-[#FFFDF0] border border-[#EADBBF] text-[#4A3566] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-xs"
                title="Previous scene (Left Arrow)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-[#D9C8FF] to-[#FFD6E0] hover:scale-105 border-2 border-[#B196F5] text-[#4A3566] flex items-center justify-center shadow-storybook transition-all"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-[#4A3566]" /> : <Play className="w-5 h-5 fill-[#4A3566] ml-0.5" />}
              </button>

              <button
                onClick={handleNextScene}
                disabled={currentSceneIdx === scenes.length - 1}
                className="w-10 h-10 rounded-full bg-white hover:bg-[#FFFDF0] border border-[#EADBBF] text-[#4A3566] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-xs"
                title="Next scene (Right Arrow)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={handleReplay}
                className="w-10 h-10 rounded-full bg-white hover:bg-[#FFFDF0] border border-[#EADBBF] text-[#855627] flex items-center justify-center shadow-xs"
                title="Replay from Scene 1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Center: Completion / Bloom Action */}
            <div>
              <button
                onClick={onBloomConcept}
                className="btn-storybook min-h-[44px] px-5 bg-gradient-to-r from-[#CFF2E0] to-[#FFF0B8] border-2 border-[#83D9A7] text-[#1F8C4F] text-[15px] font-bold shadow-sm hover:scale-105 transition-all flex items-center gap-2"
              >
                <Flower2 className="w-4 h-4 text-[#1F8C4F]" />
                <span>Bloom Concept 🌸</span>
              </button>
            </div>

            {/* Right Controls: Speed, Mute, Captions */}
            <div className="flex items-center gap-2">
              {/* Playback Speed */}
              <button
                onClick={cycleSpeed}
                className="h-9 px-3 rounded-full bg-white hover:bg-[#FFFDF0] border border-[#EADBBF] text-[13px] font-display font-bold text-[#4A3566] shadow-xs"
                title="Change playback speed"
              >
                {playbackSpeed}x
              </button>

              {/* Mute Toggle */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-xs transition-colors ${
                  isMuted ? 'bg-[#FFD6E0] border-[#F2A8BC] text-[#855627]' : 'bg-white border-[#EADBBF] text-[#4A3566]'
                }`}
                title={isMuted ? 'Unmute narration' : 'Mute narration'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Captions Toggle */}
              <button
                onClick={() => setShowCaptions(!showCaptions)}
                className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-xs transition-colors ${
                  showCaptions ? 'bg-[#E7DCFF] border-[#B196F5] text-[#6C3FE0]' : 'bg-white border-[#EADBBF] text-[#855627]'
                }`}
                title={showCaptions ? 'Hide on-screen captions' : 'Show on-screen captions'}
              >
                <Subtitles className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
