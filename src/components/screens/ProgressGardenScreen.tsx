import React, { useState } from 'react';
import { GardenPlant, SubjectId } from '../../types';
import { SUBJECTS } from '../../utils/subjects';
import { BloomingStreakFlower } from '../illustrations/Characters';
import { FloatingPetalsBackground } from '../illustrations/GardenAccents';
import { Flower2, Sparkles, BookOpen, ArrowRight, TreePine, Calendar } from 'lucide-react';

interface ProgressGardenScreenProps {
  plants: GardenPlant[];
  streak: number;
  onOpenConcept?: (subjectId: SubjectId, conceptTitle: string) => void;
  onPlantSeed: () => void;
}

export const ProgressGardenScreen: React.FC<ProgressGardenScreenProps> = ({
  plants,
  streak,
  onOpenConcept,
  onPlantSeed,
}) => {
  const [selectedPlant, setSelectedPlant] = useState<GardenPlant | null>(null);

  const pmCount = plants.filter((p) => p.subjectId === 'pm2').length;
  const mrCount = plants.filter((p) => p.subjectId === 'mrm').length;
  const microCount = plants.filter((p) => p.subjectId === 'microecon').length;

  return (
    <div className="relative min-h-[calc(100vh-80px)] py-8 px-4 sm:px-8 max-w-6xl mx-auto flex flex-col justify-between">
      <FloatingPetalsBackground />

      {/* Header */}
      <section className="text-center relative z-10 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-garden-sand shadow-sm mb-3">
          <TreePine className="w-4 h-4 text-emerald-600" />
          <span className="font-display font-medium text-xs sm:text-sm text-plum-dark">
            The Living Garden Meadow • {plants.length} Blossoms in Bloom
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-semibold text-plum-dark tracking-tight mb-2">
          Your Garden of Wisdom
        </h1>
        <p className="text-base text-plum-medium max-w-xl mx-auto font-body">
          Every concept you master sprouts into a permanent flower in your meadow. A living landscape of your MBA journey.
        </p>

        {/* Soft Botanical Metrics Strip */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6">
          <div className="glass-card px-4 py-2 rounded-2xl border border-pm-pastel flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#8B5CF6]"></span>
            <span className="text-xs font-display text-plum-dark">
              PM2: <strong>{pmCount}</strong> Orchids
            </span>
          </div>
          <div className="glass-card px-4 py-2 rounded-2xl border border-mr-pastel flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#059669]"></span>
            <span className="text-xs font-display text-plum-dark">
              Research: <strong>{mrCount}</strong> Clovers
            </span>
          </div>
          <div className="glass-card px-4 py-2 rounded-2xl border border-micro-pastel flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#D97706]"></span>
            <span className="text-xs font-display text-plum-dark">
              Microecon: <strong>{microCount}</strong> Sunflowers
            </span>
          </div>
          <div className="glass-card px-4 py-2 rounded-2xl border border-garden-sand flex items-center gap-2">
            <BloomingStreakFlower streak={streak} size={20} />
            <span className="text-xs font-display text-plum-dark">
              Streak: <strong>{streak}</strong> Days
            </span>
          </div>
        </div>
      </section>

      {/* The Visual Meadow Canvas */}
      <section className="relative z-10 mb-8">
        <div className="glass-card rounded-5xl p-6 sm:p-10 min-h-[460px] relative overflow-hidden border-2 border-white shadow-garden-xl bg-gradient-to-b from-[#FDFBF7] via-[#F4EFEA] to-[#E8EFE5]">
          {/* Subtle rolling hills background lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
            viewBox="0 0 1000 500"
            preserveAspectRatio="none"
          >
            <path d="M 0 350 Q 250 280 500 340 T 1000 320 L 1000 500 L 0 500 Z" fill="#D1FAE5" opacity="0.4" />
            <path d="M 0 390 Q 300 330 650 380 T 1000 360 L 1000 500 L 0 500 Z" fill="#A7F3D0" opacity="0.5" />
          </svg>

          {/* Floating fireflies in the meadow */}
          <div className="absolute top-[20%] left-[15%] w-2 h-2 rounded-full bg-amber-300 animate-firefly opacity-70" />
          <div className="absolute top-[45%] right-[22%] w-2.5 h-2.5 rounded-full bg-amber-300 animate-firefly opacity-80" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[60%] left-[30%] w-2 h-2 rounded-full bg-amber-300 animate-firefly opacity-60" style={{ animationDelay: '4s' }} />

          {/* Empty Meadow State */}
          {plants.length === 0 ? (
            <div className="relative z-10 py-16 text-center max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white shadow-garden flex items-center justify-center border border-garden-sand">
                <Flower2 className="w-10 h-10 text-petal-rose animate-spin" style={{ animationDuration: '14s' }} />
              </div>
              <h3 className="text-2xl font-display font-semibold text-plum-dark mb-2">
                A Peaceful Meadow Awaiting Seeds
              </h3>
              <p className="text-sm text-plum-medium font-body leading-relaxed mb-6">
                Your garden meadow is currently empty. Complete quizzes and master concepts in your subjects to watch your first flowers bloom here!
              </p>
              <button
                onClick={onPlantSeed}
                className="btn-fairy-primary bg-plum-dark text-white hover:bg-pm-deep text-sm inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-fairy-gold" />
                <span>Begin Learning</span>
              </button>
            </div>
          ) : (
            /* Populated Meadow of Interactive Flowers */
            <div className="relative w-full h-[400px]">
              {plants.map((plant) => (
                <div
                  key={plant.id}
                  onClick={() => setSelectedPlant(plant)}
                  style={{
                    left: `${plant.xPercent}%`,
                    top: `${plant.yPercent}%`,
                    transform: `scale(${plant.scale})`,
                  }}
                  className="absolute cursor-pointer group transition-transform duration-300 hover:scale-125 z-10"
                >
                  {/* Botanical Flower Rendering by Subject */}
                  {plant.flowerType === 'lavender_orchid' && (
                    <div className="relative flex flex-col items-center">
                      <svg width="42" height="42" viewBox="0 0 50 50">
                        {/* Stem */}
                        <path d="M25 25 L25 50" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
                        {/* Petals */}
                        <circle cx="25" cy="18" r="8" fill="#DDD6FE" opacity="0.9" />
                        <circle cx="18" cy="24" r="7" fill="#C4B5FD" opacity="0.85" />
                        <circle cx="32" cy="24" r="7" fill="#C4B5FD" opacity="0.85" />
                        <circle cx="25" cy="26" r="6" fill="#8B5CF6" />
                        <circle cx="25" cy="24" r="2.5" fill="#FEF08A" />
                      </svg>
                      <span className="text-[9px] font-display font-semibold text-purple-900 bg-white/90 px-1.5 py-0.5 rounded-full shadow-sm border border-purple-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none mt-1">
                        {plant.conceptTitle}
                      </span>
                    </div>
                  )}

                  {plant.flowerType === 'mint_clover' && (
                    <div className="relative flex flex-col items-center">
                      <svg width="40" height="40" viewBox="0 0 50 50">
                        {/* Stem */}
                        <path d="M25 26 L25 50" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
                        {/* Clover Leaf Triad */}
                        <circle cx="20" cy="18" r="7" fill="#34D399" />
                        <circle cx="30" cy="18" r="7" fill="#34D399" />
                        <circle cx="25" cy="25" r="7" fill="#10B981" />
                        <circle cx="25" cy="21" r="2.5" fill="#DCFCE7" />
                      </svg>
                      <span className="text-[9px] font-display font-semibold text-emerald-900 bg-white/90 px-1.5 py-0.5 rounded-full shadow-sm border border-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none mt-1">
                        {plant.conceptTitle}
                      </span>
                    </div>
                  )}

                  {plant.flowerType === 'golden_sunflower' && (
                    <div className="relative flex flex-col items-center">
                      <svg width="42" height="42" viewBox="0 0 50 50">
                        {/* Stem */}
                        <path d="M25 25 L25 50" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
                        {/* Golden Petals */}
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
                          <ellipse
                            key={ang}
                            cx="25"
                            cy="15"
                            rx="4"
                            ry="9"
                            fill="#FBBF24"
                            transform={`rotate(${ang} 25 25)`}
                          />
                        ))}
                        {/* Heart */}
                        <circle cx="25" cy="25" r="7" fill="#78350F" />
                        <circle cx="25" cy="25" r="3" fill="#D97706" />
                      </svg>
                      <span className="text-[9px] font-display font-semibold text-amber-900 bg-white/90 px-1.5 py-0.5 rounded-full shadow-sm border border-amber-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none mt-1">
                        {plant.conceptTitle}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Flower Details Dialog when clicked */}
      {selectedPlant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-dark/30 backdrop-blur-sm">
          <div className="glass-card rounded-4xl p-6 sm:p-8 max-w-sm w-full shadow-garden-xl border border-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-display font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pm-soft text-pm-deep">
                Bloomed Blossom
              </span>
              <button
                onClick={() => setSelectedPlant(null)}
                className="w-7 h-7 rounded-full bg-garden-mist flex items-center justify-center text-plum-medium"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl font-display font-semibold text-plum-dark mb-1">
              {selectedPlant.conceptTitle}
            </h3>
            <p className="text-xs font-display text-pm-deep mb-3">
              {SUBJECTS[selectedPlant.subjectId]?.title}
            </p>

            <div className="p-3 rounded-2xl bg-garden-ivory border border-garden-sand text-xs font-body text-plum-medium mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-plum-light" />
              <span>Bloomed on {new Date(selectedPlant.bloomedAt).toLocaleDateString()}</span>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedPlant(null)}
                className="px-5 py-2.5 rounded-full bg-plum-dark text-white font-display text-xs font-medium hover:bg-pm-deep transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
