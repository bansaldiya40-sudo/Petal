import React, { useState } from 'react';
import { SubjectId, Lesson } from '../../types';
import { ParallaxGardenLandscape } from '../illustrations/ParallaxGardenLandscape';
import { LavenderFairyTower, MintTreehouseLibrary, GoldenHoneyMarketStall } from '../illustrations/Landmarks';
import { ScrollOfTheDay } from '../home/ScrollOfTheDay';
import { PetalLogo } from '../brand/PetalLogo';
import { Sparkles, ArrowRight, BookOpen, Compass } from 'lucide-react';

interface HomeScreenProps {
  userName: string;
  lessons: Lesson[];
  streak: number;
  onSelectSubject: (subjectId: SubjectId) => void;
  onOpenLesson: (lessonId: string, conceptId?: string) => void;
  onPlantSeed: (subjectId: SubjectId) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userName = 'Diya',
  lessons,
  streak,
  onSelectSubject,
  onOpenLesson,
  onPlantSeed,
}) => {
  const [hoveredLandmark, setHoveredLandmark] = useState<SubjectId | null>(null);

  // Time-aware greeting for Diya
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${userName}`;
    if (hour < 17) return `Good afternoon, ${userName}`;
    return `Good evening, ${userName}`;
  };

  // Helper for landmark statistics (chapters & progress)
  const getSubjectStats = (subjectId: SubjectId) => {
    const subjectLessons = lessons.filter((l) => l.subjectId === subjectId);
    const totalConcepts = subjectLessons.reduce((acc, l) => acc + (l.concepts?.length || 0), 0);
    const bloomedConcepts = subjectLessons.reduce(
      (acc, l) => acc + (l.concepts?.filter((c) => c.status === 'bloomed')?.length || 0),
      0
    );
    return {
      lessonCount: subjectLessons.length,
      totalConcepts: totalConcepts || subjectLessons.length,
      bloomedConcepts: bloomedConcepts || (subjectLessons.length > 0 ? Math.min(bloomedConcepts, subjectLessons.length) : 0),
    };
  };

  const pmStats = getSubjectStats('pm2');
  const mrStats = getSubjectStats('mrm');
  const microStats = getSubjectStats('microecon');

  // Find last material to continue where user left off
  const lastMaterial = lessons.length > 0
    ? [...lessons].sort((a, b) => {
        const aTime = a.lastOpenedAt ? new Date(a.lastOpenedAt).getTime() : new Date(a.uploadedAt).getTime();
        const bTime = b.lastOpenedAt ? new Date(b.lastOpenedAt).getTime() : new Date(b.uploadedAt).getTime();
        return bTime - aTime;
      })[0]
    : null;

  return (
    <ParallaxGardenLandscape>
      <div className="relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-between px-4 sm:px-8 md:px-12 pb-8 pt-2">
        {/* ======================================================== */}
        {/* 1. TOP TITLE-PAGE HERO: Logo Lockup, Greeting, Quick CTA */}
        {/* ======================================================== */}
        <div className="relative z-30 w-full max-w-6xl mx-auto flex flex-col items-center justify-center text-center pt-2 sm:pt-4">
          {/* Floating Scroll of the Day held by Fairy in Top Right */}
          <div className="w-full flex justify-end mb-2 sm:mb-0 sm:absolute sm:top-2 sm:right-0 z-40">
            <ScrollOfTheDay
              lessons={lessons}
              onOpenLesson={onOpenLesson}
              onPlantSeed={() => onPlantSeed('pm2')}
            />
          </div>

          {/* Title Lockup: Blooming Petal Mark + Hand-Lettered Wordmark + Tagline */}
          <div className="mb-2">
            <PetalLogo variant="hero" animate />
          </div>

          {/* Time-Aware Greeting Line (Secondary) */}
          <p className="font-display font-extrabold text-[19px] sm:text-[22px] text-[#4B2A7B] tracking-tight mt-1 mb-0.5">
            {getTimeGreeting()}
          </p>

          {/* Subtitle: "Pick a sanctuary to begin" */}
          <p className="text-[15px] sm:text-[17px] font-display font-bold text-[#6C538C] mb-4">
            Pick a sanctuary to begin
          </p>

          {/* Clear Primary Button: "Continue where you left off" */}
          <div>
            <button
              onClick={() => {
                if (lastMaterial) {
                  onOpenLesson(lastMaterial.id);
                } else {
                  onPlantSeed('pm2');
                }
              }}
              className="btn-glossy px-8 py-3.5 min-h-[54px] bg-gradient-to-r from-[#FF5FA2] via-[#FF7F66] to-[#FFC93C] text-white text-[17px] sm:text-[19px] font-brand tracking-wide inline-flex items-center gap-2.5 shadow-[0_6px_0_#4B2A7B,0_14px_28px_rgba(75,42,123,0.25)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-[#FFF0B8]" />
              <span>
                {lastMaterial
                  ? `Continue where you left off: ${lastMaterial.title}`
                  : 'Start learning in Petal'}
              </span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. DESKTOP VIEW (md+): Winding Path with 3 Big Landmarks */}
        {/* ======================================================== */}
        <div className="hidden md:block relative w-full max-w-6xl mx-auto my-1 min-h-[480px] h-[500px] lg:h-[520px] shrink-0">
          {/* ------------------------------------------------------ */}
          {/* LANDMARK 1: Product Management 2 — Lavender Fairy Tower */}
          {/* Upper Left on rolling hill, separated from center      */}
          {/* ------------------------------------------------------ */}
          <div
            onClick={() => onSelectSubject('pm2')}
            onMouseEnter={() => setHoveredLandmark('pm2')}
            onMouseLeave={() => setHoveredLandmark(null)}
            className="absolute top-[2%] left-[2%] lg:left-[4%] cursor-pointer group z-20 transition-all duration-300"
          >
            <div className="relative flex flex-col items-center">
              <div className="w-64 lg:w-72 transition-transform duration-300 group-hover:scale-105">
                <LavenderFairyTower size={260} isHovered={hoveredLandmark === 'pm2'} />
              </div>

              {/* Saturated Wooden/Ribbon Signpost */}
              <div className="mt-[-24px] px-5 py-2 rounded-2xl bg-gradient-to-r from-[#9B72CF] to-[#7B4BB8] border-[2.5px] border-[#4B2A7B] shadow-[0_5px_0_#4B2A7B,0_10px_20px_rgba(75,42,123,0.2)] flex items-center gap-2.5 group-hover:scale-105 group-hover:shadow-[0_7px_0_#4B2A7B] transition-all">
                <span className="w-3.5 h-3.5 rounded-full bg-[#FFF0B8] border border-[#4B2A7B] shrink-0" />
                <span className="text-[20px] lg:text-[22px] font-brand font-black text-white tracking-wide whitespace-nowrap drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
                  Product Management 2
                </span>
                <span className="text-[12px] font-display font-black px-2.5 py-0.5 rounded-full bg-white text-[#4B2A7B] border-2 border-[#4B2A7B] shadow-xs flex items-center gap-1 shrink-0">
                  <span>🌸</span>
                  <span>{pmStats.lessonCount === 0 ? 'Plant seed' : `${pmStats.bloomedConcepts} / ${pmStats.totalConcepts} bloomed`}</span>
                </span>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------ */}
          {/* LANDMARK 2: Market Research Methods — Mint Treehouse   */}
          {/* Upper Right on rolling hill, separated from center     */}
          {/* ------------------------------------------------------ */}
          <div
            onClick={() => onSelectSubject('mrm')}
            onMouseEnter={() => setHoveredLandmark('mrm')}
            onMouseLeave={() => setHoveredLandmark(null)}
            className="absolute top-[2%] right-[2%] lg:right-[4%] cursor-pointer group z-20 transition-all duration-300"
          >
            <div className="relative flex flex-col items-center">
              <div className="w-64 lg:w-72 transition-transform duration-300 group-hover:scale-105">
                <MintTreehouseLibrary size={260} isHovered={hoveredLandmark === 'mrm'} />
              </div>

              {/* Saturated Wooden/Ribbon Signpost */}
              <div className="mt-[-24px] px-5 py-2 rounded-2xl bg-gradient-to-r from-[#20C5B5] to-[#16988B] border-[2.5px] border-[#4B2A7B] shadow-[0_5px_0_#4B2A7B,0_10px_20px_rgba(75,42,123,0.2)] flex items-center gap-2.5 group-hover:scale-105 group-hover:shadow-[0_7px_0_#4B2A7B] transition-all">
                <span className="w-3.5 h-3.5 rounded-full bg-[#FFF0B8] border border-[#4B2A7B] shrink-0" />
                <span className="text-[20px] lg:text-[22px] font-brand font-black text-white tracking-wide whitespace-nowrap drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
                  Market Research Methods
                </span>
                <span className="text-[12px] font-display font-black px-2.5 py-0.5 rounded-full bg-white text-[#4B2A7B] border-2 border-[#4B2A7B] shadow-xs flex items-center gap-1 shrink-0">
                  <span>🌸</span>
                  <span>{mrStats.lessonCount === 0 ? 'Plant seed' : `${mrStats.bloomedConcepts} / ${mrStats.totalConcepts} bloomed`}</span>
                </span>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------ */}
          {/* LANDMARK 3: Microeconomics — Golden Honey Market Stall */}
          {/* Bottom Center along the path, completely clear of both */}
          {/* ------------------------------------------------------ */}
          <div
            onClick={() => onSelectSubject('microecon')}
            onMouseEnter={() => setHoveredLandmark('microecon')}
            onMouseLeave={() => setHoveredLandmark(null)}
            className="absolute top-[20%] left-[30%] lg:left-[33%] cursor-pointer group z-20 transition-all duration-300"
          >
            <div className="relative flex flex-col items-center">
              <div className="w-64 lg:w-72 transition-transform duration-300 group-hover:scale-105">
                <GoldenHoneyMarketStall size={260} isHovered={hoveredLandmark === 'microecon'} />
              </div>

              {/* Saturated Wooden/Ribbon Signpost */}
              <div className="mt-[-24px] px-5 py-2 rounded-2xl bg-gradient-to-r from-[#FF9F43] to-[#E67E22] border-[2.5px] border-[#4B2A7B] shadow-[0_5px_0_#4B2A7B,0_10px_20px_rgba(75,42,123,0.2)] flex items-center gap-2.5 group-hover:scale-105 group-hover:shadow-[0_7px_0_#4B2A7B] transition-all">
                <span className="w-3.5 h-3.5 rounded-full bg-[#FFF0B8] border border-[#4B2A7B] shrink-0" />
                <span className="text-[20px] lg:text-[22px] font-brand font-black text-white tracking-wide whitespace-nowrap drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
                  Microeconomics
                </span>
                <span className="text-[12px] font-display font-black px-2.5 py-0.5 rounded-full bg-white text-[#4B2A7B] border-2 border-[#4B2A7B] shadow-xs flex items-center gap-1 shrink-0">
                  <span>🌸</span>
                  <span>{microStats.lessonCount === 0 ? 'Plant seed' : `${microStats.bloomedConcepts} / ${microStats.totalConcepts} bloomed`}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. MOBILE VIEW (< md): Vertical Storybook Trail          */}
        {/* ======================================================== */}
        <div className="md:hidden flex flex-col items-center gap-12 my-6 relative z-20">
          {/* 1. Fairy Tower */}
          <div
            onClick={() => onSelectSubject('pm2')}
            className="flex flex-col items-center cursor-pointer group active:scale-95 transition-transform"
          >
            <div className="w-72 max-w-[320px]">
              <LavenderFairyTower />
            </div>
            <div className="mt-[-20px] px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#9B72CF] to-[#7B4BB8] border-[2.5px] border-[#4B2A7B] shadow-[0_4px_0_#4B2A7B] flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#FFF0B8] border border-[#4B2A7B]" />
              <span className="text-[20px] font-brand font-black text-white">Product Management 2</span>
              <span className="text-[12px] font-display font-black px-2.5 py-0.5 rounded-full bg-white text-[#4B2A7B] border border-[#4B2A7B]">
                {pmStats.lessonCount === 0 ? 'Plant seed' : `${pmStats.bloomedConcepts}/${pmStats.totalConcepts}`}
              </span>
            </div>
          </div>

          {/* 2. Treehouse Library */}
          <div
            onClick={() => onSelectSubject('mrm')}
            className="flex flex-col items-center cursor-pointer group active:scale-95 transition-transform"
          >
            <div className="w-72 max-w-[320px]">
              <MintTreehouseLibrary />
            </div>
            <div className="mt-[-20px] px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#20C5B5] to-[#16988B] border-[2.5px] border-[#4B2A7B] shadow-[0_4px_0_#4B2A7B] flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#FFF0B8] border border-[#4B2A7B]" />
              <span className="text-[20px] font-brand font-black text-white">Market Research Methods</span>
              <span className="text-[12px] font-display font-black px-2.5 py-0.5 rounded-full bg-white text-[#4B2A7B] border border-[#4B2A7B]">
                {mrStats.lessonCount === 0 ? 'Plant seed' : `${mrStats.bloomedConcepts}/${mrStats.totalConcepts}`}
              </span>
            </div>
          </div>

          {/* 3. Honey Market Stall */}
          <div
            onClick={() => onSelectSubject('microecon')}
            className="flex flex-col items-center cursor-pointer group active:scale-95 transition-transform"
          >
            <div className="w-72 max-w-[320px]">
              <GoldenHoneyMarketStall />
            </div>
            <div className="mt-[-20px] px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF9F43] to-[#E67E22] border-[2.5px] border-[#4B2A7B] shadow-[0_4px_0_#4B2A7B] flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#FFF0B8] border border-[#4B2A7B]" />
              <span className="text-[20px] font-brand font-black text-white">Microeconomics</span>
              <span className="text-[12px] font-display font-black px-2.5 py-0.5 rounded-full bg-white text-[#4B2A7B] border border-[#4B2A7B]">
                {microStats.lessonCount === 0 ? 'Plant seed' : `${microStats.bloomedConcepts}/${microStats.totalConcepts}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ParallaxGardenLandscape>
  );
};
