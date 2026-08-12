'use client';

import { motion } from 'framer-motion';

// Sphere animation config — each orb drifts on its own offset cycle.
interface SphereConfig {
  className: string;
  blur: string;
  animate: {
    x: number[];
    y: number[];
    scale: number[];
  };
  transition: {
    duration: number;
    delay: number;
  };
}

const SPHERES: SphereConfig[] = [
  {
    // Deep purple — dominant, top-left origin
    className: 'absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-[#7F3AA1]/15',
    blur: 'blur-[160px]',
    animate: {
      x: [0, 80, -40, 0],
      y: [0, 50, 120, 0],
      scale: [1, 1.12, 0.95, 1],
    },
    transition: { duration: 28, delay: 0 },
  },
  {
    // Indigo — bottom-right counterweight
    className: 'absolute -bottom-[15%] -right-[10%] w-[55vw] h-[55vw] rounded-full bg-[#5416B5]/12',
    blur: 'blur-[140px]',
    animate: {
      x: [0, -90, 40, 0],
      y: [0, -60, -130, 0],
      scale: [1, 0.9, 1.08, 1],
    },
    transition: { duration: 34, delay: 3 },
  },
  {
    // Faint Spotify green — subtle accent, center-right drift
    className: 'absolute top-[30%] right-[5%] w-[40vw] h-[40vw] rounded-full bg-[#1DB954]/5',
    blur: 'blur-[120px]',
    animate: {
      x: [0, -110, 30, 0],
      y: [0, 80, -50, 0],
      scale: [1, 1.06, 0.94, 1],
    },
    transition: { duration: 25, delay: 7 },
  },
];

export function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 z-[-1] overflow-hidden"
      style={{ backgroundColor: '#0A0A0B' }}
      aria-hidden="true"
    >
      {/* Animated light orbs */}
      {SPHERES.map((sphere, i) => (
        <motion.div
          key={i}
          className={`${sphere.className} ${sphere.blur}`}
          style={{ willChange: 'transform' }}
          animate={sphere.animate}
          transition={{
            duration: sphere.transition.duration,
            delay: sphere.transition.delay,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Film grain noise texture — SVG feTurbulence, GPU-composited */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ willChange: 'transform' }}>
        <filter id="ambient-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter="url(#ambient-grain)"
          opacity="0.03"
        />
      </svg>
    </div>
  );
}

