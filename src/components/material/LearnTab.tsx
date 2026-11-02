import React, { useState, useEffect } from 'react';
import { Material, MaterialSection, SubjectId, LearnData, LearnTopic } from '../../types';
import {
  updateSectionLevel,
  askSectionQuestion,
  regenerateSection,
  regenerateMaterial,
  adjustTopicLevel,
} from '../../services/api';
import {
  BookOpen,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Wand2,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Building2,
  Table,
  Compass,
  ArrowRight,
  Layers,
  Send,
  MessageCircleQuestion,
  Undo2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LearnTabProps {
  material: Material;
  subjectId: SubjectId;
  onRefreshMaterial: () => Promise<void>;
  reducedMotion?: boolean;
}

function toTitleCase(str: string): string {
  if (!str) return '';
  const clean = str.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  const minorWords = new Set(['and', 'or', 'the', 'a', 'an', 'in', 'on', 'of', 'for', 'to', 'at', 'by', 'vs', 'with']);
  return clean
    .toLowerCase()
    .split(' ')
    .map((word, idx) => {
      if (idx > 0 && minorWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}

export const LearnTab: React.FC<LearnTabProps> = ({
  material,
  subjectId,
  onRefreshMaterial,
  reducedMotion = false,
}) => {
  // Use learnData if available
  const learnData: LearnData | null = material.learnData || null;
  const topics: LearnTopic[] = Array.isArray(learnData?.topics) ? learnData!.topics : [];

  // Collapsed state for topic cards: first topic (idx 0) is open by default
  const [openTopics, setOpenTopics] = useState<Record<number, boolean>>({ 0: true });

  // Topic adjustment state ("Simplify" / "Go deeper") & local override store
  const [adjustingTopicIdx, setAdjustingTopicIdx] = useState<number | null>(null);
  const [adjustingMode, setAdjustingMode] = useState<'simplify' | 'deeper' | null>(null);
  const [topicOverrides, setTopicOverrides] = useState<Record<number, LearnTopic>>({});
  const [originalTopics, setOriginalTopics] = useState<Record<number, LearnTopic>>({});
  const [adjustErrors, setAdjustErrors] = useState<Record<number, string | null>>({});

  // Material retry/regeneration state
  const [isRetryingAll, setIsRetryingAll] = useState<boolean>(false);

  // Active rail section for desktop sidebar
  const [activeRailId, setActiveRailId] = useState<string>('deck-big-idea');

  // Fallback state for legacy section interactive features
  const sections = material.sections || [];
  const [activeSectionId, setActiveSectionId] = useState<string>(sections[0]?.id || 'sec-1');
  const [activeChatSection, setActiveChatSection] = useState<MaterialSection | null>(null);
  const [chatQuestion, setChatQuestion] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<{ q: string; a: string; source: string }[]>([]);
  const [levelUpdatingSectionId, setLevelUpdatingSectionId] = useState<string | null>(null);
  const [regeneratingSectionId, setRegeneratingSectionId] = useState<string | null>(null);

  const toggleTopic = (idx: number) => {
    setOpenTopics((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const expandAllTopics = () => {
    const allOpen: Record<number, boolean> = {};
    topics.forEach((_, idx) => {
      allOpen[idx] = true;
    });
    setOpenTopics(allOpen);
  };

  const collapseAllTopics = () => {
    setOpenTopics({});
  };

  const handleAdjustTopic = async (idx: number, mode: 'simplify' | 'deeper') => {
    const rawTopic = topicOverrides[idx] || topics[idx];
    console.log('[Topic Adjust Clicked]', { idx, mode, topicTitle: rawTopic?.title });
    if (adjustingTopicIdx !== null) return;

    setAdjustingTopicIdx(idx);
    setAdjustingMode(mode);
    setAdjustErrors((prev) => ({ ...prev, [idx]: null }));

    // Preserve original snapshot if not already stored
    if (!originalTopics[idx] && rawTopic) {
      setOriginalTopics((prev) => ({ ...prev, [idx]: { ...rawTopic, mode: 'original' } }));
    }

    try {
      const res = await adjustTopicLevel(material.id, idx, mode);
      if (res.topic) {
        setTopicOverrides((prev) => ({
          ...prev,
          [idx]: { ...res.topic, mode },
        }));
        setOpenTopics((prev) => ({ ...prev, [idx]: true }));
      }
      onRefreshMaterial().catch((e) => console.warn('Background sync error:', e));
    } catch (err: any) {
      console.error('Failed to adjust topic:', err);
      setAdjustErrors((prev) => ({
        ...prev,
        [idx]: err?.message || 'Tutor engine adjustment failed. Tap to retry.',
      }));
    } finally {
      setAdjustingTopicIdx(null);
      setAdjustingMode(null);
    }
  };

  const handleRestoreOriginal = (idx: number) => {
    console.log('[Restore Original Clicked]', { idx });
    if (originalTopics[idx]) {
      setTopicOverrides((prev) => ({
        ...prev,
        [idx]: { ...originalTopics[idx], mode: 'original' },
      }));
      setAdjustErrors((prev) => ({ ...prev, [idx]: null }));
    }
  };

  const handleRegenerateAll = async () => {
    setIsRetryingAll(true);
    try {
      await regenerateMaterial(material.id, 'all');
      await onRefreshMaterial();
    } catch (e) {
      console.error('Material retry failed:', e);
    } finally {
      setIsRetryingAll(false);
    }
  };

  // Scroll listener for desktop rail
  useEffect(() => {
    const handleScroll = () => {
      if (!learnData || topics.length === 0) return;
      const scrollPos = window.scrollY + 220;

      const glossaryEl = document.getElementById('deck-glossary');
      if (glossaryEl && glossaryEl.offsetTop <= scrollPos) {
        setActiveRailId('deck-glossary');
        return;
      }

      const takeawaysEl = document.getElementById('deck-takeaways');
      if (takeawaysEl && takeawaysEl.offsetTop <= scrollPos) {
        setActiveRailId('deck-takeaways');
        return;
      }

      for (let i = topics.length - 1; i >= 0; i--) {
        const el = document.getElementById(`topic-card-${i}`);
        if (el && el.offsetTop <= scrollPos) {
          setActiveRailId(`topic-card-${i}`);
          return;
        }
      }

      setActiveRailId('deck-big-idea');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [learnData, topics]);

  // -------------------------------------------------------------
  // 1. QUEUED STATE
  // -------------------------------------------------------------
  if (material.learnStatus === 'queued') {
    return (
      <div className="w-full max-w-2xl mx-auto py-14 px-4 text-center space-y-6 animate-fadeIn">
        <div className="p-8 sm:p-10 rounded-[32px] bg-gradient-to-br from-[#FFF9F0] via-[#FFFDF9] to-[#FAF5FF] border-2 border-[#EADBBF] shadow-storybook space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#FFF0B8] border-2 border-[#E6CB67] flex items-center justify-center shadow-md">
            <Sparkles className="w-9 h-9 text-[#855627] animate-pulse" />
          </div>
          <span className="px-4 py-1.5 rounded-full bg-white border border-[#EADBBF] text-[15px] font-display font-bold text-[#855627] inline-block shadow-2xs">
            Seed Queued in Garden 🌱
          </span>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#4A3566]">
            Lecture Seed Planted
          </h3>
          <p className="text-[17px] font-body text-[#6C538C] leading-relaxed max-w-lg mx-auto">
            Your slides are queued for grounded AI analysis. As soon as the tutor engine begins, full topic explanations will bloom right here.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs font-display font-bold text-[#855627] pt-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#855627]" />
            <span>Connecting with tutor engine...</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. PROCESSING STATE (Live slide reading & topic generation)
  // -------------------------------------------------------------
  if (material.learnStatus === 'processing') {
    const currentSlide = material.learnProgress?.current || 1;
    const totalSlides = material.learnProgress?.total || material.totalPages || 20;
    const stageMsg = material.learnProgress?.message || `Analyzing slide ${currentSlide} of ${totalSlides}...`;
    const pct = material.learnProgress?.percentage || Math.min(95, Math.max(15, Math.round((currentSlide / totalSlides) * 100)));

    return (
      <div className="w-full max-w-2xl mx-auto py-14 px-4 text-center space-y-6 animate-fadeIn">
        <div className="p-8 sm:p-10 rounded-[32px] bg-gradient-to-br from-[#FFF9F0] via-[#FFFDF9] to-[#DBF5E7] border-2 border-[#83D9A7] shadow-storybook space-y-5">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#E7DCFF] border-2 border-[#B196F5] flex items-center justify-center shadow-md">
            <Loader2 className="w-10 h-10 text-[#6C3FE0] animate-spin" />
          </div>
          <span className="px-4 py-1.5 rounded-full bg-white border border-[#83D9A7] text-[15px] font-display font-bold text-[#1F8C4F] inline-block shadow-2xs">
            Planting Knowledge 🌱
          </span>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#4A3566]">
            Grounded AI Synthesis in Progress
          </h3>
          <p className="text-[18px] font-display font-bold text-[#6C3FE0]">
            {stageMsg}
          </p>

          {/* Botanical Vine Progress Bar */}
          <div className="space-y-1.5 max-w-md mx-auto">
            <div className="relative w-full h-3.5 rounded-full bg-[#EAD7BA] p-0.5 border border-[#855627]/30 shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-500 flex items-center justify-end"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, #83D9A7 0%, #9670F5 50%, #FFD6E0 100%)',
                }}
              >
                <div className="w-4 h-4 rounded-full bg-white border-2 border-[#9670F5] shadow-xs translate-x-1" />
              </div>
            </div>
            <div className="flex justify-between text-xs font-mono font-semibold text-[#855627]">
              <span>Extracting slides & tables</span>
              <span>{pct}% bloomed</span>
            </div>
          </div>

          <p className="text-[15px] font-body text-[#6C538C] max-w-md mx-auto leading-relaxed pt-2">
            Organizing slides into 5–8 coherent topics with real examples, comparison tables, and zero boilerplate.
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. FAILED STATE
  // -------------------------------------------------------------
  if (material.learnStatus === 'failed') {
    return (
      <div className="w-full max-w-2xl mx-auto py-14 px-4 text-center space-y-6 animate-fadeIn">
        <div className="p-8 sm:p-10 rounded-[32px] bg-[#FFF5F5] border-2 border-[#FEB2B2] shadow-storybook space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-white border-2 border-[#FC8181] flex items-center justify-center shadow-md">
            <AlertTriangle className="w-10 h-10 text-[#C53030]" />
          </div>
          <span className="px-4 py-1.5 rounded-full bg-white border border-[#FEB2B2] text-[15px] font-display font-bold text-[#C53030] inline-block">
            Sprouting Issue 🥀
          </span>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#742A2A]">
            This section tripped over a root. Couldn't plant this study guide
          </h3>
          <p className="text-[17px] font-body text-[#742A2A] leading-relaxed max-w-lg mx-auto">
            The AI tutor engine encountered an error while synthesizing topics. Tap below to retry planting.
          </p>
          <div className="pt-2">
            <button
              onClick={handleRegenerateAll}
              disabled={isRetryingAll}
              className="btn-storybook min-h-[48px] px-6 bg-gradient-to-r from-[#DBF5E7] to-[#FFF0B8] border-2 border-[#83D9A7] text-[#1F8C4F] text-[16px] font-bold shadow-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRetryingAll ? 'animate-spin' : ''}`} />
              <span>{isRetryingAll ? 'Retrying Sprout...' : 'Tap to retry'}</span>
            </button>
          </div>
          {material.errorReason && (
            <details className="mt-4 text-left max-w-md mx-auto bg-white p-3 rounded-2xl border border-[#FEB2B2] text-xs font-mono text-[#9B2C2C]">
              <summary className="font-bold cursor-pointer">Error details</summary>
              <div className="mt-1 whitespace-pre-wrap">{material.errorReason}</div>
            </details>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 4. EMPTY STATE (No learnData and no legacy sections)
  // -------------------------------------------------------------
  if (!learnData && (!sections || sections.length === 0)) {
    return (
      <div className="w-full max-w-2xl mx-auto py-14 px-4 text-center space-y-6 animate-fadeIn">
        <div className="p-8 sm:p-10 rounded-[32px] bg-gradient-to-br from-[#FFF9F0] to-[#FFFDF9] border-2 border-[#EADBBF] shadow-storybook space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#FFF0B8] border-2 border-[#E6CB67] flex items-center justify-center shadow-md">
            <BookOpen className="w-9 h-9 text-[#A67C0D]" />
          </div>
          <span className="px-4 py-1.5 rounded-full bg-white border border-[#EADBBF] text-[15px] font-display font-bold text-[#855627] inline-block">
            Study Guide Ready to Sprout 🌱
          </span>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#4A3566]">
            No Study Notes Yet
          </h3>
          <p className="text-[17px] font-body text-[#6C538C] leading-relaxed max-w-lg mx-auto">
            Sprout clean, grounded topic explanations, comparison tables, real company examples, and key concepts directly from your slides.
          </p>
          <div className="pt-2">
            <button
              onClick={handleRegenerateAll}
              disabled={isRetryingAll}
              className="btn-storybook min-h-[48px] px-6 bg-gradient-to-r from-[#DBF5E7] to-[#E7DCFF] border-2 border-[#83D9A7] text-[#1F8C4F] text-[16px] font-bold shadow-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isRetryingAll ? 'Planting Study Notes...' : 'Sprout Grounded Topics'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 5. MAIN GROUNDED LEARN VIEW (with learnData)
  // -------------------------------------------------------------
  if (learnData && topics.length > 0) {
    const deckTitle = learnData.deck_title || toTitleCase(material.title);
    const bigIdea = learnData.big_idea || `Grounded, structured study guide for ${deckTitle}.`;
    const takeaways = Array.isArray(learnData.key_takeaways) ? learnData.key_takeaways : [];
    const glossary = Array.isArray(learnData.glossary) ? learnData.glossary : [];

    return (
      <div className="w-full relative flex flex-col lg:flex-row gap-8 lg:gap-10 items-start pb-16">
        {/* ======================================================== */}
        {/* LEFT STICKY "ON THIS PAGE" RAIL (Desktop)               */}
        {/* ======================================================== */}
        <aside className="w-72 shrink-0 hidden lg:block sticky top-28 self-start bg-[#FFFBF4] rounded-3xl border-2 border-[#EADBBF] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EADBBF]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#855627]" />
              <h4 className="font-display font-bold text-[17px] text-[#4A3566]">
                Topics ({topics.length})
              </h4>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={expandAllTopics}
                className="text-xs font-display font-bold text-[#6C3FE0] hover:text-[#4A25A3] px-2 py-0.5 rounded hover:bg-[#F3ECFB] transition-colors"
                title="Expand all topics"
              >
                Expand all
              </button>
            </div>
          </div>

          <nav className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
            <button
              onClick={() => {
                document.getElementById('deck-big-idea')?.scrollIntoView({ behavior: 'smooth' });
                setActiveRailId('deck-big-idea');
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-display font-semibold transition-colors flex items-center gap-2 ${
                activeRailId === 'deck-big-idea'
                  ? 'bg-[#E7DCFF] text-[#4A25A3] border border-[#B196F5]'
                  : 'text-[#6C538C] hover:bg-[#F5EDE0] border border-transparent'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#855627]" />
              <span className="truncate">The Big Idea</span>
            </button>

            {topics.map((t, idx) => {
              const slideText = Array.isArray(t.slides) && t.slides.length > 0
                ? t.slides[0] === t.slides[1] || t.slides.length === 1
                  ? `Slide ${t.slides[0]}`
                  : `Slides ${t.slides.join('–')}`
                : '';

              const isActive = activeRailId === `topic-card-${idx}`;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setOpenTopics((prev) => ({ ...prev, [idx]: true }));
                    document.getElementById(`topic-card-${idx}`)?.scrollIntoView({ behavior: 'smooth' });
                    setActiveRailId(`topic-card-${idx}`);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-display font-semibold transition-colors flex flex-col gap-0.5 ${
                    isActive
                      ? 'bg-[#DBF5E7] text-[#1F8C4F] border border-[#83D9A7]'
                      : 'text-[#4A3566] hover:bg-[#F5EDE0] border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-[#855627]">
                      Topic {idx + 1}
                    </span>
                    {slideText && (
                      <span className="text-[10px] font-mono text-[#855627]/80">
                        {slideText}
                      </span>
                    )}
                  </div>
                  <span className="truncate font-medium text-[13px] text-[#2E1E43]">
                    {t.title}
                  </span>
                </button>
              );
            })}

            {takeaways.length > 0 && (
              <button
                onClick={() => {
                  document.getElementById('deck-takeaways')?.scrollIntoView({ behavior: 'smooth' });
                  setActiveRailId('deck-takeaways');
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-display font-semibold transition-colors flex items-center gap-2 ${
                  activeRailId === 'deck-takeaways'
                    ? 'bg-[#E7DCFF] text-[#4A25A3] border border-[#B196F5]'
                    : 'text-[#6C538C] hover:bg-[#F5EDE0] border border-transparent'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#16A34A]" />
                <span className="truncate">Key Takeaways</span>
              </button>
            )}

            {glossary.length > 0 && (
              <button
                onClick={() => {
                  document.getElementById('deck-glossary')?.scrollIntoView({ behavior: 'smooth' });
                  setActiveRailId('deck-glossary');
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-display font-semibold transition-colors flex items-center gap-2 ${
                  activeRailId === 'deck-glossary'
                    ? 'bg-[#E7DCFF] text-[#4A25A3] border border-[#B196F5]'
                    : 'text-[#6C538C] hover:bg-[#F5EDE0] border border-transparent'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0 text-[#855627]" />
                <span className="truncate">Deck Glossary ({glossary.length})</span>
              </button>
            )}
          </nav>
        </aside>

        {/* ======================================================== */}
        {/* MAIN TOPICS STREAM                                       */}
        {/* ======================================================== */}
        <div className="flex-1 w-full max-w-4xl space-y-8">
          {/* Deck Header & The Big Idea Callout */}
          <div
            id="deck-big-idea"
            className="rounded-[30px] bg-gradient-to-br from-[#FFFDF9] via-[#FFF9F2] to-[#FAF5FF] border-2 border-[#EADBBF] p-6 sm:p-8 shadow-storybook space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="px-3.5 py-1 rounded-full bg-[#E7DCFF] border border-[#B196F5] text-xs font-display font-bold text-[#5B21B6] uppercase tracking-wider shadow-2xs">
                Grounded Study Deck 🌱
              </span>
              <div className="flex items-center gap-2 text-xs font-display font-bold text-[#855627]">
                <span>{topics.length} Grounded Topics</span>
                <span>•</span>
                <span>{material.totalPages || (material as any).slides?.length || 18} Slides</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[#3B2252] leading-tight">
              {deckTitle}
            </h1>

            {/* The Big Idea Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF6EA] border border-[#F0DFBE] shadow-2xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFF0B8] border border-[#E6CB67] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Sparkles className="w-5 h-5 text-[#855627]" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-display font-bold uppercase tracking-wider text-[#855627]">
                  The Big Idea
                </div>
                <p className="text-[16px] sm:text-[17px] font-body text-[#4A3566] leading-relaxed">
                  {bigIdea}
                </p>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* TOPIC CARDS (Collapsible, first open by default)          */}
          {/* ======================================================== */}
          <div className="space-y-6">
            {topics.map((rawTopic, topicIdx) => {
              const topic = topicOverrides[topicIdx] || rawTopic;
              const isSimplified = topic.mode === 'simplify';
              const isDeeper = topic.mode === 'deeper';
              const isAdjusted = isSimplified || isDeeper;

              const isOpen = openTopics[topicIdx] ?? (topicIdx === 0);
              const slideBadge = Array.isArray(topic.slides) && topic.slides.length > 0
                ? topic.slides[0] === topic.slides[1] || topic.slides.length === 1
                  ? `Slide ${topic.slides[0]}`
                  : `Slides ${topic.slides.join('–')}`
                : '';

              const isAdjustingThis = adjustingTopicIdx === topicIdx;
              const hasTable = topic.comparison_table &&
                Array.isArray(topic.comparison_table.headers) &&
                topic.comparison_table.headers.length > 0 &&
                Array.isArray(topic.comparison_table.rows) &&
                topic.comparison_table.rows.length > 0;

              const concepts = Array.isArray(topic.key_concepts) ? topic.key_concepts : [];
              const hasError = Boolean(adjustErrors[topicIdx]);

              return (
                <div
                  key={topicIdx}
                  id={`topic-card-${topicIdx}`}
                  className="rounded-[28px] bg-[#FFFDF9] border-2 border-[#EADBBF] shadow-storybook overflow-hidden transition-all duration-200"
                >
                  {/* Topic Card Header */}
                  <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 bg-white/80 border-b border-[#F2E8D8]">
                    <div
                      className="flex-1 min-w-[240px] flex items-center gap-3 cursor-pointer select-none"
                      onClick={() => toggleTopic(topicIdx)}
                    >
                      <span className="px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-wider bg-[#F3ECFB] text-[#6C3FE0] border border-[#D8C7F5] shrink-0 shadow-2xs">
                        Topic {topicIdx + 1}
                      </span>

                      <h2 className="text-[19px] sm:text-[21px] font-display font-bold text-[#3B2252] leading-snug">
                        {topic.title}
                      </h2>

                      {slideBadge && (
                        <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#FFF0B8] text-[#855627] border border-[#E6CB67]/50 shrink-0">
                          {slideBadge}
                        </span>
                      )}

                      {/* Mode Badge */}
                      {isSimplified && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-display font-bold bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA] shrink-0">
                          ✨ Simplified
                        </span>
                      )}
                      {isDeeper && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-display font-bold bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF] shrink-0">
                          🔍 Deep Dive
                        </span>
                      )}
                    </div>

                    {/* Topic Actions: Simplify, Go Deeper, Back to Original, Toggle Chevron */}
                    <div className="flex items-center gap-2">
                      {isAdjusted && (
                        <button
                          data-testid={`restore-btn-${topicIdx}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreOriginal(topicIdx);
                          }}
                          className="text-xs font-display font-bold px-3 py-1.5 rounded-xl border border-[#D4A373] bg-[#FFFBF4] hover:bg-[#F5EDE0] text-[#855627] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Restore original lecture explanation"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          <span>Back to original</span>
                        </button>
                      )}

                      <button
                        data-testid={`simplify-btn-${topicIdx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdjustTopic(topicIdx, 'simplify');
                        }}
                        disabled={isAdjustingThis}
                        className={`text-xs font-display font-bold px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs ${
                          isSimplified
                            ? 'border-[#EA580C] bg-[#FFF7ED] text-[#EA580C]'
                            : 'border-[#B196F5] bg-[#F5EEFA] hover:bg-[#EBE0F8] text-[#5B21B6]'
                        }`}
                        title="Explain this topic in simpler words with an everyday analogy"
                      >
                        {isAdjustingThis && adjustingMode === 'simplify' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Wand2 className="w-3.5 h-3.5" />
                        )}
                        <span>{isSimplified ? 'Simplified ✓' : 'Simplify'}</span>
                      </button>

                      <button
                        data-testid={`deeper-btn-${topicIdx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdjustTopic(topicIdx, 'deeper');
                        }}
                        disabled={isAdjustingThis}
                        className={`text-xs font-display font-bold px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs ${
                          isDeeper
                            ? 'border-[#10B981] bg-[#ECFDF5] text-[#047857]'
                            : 'border-[#83D9A7] bg-[#E8F8F0] hover:bg-[#D7F3E4] text-[#1B6D41]'
                        }`}
                        title="Dig deeper into architecture, edge cases, and PM trade-offs"
                      >
                        {isAdjustingThis && adjustingMode === 'deeper' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Compass className="w-3.5 h-3.5" />
                        )}
                        <span>{isDeeper ? 'Deep Dive ✓' : 'Go deeper'}</span>
                      </button>

                      <button
                        onClick={() => toggleTopic(topicIdx)}
                        className="w-8 h-8 rounded-full bg-[#F5EDE0] hover:bg-[#EBDCC8] flex items-center justify-center text-[#5C4033] transition-colors cursor-pointer"
                        aria-label={isOpen ? 'Collapse topic' : 'Expand topic'}
                      >
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Topic Card Content (Collapsible) */}
                  {isOpen && (
                    <div className="p-6 sm:p-7 space-y-6 bg-white/60">
                      {/* Inline Error Notice if adjust failed */}
                      {hasError && (
                        <div className="p-4 rounded-2xl bg-[#FFF5F5] border border-[#FEB2B2] flex items-center justify-between gap-3 text-xs text-[#9B2C2C] shadow-2xs">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-[#C53030] shrink-0" />
                            <span>{adjustErrors[topicIdx]}</span>
                          </div>
                          <button
                            onClick={() => handleAdjustTopic(topicIdx, adjustingMode || 'simplify')}
                            className="btn-storybook min-h-[30px] px-3 bg-white border border-[#FEB2B2] text-[#C53030] text-xs font-bold shrink-0 cursor-pointer"
                          >
                            Retry
                          </button>
                        </div>
                      )}

                      {/* 1. Summary */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF6F0] border border-[#EFE5D5] shadow-2xs">
                        <div className="text-xs font-display font-bold uppercase tracking-wider text-[#855627] mb-1">
                          Overview
                        </div>
                        <p className="text-[16px] sm:text-[17px] font-body text-[#3B2A4A] leading-relaxed font-medium">
                          {topic.summary}
                        </p>
                      </div>

                      {/* Simplify: Everyday Analogy Box */}
                      {(topic.analogy || (topic as any).everyday_analogy) && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] shadow-2xs space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#C2410C]">
                            <Lightbulb className="w-4 h-4 text-[#EA580C]" />
                            <span>Everyday Analogy</span>
                          </div>
                          <p className="text-[15px] sm:text-[16px] font-body text-[#9A3412] leading-relaxed">
                            {topic.analogy || (topic as any).everyday_analogy}
                          </p>
                        </div>
                      )}

                      {/* Go Deeper: Technical Depth Box */}
                      {topic.extra_detail && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] shadow-2xs space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#7E22CE]">
                            <Layers className="w-4 h-4 text-[#9333EA]" />
                            <span>Technical Depth & Architecture Mechanics</span>
                          </div>
                          <p className="text-[15px] sm:text-[16px] font-body text-[#581C87] leading-relaxed">
                            {topic.extra_detail}
                          </p>
                        </div>
                      )}

                      {/* Go Deeper: Edge Cases Box */}
                      {Array.isArray(topic.edge_cases) && topic.edge_cases.length > 0 && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] shadow-2xs space-y-2">
                          <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#B45309]">
                            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                            <span>Edge Cases & Gotchas from Slides</span>
                          </div>
                          <ul className="space-y-1.5 pl-1">
                            {topic.edge_cases.map((ec, ecIdx) => (
                              <li key={ecIdx} className="text-[14px] sm:text-[15px] font-body text-[#78350F] flex items-start gap-2">
                                <span className="text-amber-500 font-bold">•</span>
                                <span>{ec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Go Deeper: PM Lens Box */}
                      {topic.pm_lens && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] shadow-2xs space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#15803D]">
                            <GraduationCap className="w-4 h-4 text-[#16A34A]" />
                            <span>PM Decision Framework (Prioritization & Trade-offs)</span>
                          </div>
                          <p className="text-[15px] sm:text-[16px] font-body text-[#14532D] leading-relaxed">
                            {topic.pm_lens}
                          </p>
                        </div>
                      )}

                      {/* 2. Key Concepts */}
                      {concepts.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#6C3FE0]">
                            <Sparkles className="w-4 h-4 text-[#6C3FE0]" />
                            <span>Key Concepts ({concepts.length})</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {concepts.map((concept, cIdx) => (
                              <div
                                key={cIdx}
                                className="p-3.5 rounded-2xl bg-white border border-[#E9E1F0] shadow-2xs hover:border-[#D4C3E3] transition-colors space-y-1"
                              >
                                <div className="font-display font-bold text-[15px] text-[#2E184A] flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#9670F5]" />
                                  <span>{concept.term}</span>
                                </div>
                                <div className="font-body text-[14px] text-[#5C4B6F] leading-snug pl-3">
                                  {concept.meaning}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. Comparison Table (Optional - only when slides contain real comparison) */}
                      {hasTable && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#0284C7]">
                            <Table className="w-4 h-4 text-[#0284C7]" />
                            <span>Comparison & Trade-offs</span>
                          </div>
                          <div className="overflow-x-auto rounded-2xl border border-[#BAE6FD] bg-white shadow-2xs">
                            <table className="w-full border-collapse text-left">
                              <thead>
                                <tr className="bg-[#F0F9FF] border-b border-[#BAE6FD]">
                                  {topic.comparison_table!.headers.map((hdr, hIdx) => (
                                    <th
                                      key={hIdx}
                                      className="px-4 py-3 font-display font-bold text-xs uppercase tracking-wider text-[#0369A1]"
                                    >
                                      {hdr}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#E0F2FE]">
                                {topic.comparison_table!.rows.map((row, rIdx) => (
                                  <tr
                                    key={rIdx}
                                    className={rIdx % 2 === 0 ? 'bg-white' : 'bg-[#F8FCFF]'}
                                  >
                                    {row.map((cell, cIdx) => (
                                      <td
                                        key={cIdx}
                                        className="px-4 py-3 font-body text-[14px] text-[#1E293B] leading-relaxed"
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* 4. Real Example from Slides */}
                      {topic.example && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] shadow-2xs space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#15803D]">
                            <Building2 className="w-4 h-4 text-[#16A34A]" />
                            <span>Example from Lecture Slides</span>
                          </div>
                          <p className="text-[15px] sm:text-[16px] font-body text-[#14532D] leading-relaxed">
                            {topic.example}
                          </p>
                        </div>
                      )}

                      {/* 5. Why It Matters */}
                      {topic.why_it_matters && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] shadow-2xs space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#7E22CE]">
                            <GraduationCap className="w-4 h-4 text-[#9333EA]" />
                            <span>Why This Matters (PM Perspective)</span>
                          </div>
                          <p className="text-[15px] sm:text-[16px] font-body text-[#581C87] leading-relaxed">
                            {topic.why_it_matters}
                          </p>
                        </div>
                      )}

                      {/* 6. Common Confusion */}
                      {topic.common_confusion && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] shadow-2xs space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#B45309]">
                            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                            <span>Common Confusion to Avoid</span>
                          </div>
                          <p className="text-[15px] sm:text-[16px] font-body text-[#78350F] leading-relaxed">
                            {topic.common_confusion}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* KEY TAKEAWAYS (At bottom)                                */}
          {/* ======================================================== */}
          {takeaways.length > 0 && (
            <div
              id="deck-takeaways"
              className="rounded-[28px] bg-gradient-to-br from-[#FFFDF8] via-[#FFF9F0] to-[#E8F8F0] border-2 border-[#83D9A7] p-6 sm:p-8 shadow-storybook space-y-4"
            >
              <div className="flex items-center gap-2 text-[#15803D]">
                <CheckCircle2 className="w-6 h-6 text-[#16A34A]" />
                <h3 className="text-xl sm:text-2xl font-display font-bold text-[#14532D]">
                  Key Takeaways
                </h3>
              </div>
              <ul className="space-y-3 pt-1">
                {takeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#DCFCE7] border border-[#86EFAC] text-[#16A34A] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="text-[15px] sm:text-[16px] font-body text-[#1F402B] leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ======================================================== */}
          {/* GLOSSARY (At bottom)                                     */}
          {/* ======================================================== */}
          {glossary.length > 0 && (
            <div
              id="deck-glossary"
              className="rounded-[28px] bg-[#FFFDF9] border-2 border-[#EADBBF] p-6 sm:p-8 shadow-storybook space-y-4"
            >
              <div className="flex items-center gap-2 text-[#4A3566]">
                <BookOpen className="w-6 h-6 text-[#855627]" />
                <h3 className="text-xl sm:text-2xl font-display font-bold text-[#3B2252]">
                  Deck Glossary ({glossary.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {glossary.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-[#EFE5D5] shadow-2xs space-y-1 hover:border-[#D8C7B0] transition-colors"
                  >
                    <div className="font-display font-bold text-[15px] text-[#3B2252]">
                      {item.term}
                    </div>
                    <div className="font-body text-[14px] text-[#5C4573] leading-snug">
                      {item.meaning}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 6. LEGACY SECTIONS FALLBACK (For older materials before learnData)
  // -------------------------------------------------------------
  return (
    <div className="w-full relative flex flex-col gap-6 items-start pb-16">
      {/* Upgrade Banner to Grounded Topics */}
      <div className="w-full p-5 rounded-3xl bg-gradient-to-r from-[#FAF5FF] via-[#FFF9F2] to-[#E8F8F0] border-2 border-[#B196F5] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-[#6C3FE0] shrink-0" />
          <div>
            <h4 className="font-display font-bold text-[16px] text-[#3B2252]">
              Upgrade to Grounded Topic Guide
            </h4>
            <p className="text-xs sm:text-sm font-body text-[#6C538C]">
              Organize this deck into 5–8 clean topics with real examples, comparison tables, and zero boilerplate.
            </p>
          </div>
        </div>
        <button
          onClick={handleRegenerateAll}
          disabled={isRetryingAll}
          className="btn-storybook min-h-[40px] px-5 bg-gradient-to-r from-[#DBF5E7] to-[#E7DCFF] border-2 border-[#83D9A7] text-[#1F8C4F] text-xs font-bold shadow-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetryingAll ? 'animate-spin' : ''}`} />
          <span>{isRetryingAll ? 'Regenerating...' : 'Regenerate Grounded Topics'}</span>
        </button>
      </div>

      {/* Render Legacy Sections */}
      <div className="w-full space-y-6">
        {sections.map((section, sIdx) => (
          <div
            key={section.id}
            id={section.id}
            className="rounded-[28px] bg-[#FFFDF9] border-2 border-[#EADBBF] p-6 shadow-storybook space-y-4"
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#F2E8D8] pb-3">
              <span className="px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-wider bg-[#F3ECFB] text-[#6C3FE0] border border-[#D8C7F5]">
                {section.slidesRange}
              </span>
              <h3 className="text-xl font-display font-bold text-[#3B2252]">
                {section.title}
              </h3>
            </div>
            <p className="text-[16px] font-body text-[#3B2A4A] leading-relaxed">
              {section.inSimpleWords || 'Explanation pending generation.'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
