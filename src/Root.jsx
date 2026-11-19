import React from 'react';
import { Composition } from 'remotion';
import { DURATION, FPS } from './components/Transitions.jsx';
import { Video001_AI } from './projects/Video001_AI.jsx';
import { Video002_DNA } from './projects/Video002_DNA.jsx';
import { Video003_Heart } from './projects/Video003_Heart.jsx';
import { Video004_Cell } from './projects/Video004_Cell.jsx';
import { Video005_Space } from './projects/Video005_Space.jsx';
import { Video006_Chemistry } from './projects/Video006_Chemistry.jsx';
import { Video007_Quantum } from './projects/Video007_Quantum.jsx';
import { Video008_Data } from './projects/Video008_Data.jsx';
import { Video009_Robotics } from './projects/Video009_Robotics.jsx';
import { Video010_Abstract } from './projects/Video010_Abstract.jsx';

// Komposisi final 4K. Mode preview memakai override --width/--height saat render.
const WIDTH = 3840;
const HEIGHT = 2160;

export const COMPOSITIONS = [
  { id: 'V001-AI', component: Video001_AI },
  { id: 'V002-DNA', component: Video002_DNA },
  { id: 'V003-Heart', component: Video003_Heart },
  { id: 'V004-Cell', component: Video004_Cell },
  { id: 'V005-Space', component: Video005_Space },
  { id: 'V006-Chemistry', component: Video006_Chemistry },
  { id: 'V007-Quantum', component: Video007_Quantum },
  { id: 'V008-Data', component: Video008_Data },
  { id: 'V009-Robotics', component: Video009_Robotics },
  { id: 'V010-Abstract', component: Video010_Abstract },
];

export const RemotionRoot = () => (
  <>
    {COMPOSITIONS.map(({ id, component }) => (
      <Composition
        key={id}
        id={id}
        component={component}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    ))}
  </>
);
