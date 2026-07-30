import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../game/GameEngine';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotSpeed: number;
}

const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#FF69B4', '#00FFFF', '#FF4500', '#7C3AED'];

function createBurst(center: THREE.Vector3): Particle[] {
  const particles: Particle[] = [];
  const count = 30 + Math.floor(Math.random() * 20);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const speed = 0.8 + Math.random() * 1.5;
    particles.push({
      position: center.clone(),
      velocity: new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.abs(Math.sin(phi) * Math.sin(theta)) * speed + 0.5,
        Math.cos(phi) * speed,
      ),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 0.04 + Math.random() * 0.06,
      life: 1,
      maxLife: 0.8 + Math.random() * 0.6,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.1,
    });
  }
  return particles;
}

export default function ConfettiSystem() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<Particle[]>([]);
  const showBurst = useGameStore(s => s.showStarBurst);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Trigger burst on correct answer
  useEffect(() => {
    if (showBurst) {
      const center = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        0.5,
        (Math.random() - 0.5) * 2,
      );
      particlesRef.current.push(...createBurst(center));
    }
  }, [showBurst]);

  // Trigger burst on game over
  const phase = useGameStore(s => s.phase);
  useEffect(() => {
    if (phase === 'game_over') {
      // Multiple bursts for victory
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const center = new THREE.Vector3(
            (Math.random() - 0.5) * 4,
            1 + Math.random() * 2,
            (Math.random() - 0.5) * 4,
          );
          particlesRef.current.push(...createBurst(center));
        }, i * 300);
      }
    }
  }, [phase]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Update particles
    const alive: Particle[] = [];
    for (const p of particlesRef.current) {
      p.life -= delta / p.maxLife;
      if (p.life <= 0) continue;
      p.velocity.y -= 1.5 * delta; // gravity
      p.position.add(p.velocity.clone().multiplyScalar(delta));
      p.rotation += p.rotSpeed;
      alive.push(p);
    }
    particlesRef.current = alive;

    // Update instanced mesh
    const count = Math.min(alive.length, 200);
    meshRef.current.count = count;
    for (let i = 0; i < count; i++) {
      const p = alive[i];
      dummy.position.copy(p.position);
      dummy.rotation.z = p.rotation;
      dummy.scale.setScalar(p.size * (0.5 + 0.5 * Math.max(0, p.life)));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      // Color
      const color = new THREE.Color(p.color);
      meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 200]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial side={THREE.DoubleSide} transparent opacity={0.9} />
    </instancedMesh>
  );
}
