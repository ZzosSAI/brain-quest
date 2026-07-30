import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../game/GameEngine';

// ─── Die face dot patterns ─────────────────────────────
const DOT_PATTERNS: [number, number][][] = [
  [],
  [[0, 0]],
  [[-0.2, -0.2], [0.2, 0.2]],
  [[-0.2, -0.2], [0, 0], [0.2, 0.2]],
  [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]],
  [[-0.2, -0.2], [0.2, -0.2], [0, 0], [-0.2, 0.2], [0.2, 0.2]],
  [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0], [0.2, 0], [-0.2, 0.2], [0.2, 0.2]],
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
        <mesh key={i} position={[d.x, d.z, 0.001]}>
          <circleGeometry args={[0.04, 12]} />
          <meshBasicMaterial color="#222" />
        </mesh>
      ))}
    </mesh>
  );
}

const FACE_POSITIONS: [number, number, number][] = [
  [0, 0, 0.25],  [0, 0, -0.25], [0.25, 0, 0],
  [-0.25, 0, 0], [0, 0.25, 0],  [0, -0.25, 0],
];
const FACE_ROTATIONS: [number, number, number][] = [
  [0, 0, 0], [0, Math.PI, 0], [0, Math.PI / 2, 0],
  [0, -Math.PI / 2, 0], [-Math.PI / 2, 0, 0], [Math.PI / 2, 0, 0],
];
const FACE_VALUES = [1, 6, 2, 5, 3, 4];

interface DiceProps {
  position: [number, number, number];
  size?: number;
}

export default function Dice3D({ position, size = 0.5 }: DiceProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const rollDiceAction = useGameStore(s => s.rollDice);
  const phase = useGameStore(s => s.phase);
  const lastRoll = useGameStore(s => s.lastRoll);
  const [rolling, setRolling] = useState(false);
  const [displayValue, setDisplayValue] = useState(1);
  const intervalRef = useRef<number | null>(null);
  const isClickable = phase === 'rolling' && !rolling;

  // Idle floating animation
  useFrame((state) => {
    if (!groupRef.current || rolling) return;
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.4) * 0.05;
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleClick = () => {
    if (!isClickable) return;
    setRolling(true);
    rollDiceAction();

    // Animate the dice spinning
    const startTime = Date.now();
    const duration = 800;
    const startRot = groupRef.current
      ? { x: groupRef.current.rotation.x, y: groupRef.current.rotation.y, z: groupRef.current.rotation.z }
      : { x: 0, y: 0, z: 0 };

    // Rapidly cycle through values during spin
    const spinInterval = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * 6) + 1);
    }, 60);

    // Animate using requestAnimationFrame
    let animFrame: number;
    const animate = () => {
      if (!groupRef.current) { animFrame = requestAnimationFrame(animate); return; }
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);

      groupRef.current.rotation.x = startRot.x + progress * Math.PI * 6;
      groupRef.current.rotation.y = startRot.y + progress * Math.PI * 8;
      groupRef.current.rotation.z = startRot.z + progress * Math.PI * 4;

      const bounce = Math.sin(progress * Math.PI) * 0.4;
      groupRef.current.position.y = position[1] + bounce;

      const scale = 1 + Math.sin(progress * Math.PI * 3) * 0.06;
      groupRef.current.scale.setScalar(scale);

      if (progress < 1) {
        animFrame = requestAnimationFrame(animate);
      } else {
        // Settle: show the result from the store
        // The store already has the roll result from rollDiceAction()
        const result = useGameStore.getState().lastRoll;
        if (result > 0) {
          setDisplayValue(result);
        }
        clearInterval(spinInterval);
        setRolling(false);
      }
    };
    animFrame = requestAnimationFrame(animate);
  };

  const half = size / 2;

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      onPointerEnter={() => { if (isClickable) document.body.style.cursor = 'pointer'; }}
      onPointerLeave={() => { document.body.style.cursor = 'default'; }}
    >
      {/* Dice body */}
      <mesh castShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.15}
          metalness={0.2}
          emissive={isClickable ? '#FFD700' : '#000'}
          emissiveIntensity={isClickable ? 0.12 : 0}
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
        const isTopFace = fi === 4;
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

      {/* Clickable glow ring */}
      {isClickable && (
        <mesh>
          <ringGeometry args={[half + 0.1, half + 0.2, 32]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
