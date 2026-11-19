import React from 'react';
import { Sequence, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { Background } from '../components/Background.jsx';
import { Particles } from '../components/Particles.jsx';
import { CameraStage, DESIGN_W, DESIGN_H } from '../components/Camera.jsx';
import { Caption, useIntro } from '../components/Transitions.jsx';

const BAR_DATA = [42, 68, 55, 90, 74, 110, 96];
const BAR_MAX = 120;
const LINE_DATA = [18, 26, 22, 35, 31, 44, 40, 52, 47, 61, 58, 72];
const DONUT = [
  { p: 38, color: '#22d3ee' },
  { p: 27, color: '#a78bfa' },
  { p: 20, color: '#f472b6' },
  { p: 15, color: '#facc15' },
];
const SPARK = [5, 9, 7, 12, 10, 15, 13, 18, 16, 21];

// Panel kaca dengan animasi masuk berurutan lewat Sequence
const Panel = ({ x, y, w, h, title, delay, children }) => (
  <Sequence from={delay}>
    <PanelBody x={x} y={y} w={w} h={h} title={title}>
      {children}
    </PanelBody>
  </Sequence>
);

const PanelBody = ({ x, y, w, h, title, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + (1 - p) * 40,
        width: w,
        height: h,
        borderRadius: 24,
        background: 'linear-gradient(160deg, rgba(15,23,42,0.85), rgba(15,23,42,0.55))',
        border: '2px solid rgba(56,189,248,0.35)',
        boxShadow: '0 0 60px rgba(56,189,248,0.15)',
        opacity: p,
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        color: '#e2e8f0',
      }}
    >
      <div style={{ position: 'absolute', left: 28, top: 20, fontSize: 26, fontWeight: 700, letterSpacing: 3, color: '#7dd3fc' }}>
        {title}
      </div>
      {/* Lapisan koordinat layar: isi chart memakai koordinat desain 1920x1080 */}
      <div style={{ position: 'absolute', left: -x, top: -y, width: DESIGN_W, height: DESIGN_H }}>
        {children}
      </div>
    </div>
  );
};

// Grafik batang yang tumbuh dengan pegas dan label angka
const BarChart = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const baseY = 860;
  const maxH = 440;
  const x0 = 190;
  const slot = 690 / BAR_DATA.length;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0 }} width={DESIGN_W} height={DESIGN_H} viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((g) => (
        <line key={`g-${g}`} x1={x0 - 10} x2={x0 + 690} y1={baseY - (g * maxH) / 4} y2={baseY - (g * maxH) / 4} stroke="rgba(148,163,184,0.15)" strokeWidth={2} />
      ))}
      {BAR_DATA.map((v, i) => {
        const prog = spring({ frame: Math.max(0, frame - 30 - i * 7), fps, config: { damping: 18, stiffness: 120 } });
        const h = (v / BAR_MAX) * maxH * prog;
        const bx = x0 + i * slot + slot / 2 - 30;
        return (
          <g key={`bar-${i}`}>
            <rect x={bx} y={baseY - h} width={60} height={h} rx={10} fill="url(#barGrad)" />
            <text x={bx + 30} y={baseY - h - 14} textAnchor="middle" fontSize={26} fontWeight={700} fill="#e0f2fe" opacity={prog}>
              {Math.round(v * prog)}
            </text>
            <text x={bx + 30} y={baseY + 40} textAnchor="middle" fontSize={22} fill="#94a3b8">
              {`Q${(i % 4) + 1}-${Math.floor(i / 4) + 24}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// Grafik garis yang tergambar, dengan titik aktif yang bergerak di ujung
const LineChart = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [20, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const x0 = 1060;
  const x1 = 1740;
  const yBase = 540;
  const yTop = 380;
  const pts = LINE_DATA.map((v, i) => {
    const x = x0 + (i / (LINE_DATA.length - 1)) * (x1 - x0);
    const y = yBase - (v / 80) * (yBase - yTop);
    return [x, y];
  });
  const d = pts.map((p) => p.join(',')).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0 }} width={DESIGN_W} height={DESIGN_H} viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}>
      <polyline points={d} fill="none" stroke="#a78bfa" strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" pathLength={1000} strokeDasharray="1000" strokeDashoffset={1000 * (1 - draw)} />
      <polyline points={d} fill="none" stroke="rgba(167,139,250,0.2)" strokeWidth={28} strokeLinejoin="round" pathLength={1000} strokeDasharray="1000" strokeDashoffset={1000 * (1 - draw)} />
      <circle cx={last[0]} cy={last[1]} r={14} fill="#e9d5ff" opacity={draw} />
      <circle cx={last[0]} cy={last[1]} r={30 + 8 * Math.sin(frame / 8)} fill="none" stroke="#c4b5fd" strokeWidth={3} opacity={draw * 0.7} />
    </svg>
  );
};

// Diagram lingkaran yang berputar pelan dan segmen yang tumbuh
const Donut = () => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [30, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const cx = 1190;
  const cy = 790;
  const r = 84;
  let cum = 0;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0 }} width={DESIGN_W} height={DESIGN_H} viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}>
      <g transform={`rotate(${frame * 0.6} ${cx} ${cy})`}>
        {DONUT.map((seg, i) => {
          const offset = -cum;
          cum += seg.p;
          return (
            <circle
              key={`seg-${i}`}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={30}
              pathLength={100}
              strokeDasharray={`${seg.p * grow - 0.6} ${100}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
        })}
      </g>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={34} fontWeight={800} fill="#f8fafc">
        100%
      </text>
    </svg>
  );
};

