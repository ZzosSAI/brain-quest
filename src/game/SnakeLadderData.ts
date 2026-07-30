import { Snake, Ladder, Difficulty } from './types';

interface SnakeLadderSet {
  snakes: Snake[];
  ladders: Ladder[];
}

// ─── Hand-crafted snake & ladder sets per difficulty ─────

const BEGINNER_SETS: SnakeLadderSet[] = [
  {
    snakes: [
      { from: 15, to: 5 },
      { from: 28, to: 12 },
      { from: 42, to: 22 },
      { from: 55, to: 38 },
    ],
    ladders: [
      { from: 3, to: 18 },
      { from: 10, to: 30 },
      { from: 20, to: 40 },
      { from: 35, to: 52 },
      { from: 48, to: 60 },
    ],
  },
  {
    snakes: [
      { from: 13, to: 3 },
      { from: 32, to: 18 },
      { from: 48, to: 28 },
      { from: 58, to: 40 },
    ],
    ladders: [
      { from: 5, to: 22 },
      { from: 14, to: 34 },
      { from: 25, to: 45 },
      { from: 38, to: 54 },
      { from: 50, to: 62 },
    ],
  },
  {
    snakes: [
      { from: 18, to: 8 },
      { from: 35, to: 20 },
      { from: 50, to: 30 },
      { from: 60, to: 42 },
    ],
    ladders: [
      { from: 2, to: 16 },
      { from: 12, to: 28 },
      { from: 22, to: 38 },
      { from: 40, to: 56 },
      { from: 46, to: 61 },
    ],
  },
];

const INTERMEDIATE_SETS: SnakeLadderSet[] = [
  {
    snakes: [
      { from: 22, to: 8 },
      { from: 35, to: 15 },
      { from: 48, to: 25 },
      { from: 62, to: 40 },
      { from: 78, to: 50 },
      { from: 88, to: 65 },
    ],
    ladders: [
      { from: 4, to: 20 },
      { from: 12, to: 32 },
      { from: 18, to: 42 },
      { from: 28, to: 52 },
      { from: 38, to: 60 },
      { from: 55, to: 75 },
      { from: 68, to: 85 },
      { from: 72, to: 92 },
    ],
  },
  {
    snakes: [
      { from: 25, to: 10 },
      { from: 40, to: 20 },
      { from: 52, to: 30 },
      { from: 68, to: 45 },
      { from: 82, to: 55 },
      { from: 90, to: 70 },
    ],
    ladders: [
      { from: 6, to: 24 },
      { from: 14, to: 36 },
      { from: 22, to: 46 },
      { from: 32, to: 56 },
      { from: 42, to: 64 },
      { from: 58, to: 78 },
      { from: 70, to: 88 },
      { from: 76, to: 95 },
    ],
  },
];

const ADVANCED_SETS: SnakeLadderSet[] = [
  {
    snakes: [
      { from: 28, to: 6 },
      { from: 45, to: 18 },
      { from: 58, to: 30 },
      { from: 72, to: 42 },
      { from: 88, to: 55 },
      { from: 98, to: 70 },
      { from: 110, to: 85 },
      { from: 125, to: 95 },
    ],
    ladders: [
      { from: 4, to: 24 },
      { from: 10, to: 36 },
      { from: 20, to: 48 },
      { from: 32, to: 60 },
      { from: 40, to: 68 },
      { from: 52, to: 80 },
      { from: 62, to: 90 },
      { from: 74, to: 104 },
      { from: 82, to: 115 },
      { from: 100, to: 130 },
    ],
  },
  {
    snakes: [
      { from: 32, to: 10 },
      { from: 50, to: 22 },
      { from: 65, to: 35 },
      { from: 78, to: 48 },
      { from: 92, to: 60 },
      { from: 105, to: 75 },
      { from: 118, to: 88 },
      { from: 130, to: 100 },
    ],
    ladders: [
      { from: 6, to: 28 },
      { from: 14, to: 40 },
      { from: 24, to: 54 },
      { from: 36, to: 66 },
      { from: 46, to: 76 },
      { from: 56, to: 86 },
      { from: 68, to: 98 },
      { from: 80, to: 110 },
      { from: 90, to: 120 },
      { from: 102, to: 138 },
    ],
  },
];

export const SEED_SNAKES_LADDERS: Record<Difficulty, SnakeLadderSet[]> = {
  beginner: BEGINNER_SETS,
  intermediate: INTERMEDIATE_SETS,
  advanced: ADVANCED_SETS,
};
