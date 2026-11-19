import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

// Latar dengan dua cahaya bergerak, gradien hidup, dan grid perspektif opsional
export const Background = ({
  base = '#05070f',
  glowA = 'rgba(56,189,248,0.28)',
  glowB = 'rgba(168,85,247,0.22)',
  grid = true,
  gridColor = 'rgba(148,163,184,0.10)',
  gridSize = 120,
  gridSpeed = 1,
  drift = 1,
}) => {
  const frame = useCurrentFrame();
  const ax = 50 + Math.sin((frame / 120) * drift) * 22;
  const ay = 40 + Math.cos((frame / 150) * drift) * 18;
  const bx = 55 + Math.cos((frame / 140) * drift) * 25;
  const by = 65 + Math.sin((frame / 110) * drift) * 15;
  const offX = -((frame * 1.4 * gridSpeed) % gridSize);
  const offY = -((frame * 0.7 * gridSpeed) % gridSize);

  return (
    <AbsoluteFill style={{ background: base }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${ax}% ${ay}%, ${glowA}, transparent 55%), radial-gradient(circle at ${bx}% ${by}%, ${glowB}, transparent 60%)`,
        }}
      />
      {grid && (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            backgroundPosition: `${offX}px ${offY}px`,
            maskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 85%)',
          }}
        />
      )}
    </AbsoluteFill>
  );
};
