import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background } from '../components/Background.jsx';
import { Particles } from '../components/Particles.jsx';
import { CameraStage, DESIGN_W, DESIGN_H } from '../components/Camera.jsx';
import { Caption, useIntro } from '../components/Transitions.jsx';

const seeded = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

// Jalur sirkuit ortogonal yang mengelilingi chip
const buildTraces = () => {
  const r = seeded(4242);
  return Array.from({ length: 18 }, (_, i) => {
    const x0 = 80 + r() * 1760;
    const y0 = i % 2 === 0 ? 70 : 1010;
    const xm = x0 + (r() - 0.5) * 420;
    const ym = 540 + (r() - 0.5) * 320;
    const xe = 960 + (r() - 0.5) * 520;
    return `M ${x0} ${y0} L ${xm} ${y0 + (ym - y0) * 0.5} L ${xm} ${ym} L ${xe} ${ym}`;
  });
};

const TRACES = buildTraces();

// Chip 3D: beberapa lapisan plat dengan translateZ dan inti yang berdenyut
const Chip = ({ rx, ry, scale, pulse }) => (
  <div
    style={{
      position: 'absolute',
      left: DESIGN_W / 2 - 220,
      top: DESIGN_H / 2 - 220,
      width: 440,
      height: 440,
      transformStyle: 'preserve-3d',
      transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`,
    }}
  >
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          inset: 20 + i * 22,
          borderRadius: 22,
          transform: `translateZ(${(i - 1.5) * 34}px)`,
          background:
            i === 2
              ? 'linear-gradient(135deg,#0c4a6e,#0f172a 60%,#1e1b4b)'
              : 'linear-gradient(135deg,#0b1220,#131c31)',
          border: `2px solid rgba(34,211,238,${0.35 + i * 0.15})`,
          boxShadow: '0 0 50px rgba(34,211,238,0.30)',
        }}
      />
    ))}
    {/* Pin konektor di tepi chip */}
    {Array.from({ length: 10 }, (_, k) => (
      <div
        key={`pin-${k}`}
        style={{
          position: 'absolute',
          left: 60 + k * 30,
          top: 6,
          width: 10,
          height: 22,
          background: '#67e8f9',
          opacity: 0.6 + 0.4 * Math.sin(pulse + k),
          transform: 'translateZ(90px)',
        }}
      />
    ))}
    {/* Inti pemrosesan yang berdenyut */}
    <div
      style={{
        position: 'absolute',
        left: 150,
        top: 150,
        width: 140,
        height: 140,
        borderRadius: 16,
        transform: 'translateZ(110px)',
        background: `radial-gradient(circle, rgba(125,211,252,${0.7 + 0.3 * Math.sin(pulse)}), #0369a1 70%)`,
        boxShadow: `0 0 ${60 + 25 * Math.sin(pulse)}px #22d3ee`,
      }}
    />
  </div>
);

export const Video001_AI = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const intro = useIntro();
  const chipIn = spring({ frame, fps, config: { damping: 22, stiffness: 90 } });

  const rx = 58 + Math.sin(frame / 60) * 6;
  const ry = frame * 0.9 - 40;
  const pulse = frame / 9;

  return (
    <CameraStage
      background="#030712"
      zoom={[0.92, 1.08]}
      rotateX={[10, -4]}
      rotateY={[-14, 16]}
      perspective={1800}
    >
      <Background base="#030712" glowA="rgba(34,211,238,0.22)" glowB="rgba(129,140,248,0.20)" gridSpeed={0.8} />

      {/* Jalur data sirkuit dengan paket cahaya yang bergerak */}
      <svg
        style={{ position: 'absolute', left: 0, top: 0 }}
        width={DESIGN_W}
        height={DESIGN_H}
        viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}
      >
        {TRACES.map((d, i) => (
          <g key={i}>
            <path
              d={d}
              pathLength={1000}
              fill="none"
              stroke="rgba(34,211,238,0.35)"
              strokeWidth={3}
              opacity={intro}
            />
            <path
              d={d}
              pathLength={1000}
              fill="none"
              stroke="#e0f2fe"
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray="70 930"
              strokeDashoffset={-((frame * 11 + i * 97) % 1000)}
              opacity={intro}
            />
          </g>
        ))}
      </svg>

      {/* Gelombang energi yang melebar dari pusat */}
      {[0, 1, 2, 3].map((i) => {
        const radius = ((frame * 5 + i * 170) % 900) + 40;
        return (
          <div
            key={`wave-${i}`}
            style={{
              position: 'absolute',
              left: DESIGN_W / 2 - radius,
              top: DESIGN_H / 2 - radius,
              width: radius * 2,
              height: radius * 2,
              borderRadius: '50%',
              border: '3px solid rgba(103,232,249,0.6)',
              opacity: 1 - radius / 940,
            }}
          />
        );
      })}

      <Chip rx={rx} ry={ry} scale={chipIn} pulse={pulse} />

      <Particles color="#67e8f9" count={110} seed={11} speed={1.2} />

      <Caption
        title="FUTURE AI TECHNOLOGY"
        subtitle="Neural Processor · Real-time Data Flow"
        accent="#22d3ee"
        x={140}
        y={120}
      />
    </CameraStage>
  );
};
