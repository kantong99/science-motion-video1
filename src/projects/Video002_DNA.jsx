import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Background } from '../components/Background.jsx';
import { Particles } from '../components/Particles.jsx';
import { CameraStage, DESIGN_W, DESIGN_H } from '../components/Camera.jsx';
import { Caption, Label, clampTween } from '../components/Transitions.jsx';

const RUNGS = 46;
const SPACING = 21;
const RADIUS = 210;
const CX = DESIGN_W / 2;
const TOP = DESIGN_H / 2 - ((RUNGS - 1) * SPACING) / 2;

// Empat jenis basa: dua pasangan dengan warna berbeda
const PAIRS = [
  ['#22d3ee', '#f472b6'], // A-T
  ['#a3e635', '#fb923c'], // G-C
];

const MOLECULES = Array.from({ length: 10 }, (_, i) => ({
  x: 220 + ((i * 397) % 1480),
  y: 180 + ((i * 263) % 720),
  r: 26 + (i % 4) * 14,
  phase: i * 0.9,
}));

export const Video002_DNA = () => {
  const frame = useCurrentFrame();
  const spin = frame * 0.045;

  // Setiap rung dan pasangan basa dibangun berurutan dari pusat
  const rungs = Array.from({ length: RUNGS }, (_, i) => {
    const grow = clampTween(frame, [10 + i * 2.5, 40 + i * 2.5], [0, 1]);
    const a = i * 0.42 + spin;
    const yy = TOP + i * SPACING;
    const aX = CX + RADIUS * Math.cos(a) * grow;
    const bX = CX + RADIUS * Math.cos(a + Math.PI) * grow;
    const zA = Math.sin(a);
    const zB = -Math.sin(a);
    return { i, a, yy, aX, bX, zA, zB, grow, pair: PAIRS[i % 2] };
  });

  // Urutan gambar: bagian belakang dulu, depan terakhir
  const dots = [];
  rungs.forEach((r) => {
    dots.push({ x: r.aX, y: r.yy, z: r.zA, color: r.pair[0], key: `a${r.i}` });
    dots.push({ x: r.bX, y: r.yy, z: r.zB, color: r.pair[1], key: `b${r.i}` });
  });
  dots.sort((p, q) => p.z - q.z);

  return (
    <CameraStage
      background="#050b14"
      zoom={[0.9, 1.06]}
      rotateX={[6, -3]}
      rotateY={[-12, 22]}
      perspective={2200}
    >
      <Background base="#050b14" glowA="rgba(45,212,191,0.20)" glowB="rgba(59,130,246,0.20)" />

      {/* Molekul mengambang di latar */}
      {MOLECULES.map((m, i) => {
        const dx = Math.sin(frame / 70 + m.phase) * 60;
        const dy = Math.cos(frame / 90 + m.phase) * 40;
        return (
          <div
            key={`mol-${i}`}
            style={{
              position: 'absolute',
              left: m.x + dx - m.r,
              top: m.y + dy - m.r,
              width: m.r * 2,
              height: m.r * 2,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), rgba(94,234,212,0.55) 35%, rgba(15,118,110,0.15) 70%)',
              opacity: 0.45,
              boxShadow: '0 0 30px rgba(45,212,191,0.35)',
            }}
          />
        );
      })}

      <svg
        style={{ position: 'absolute', left: 0, top: 0 }}
        width={DESIGN_W}
        height={DESIGN_H}
        viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}
      >
        {/* Rung pasangan basa */}
        {rungs.map((r) => {
          const midX = (r.aX + r.bX) / 2;
          const depth = 0.45 + 0.55 * Math.abs(Math.cos(r.a));
          return (
            <g key={`rung-${r.i}`} opacity={depth * r.grow}>
              <line x1={r.aX} y1={r.yy} x2={midX} y2={r.yy} stroke={r.pair[0]} strokeWidth={7} strokeLinecap="round" />
              <line x1={midX} y1={r.yy} x2={r.bX} y2={r.yy} stroke={r.pair[1]} strokeWidth={7} strokeLinecap="round" />
            </g>
          );
        })}

        {/* Tulang punggung gula-fosfat dengan garis penghubung antar rung */}
        {[0, 1].map((strand) => {
          const pts = rungs.map((r) => {
            const x = strand === 0 ? r.aX : r.bX;
            return `${x},${r.yy}`;
          });
          return (
            <polyline
              key={`strand-${strand}`}
              points={pts.join(' ')}
              fill="none"
              stroke={strand === 0 ? 'rgba(34,211,238,0.35)' : 'rgba(244,114,182,0.35)'}
              strokeWidth={4}
            />
          );
        })}

        {/* Atom gula-fosfat, diurutkan dari belakang ke depan */}
        {dots.map((d) => {
          const size = 11 + 7 * d.z;
          return (
            <g key={d.key}>
              <circle cx={d.x} cy={d.y} r={size + 6} fill={d.color} opacity={0.18} />
              <circle cx={d.x} cy={d.y} r={size} fill={d.color} />
              <circle cx={d.x - size * 0.3} cy={d.y - size * 0.3} r={size * 0.3} fill="#ffffff" opacity={0.7} />
            </g>
          );
        })}
      </svg>

      <Particles color="#86efac" count={70} seed={23} speed={0.8} />

      <Caption
        title="DNA MOLECULAR SCIENCE"
        subtitle="Double Helix · Base Pairing"
        accent="#2dd4bf"
        x={140}
        y={120}
      />
      <Label text="ADENIN — TIMIN" x={1290} y={520} color="#22d3ee" delay={120} />
      <Label text="GUANIN — SITOSIN" x={1290} y={600} color="#a3e635" delay={150} />
    </CameraStage>
  );
};
