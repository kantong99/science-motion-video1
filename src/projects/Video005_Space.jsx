import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Background } from '../components/Background.jsx';
import { CameraStage, DESIGN_W, DESIGN_H } from '../components/Camera.jsx';
import { Caption, Label, useIntro } from '../components/Transitions.jsx';

const PLANET = { cx: 1180, cy: 640, r: 300 };
const ORBIT = { rx: 430, ry: 150 };

const seeded = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const rand = seeded(90210);
const STARS = Array.from({ length: 280 }, () => ({
  x: rand() * 2 - 1,
  y: rand() * 2 - 1,
  z0: rand(),
  hue: rand() > 0.85 ? '#fde68a' : rand() > 0.7 ? '#93c5fd' : '#ffffff',
}));

const NEBULAS = [
  { x: 300, y: 260, w: 900, h: 600, c: 'rgba(168,85,247,0.35)', sp: 0.012 },
  { x: 1300, y: 120, w: 800, h: 500, c: 'rgba(20,184,166,0.28)', sp: 0.009 },
  { x: 700, y: 760, w: 1000, h: 520, c: 'rgba(249,115,22,0.20)', sp: 0.007 },
  { x: 1500, y: 800, w: 700, h: 420, c: 'rgba(59,130,246,0.30)', sp: 0.011 },
];

export const Video005_Space = () => {
  const frame = useCurrentFrame();
  const intro = useIntro();

  // Bintang bergerak keluar dari pusat, memberi efek kamera meluncur ke depan
  const stars = STARS.map((s, i) => {
    const d = (s.z0 + frame * 0.0035) % 1;
    const sx = 960 + s.x * (40 + 1500 * d * d);
    const sy = 540 + s.y * (30 + 950 * d * d);
    const twinkle = 0.65 + 0.35 * Math.sin(frame / 9 + i);
    return { sx, sy, size: 0.8 + 4.2 * d, op: Math.min(1, d * 1.6) * twinkle, color: s.hue };
  });

  const theta = frame * 0.025;
  const satX = PLANET.cx + ORBIT.rx * Math.cos(theta);
  const satY = PLANET.cy + ORBIT.ry * Math.sin(theta);
  const satRot = theta * 40;

  return (
    <CameraStage
      background="#00010a"
      zoom={[1.0, 1.32]}
      panX={[0, -70]}
      rotateY={[-4, 6]}
      perspective={2600}
    >
      <Background base="#00010a" grid={false} glowA="rgba(59,130,246,0.14)" glowB="rgba(168,85,247,0.12)" drift={0.6} />

      {/* Nebula bergerak dengan blur lembut */}
      {NEBULAS.map((n, i) => (
        <div
          key={`neb-${i}`}
          style={{
            position: 'absolute',
            left: n.x + Math.sin(frame * n.sp) * 90 - n.w / 2,
            top: n.y + Math.cos(frame * n.sp * 0.8) * 70 - n.h / 2,
            width: n.w,
            height: n.h,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${n.c}, transparent 70%)`,
            filter: 'blur(60px)',
            opacity: intro,
          }}
        />
      ))}

      <svg style={{ position: 'absolute', left: 0, top: 0 }} width={DESIGN_W} height={DESIGN_H} viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}>
        <defs>
          <radialGradient id="planetFill" cx="32%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="45%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#1c0a05" />
          </radialGradient>
          <clipPath id="planetClip">
            <circle cx={PLANET.cx} cy={PLANET.cy} r={PLANET.r} />
          </clipPath>
          <pattern
            id="bands"
            width={600}
            height={600}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${frame * 0.7} 0)`}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
              <rect key={k} x={0} y={k * 75} width={600} height={34 + (k % 3) * 8} fill={k % 2 ? 'rgba(254,215,170,0.35)' : 'rgba(124,45,18,0.35)'} />
            ))}
          </pattern>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(254,240,138,0)" />
            <stop offset="50%" stopColor="rgba(254,240,138,0.85)" />
            <stop offset="100%" stopColor="rgba(254,240,138,0)" />
          </linearGradient>
        </defs>

        {/* Bintang bergerak dari pusat */}
        {stars.map((s, i) => (
          <circle key={`s-${i}`} cx={s.sx} cy={s.sy} r={s.size} fill={s.color} opacity={s.op * intro} />
        ))}

        {/* Matahari di pojok kiri atas sebagai sumber cahaya */}
        <circle cx={260} cy={200} r={180} fill="url(#sunGlow)" opacity={0.7} />
        <defs>
          <radialGradient id="sunGlow">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="20%" stopColor="rgba(253,186,116,0.8)" />
            <stop offset="100%" stopColor="rgba(253,186,116,0)" />
          </radialGradient>
        </defs>

        {/* Lintasan orbit satelit */}
        <ellipse cx={PLANET.cx} cy={PLANET.cy} rx={ORBIT.rx} ry={ORBIT.ry} fill="none" stroke="rgba(148,163,184,0.35)" strokeWidth={2} strokeDasharray="10 12" />

        {/* Planet dengan pita awan yang bergerak */}
        <circle cx={PLANET.cx} cy={PLANET.cy} r={PLANET.r} fill="url(#planetFill)" />
        <g clipPath="url(#planetClip)">
          <rect x={PLANET.cx - PLANET.r} y={PLANET.cy - PLANET.r} width={PLANET.r * 2} height={PLANET.r * 2} fill="url(#bands)" opacity={0.85} />
          <circle cx={PLANET.cx + 220} cy={PLANET.cy} r={PLANET.r * 1.2} fill="rgba(2,6,23,0.75)" />
        </g>

        {/* Cincin planet */}
        <ellipse
          cx={PLANET.cx}
          cy={PLANET.cy}
          rx={PLANET.r * 1.75}
          ry={PLANET.r * 0.36}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={26}
          transform={`rotate(-16 ${PLANET.cx} ${PLANET.cy})`}
          opacity={intro}
        />

        {/* Jejak satelit */}
        {Array.from({ length: 16 }, (_, k) => {
          const tt = theta - k * 0.06;
          return (
            <circle
              key={`trail-${k}`}
              cx={PLANET.cx + ORBIT.rx * Math.cos(tt)}
              cy={PLANET.cy + ORBIT.ry * Math.sin(tt)}
              r={6 - k * 0.3}
              fill="#7dd3fc"
              opacity={(1 - k / 16) * 0.6}
            />
          );
        })}

        {/* Satelit dengan panel surya */}
        <g transform={`translate(${satX} ${satY}) rotate(${satRot})`}>
          <rect x={-22} y={-14} width={44} height={28} rx={6} fill="#e2e8f0" />
          <rect x={-78} y={-18} width={54} height={36} fill="#1d4ed8" stroke="#93c5fd" strokeWidth={2} />
          <rect x={24} y={-18} width={54} height={36} fill="#1d4ed8" stroke="#93c5fd" strokeWidth={2} />
          <circle cx={0} cy={0} r={6} fill="#fde047" />
        </g>
      </svg>

      <Caption
        title="SPACE AND PLANETS"
        subtitle="Orbital Mechanics · Deep Field Zoom"
        accent="#60a5fa"
        x={140}
        y={120}
      />
      <Label text="PLANET GAS RAKSASA" x={1180} y={980} color="#fed7aa" delay={120} width={200} />
    </CameraStage>
  );
};
