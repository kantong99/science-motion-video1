import React from 'react';
import { Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background } from '../components/Background.jsx';
import { Particles } from '../components/Particles.jsx';
import { CameraStage, DESIGN_W, DESIGN_H } from '../components/Camera.jsx';
import { Caption, FlashSweep, useIntro } from '../components/Transitions.jsx';

const RINGS = [
  { size: 620, color: '#38bdf8', tilt: 68, spin: 0.8 },
  { size: 760, color: '#a78bfa', tilt: 74, spin: -0.5 },
  { size: 900, color: '#f472b6', tilt: 62, spin: 0.35 },
];

const BLOBS = [
  { x: 380, y: 300, c: 'rgba(56,189,248,0.55)', sp: 0.012 },
  { x: 1560, y: 260, c: 'rgba(168,85,247,0.5)', sp: 0.009 },
  { x: 1200, y: 860, c: 'rgba(244,114,182,0.45)', sp: 0.011 },
];

// Garis alir sinusoidal yang bergerak sepanjang layar
const flowPath = (base, amp, freq, phase) => {
  const pts = [];
  for (let x = -40; x <= 1960; x += 16) {
    pts.push(`${x},${(base + amp * Math.sin(x * freq + phase)).toFixed(2)}`);
  }
  return `M ${pts.join(' L ')}`;
};

const FLOW_LINES = Array.from({ length: 6 }, (_, i) => ({
  d: flowPath(260 + i * 90, 46 + i * 6, 0.0062 + i * 0.0006, i * 0.9),
  color: ['#38bdf8', '#a78bfa', '#f472b6', '#facc15', '#34d399', '#38bdf8'][i],
}));

// Bentuk geometris yang masuk satu per satu dengan pegas
const ShapeIn = ({ children, x, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{children}</g>;
};

const Shapes = () => {
  const frame = useCurrentFrame();
  const morph = 0.5 + 0.5 * Math.sin(frame / 55);
  const side = 230;
  const half = side / 2;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0 }} width={DESIGN_W} height={DESIGN_H} viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}>
      <defs>
        <linearGradient id="triGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="sqGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f0abfc" />
          <stop offset="100%" stopColor="#fb7185" />
        </linearGradient>
      </defs>

      <Sequence from={20} layout="none">
        <ShapeIn x={1480} y={330}>
          <g transform={`rotate(${frame * 0.9})`}>
            <polygon points="0,-130 113,65 -113,65" fill="url(#triGrad)" opacity={0.92} />
          </g>
        </ShapeIn>
      </Sequence>

      <Sequence from={45} layout="none">
        <ShapeIn x={470} y={700}>
          <g transform={`rotate(${frame * 0.5})`}>
            <rect x={-half} y={-half} width={side} height={side} rx={20 + morph * (side / 2 - 20)} fill="url(#sqGrad)" opacity={0.9} />
          </g>
        </ShapeIn>
      </Sequence>

      <Sequence from={70} layout="none">
        <ShapeIn x={1500} y={760}>
          <g transform={`rotate(${-frame * 0.7})`}>
            <circle cx={0} cy={0} r={96 + 14 * Math.sin(frame / 20)} fill="none" stroke="#facc15" strokeWidth={14} strokeDasharray="120 40" />
            <circle cx={0} cy={0} r={60} fill="rgba(250,204,21,0.25)" />
          </g>
        </ShapeIn>
      </Sequence>
    </svg>
  );
};

export const Video010_Abstract = () => {
  const frame = useCurrentFrame();
  const intro = useIntro();

  return (
    <CameraStage
      background="#0b1020"
      zoom={[0.9, 1.06]}
      rotateX={[-3, 3]}
      rotateY={[-5, 5]}
      perspective={2400}
    >
      <Background base="#0b1020" glowA="rgba(99,102,241,0.18)" glowB="rgba(236,72,153,0.12)" grid={false} />

      {/* Blob gradien cair yang berubah bentuk */}
      {BLOBS.map((b, i) => {
        const wob = Math.sin(frame * b.sp + i);
        return (
          <div
            key={`blob-${i}`}
            style={{
              position: 'absolute',
              left: b.x + Math.cos(frame * b.sp) * 80 - 320,
              top: b.y + Math.sin(frame * b.sp * 0.9) * 60 - 280,
              width: 640,
              height: 560,
              background: `radial-gradient(circle, ${b.c}, transparent 70%)`,
              filter: 'blur(70px)',
              borderRadius: `${40 + 12 * wob}% ${60 - 12 * wob}% ${50 + 8 * wob}% ${50 - 8 * wob}%`,
              opacity: intro,
            }}
          />
        );
      })}

      {/* Cincin 3D yang berputar pada sumbu berbeda */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: DESIGN_W, height: DESIGN_H, transformStyle: 'preserve-3d' }}>
        {RINGS.map((r, i) => (
          <div
            key={`ring-${i}`}
            style={{
              position: 'absolute',
              left: DESIGN_W / 2 - r.size / 2,
              top: DESIGN_H / 2 - r.size / 2,
              width: r.size,
              height: r.size,
              borderRadius: '50%',
              border: `6px solid ${r.color}`,
              boxShadow: `0 0 40px ${r.color}88`,
              opacity: 0.55 * intro,
              transformStyle: 'preserve-3d',
              transform: `rotateX(${r.tilt}deg) rotateZ(${frame * r.spin + i * 60}deg)`,
            }}
          />
        ))}
      </div>

      {/* Garis alir */}
      <svg style={{ position: 'absolute', left: 0, top: 0 }} width={DESIGN_W} height={DESIGN_H} viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}>
        {FLOW_LINES.map((l, i) => (
          <g key={`flow-${i}`}>
            <path d={l.d} fill="none" stroke={l.color} strokeWidth={2} opacity={0.35 * intro} />
            <path
              d={l.d}
              fill="none"
              stroke={l.color}
              strokeWidth={7}
              strokeLinecap="round"
              pathLength={1000}
              strokeDasharray="140 860"
              strokeDashoffset={-((frame * 8 + i * 130) % 1000)}
              opacity={intro}
            />
          </g>
        ))}
      </svg>

      <Shapes />

      <Particles color="#f0abfc" count={60} seed={151} speed={1} minSize={3} maxSize={9} />
      <Particles color="#67e8f9" count={60} seed={157} speed={0.7} minSize={2} maxSize={6} />

      {/* Transisi kilatan cahaya di tengah video */}
      <FlashSweep start={300} end={360} color="#e0e7ff" />

      <Caption
        title="CORPORATE MOTION"
        subtitle="Geometric Flow · Presentation Ready"
        accent="#a78bfa"
        x={140}
        y={120}
      />
    </CameraStage>
  );
};
