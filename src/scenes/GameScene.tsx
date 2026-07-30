import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import Board3D from './Board3D';
import Dice3D from './Dice3D';
import ConfettiSystem from './ConfettiSystem';
import { useGameStore } from '../game/GameEngine';
import { THEMES, WorldTheme } from '../game/types';

const THEME_LIGHTING: Record<WorldTheme, { ambient: string; hemiSky: string; hemiGround: string; dirIntensity: number }> = {
  default: { ambient: '#6060c0', hemiSky: '#7B68EE', hemiGround: '#191970', dirIntensity: 0.7 },
  jungle: { ambient: '#609060', hemiSky: '#4CAF50', hemiGround: '#1B5E20', dirIntensity: 0.9 },
  castle: { ambient: '#8060c0', hemiSky: '#9C27B0', hemiGround: '#311B92', dirIntensity: 0.6 },
  space:  { ambient: '#4040a0', hemiSky: '#3F51B5', hemiGround: '#0D0D30', dirIntensity: 0.5 },
};

function GameContent() {
  const phase = useGameStore(s => s.phase);
  const themeName = useGameStore(s => s.theme);
  const boardConfig = useGameStore(s => s.boardConfig);
  const cols = boardConfig.cols || 8;
  const boardWidth = cols * 1.1;
  const camDistance = Math.max(boardWidth, 8) * 0.7 + 3;
  const envPreset = THEMES[themeName]?.envPreset || 'night' as any;
  const lighting = THEME_LIGHTING[themeName] || THEME_LIGHTING.default;

  return (
    <>
      <ambientLight intensity={0.3} color={lighting.ambient} />
      <directionalLight
        position={[6, 12, 6]}
        intensity={lighting.dirIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4, 6, -4]} intensity={0.2} color="#8888ff" />
      <hemisphereLight args={[lighting.hemiSky, lighting.hemiGround, 0.3]} />

      <Board3D theme={themeName} />
      <Dice3D position={[0, 2.5, 0]} size={0.6} />
      <ConfettiSystem />

      <EffectComposer>
        <Bloom intensity={0.2} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
        <ChromaticAberration offset={[0.0008, 0.0008]} />
      </EffectComposer>
    </>
  );
}

export default function GameScene() {
  const phase = useGameStore(s => s.phase);
  const boardConfig = useGameStore(s => s.boardConfig);
  const active = phase !== 'lobby';

  if (!active) return null;

  const cols = boardConfig.cols || 8;
  const boardWidth = cols * 1.1;
  const camDistance = Math.max(boardWidth, 8) * 0.7 + 3;

  return (
    <div className="game-canvas-container">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{
          position: [boardWidth * 0.25, camDistance * 1.0, camDistance],
          fov: 40, near: 0.1, far: 50,
        }}
      >
        <PerspectiveCamera makeDefault position={[boardWidth * 0.25, camDistance * 1.0, camDistance]} fov={40} />
        <Environment preset="night" />
        <GameContent />
      </Canvas>
    </div>
  );
}
