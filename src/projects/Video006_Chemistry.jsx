import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Background } from '../components/Background.jsx';
import { Particles } from '../components/Particles.jsx';
import { CameraStage, DESIGN_W, DESIGN_H } from '../components/Camera.jsx';
import { Caption, Label, useIntro } from '../components/Transitions.jsx';

const COLORS = { C: '#cbd5e1', H: '#f8fafc', O: '#f87171' };
const GRADS = { C: 'gradC', H: 'gradH', O: 'gradO' };

// Metana (CH4): karbon di pusat, empat hidrogen pada geometri tetrahedral
const METHANE = {
  cx: 760,
  cy: 600,
  scale: 190,
  atoms: [
    { el: 'C', x: 0, y: 0, z: 0, r: 46 },
    { el: 'H', x: 1, y: 1, z: 1, r: 26 },
    { el: 'H', x: 1, y: -1, z: -1, r: 26 },
    { el: 'H', x: -1, y: 1, z: -1, r: 26 },
    { el: 'H', x: -1, y: -1, z: 1, r: 26 },
  ],
  bonds: [[0, 1], [0, 2], [0, 3], [0, 4]],
};

// Air (H2O): oksigen dengan dua hidrogen, sudut ikatan sekitar 104 derajat
const WATER = {
  cx: 1420,
  cy: 330,
  scale: 150,
  atoms: [
    { el: 'O', x: 0, y: 0, z: 0, r: 40 },
    { el: 'H', x: -0.78, y: 0.62, z: 0, r: 22 },
    { el: 'H', x: 0.78, y: 0.62, z: 0, r: 22 },
  ],
  bonds: [[0, 1], [0, 2]],
};

// Proyeksi 3D dengan rotasi sumbu Y dan X, lalu perspektif sederhana
const project = (p, rotY, rotX, cx, cy, scale) => {
  const x = p.x * scale;
  const y = p.y * scale;
  const z = p.z * scale;
  const cY = Math.cos(rotY);
  const sY = Math.sin(rotY);
  const x1 = x * cY + z * sY;
  const z1 = -x * sY + z * cY;
  const cX = Math.cos(rotX);
  const sX = Math.sin(rotX);
  const y2 = y * cX - z1 * sX;
  const z2 = y * sX + z1 * cX;
  const f = 900 / (900 + z2);
  return { sx: cx + x1 * f, sy: cy + y2 * f, z: z2, f };
};

const Molecule = ({ mol, rotY, rotX, grow, frame, pulseOffset }) => {
  const projected = mol.atoms.map((a) => ({
    ...project(a, rotY, rotX, mol.cx, mol.cy, mol.scale * grow),
    el: a.el,
    r: a.r,
  }));

  const pulse = 0.5 + 0.5 * Math.sin(frame / 14 + pulseOffset);

  return (
    <g>
      {/* Ikatan kimia yang berdenyut dengan pulsa cahaya bergerak */}
      {mol.bonds.map(([a, b], i) => {
        const pa = projected[a];
        const pb = projected[b];
        const t = (frame * 0.02 + i * 0.3 + pulseOffset) % 1;
        const hx = pa.sx + (pb.sx - pa.sx) * t;
        const hy = pa.sy + (pb.sy - pa.sy) * t;
        return (
          <g key={`bond-${i}`}>
            <line x1={pa.sx} y1={pa.sy} x2={pb.sx} y2={pb.sy} stroke="rgba(148,163,184,0.5)" strokeWidth={10 + 4 * pulse} strokeLinecap="round" />
            <line x1={pa.sx} y1={pa.sy} x2={pb.sx} y2={pb.sy} stroke="#7dd3fc" strokeWidth={3} opacity={0.6 + 0.4 * pulse} />
            <circle cx={hx} cy={hy} r={7} fill="#e0f2fe" opacity={0.9} />
          </g>
        );
      })}

      {/* Atom diurutkan dari belakang ke depan */}
      {[...projected]
        .map((p, i) => ({ ...p, i }))
        .sort((p, q) => p.z - q.z)
        .map((p) => {
          const rr = p.r * p.f * grow;
          return (
            <g key={`atom-${p.i}`}>
              <circle cx={p.sx} cy={p.sy} r={rr + 8} fill={COLORS[p.el]} opacity={0.12} />
              <circle cx={p.sx} cy={p.sy} r={rr} fill={`url(#${GRADS[p.el]})`} />
              <text
                x={p.sx}
                y={p.sy + 9}
                textAnchor="middle"
                fontFamily='"Helvetica Neue", Arial, sans-serif'
                fontWeight={800}
                fontSize={rr * 0.85}
                fill="#0f172a"
                opacity={grow}
              >
                {p.el}
              </text>
            </g>
          );
        })}
    </g>
  );
};

export const Video006_Chemistry = () => {
  const frame = useCurrentFrame();
  const intro = useIntro();
  const grow = 0.2 + 0.8 * intro;

  const rotY = frame * 0.022;
  const rotX = 0.35 * Math.sin(frame / 90);

  return (
    <CameraStage
      background="#070a14"
      zoom={[0.95, 1.08]}
      rotateX={[6, -6]}
      rotateY={[-8, 8]}
      perspective={2000}
    >
      <Background base="#070a14" glowA="rgba(56,189,248,0.22)" glowB="rgba(250,204,21,0.10)" gridColor="rgba(125,211,252,0.07)" />

      <svg style={{ position: 'absolute', left: 0, top: 0 }} width={DESIGN_W} height={DESIGN_H} viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}>
        <defs>
          {Object.entries(COLORS).map(([el, c]) => (
            <radialGradient key={el} id={GRADS[el]} cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor={c} />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
          ))}
        </defs>

        <Molecule mol={METHANE} rotY={rotY} rotX={rotX} grow={grow} frame={frame} pulseOffset={0} />
        <Molecule mol={WATER} rotY={-rotY * 1.4 + 1.2} rotX={-rotX} grow={grow} frame={frame} pulseOffset={2.1} />
      </svg>

      <Particles color="#7dd3fc" count={80} seed={71} speed={0.6} minSize={2} maxSize={6} />

      <Caption
        title="CHEMICAL MOLECULES"
        subtitle="Covalent Bonds · Molecular Geometry"
        accent="#38bdf8"
        x={140}
        y={120}
      />
      <Label text="METANA · CH₄" x={560} y={920} color="#e2e8f0" delay={100} width={200} />
      <Label text="AIR · H₂O" x={1280} y={560} color="#fecaca" delay={130} width={160} />
    </CameraStage>
  );
};
