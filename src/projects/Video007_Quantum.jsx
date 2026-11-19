import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Background } from '../components/Background.jsx';
import { Particles } from '../components/Particles.jsx';
import { CameraStage, DESIGN_W, DESIGN_H } from '../components/Camera.jsx';
import { Caption, Label, clampTween, useIntro } from '../components/Transitions.jsx';

const SRC_A = { x: 560, y: 420 };
const SRC_B = { x: 560, y: 660 };
const WAVELENGTH = 60;
const K = (2 * Math.PI) / WAVELENGTH;

// Layar detektor: titik-titik yang intensitasnya mengikuti pola interferensi
const DET = { x0: 1200, y0: 300, cols: 30, rows: 24, step: 20 };

const mix = (t) => {
  const a = [34, 211, 238];
  const b = [232, 121, 249];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

// Kurva gelombang sinus untuk pita energi di sisi kiri
const waveD = (base, amp, freq, phase) => {
  const pts = [];
  for (let x = 60; x <= 1100; x += 10) {
    const y = base + amp * Math.sin(x * freq + phase);
    pts.push(`${x},${y.toFixed(2)}`);
  }
  return `M ${pts.join(' L ')}`;
};

export const Video007_Quantum = () => {
  const frame = useCurrentFrame();
  const intro = useIntro();
  const reveal = clampTween(frame, [30, 150], [0, 1]);

  // Cincin gelombang dari dua sumber
  const rings = [];
  [SRC_A, SRC_B].forEach((src, si) => {
    for (let k = 0; k < 14; k++) {
      const radius = ((frame * 3.2 + k * 60) % 840) + 10;
      rings.push({ src, radius, op: (1 - radius / 860) * 0.7, color: si === 0 ? '#22d3ee' : '#e879f9', key: `r-${si}-${k}` });
    }
  });

  // Titik detektor dengan intensitas interferensi
  const dots = [];
  for (let r = 0; r < DET.rows; r++) {
    for (let c = 0; c < DET.cols; c++) {
      const x = DET.x0 + c * DET.step;
      const y = DET.y0 + r * DET.step;
      const dA = Math.hypot(x - SRC_A.x, y - SRC_A.y);
      const dB = Math.hypot(x - SRC_B.x, y - SRC_B.y);
      const I = 0.5 + 0.5 * Math.cos(K * (dA - dB) - frame * 0.07);
      dots.push({ x, y, I, key: `d-${r}-${c}` });
    }
  }

  const waves = [
    { base: 330, amp: 40, freq: 0.012, phase: frame / 22, color: 'rgba(168,85,247,0.55)' },
    { base: 540, amp: 60, freq: 0.009, phase: frame / 30 + 1.2, color: 'rgba(34,211,238,0.45)' },
    { base: 760, amp: 45, freq: 0.014, phase: -frame / 26 + 0.6, color: 'rgba(244,114,182,0.45)' },
  ];

  return (
    <CameraStage
      background="#06040f"
      zoom={[1.04, 0.97]}
      rotateY={[-4, 5]}
      rotateX={[2, -2]}
      perspective={2400}
    >
      <Background base="#06040f" glowA="rgba(34,211,238,0.14)" glowB="rgba(232,121,249,0.14)" gridColor="rgba(168,85,247,0.06)" />

      <svg style={{ position: 'absolute', left: 0, top: 0 }} width={DESIGN_W} height={DESIGN_H} viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}>
        <defs>
          <radialGradient id="sourceGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* Cincin gelombang dari setiap sumber */}
        {rings.map((g) => (
          <circle key={g.key} cx={g.src.x} cy={g.src.y} r={g.radius} fill="none" stroke={g.color} strokeWidth={2.5} opacity={g.op * intro} />
        ))}

        {/* Pita gelombang energi */}
        {waves.map((w, i) => (
          <path key={`wave-${i}`} d={waveD(w.base, w.amp, w.freq, w.phase)} fill="none" stroke={w.color} strokeWidth={4} opacity={reveal} />
        ))}

        {/* Sumber partikel di pusat setiap pola */}
        {[SRC_A, SRC_B].map((s, i) => (
          <g key={`src-${i}`}>
            <circle cx={s.x} cy={s.y} r={150 + 10 * Math.sin(frame / 10 + i)} fill="url(#sourceGlow)" opacity={0.6} />
            <circle cx={s.x} cy={s.y} r={12} fill={i === 0 ? '#67e8f9' : '#f0abfc'} />
          </g>
        ))}

        {/* Partikel subatomik yang bergerak sepanjang gelombang */}
        {waves.map((w, wi) =>
          Array.from({ length: 6 }, (_, k) => {
            const x = 60 + (((frame * 4 + k * 170 + wi * 60) % 1040));
            const y = w.base + w.amp * Math.sin(x * w.freq + w.phase);
            return <circle key={`p-${wi}-${k}`} cx={x} cy={y} r={7} fill="#f5d0fe" opacity={0.9} />;
          })
        )}

        {/* Layar detektor interferensi */}
        <rect x={DET.x0 - 30} y={DET.y0 - 30} width={DET.cols * DET.step + 20} height={DET.rows * DET.step + 20} rx={18} fill="rgba(15,10,30,0.6)" stroke="rgba(192,132,252,0.4)" strokeWidth={2} />
        {dots.map((d) => (
          <circle key={d.key} cx={d.x} cy={d.y} r={2 + 6 * d.I} fill={mix(d.I)} opacity={(0.25 + 0.75 * d.I) * intro} />
        ))}
      </svg>

      <Particles color="#c4b5fd" count={70} seed={89} speed={0.7} minSize={2} maxSize={6} />

      <Caption
        title="QUANTUM PHYSICS"
        subtitle="Wave Interference · Probability Field"
        accent="#e879f9"
        x={140}
        y={120}
      />
      <Label text="SUMBER A" x={300} y={390} color="#67e8f9" delay={90} width={120} />
      <Label text="SUMBER B" x={300} y={630} color="#f0abfc" delay={100} width={120} />
      <Label text="POLA INTERFERENSI" x={1200} y={880} color="#e9d5ff" delay={140} width={200} />
    </CameraStage>
  );
};
