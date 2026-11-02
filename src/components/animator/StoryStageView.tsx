import React from 'react';
import { DirectorScene, StoryBeat, SceneActor, CharacterId, CharacterAction, PropItem } from './characters/types';
import { StageBackground } from './stage/StageBackground';
import { CharacterRenderer } from './characters/CharacterRenderer';
import { SignboardProp } from './stage/AnimatedProps';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryStageViewProps {
  scene: DirectorScene;
  elapsedTime: number; // seconds in this scene
  reducedMotion?: boolean;
}

export const StoryStageView: React.FC<StoryStageViewProps> = ({
  scene,
  elapsedTime,
  reducedMotion = false,
}) => {
  // Find current active beat for each actor based on elapsedTime
  const getActorState = (actorId: CharacterId) => {
    const actorBeats = (scene.beats || [])
      .filter((b) => b.actor === actorId && elapsedTime >= b.t)
      .sort((a, b) => b.t - a.t);

    const latestBeat = actorBeats[0];

    // Check if dialogue is currently active (e.g. show for 2.8s after beat.t)
    const activeSay =
      latestBeat?.say && elapsedTime - latestBeat.t <= 3.2 ? latestBeat.say : undefined;

    return {
      action: (latestBeat?.action || 'idle') as CharacterAction,
      item: latestBeat?.item as PropItem | undefined,
      say: activeSay,
    };
  };

  // Position mapping to CSS percentages
  const getPositionClass = (pos: SceneActor['position']) => {
    switch (pos) {
      case 'left':
        return 'left-[6%] sm:left-[10%] bottom-6';
      case 'center-left':
        return 'left-[22%] sm:left-[26%] bottom-6';
      case 'center':
        return 'left-[43%] sm:left-[45%] bottom-6';
      case 'center-right':
        return 'left-[63%] sm:left-[66%] bottom-6';
      case 'right':
        return 'left-[78%] sm:left-[80%] bottom-6';
      case 'counter':
        return 'left-[16%] sm:left-[20%] bottom-16 z-10';
      default:
        return 'left-[45%] bottom-6';
    }
  };

  return (
    <div className="relative w-full h-[320px] sm:h-[400px] rounded-3xl overflow-hidden border-2 border-[#D4A373]/60 bg-[#FFFDF9] shadow-inner flex flex-col justify-end">
      {/* 1. Layered Hand-Drawn Background */}
      <StageBackground
        type={scene.background}
        camera={scene.camera}
        reducedMotion={reducedMotion}
      />

      {/* 2. Small Swinging Wooden Signboard in Corner (Holds Formula / Takeaway max 6 words) */}
      <AnimatePresence>
        {scene.takeaway_prop && (
          <SignboardProp
            key={scene.takeaway_prop}
            text={scene.takeaway_prop}
            position="top-right"
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>

      {/* 3. Act Badge in top left (Setup / Cause & Effect / Result) */}
      <div className="absolute top-2.5 left-3 sm:top-4 sm:left-5 z-30 pointer-events-none">
        <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-display font-bold uppercase tracking-wider bg-white/90 border border-[#D4A373]/40 text-[#855627] shadow-xs">
          {scene.act === 'setup'
            ? 'Act 1 • Setup'
            : scene.act === 'action'
            ? 'Act 2 • Cause & Effect'
            : 'Act 3 • Discovery'}
        </span>
      </div>

      {/* 4. Animated Cast Actors on Stage */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {scene.actors.map((actor, idx) => {
          const state = getActorState(actor.id);
          const posClass = getPositionClass(actor.position);
          const flipX = actor.position === 'right' || actor.position === 'center-right';

          return (
            <motion.div
              key={`${actor.id}-${idx}`}
              initial={
                actor.enter === 'walk-in-left'
                  ? { x: -80, opacity: 0 }
                  : actor.enter === 'walk-in-right'
                  ? { x: 80, opacity: 0 }
                  : actor.enter === 'fly-in'
                  ? { y: -80, opacity: 0 }
                  : actor.enter === 'appear'
                  ? { scale: 0.5, opacity: 0 }
                  : { opacity: 1 }
              }
              animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`absolute ${posClass}`}
            >
              <CharacterRenderer
                id={actor.id}
                action={state.action}
                item={state.item}
                say={state.say}
                flipX={flipX}
                scale={actor.scale || 1}
                reducedMotion={reducedMotion}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
