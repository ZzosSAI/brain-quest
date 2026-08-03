import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../game/GameEngine';
import { getTilePosition } from '../game/Board';
import { TileType, WorldTheme, THEMES } from '../game/types';
import gsap from 'gsap';

const TILE_SIZE = 1;
const TILE_GAP = 0.1;
const BOARD_Y = -0.5;

function getTileColor(type: TileType, index: number, total: number, theme: WorldTheme): string {
  const t = THEMES[theme] || THEMES.default;
  if (index === 0) return '#4CAF50';
  if (index === total - 1) return '#FFD700';
  switch (type) {
    case 'reward': return '#9C27B0';
    case 'bomb': return '#F44336';
    default: return (index % 2 === 0) ? t.tileEven : t.tileOdd;
  }
}

function makeTexture(text: string, fontSize = 24, color = 'rgba(255,255,255,0.5)'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 64, 64);
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 32, 34);
  return new THREE.CanvasTexture(canvas);
}

function Tile({ index, type, total, rows, cols, theme }: {
  index: number; type: TileType; total: number;
  rows: number; cols: number; theme: WorldTheme;
}) {
  const { row, col } = getTilePosition(index, rows, cols);
  const pos: [number, number, number] = [
    (col - cols / 2 + 0.5) * (TILE_SIZE + TILE_GAP),
    BOARD_Y,
    (row - rows / 2 + 0.5) * (TILE_SIZE + TILE_GAP),
  ];

  const color = getTileColor(type, index, total, theme);
  const isSpecial = type !== 'normal' || index === 0 || index === total - 1;

  return (
    <group position={pos}>
      {/* Tile base */}
      <mesh receiveShadow>
        <boxGeometry args={[TILE_SIZE, 0.12, TILE_SIZE]} />
        <meshStandardMaterial
          color={color}
          metalness={isSpecial ? 0.4 : 0.1}
          roughness={0.5}
          emissive={isSpecial ? color : '#000'}
          emissiveIntensity={isSpecial ? 0.15 : 0}
        />
      </mesh>

      {/* Glow border for special */}
      {isSpecial && (
        <mesh>
          <boxGeometry args={[TILE_SIZE + 0.04, 0.01, TILE_SIZE + 0.04]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} />
        </mesh>
      )}

      {/* Number label */}
      <sprite position={[0, 0.15, 0]} scale={[0.3, 0.3, 1]}>
        <spriteMaterial>
          <canvasTexture attach="map" args={[makeTexture(String(index + 1), 20)]} />
        </spriteMaterial>
      </sprite>

      {/* Emoji indicators */}
      {type === 'reward' && <sprite position={[0, 0.35, 0]} scale={[0.25, 0.25, 1]}>
        <spriteMaterial><canvasTexture attach="map" args={[makeTexture('🎁', 32)]} /></spriteMaterial>
      </sprite>}
      {type === 'bomb' && <sprite position={[0, 0.35, 0]} scale={[0.25, 0.25, 1]}>
        <spriteMaterial><canvasTexture attach="map" args={[makeTexture('💣', 32)]} /></spriteMaterial>
      </sprite>}
      {index === 0 && <sprite position={[0, 0.35, 0]} scale={[0.25, 0.25, 1]}>
        <spriteMaterial><canvasTexture attach="map" args={[makeTexture('🚀', 32)]} /></spriteMaterial>
      </sprite>}
      {index === total - 1 && <sprite position={[0, 0.35, 0]} scale={[0.25, 0.25, 1]}>
        <spriteMaterial><canvasTexture attach="map" args={[makeTexture('🏆', 32)]} /></spriteMaterial>
      </sprite>}
    </group>
  );
}

