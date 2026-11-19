import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { DESIGN_W, DESIGN_H } from './Camera.jsx';

// Generator angka acak berbasis seed, sehingga hasil render selalu sama di setiap mesin
const seededRandom = (seed) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

// Partikel glowing yang mengalir naik dan berkedip mengikuti frame
export const Particles = ({
  count = 80,
  color = '#7dd3fc',
  seed = 1,
  speed = 1,
  minSize = 3,
  maxSize = 9,
  glow = true,
}) => {
  const frame = useCurrentFrame();
  const rand = seededRandom(seed * 9973 + 17);
  const items = Array.from({ length: count }, () => ({
    x: rand(),
    y: rand(),
    z: rand(),
    phase: rand() * Math.PI * 2,
    size: minSize + rand() * (maxSize - minSize),
  }));

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {items.map((p, i) => {
        const depth = 0.35 + p.z * 0.65;
        const travel = (p.y - frame * 0.0012 * speed * (0.5 + p.z) + 1) % 1;
        const sway = Math.sin(frame / 60 * speed + p.phase) * 0.018;
        const left = (p.x + sway) * DESIGN_W;
        const top = travel * DESIGN_H;
        const size = p.size * depth;
        const twinkle = 0.55 + 0.45 * Math.sin(frame / 12 + p.phase);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left,
              top,
              width: size,
              height: size,
              borderRadius: '50%',
              background: color,
              opacity: (0.25 + 0.75 * p.z) * twinkle,
              boxShadow: glow ? `0 0 ${size * 3}px ${color}` : 'none',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
