import confetti from 'canvas-confetti';

/**
 * Enchanted Petals Falling Celebration
 * Floats pastel flower petals (lavender, blush pink, mint, butter yellow) across the screen.
 * Respects prefers-reduced-motion.
 */
export function triggerPetalsCelebration() {
  if (typeof window === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const end = Date.now() + 1500;
  const colors = ['#C084FC', '#F472B6', '#34D399', '#FBBF24', '#DDD6FE', '#FCE7F3'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: colors,
      shapes: ['circle'],
      scalar: 1.2,
      gravity: 0.6,
      drift: 0.5,
    });

    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: colors,
      shapes: ['circle'],
      scalar: 1.2,
      gravity: 0.6,
      drift: -0.5,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
