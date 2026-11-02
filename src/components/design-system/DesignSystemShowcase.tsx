import React, { useState } from 'react';
import { FayeFairyBuilder, BarnabyCuriousFox, PipFriendlyBunny, BloomingStreakFlower } from '../illustrations/Characters';
import { FloatingPetalsBackground, StorybookVineDivider } from '../illustrations/GardenAccents';
import { Sparkles, Flower2, BookOpen, ArrowRight, Play, CheckCircle2, Feather, Compass } from 'lucide-react';

export const DesignSystemShowcase: React.FC<{ onProceedToHome?: () => void }> = ({ onProceedToHome }) => {
  const [demoStreak, setDemoStreak] = useState(3);
  const [activeTab, setActiveTab] = useState<'tokens' | 'characters' | 'components'>('characters');

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-8 max-w-6xl mx-auto">
      <FloatingPetalsBackground />

      {/* Top Header */}
      <header className="text-center mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pm-soft border border-pm-pastel text-pm-deep font-display text-sm mb-4 shadow-sm">
          <Sparkles className="w-4 h-4 text-pm-accent animate-spin" style={{ animationDuration: '6s' }} />
          <span>Petal Storybook Design System & Brand Identity</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-semibold text-plum-dark mb-3 tracking-tight">
          The Enchanted Garden
        </h1>
        <p className="text-lg text-plum-medium max-w-2xl mx-auto font-body">
          A calm, magical storybook design system for an MBA learning space. Crafted with soft ivory backgrounds,
          delicate pastel accents, generous spacing, and zero pure black.
        </p>

        {/* Tab switch */}
        <div className="inline-flex p-1.5 rounded-2xl glass-card mt-6 border border-garden-sand">
          <button
            onClick={() => setActiveTab('characters')}
            className={`px-5 py-2 rounded-xl font-display text-sm transition-all ${
              activeTab === 'characters'
                ? 'bg-white shadow-sm text-plum-dark font-semibold'
                : 'text-plum-medium hover:text-plum-dark'
            }`}
          >
            🌸 3 Subject Characters
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-5 py-2 rounded-xl font-display text-sm transition-all ${
              activeTab === 'tokens'
                ? 'bg-white shadow-sm text-plum-dark font-semibold'
                : 'text-plum-medium hover:text-plum-dark'
            }`}
          >
            🎨 Color & Typography Tokens
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`px-5 py-2 rounded-xl font-display text-sm transition-all ${
              activeTab === 'components'
                ? 'bg-white shadow-sm text-plum-dark font-semibold'
                : 'text-plum-medium hover:text-plum-dark'
            }`}
          >
            🌿 Component Styles & Cards
          </button>
        </div>
      </header>

      {/* Section 1: The 3 Subject Characters */}
      {activeTab === 'characters' && (
        <section className="space-y-8 relative z-10">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-display font-semibold text-plum-dark">
              The Three Subject World Guardians
            </h2>
            <p className="text-sm text-plum-medium">
              Hand-drawn cartoon storybook SVG illustrations tailored to each MBA subject discipline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Character 1: Faye */}
            <div className="glass-card rounded-4xl p-6 flex flex-col items-center text-center border-2 border-pm-pastel/60 hover:-translate-y-2 transition-transform duration-300 shadow-garden hover:shadow-glow-pm">
              <div className="w-48 h-48 mb-4 relative flex items-center justify-center">
                <FayeFairyBuilder size={190} />
              </div>
              <span className="text-xs font-display tracking-widest uppercase px-3 py-1 rounded-full bg-pm-soft text-pm-deep font-semibold mb-2">
                Product Management 2
              </span>
              <h3 className="text-2xl font-display font-semibold text-plum-dark">Faye</h3>
              <p className="text-sm font-display text-pm-deep mb-3">The Fairy Builder</p>
              <p className="text-sm text-plum-medium font-body leading-relaxed mb-4">
                Surrounded by lavender sparkles, holding a glowing star wand and floating architectural blueprint cube.
                Guides the user through roadmap trade-offs, activation funnels, and user delight.
              </p>
              <div className="w-full pt-4 border-t border-pm-light flex items-center justify-between text-xs font-display text-plum-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#EDE9FE] border border-[#A78BFA]"></span>
                  Lavender World
                </span>
                <span className="text-pm-deep font-medium">PM-802</span>
              </div>
            </div>

            {/* Character 2: Barnaby */}
            <div className="glass-card rounded-4xl p-6 flex flex-col items-center text-center border-2 border-mr-pastel/60 hover:-translate-y-2 transition-transform duration-300 shadow-garden hover:shadow-glow-mr">
              <div className="w-48 h-48 mb-4 relative flex items-center justify-center">
                <BarnabyCuriousFox size={190} />
              </div>
              <span className="text-xs font-display tracking-widest uppercase px-3 py-1 rounded-full bg-mr-soft text-mr-deep font-semibold mb-2">
                Market Research Methods
              </span>
              <h3 className="text-2xl font-display font-semibold text-plum-dark">Barnaby</h3>
              <p className="text-sm font-display text-mr-deep mb-3">The Curious Fox & Scholar</p>
              <p className="text-sm text-plum-medium font-body leading-relaxed mb-4">
                Wearing scholars brass spectacles and tweed scholar coat, peering through a brass magnifying glass at a budding inquiry sprout.
                Guides survey designs, qualitative interviews, and statistical power.
              </p>
              <div className="w-full pt-4 border-t border-mr-light flex items-center justify-between text-xs font-display text-plum-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#DCFCE7] border border-[#34D399]"></span>
                  Mint / Sage World
                </span>
                <span className="text-mr-deep font-medium">MR-704</span>
              </div>
            </div>

            {/* Character 3: Pip */}
            <div className="glass-card rounded-4xl p-6 flex flex-col items-center text-center border-2 border-micro-pastel/60 hover:-translate-y-2 transition-transform duration-300 shadow-garden hover:shadow-glow-micro">
              <div className="w-48 h-48 mb-4 relative flex items-center justify-center">
                <PipFriendlyBunny size={190} />
              </div>
              <span className="text-xs font-display tracking-widest uppercase px-3 py-1 rounded-full bg-micro-soft text-micro-deep font-semibold mb-2">
                Microeconomics
              </span>
              <h3 className="text-2xl font-display font-semibold text-plum-dark">Pip</h3>
              <p className="text-sm font-display text-micro-deep mb-3">The Friendly Bunny</p>
              <p className="text-sm text-plum-medium font-body leading-relaxed mb-4">
                Floppy ears, cozy buttercup apron, holding a giant honey coin and resting beside a gentle wooden equilibrium scale.
                Demystifies supply-demand shifts, consumer surplus, and price elasticity.
              </p>
              <div className="w-full pt-4 border-t border-micro-light flex items-center justify-between text-xs font-display text-plum-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#FEF3C7] border border-[#F59E0B]"></span>
                  Butter & Peach World
                </span>
                <span className="text-micro-deep font-medium">EC-601</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 2: Color & Typography Tokens */}
      {activeTab === 'tokens' && (
        <section className="space-y-10 relative z-10">
          {/* Colors */}
          <div className="glass-card rounded-4xl p-8 shadow-garden border border-garden-sand">
            <h3 className="text-xl font-display font-semibold text-plum-dark mb-6 flex items-center gap-2">
              <span className="text-xl">🎨</span> The Storybook Palette Worlds
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Product Management Palette */}
              <div className="p-4 rounded-3xl bg-pm-soft/60 border border-pm-pastel">
                <h4 className="font-display font-semibold text-pm-deep text-sm mb-3">Lavender World (PM2)</h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#F6F3FF] border border-[#DDD6FE]">
                    <span>#F6F3FF Soft</span>
                    <span className="w-4 h-4 rounded-full bg-[#F6F3FF] border"></span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#EDE9FE]">
                    <span>#EDE9FE Light</span>
                    <span className="w-4 h-4 rounded-full bg-[#EDE9FE]"></span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#DDD6FE]">
                    <span>#DDD6FE Pastel</span>
                    <span className="w-4 h-4 rounded-full bg-[#DDD6FE]"></span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#A78BFA] text-white">
                    <span>#A78BFA Accent</span>
                    <span className="w-4 h-4 rounded-full bg-[#A78BFA]"></span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#7C3AED] text-white">
                    <span>#7C3AED Deep</span>
                    <span className="w-4 h-4 rounded-full bg-[#7C3AED]"></span>
                  </div>
                </div>
              </div>

              {/* Market Research Palette */}
              <div className="p-4 rounded-3xl bg-mr-soft/60 border border-mr-pastel">
                <h4 className="font-display font-semibold text-mr-deep text-sm mb-3">Mint & Sage World (MRM)</h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
                    <span>#F0FDF4 Soft</span>
                    <span className="w-4 h-4 rounded-full bg-[#F0FDF4] border"></span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#DCFCE7]">
                    <span>#DCFCE7 Light</span>
                    <span className="w-4 h-4 rounded-full bg-[#DCFCE7]"></span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#BBF7D0]">
                    <span>#BBF7D0 Pastel</span>
                    <span className="w-4 h-4 rounded-full bg-[#BBF7D0]"></span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#34D399] text-plum-dark">
                    <span>#34D399 Accent</span>
                    <span className="w-4 h-4 rounded-full bg-[#34D399]"></span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#059669] text-white">
                    <span>#059669 Deep</span>
                    <span className="w-4 h-4 rounded-full bg-[#059669]"></span>
                  </div>
                </div>
              </div>

              {/* Microeconomics Palette */}
              <div className="p-4 rounded-3xl bg-micro-soft/60 border border-micro-pastel">
                <h4 className="font-display font-semibold text-micro-deep text-sm mb-3">Butter & Peach World (Micro)</h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                    <span>#FFFBEB Soft</span>
                    <span className="w-4 h-4 rounded-full bg-[#FFFBEB] border"></span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#FEF3C7]">
                    <span>#FEF3C7 Light</span>
                    <span className="w-4 h-4 rounded-full bg-[#FEF3C7]"></span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#FDE68A]">
                    <span>#FDE68A Pastel</span>
                    <span className="w-4 h-4 rounded-full bg-[#FDE68A]"></span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#F59E0B] text-white">
                    <span>#F59E0B Accent</span>
                    <span className="w-4 h-4 rounded-full bg-[#F59E0B]"></span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#D97706] text-white">
                    <span>#D97706 Deep</span>
                    <span className="w-4 h-4 rounded-full bg-[#D97706]"></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Base & Text Palette */}
            <div className="mt-8 pt-6 border-t border-garden-sand">
              <h4 className="font-display font-semibold text-plum-dark text-sm mb-4">Background & Text Strict Rules</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#ECE4DB]">
                  <p className="font-semibold text-plum-dark">#FAF7F2</p>
                  <p className="text-plum-light font-body mt-1">Garden Cream Base</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#FFFDF9] border border-[#ECE4DB]">
                  <p className="font-semibold text-plum-dark">#FFFDF9</p>
                  <p className="text-plum-light font-body mt-1">Ivory Card Fill</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#2D1F38] text-white">
                  <p className="font-semibold">#2D1F38</p>
                  <p className="text-[#C3B8CB] font-body mt-1">Deep Plum (No Black!)</p>
                </div>
                <div className="p-3 rounded-2xl bg-[#594765] text-white">
                  <p className="font-semibold">#594765</p>
                  <p className="text-[#E8E1ED] font-body mt-1">Soft Slate Plum</p>
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="glass-card rounded-4xl p-8 shadow-garden border border-garden-sand">
            <h3 className="text-xl font-display font-semibold text-plum-dark mb-4 flex items-center gap-2">
              <Feather className="w-5 h-5 text-pm-accent" /> Typography Pairings
            </h3>
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-plum-light">Display Headings — Fredoka</span>
                <p className="text-3xl font-display font-semibold text-plum-dark mt-1">
                  "Every petal holds a quiet insight."
                </p>
                <p className="text-xs text-plum-medium font-body mt-1">
                  Rounded, joyful, whimsical letterforms with friendly geometry and zero harsh corners.
                </p>
              </div>
              <div className="pt-4 border-t border-garden-sand">
                <span className="text-xs uppercase font-mono tracking-wider text-plum-light">Body Text — Nunito</span>
                <p className="text-base text-plum-medium font-body leading-relaxed mt-1">
                  Nunito provides gentle rounded terminals and generous x-height, rendering long MBA case studies,
                  equations, and slide notes effortlessly readable without visual exhaustion.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Component Styles & Cards */}
      {activeTab === 'components' && (
        <section className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Interactive Streak Flower */}
            <div className="glass-card rounded-4xl p-6 shadow-garden border border-garden-sand flex flex-col items-center text-center">
              <h3 className="font-display font-semibold text-lg text-plum-dark mb-2">The Blooming Streak Flower</h3>
              <p className="text-xs text-plum-medium mb-4">
                Soft gamification: no point leaderboards, only a flower that opens its petals with daily learning.
              </p>
              <div className="my-2">
                <BloomingStreakFlower streak={demoStreak} size={110} />
              </div>
              <div className="flex items-center gap-2 mt-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setDemoStreak(s)}
                    className={`w-8 h-8 rounded-full font-display text-xs transition-all ${
                      demoStreak === s
                        ? 'bg-pm-deep text-white shadow-sm'
                        : 'bg-white border border-garden-sand text-plum-medium hover:border-pm-accent'
                    }`}
                  >
                    {s}d
                  </button>
                ))}
              </div>
              <p className="text-xs text-plum-light mt-3">Interactive demo: click days to watch petals bloom</p>
            </div>

            {/* Source Grounding Chip & Buttons */}
            <div className="glass-card rounded-4xl p-6 shadow-garden border border-garden-sand flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold text-lg text-plum-dark mb-2">Micro-Interactions & Badges</h3>
                <p className="text-xs text-plum-medium mb-4">
                  Everything grounded in uploaded slides with gentle feedback tokens.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pm-soft border border-pm-pastel text-xs font-display font-semibold text-pm-deep">
                    <BookOpen className="w-3.5 h-3.5" /> from slide 12
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mr-soft border border-mr-pastel text-xs font-display font-semibold text-mr-deep">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Concept Mastered
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-micro-soft border border-micro-pastel text-xs font-display font-semibold text-micro-deep">
                    <Flower2 className="w-3.5 h-3.5" /> New Seed Placed
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-garden-sand flex items-center gap-3">
                <button className="px-6 py-3 rounded-full bg-gradient-to-r from-pm-deep to-pm-accent text-white font-display text-sm font-medium shadow-garden hover:shadow-glow-pm hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  <Flower2 className="w-4 h-4" /> Plant a new seed
                </button>
                <button className="px-5 py-3 rounded-full bg-white border border-garden-sand hover:border-pm-pastel font-display text-sm text-plum-dark hover:bg-garden-ivory transition-all">
                  Go Deeper
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Proceed action to start exploring the app */}
      {onProceedToHome && (
        <div className="text-center mt-12 relative z-10">
          <button
            onClick={onProceedToHome}
            className="px-8 py-4 rounded-full bg-plum-dark text-white font-display font-medium text-base shadow-garden hover:bg-pm-deep hover:-translate-y-1 transition-all inline-flex items-center gap-3"
          >
            <span>Enter Today's Garden</span>
            <ArrowRight className="w-5 h-5 text-fairy-gold" />
          </button>
        </div>
      )}
    </div>
  );
};