// Angka penghitung yang berubah dan sparkline kecil
const Counter = () => {
  const frame = useCurrentFrame();
  const value = Math.round(interpolate(frame, [0, 150], [0, 2847], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }));
  const label = String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sx0 = 1470;
  const sx1 = 1770;
  const pts = SPARK.map((v, i) => `${sx0 + (i / (SPARK.length - 1)) * (sx1 - sx0)},${880 - v * 6}`).join(' ');
  return (
    <>
      <div style={{ position: 'absolute', left: 1460, top: 720, fontSize: 84, fontWeight: 800, color: '#f8fafc', letterSpacing: 2 }}>{label}</div>
      <svg style={{ position: 'absolute', left: 0, top: 0 }} width={DESIGN_W} height={DESIGN_H} viewBox={`0 0 ${DESIGN_W} ${DESIGN_H}`}>
        <polyline points={pts} fill="none" stroke="#67e8f9" strokeWidth={5} strokeLinejoin="round" />
      </svg>
    </>
  );
};

export const Video008_Data = () => {
  const frame = useCurrentFrame();
  const intro = useIntro();
  const scanY = (frame * 7) % DESIGN_H;

  return (
    <CameraStage
      background="#020617"
      zoom={[0.98, 1.04]}
      rotateY={[-3, 3]}
      rotateX={[3, -2]}
      perspective={2400}
    >
      <Background base="#020617" glowA="rgba(56,189,248,0.18)" glowB="rgba(167,139,250,0.14)" gridColor="rgba(56,189,248,0.07)" gridSize={80} gridSpeed={0.5} />

      <Panel x={120} y={300} w={820} h={620} title="PERTUMBUHAN KUARTALAN" delay={20}>
        <BarChart />
      </Panel>
      <Panel x={1000} y={300} w={800} h={300} title="TREN PENGGUNA" delay={60}>
        <LineChart />
      </Panel>
      <Panel x={1000} y={640} w={380} h={280} title="BAURAN PRODUK" delay={100}>
        <Donut />
      </Panel>
      <Panel x={1420} y={640} w={380} h={280} title="PENGGUNA AKTIF" delay={130}>
        <Counter />
      </Panel>

      {/* Garis pemindai yang bergerak melintasi dashboard */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: scanY,
          width: DESIGN_W,
          height: 4,
          background: 'linear-gradient(90deg, transparent, rgba(103,232,249,0.8), transparent)',
          opacity: 0.35 * intro,
        }}
      />

      <Particles color="#7dd3fc" count={50} seed={101} speed={0.6} minSize={2} maxSize={5} />

      <Caption
        title="DATA ANALYTICS"
        subtitle="Statistik · Visualisasi · Dashboard Real-time"
        accent="#38bdf8"
        x={140}
        y={120}
      />
    </CameraStage>
  );
};
