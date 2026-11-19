import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Background } from '../components/Background.jsx';
import { Particles } from '../components/Particles.jsx';
import { CameraStage, DESIGN_W, DESIGN_H } from '../components/Camera.jsx';
import { Caption, Label, useIntro } from '../components/Transitions.jsx';

const BASE = { x: 1340, y: 900 };
const L1 = 260;
const L2 = 210;
const L3 = 130;
const TARGETS = [
  { x: 1020, y: 470 },
  { x: 1480, y: 330 },
  { x: 1700, y: 640 },
];

// Path roda gigi: setiap gigi terdiri dari empat titik trapesium
const gearPath = (cx, cy, r, teeth, depth) => {
  const pts = [];
  const step = (Math.PI * 2) / teeth;
  for (let k = 0; k < teeth; k++) {
    const a = k * step;
    const inner = r;
    const outer = r + depth;
    const d1 = step * 0.22;
    const d2 = step * 0.36;
    pts.push([a - d2, inner], [a - d1, outer], [a + d1, outer], [a + d2, inner]);
  }
  const coords = pts.map(([a, rad]) => `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  return `M ${coords.join(' L ')} Z`;
};

// Forward kinematics dua dimensi: sudut dalam derajat, sumbu Y ke bawah
const forward = (frame) => {
  const t1 = -100 + 25 * Math.sin(frame / 50);
  const t2 = -40 + 35 * Math.sin(frame / 42 + 1);
  const t3 = 30 + 30 * Math.sin(frame / 36 + 2);
  const rad = (d) => (d * Math.PI) / 180;
  const a1 = rad(t1);
  const a2 = rad(t1 + t2);
  const a3 = rad(t1 + t2 + t3);
  const p1 = { x: BASE.x + L1 * Math.cos(a1), y: BASE.y + L1 * Math.sin(a1) };
  const p2 = { x: p1.x + L2 * Math.cos(a2), y: p1.y + L2 * Math.sin(a2) };
  const p3 = { x: p2.x + L3 * Math.cos(a3), y: p2.y + L3 * Math.sin(a3) };
  return { p1, p2, p3, a3: (a3 * 180) / Math.PI };
};

const CONVEYOR_BOXES = Array.from({ length: 4 }, (_, k) => k);

export const Video009_Robotics = () => {
  const frame = useCurrentFrame();
  const intro = useIntro();

  // Roda gigi utama berputar, roda pasangannya berputar berlawanan arah sesuai rasio gigi
  const rot1 = frame * 1.1;
  const rot2 = -rot1 * (18 / 14) + 6;
  const rot3 = -rot1 * (18 / 10);

  const arm = forward(frame);
  const gripGap = 12 + 14 * (0.5 + 0.5 * Math.sin(frame / 20));

  // Jejak ujung lengan dari beberapa frame sebelumnya
  const trail = [];
  for (let k = 0; k < 40; k++) {
    const pt = forward(frame - k * 2).p3;
    trail.push(`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);
  }

  const activeTarget = TARGETS[Math.floor(frame / 120) % TARGETS.length];
  const pulse = 0.5 + 0.5 * Math.sin(frame / 8);

  return (
    <CameraStage
      background="#0b0f14"
      zoom={[0.96, 1.05]}
      rotateY={[-8, 8]}
      rotateX={[4, -2]}
      perspective={2400}
    >
      <Background base="#0b0f14" glowA="rgba(251,191,36,0.14)" glowB="rgba(96,165,250,0.12)" gridColor="rgba(148,163,184,0.06)" />

      <svg style={{ position: 'absolute', left: 0, top: 0 }} width={DESIGN_W} height={DESIGN_H} viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}>
        <defs>
          <linearGradient id="gearGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="armGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <pattern id="conv" width={60} height={60} patternUnits="userSpaceOnUse" patternTransform={`translate(${frame * 4} 0)`}>
            <rect x={0} y={0} width={30} height={60} fill="#334155" />
            <rect x={30} y={0} width={30} height={60} fill="#1e293b" />
          </pattern>
        </defs>

        {/* Jalur teknologi di bagian atas dengan paket data */}
        <path d="M 100 170 C 500 120, 900 220, 1820 150" fill="none" stroke="rgba(251,191,36,0.25)" strokeWidth={3} pathLength={1000} opacity={intro} />
        <path
          d="M 100 170 C 500 120, 900 220, 1820 150"
          fill="none"
          stroke="#fde68a"
          strokeWidth={6}
          strokeLinecap="round"
          pathLength={1000}
          strokeDasharray="60 940"
          strokeDashoffset={-((frame * 9) % 1000)}
          opacity={intro}
        />

        {/* Roda gigi yang saling bertautan */}
        <g>
          <g transform={`rotate(${rot1} 520 560)`}>
            <path d={gearPath(520, 560, 150, 18, 24)} fill="url(#gearGrad)" stroke="#94a3b8" strokeWidth={3} opacity={intro} />
          </g>
          <g transform={`rotate(${rot2} 780 560)`}>
            <path d={gearPath(780, 560, 110, 14, 22)} fill="url(#gearGrad)" stroke="#94a3b8" strokeWidth={3} opacity={intro} />
          </g>
          <g transform={`rotate(${rot3} 520 330)`}>
            <path d={gearPath(520, 330, 80, 10, 18)} fill="url(#gearGrad)" stroke="#94a3b8" strokeWidth={3} opacity={intro} />
          </g>
          {[[520, 560, 46], [780, 560, 36], [520, 330, 28]].map(([cx, cy, rr], i) => (
            <g key={`hub-${i}`}>
              <circle cx={cx} cy={cy} r={rr} fill="#0f172a" stroke="#fbbf24" strokeWidth={4} />
              <circle cx={cx} cy={cy} r={rr * 0.4} fill="#fbbf24" />
            </g>
          ))}
        </g>

        {/* Target yang berdenyut sebagai titik kerja lengan */}
        {TARGETS.map((t, i) => (
          <g key={`t-${i}`} opacity={t === activeTarget ? 1 : 0.35}>
            <circle cx={t.x} cy={t.y} r={26 + (t === activeTarget ? 12 * pulse : 0)} fill="none" stroke="#67e8f9" strokeWidth={3} />
            <circle cx={t.x} cy={t.y} r={6} fill="#67e8f9" />
          </g>
        ))}

        {/* Jejak ujung lengan */}
        <polyline points={trail.join(' ')} fill="none" stroke="rgba(251,191,36,0.55)" strokeWidth={4} strokeLinejoin="round" />

        {/* Konveyor dengan kotak yang bergerak */}
        <rect x={0} y={960} width={DESIGN_W} height={60} fill="url(#conv)" />
        {CONVEYOR_BOXES.map((k) => {
          const x = ((k * 480 + frame * 3) % 2160) - 120;
          return <rect key={`box-${k}`} x={x} y={880} width={120} height={80} rx={8} fill="#b45309" stroke="#fde68a" strokeWidth={3} opacity={intro} />;
        })}

        {/* Dasar lengan robot */}
        <rect x={BASE.x - 90} y={BASE.y} width={180} height={70} rx={14} fill="#334155" stroke="#94a3b8" strokeWidth={3} />

        {/* Lengan robot tiga segmen */}
        <line x1={BASE.x} y1={BASE.y} x2={arm.p1.x} y2={arm.p1.y} stroke="#1e293b" strokeWidth={44} strokeLinecap="round" />
        <line x1={BASE.x} y1={BASE.y} x2={arm.p1.x} y2={arm.p1.y} stroke="url(#armGrad)" strokeWidth={22} strokeLinecap="round" />
        <line x1={arm.p1.x} y1={arm.p1.y} x2={arm.p2.x} y2={arm.p2.y} stroke="#1e293b" strokeWidth={36} strokeLinecap="round" />
        <line x1={arm.p1.x} y1={arm.p1.y} x2={arm.p2.x} y2={arm.p2.y} stroke="#cbd5e1" strokeWidth={16} strokeLinecap="round" />
        <line x1={arm.p2.x} y1={arm.p2.y} x2={arm.p3.x} y2={arm.p3.y} stroke="#1e293b" strokeWidth={28} strokeLinecap="round" />
        <line x1={arm.p2.x} y1={arm.p2.y} x2={arm.p3.x} y2={arm.p3.y} stroke="url(#armGrad)" strokeWidth={12} strokeLinecap="round" />

        {[BASE, arm.p1, arm.p2].map((j, i) => (
          <circle key={`joint-${i}`} cx={j.x} cy={j.y} r={i === 0 ? 34 : 26} fill="#0f172a" stroke="#fbbf24" strokeWidth={5} />
        ))}

        {/* Penjepit yang membuka dan menutup */}
        <g transform={`translate(${arm.p3.x} ${arm.p3.y}) rotate(${arm.a3 + 90})`}>
          <rect x={-gripGap - 12} y={-6} width={12} height={46} rx={4} fill="#fde68a" />
          <rect x={gripGap} y={-6} width={12} height={46} rx={4} fill="#fde68a" />
          <rect x={-gripGap} y={-6} width={gripGap * 2} height={10} rx={4} fill="#b45309" />
        </g>
      </svg>

      <Particles color="#fcd34d" count={45} seed={131} speed={0.5} minSize={2} maxSize={6} />

      <Caption
        title="ROBOTICS AND ENGINEERING"
        subtitle="Mekanika · Otomasi · Presisi"
        accent="#fbbf24"
        x={140}
        y={230}
      />
      <Label text="LENGAN ROBOT" x={1000} y={760} color="#fde68a" delay={120} width={160} />
    </CameraStage>
  );
};
