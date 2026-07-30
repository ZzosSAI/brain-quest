import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../game/GameEngine';

// ─── Die face dot patterns ─────────────────────────────
const DOT_PATTERNS: [number, number][][] = [
  [], // unused
  [[0, 0]],                                       // 1
  [[-0.2, -0.2], [0.2, 0.2]],                     // 2
  [[-0.2, -0.2], [0, 0], [0.2, 0.2]],             // 3
  [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]], // 4
  [[-0.2, -0.2], [0.2, -0.2], [0, 0], [-0.2, 0.2], [0.2, 0.2]], // 5
  [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0], [0.2, 0], [-0.2, 0.2], [0.2, 0.2]], // 6
];

function DieFace({ dots, color = '#FFFFFF', glow = false }: {
  dots: { x: number; z: number }[];
  color?: string;
  glow?: boolean;
}) {
  return (
    <mesh>
      <planeGeometry args={[0.44, 0.44]} />
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={0.1}
        emissive={glow ? '#FFD700' : '#000'}
        emissiveIntensity={glow ? 0.3 : 0}
      />
      {dots.map((d, i) => (
        <mesh key={i} position={[d[0], d[1], 0.001]}>
          <circleGeometry args={[0.04, 12]} />
          <meshBasicMaterial color="#222" />
        </mesh>
      ))}
    </mesh>
  );
}

const FACE_POSITIONS: [number, number, number][] = [
  [0, 0, 0.25],  // front (1)
  [0, 0, -0.25], // back (6)
  [0.25, 0, 0],  // right (2)
  [-0.25, 0, 0], // left (5)
  [0, 0.25, 0],  // top (3)
  [0, -0.25, 0], // bottom (4)
];

const FACE_ROTATIONS: [number, number, number][] = [
  [0, 0, 0],
  [0, Math.PI, 0],
  [0, Math.PI / 2, 0],
  [0, -Math.PI / 2, 0],
  [-Math.PI / 2, 0, 0],
  [Math.PI / 2, 0, 0],
];

// Face values: face index → dice value
const FACE_VALUES = [1, 6, 2, 5, 3, 4];

interface DiceProps {
  position: [number, number, number];
  size?: number;
}

export default function Dice3D({ position, size = 0.5 }: DiceProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const targetRot = useRef(new THREE.Euler(0, 0, 0));
  const lastRoll = useGameStore(s => s.lastRoll);
  const phase = useGameStore(s => s.phase);
  const rollDiceAction = useGameStore(s => s.rollDice);
  const [rolling, setRolling] = useState(false);
  const [rollPhase, setRollPhase] = useState<'idle' | 'spinning' | 'settling' | 'done'>('idle');
  const [displayValue, setDisplayValue] = useState(1);

  // Idle floating
  useFrame((state) => {
    if (!groupRef.current) return;
    if (rollPhase === 'idle') {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.4) * 0.05;
    }
  });

  // Handle roll
  useEffect(() => {
    if (phase === 'rolling' && !rolling) {
      setRolling(true);
      setRollPhase('spinning');

      const duration = 1200;
      const startTime = Date.now();
      const startRot = {
        x: groupRef.current.rotation.x,
        y: groupRef.current.rotation.y,
        z: groupRef.current.rotation.z,
      };

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);

        // Spin wildly
        if (groupRef.current) {
          groupRef.current.rotation.x = startRot.x + progress * Math.PI * 8;
          groupRef.current.rotation.y = startRot.y + progress * Math.PI * 12;
          groupRef.current.rotation.z = startRot.z + progress * Math.PI * 6;

          // Bounce up then down
          const bounce = Math.sin(progress * Math.PI) * 0.5;
          groupRef.current.position.y = position[1] + bounce;

          // Scale pulse
          const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.05;
          groupRef.current.scale.setScalar(scale);
        }

        if (progress >= 1) {
          clearInterval(interval);
          setRollPhase('settling');

          // Settle on the final value
          setTimeout(() => {
            setRolling(false);
            setRollPhase('done');
            rollDiceAction();

            // After roll processing, go back to idle
            setTimeout(() => {
              setRollPhase('idle');
            }, 500);
          }, 200);
        }
      }, 16);
    }
  }, [phase, rolling]);

  // Show final value
  useEffect(() => {
    if (lastRoll > 0 && rollPhase === 'done') {
      setDisplayValue(lastRoll);
    }
  }, [lastRoll, rollPhase]);

  const isClickable = phase === 'rolling' && !rolling;

  const handleClick = () => {
    if (!isClickable) return;
    setRollPhase('spinning');
    setRolling(true);
  };

  const half = size / 2;

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      onPointerEnter={() => {
        if (isClickable) document.body.style.cursor = 'pointer';
      }}
      onPointerLeave={() => {
        document.body.style.cursor = 'default';
      }}
    >
      {/* Dice body */}
      <mesh castShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.15}
          metalness={0.2}
          emissive={isClickable ? '#FFD700' : '#000'}
          emissiveIntensity={isClickable ? 0.1 : 0}
        />
      </mesh>

      {/* Border edges */}
      <mesh>
        <boxGeometry args={[size + 0.02, size + 0.02, size + 0.02]} />
        <meshBasicMaterial color="#DDD" wireframe transparent opacity={0.15} />
      </mesh>

      {/* Dot faces */}
      {FACE_POSITIONS.map((pos, fi) => {
        const value = FACE_VALUES[fi];
        const dots = DOT_PATTERNS[value] || [];
        const isTopFace = fi === 4; // top face shows value prominently
        return (
          <group key={fi} position={pos} rotation={FACE_ROTATIONS[fi] as [number, number, number]}>
            <DieFace
              dots={dots.map(d => ({ x: d[0] * size, z: d[1] * size }))}
              color="#FFF"
              glow={fi === 4 && isClickable}
            />
          </group>
        );
      })}

      {/* Glow ring when clickable */}
      {isClickable && (
        <mesh>
          <ringGeometry args={[half + 0.1, half + 0.2, 32]} />
          <meshBasicMaterial
            color="#FFD700"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