// ─── Snake Tube ──────────────────────────────────────────
function Snake({ from, to, rows, cols, color }: { from: number; to: number; rows: number; cols: number; color: string }) {
  const fromP = getTilePosition(from, rows, cols);
  const toP = getTilePosition(to, rows, cols);
  const meshRef = useRef<THREE.Mesh>(null);

  const start = new THREE.Vector3(
    (fromP.col - cols / 2 + 0.5) * (TILE_SIZE + TILE_GAP), BOARD_Y - 0.05,
    (fromP.row - rows / 2 + 0.5) * (TILE_SIZE + TILE_GAP)
  );
  const end = new THREE.Vector3(
    (toP.col - cols / 2 + 0.5) * (TILE_SIZE + TILE_GAP), BOARD_Y - 0.05,
    (toP.row - rows / 2 + 0.5) * (TILE_SIZE + TILE_GAP)
  );

  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  mid.y += 0.3 + Math.abs(from - to) * 0.015;

  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(start, mid, end), [from, to]);

  // Gentle pulse animation
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 1.5 + from) * 0.1 + 0.9;
      meshRef.current.scale.y = pulse;
    }
  });

  return (
    <mesh ref={meshRef}>
      <tubeGeometry args={[curve, 20, 0.05, 8, false]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

// ─── Ladder Tube ─────────────────────────────────────────
function Ladder({ from, to, rows, cols, color }: { from: number; to: number; rows: number; cols: number; color: string }) {
  const fromP = getTilePosition(from, rows, cols);
  const toP = getTilePosition(to, rows, cols);
  const meshRef = useRef<THREE.Mesh>(null);

  const start = new THREE.Vector3(
    (fromP.col - cols / 2 + 0.5) * (TILE_SIZE + TILE_GAP), BOARD_Y,
    (fromP.row - rows / 2 + 0.5) * (TILE_SIZE + TILE_GAP)
  );
  const end = new THREE.Vector3(
    (toP.col - cols / 2 + 0.5) * (TILE_SIZE + TILE_GAP), BOARD_Y,
    (toP.row - rows / 2 + 0.5) * (TILE_SIZE + TILE_GAP)
  );

  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  mid.y += 0.25 + Math.abs(from - to) * 0.012;

  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(start, mid, end), [from, to]);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + to + 1) * 0.15 + 1;
      meshRef.current.scale.y = pulse;
    }
  });

  return (
    <mesh ref={meshRef}>
      <tubeGeometry args={[curve, 20, 0.06, 8, false]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

// ─── Player Token ────────────────────────────────────────
const CHARACTER_EMOJIS: Record<string, string> = {
  wizard: '🧙', robot: '🤖', dinosaur: '🦕', superhero: '🦸',
  astronaut: '👨‍🚀', explorer: '🗺️', fairy: '🧚', ninja: '🥷',
};

function PlayerToken({ playerIndex, rows, cols }: { playerIndex: number; rows: number; cols: number }) {
  const player = useGameStore(s => s.players[playerIndex]);
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
  const phase = useGameStore(s => s.phase);
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
  const color = colors[playerIndex];
  const tokenRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const floatRef = useRef(0);

  // Safety: if player doesn't exist yet, render nothing
  if (!player) return null;

  const isActive = currentPlayerIndex === playerIndex && !player.hasFinished;

  // Smooth movement to target position
  useEffect(() => {
    const { row, col } = getTilePosition(player.position, rows, cols);
    const offset = (playerIndex - 1.5) * 0.15;
    targetPos.current.set(
      (col - cols / 2 + 0.5) * (TILE_SIZE + TILE_GAP) + offset,
      BOARD_Y + 0.4,
      (row - rows / 2 + 0.5) * (TILE_SIZE + TILE_GAP) + offset
    );

    if (tokenRef.current) {
      gsap.to(tokenRef.current.position, {
        x: targetPos.current.x,
        y: targetPos.current.y,
        z: targetPos.current.z,
        duration: 0.6,
        ease: 'back.out(1.5)',
      });
      // Hop animation
      gsap.to(tokenRef.current.position, {
        y: targetPos.current.y + 0.2,
        duration: 0.3,
        ease: 'power1.out',
        yoyo: true,
        repeat: 1,
      });
    }
  }, [player.position, rows, cols]);

  // Floating idle animation
  useFrame((state) => {
    if (tokenRef.current && phase !== 'moving') {
      const float = Math.sin(state.clock.elapsedTime * 1.5 + playerIndex * 2) * 0.06;
      tokenRef.current.position.y = targetPos.current.y + float;
      // Subtle rotation
      tokenRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + playerIndex) * 0.1;
    }
  });

  const emoji = CHARACTER_EMOJIS[player.character] || '🤖';

  return (
    <group ref={tokenRef}>
      {/* Glow ring for active player */}
      {isActive && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
          <ringGeometry args={[0.25, 0.35, 24]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <circleGeometry args={[0.2, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.2} />
      </mesh>

      {/* Body sphere */}
      <mesh castShadow>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={isActive ? color : '#000'}
          emissiveIntensity={isActive ? 0.3 : 0}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Character emoji */}
      <sprite position={[0, 0.22, 0]} scale={[0.3, 0.3, 1]}>
        <spriteMaterial>
          <canvasTexture attach="map" args={[makeTexture(emoji, 28)]} />
        </spriteMaterial>
      </sprite>

      {/* Name label (only shows on hover/active) */}
      {isActive && (
        <sprite position={[0, -0.28, 0]} scale={[0.45, 0.18, 1]}>
          <spriteMaterial>
            <canvasTexture attach="map" args={[(() => {
              const c = document.createElement('canvas');
              c.width = 128; c.height = 48;
              const ctx = c.getContext('2d')!;
              ctx.clearRect(0, 0, 128, 48);
              ctx.fillStyle = 'rgba(0,0,0,0.6)';
              ctx.beginPath();
              ctx.roundRect(4, 4, 120, 40, 10);
              ctx.fill();
              ctx.fillStyle = color;
              ctx.font = 'bold 16px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(player.name, 64, 24);
              return new THREE.CanvasTexture(c);
            })()]} />
          </spriteMaterial>
        </sprite>
      )}

      {/* Finished badge */}
      {player.hasFinished && (
        <sprite position={[0, 0.35, 0]} scale={[0.2, 0.2, 1]}>
          <spriteMaterial>
            <canvasTexture attach="map" args={[makeTexture(`#${player.finishOrder}`, 24, '#FFD700')]} />
          </spriteMaterial>
        </sprite>
      )}
    </group>
  );
}

// ─── Board Component ─────────────────────────────────────
export default function Board3D({ theme }: { theme: WorldTheme }) {
  const boardConfig = useGameStore(s => s.boardConfig);
  const playerCount = useGameStore(s => s.players.length);
  const { rows, cols, totalTiles, tiles, snakes, ladders } = boardConfig;
  const t = THEMES[theme] || THEMES.default;

  if (!tiles.length) return null;

  return (
    <group>
      {/* Board base platform */}
      <mesh receiveShadow position={[0, BOARD_Y - 0.08, 0]}>
        <boxGeometry args={[cols * (TILE_SIZE + TILE_GAP) + 0.8, 0.08, rows * (TILE_SIZE + TILE_GAP) + 0.8]} />
        <meshStandardMaterial color={t.boardBase} metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Tiles */}
      {tiles.map((type, i) => (
        <Tile key={i} index={i} type={type} total={totalTiles} rows={rows} cols={cols} theme={theme} />
      ))}

      {/* Snakes */}
      {snakes.map((s, i) => (
        <Snake key={`s${i}`} from={s.from} to={s.to} rows={rows} cols={cols} color={t.snakeColor} />
      ))}

      {/* Ladders */}
      {ladders.map((l, i) => (
        <Ladder key={`l${i}`} from={l.from} to={l.to} rows={rows} cols={cols} color={t.ladderColor} />
      ))}

      {/* Player tokens (only render actual players) */}
      {Array.from({ length: playerCount }).map((_, i) => (
        <PlayerToken key={i} playerIndex={i} rows={rows} cols={cols} />
      ))}
    </group>
  );
}
