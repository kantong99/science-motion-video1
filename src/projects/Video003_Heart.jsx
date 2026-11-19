import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Background } from '../components/Background.jsx';
import { Particles } from '../components/Particles.jsx';
import { CameraStage, DESIGN_W, DESIGN_H } from '../components/Camera.jsx';
import { Caption, Label, clampTween, useIntro } from '../components/Transitions.jsx';

const CX = 960;
const CY = 470;
const S = 18;
const BEAT_FRAMES = 27; // sekitar 66 detak per menit

// Kurva kardioid klasik untuk bentuk jantung
const HEART_PATH = (() => {
  const pts = [];
  for (let t = 0; t <= Math.PI * 2 + 0.001; t += 0.02) {
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    pts.push(`${CX + S * x},${CY + S * y}`);
  }
  return `M ${pts.join(' L ')} Z`;
})();

// Pembuluh utama dalam koordinat layar
const VESSELS = [
  'M 960 400 C 1000 300, 1060 260, 1180 200',
  'M 905 405 C 860 320, 770 300, 640 250',
  'M 1010 430 C 1080 420, 1140 380, 1260 380',
  'M 880 560 C 800 540, 720 600, 620 640',
  'M 1045 580 C 1120 600, 1200 660, 1300 700',
];

// Garis EKG: satu spike setiap satu siklus detak
const EKG_POINTS = (() => {
  const pts = [];
  for (let x = 300; x <= 1620; x += 6) {
    const p = ((x - 300) / 150) % 1;
    const spike =
      -70 * Math.exp(-Math.pow((p - 0.42) / 0.012, 2)) + 26 * Math.exp(-Math.pow((p - 0.5) / 0.03, 2));
    pts.push(`${x},${940 + spike}`);
  }
  return pts.join(' ');
})();

export const Video003_Heart = () => {
  const frame = useCurrentFrame();
  const intro = useIntro();

  // Pola detak: dua dorongan cepat (sistol) lalu jeda (diastol)
  const ph = (frame % BEAT_FRAMES) / BEAT_FRAMES;
  const beat =
    0.1 * Math.exp(-(((ph - 0.05) / 0.04) ** 2)) + 0.06 * Math.exp(-(((ph - 0.25) / 0.05) ** 2));
  const heartScale = (1 + beat) * (0.6 + 0.4 * intro);

  const ekgProgress = clampTween(frame, [30, 150], [0, 1]);

  return (
    <CameraStage
      background="#0a0206"
      zoom={[0.88, 1.08]}
      rotateY={[-6, 8]}
      rotateX={[4, -2]}
      perspective={2400}
    >
      <Background base="#0a0206" glowA="rgba(248,113,113,0.22)" glowB="rgba(190,24,93,0.18)" gridColor="rgba(248,113,113,0.07)" />

      <svg style={{ position: 'absolute', left: 0, top: 0 }} width={DESIGN_W} height={DESIGN_H} viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}>
        <defs>
          <radialGradient id="heartFill" cx="45%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="45%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#4c0519" />
          </radialGradient>
          <filter id="heartGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Pembuluh darah dengan aliran sel darah merah */}
        {VESSELS.map((d, i) => {
          const wall = 16 + 6 * Math.exp(-(((((frame % BEAT_FRAMES) / BEAT_FRAMES) - 0.05) / 0.06) ** 2));
          return (
            <g key={`v-${i}`} opacity={intro}>
              <path d={d} pathLength={1000} fill="none" stroke="rgba(127,29,29,0.9)" strokeWidth={wall + 8} strokeLinecap="round" />
              <path d={d} pathLength={1000} fill="none" stroke="rgba(248,113,113,0.6)" strokeWidth={wall} strokeLinecap="round" />
              <path
                d={d}
                pathLength={1000}
                fill="none"
                stroke="#fecaca"
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray="90 910"
                strokeDashoffset={-((frame * 10 + i * 170) % 1000)}
              />
            </g>
          );
        })}

        {/* Jantung yang berdenyut */}
        <g transform={`translate(${CX} ${CY + 130}) scale(${heartScale}) translate(${-CX} ${-(CY + 130)})`}>
          <path d={HEART_PATH} fill="url(#heartFill)" filter="url(#heartGlow)" stroke="#fb7185" strokeWidth={4} />
          <path
            d={`M ${CX - 40} ${CY + 60} C ${CX - 80} ${CY + 130}, ${CX - 30} ${CY + 190}, ${CX + 10} ${CY + 170}`}
            fill="none"
            stroke="rgba(255,228,230,0.35)"
            strokeWidth={6}
            strokeLinecap="round"
          />
          <path
            d={`M ${CX + 60} ${CY + 40} C ${CX + 100} ${CY + 100}, ${CX + 80} ${CY + 170}, ${CX + 20} ${CY + 200}`}
            fill="none"
            stroke="rgba(255,228,230,0.25)"
            strokeWidth={5}
            strokeLinecap="round"
          />
        </g>

        {/* Garis EKG */}
        <polyline
          points={EKG_POINTS}
          fill="none"
          stroke="#fb7185"
          strokeWidth={5}
          strokeLinejoin="round"
          pathLength={1000}
          strokeDasharray="1000"
          strokeDashoffset={1000 * (1 - ekgProgress)}
          opacity={0.95}
        />
        <circle cx={300 + 1320 * ekgProgress} cy={940} r={9} fill="#fecdd3" opacity={ekgProgress > 0 && ekgProgress < 1 ? 1 : 0} />
      </svg>

      <Particles color="#fda4af" count={60} seed={37} speed={0.9} minSize={2} maxSize={7} />

      <Caption
        title="HUMAN HEART ANATOMY"
        subtitle="Cardiac Cycle · Blood Circulation"
        accent="#fb7185"
        x={140}
        y={120}
      />
      <Label text="AORTA" x={1200} y={170} color="#fecaca" delay={60} />
      <Label text="ARTERI PULMONALIS" x={420} y={220} color="#fecaca" delay={90} />
    </CameraStage>
  );
};
