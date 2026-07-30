import { BoardConfig, Difficulty, Snake, Ladder, TileType } from './types';
import { SEED_SNAKES_LADDERS } from './SnakeLadderData';

// ─── Board Generation ────────────────────────────────────

const DIFFICULTY_CONFIG: Record<Difficulty, { rows: number; cols: number; rewardRatio: number; bombRatio: number }> = {
  beginner:     { rows: 8,  cols: 8,  rewardRatio: 0.12, bombRatio: 0.08 },
  intermediate: { rows: 10, cols: 10, rewardRatio: 0.10, bombRatio: 0.10 },
  advanced:     { rows: 12, cols: 12, rewardRatio: 0.08, bombRatio: 0.12 },
};

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateBoard(difficulty: Difficulty, gameSeed: number = 42): BoardConfig {
  const config = DIFFICULTY_CONFIG[difficulty];
  const { rows, cols, rewardRatio, bombRatio } = config;
  const totalTiles = rows * cols;

  // Pick snake/ladder set (deterministic by difficulty)
  const sets = SEED_SNAKES_LADDERS[difficulty];
  const chosenSet = sets[gameSeed % sets.length];

  // Assign tile types
  const tiles: TileType[] = new Array(totalTiles).fill('normal');
  tiles[0] = 'normal';        // Start
  tiles[totalTiles - 1] = 'normal'; // Finish

  const midIndices: number[] = [];
  for (let i = 1; i < totalTiles - 1; i++) {
    midIndices.push(i);
  }

  const shuffled = seededShuffle(midIndices, gameSeed + 1);
  const rewardCount = Math.floor(midIndices.length * rewardRatio);
  const bombCount = Math.floor(midIndices.length * bombRatio);

  for (let i = 0; i < rewardCount; i++) tiles[shuffled[i]] = 'reward';
  for (let i = 0; i < bombCount; i++) tiles[shuffled[rewardCount + i]] = 'bomb';

  return {
    rows,
    cols,
    totalTiles,
    snakes: chosenSet.snakes,
    ladders: chosenSet.ladders,
    tiles,
  };
}

// ─── Board Navigation ────────────────────────────────────

export function getTilePosition(
  tileIndex: number,
  rows: number,
  cols: number
): { row: number; col: number } {
  const row = Math.floor(tileIndex / cols);
  const isReverseRow = row % 2 === 1;
  const col = isReverseRow ? (cols - 1 - (tileIndex % cols)) : (tileIndex % cols);
  return { row: rows - 1 - row, col };
}

export function isSnakeHead(board: BoardConfig, tileIndex: number): boolean {
  return board.snakes.some(s => s.from === tileIndex);
}

export function getSnakeTail(board: BoardConfig, tileIndex: number): number | null {
  const snake = board.snakes.find(s => s.from === tileIndex);
  return snake ? snake.to : null;
}

export function isLadderBottom(board: BoardConfig, tileIndex: number): boolean {
  return board.ladders.some(l => l.from === tileIndex);
}

export function getLadderTop(board: BoardConfig, tileIndex: number): number | null {
  const ladder = board.ladders.find(l => l.from === tileIndex);
  return ladder ? ladder.to : null;
}
