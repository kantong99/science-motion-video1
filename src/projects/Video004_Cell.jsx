import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Background } from '../components/Background.jsx';
import { Particles } from '../components/Particles.jsx';
import { CameraStage, DESIGN_W, DESIGN_H } from '../components/Camera.jsx';
import { Caption, Label, clampTween, useIntro } from '../components/Transitions.jsx';

const R = 330;
const SPLIT_START = 330;
const SPLIT_END = 470;

// Membran yang bergelombang halus dengan beberapa frekuensi
const membrane = (t) => {
  const pts = [];
  for (let k = 0; k <= 120; k++) {
    const th = (k / 120) * Math.PI * 2;
    const r =
      R *
      (1 +
        0.035 * Math.sin(3 * th + t * 0.04) +
        0.02 * Math.sin(5 * th - t * 0.06) +
        0.012 * Math.sin(9 * th + t * 0.03));
    pts.push(`${(r * Math.cos(th)).toFixed(2)},${(r * Math.sin(th)).toFixed(2)}`);
  }
  return `M ${pts.join(' L ')} Z`;
};

// Retikulum endoplasma berbentuk gelombang di sekitar nukleus
const erPath = (radius, waves, amp) => {
  const pts = [];
  for (let k = 0; k <= 200; k++) {
    const th = (k / 200) * Math.PI * 2;
    const r = radius + amp * Math.sin(waves * th);
    pts.push(`${(r * Math.cos(th)).toFixed(2)},${(r * Math.sin(th)).toFixed(2)}`);
  }
  return `M ${pts.join(' L ')} Z`;
};

const MITO_ANGLES = [0, 60, 120, 180, 240, 300];
const RIBOSOMES = Array.from({ length: 26 }, (_, i) => ({
  a: (i * 137.5 * Math.PI) / 180,
  d: 60 + ((i * 53) % 220),
}));

// Satu sel lengkap dalam koordinat lokal (pusat di 0,0)
const Cell = ({ cx, cy, s, frame, rotation }) => {
  const rot = rotation;
  const counter = -rot * 1.6;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      {/* Membran sel */}
      <g transform={`rotate(${rot})`}>
        <path d={membrane(frame)} fill="url(#cellFill)" stroke="#5eead4" strokeWidth={10} opacity={0.95} />
        <path d={membrane(frame)} fill="none" stroke="rgba(204,251,241,0.5)" strokeWidth={3} transform="scale(0.97)" />
      </g>

      {/* Organel internal berputar berlawanan arah untuk efek paralaks */}
      <g transform={`rotate(${counter})`}>
        {/* Retikulum endoplasma */}
        <path d={erPath(190, 9, 14)} fill="none" stroke="#38bdf8" strokeWidth={7} opacity={0.6} strokeDasharray="22 10" />

        {/* Mitokondria dengan krista di dalamnya */}
        {MITO_ANGLES.map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const mx = Math.cos(rad) * 255;
          const my = Math.sin(rad) * 255;
          return (
            <g key={`mito-${i}`} transform={`translate(${mx} ${my}) rotate(${deg + 90})`}>
              <rect x={-50} y={-24} width={100} height={48} rx={24} fill="#f97316" opacity={0.92} />
              <rect x={-50} y={-24} width={100} height={48} rx={24} fill="none" stroke="#fdba74" strokeWidth={4} />
              <path d="M -32 -10 L 28 -10 M -32 0 L 28 0 M -32 10 L 28 10" stroke="#fed7aa" strokeWidth={3} opacity={0.8} />
            </g>
          );
        })}

        {/* Aparatus Golgi dalam bentuk tumpukan busur */}
        {[0, 1, 2, 3].map((k) => (
          <path
            key={`golgi-${k}`}
            d={`M -300 ${-160 + k * 16} Q -250 ${-190 + k * 16} -200 ${-160 + k * 16}`}
            fill="none"
            stroke="#a78bfa"
            strokeWidth={9}
            strokeLinecap="round"
          />
        ))}

        {/* Ribosom kecil yang tersebar */}
        {RIBOSOMES.map((rb, i) => (
          <circle
            key={`rib-${i}`}
            cx={Math.cos(rb.a) * rb.d}
            cy={Math.sin(rb.a) * rb.d}
            r={6}
            fill="#e0f2fe"
            opacity={0.8}
          />
        ))}
      </g>

      {/* Nukleus dengan nukleolus */}
      <g transform={`rotate(${rot * 0.5})`}>
        <circle cx={-30} cy={10} r={120} fill="url(#nucleusFill)" stroke="#c4b5fd" strokeWidth={8} />
        <circle cx={-10} cy={-5} r={40} fill="#4c1d95" opacity={0.9} />
        <circle cx={-10} cy={-5} r={40} fill="none" stroke="#ddd6fe" strokeWidth={3} />
      </g>
    </g>
  );
};

export const Video004_Cell = () => {
  const frame = useCurrentFrame();
  const intro = useIntro();
  const split = clampTween(frame, [SPLIT_START, SPLIT_END], [0, 1]);
  const rotation = frame * 0.25;
  const growth = 0.55 + 0.45 * intro;

  const parentScale = growth * (1 - 0.22 * split);
  const daughterScale = growth * 0.78;

  return (
    <CameraStage
      background="#04120f"
      zoom={[1.0, 1.18]}
      rotateY={[0, 12]}
      rotateX={[-4, 4]}
      perspective={2200}
    >
      <Background base="#04120f" glowA="rgba(45,212,191,0.22)" glowB="rgba(132,204,22,0.15)" gridColor="rgba(94,234,212,0.07)" />

      <svg style={{ position: 'absolute', left: 0, top: 0 }} width={DESIGN_W} height={DESIGN_H} viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}>
        <defs>
          <radialGradient id="cellFill" cx="40%" cy="35%" r="75%">
            <stop offset="0%" stopColor="rgba(204,251,241,0.35)" />
            <stop offset="60%" stopColor="rgba(20,184,166,0.22)" />
            <stop offset="100%" stopColor="rgba(6,78,59,0.45)" />
          </radialGradient>
          <radialGradient id="nucleusFill" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#ede9fe" />
            <stop offset="60%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2e1065" />
          </radialGradient>
        </defs>

        {split < 0.001 ? (
          <Cell cx={DESIGN_W / 2} cy={DESIGN_H / 2} s={parentScale} frame={frame} rotation={rotation} />
        ) : (
          <>
            <Cell cx={DESIGN_W / 2 - 300 * split} cy={DESIGN_H / 2} s={daughterScale} frame={frame} rotation={rotation} />
            <Cell cx={DESIGN_W / 2 + 300 * split} cy={DESIGN_H / 2} s={daughterScale} frame={frame + 60} rotation={-rotation} />
          </>
        )}
      </svg>

      <Particles color="#99f6e4" count={60} seed={53} speed={0.7} minSize={2} maxSize={6} />

      <Caption
        title="CELL BIOLOGY"
        subtitle="Membrane · Nucleus · Mitochondria · Organelles"
        accent="#2dd4bf"
        x={140}
        y={120}
      />
      <Label text="NUKLEUS" x={1260} y={260} color="#ddd6fe" delay={80} />
      <Label text="MITOKONDRIA" x={1260} y={340} color="#fdba74" delay={110} />
      <Label text="RETIKULUM ENDOPLASMA" x={1260} y={420} color="#7dd3fc" delay={140} width={180} />
    </CameraStage>
  );
};
