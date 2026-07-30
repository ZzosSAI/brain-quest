// ─── Core Types ─────────────────────────────────────────
import { Vector3Tuple } from 'three';

export interface Player {
  id: number;
  name: string;
  character: CharacterType;
  color: string;
  position: number;
  coins: number;
  shield: boolean;
  skipNextPunishment: boolean;
  reverseNext: boolean;
  correctAnswers: number;
  wrongAnswers: number;
  subjectsCorrect: Record<string, number>;
  subjectsWrong: Record<string, number>;
  combo: number;
  highestCombo: number;
  hasFinished: boolean;
  finishOrder: number;
  snakesSurvived: number;
  laddersClimbed: number;
  hintsUsed: number;
  totalCoinsEarned: number;
}

export type CharacterType =
  | 'wizard' | 'robot' | 'dinosaur' | 'superhero'
  | 'astronaut' | 'explorer' | 'fairy' | 'ninja';

export interface Snake {
  from: number;
  to: number;
}

export interface Ladder {
  from: number;
  to: number;
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type WorldTheme = 'default' | 'jungle' | 'castle' | 'space';

export type Direction = 'up' | 'down';

export type Subject =
  | 'mathematics' | 'science' | 'english' | 'geography'
  | 'general_knowledge' | 'animals' | 'space' | 'coding'
  | 'history' | 'environment' | 'art' | 'music' | 'sports' | 'logic';

export interface QuizQuestion {
  question: string;
  choices: string[];
  correctIndex: number;
  subject: Subject;
  difficulty: number; // 1-10
  hint: string;
  explanation: string;
}

export type TileType = 'normal' | 'reward' | 'bomb';

export type RewardType =
  | 'move_forward' | 'extra_roll' | 'shield'
  | 'double_reward' | 'lucky_clover' | 'skip_punishment' | 'bonus_coins';

export type PunishmentType =
  | 'move_backward' | 'lose_turn' | 'slide_snake'
  | 'lose_coins' | 'reverse' | 'lose_reward';

export interface RewardEffect {
  type: RewardType;
  description: string;
  apply: (playerIndex: number) => void;
}

export interface PunishmentEffect {
  type: PunishmentType;
  description: string;
  apply: (playerIndex: number) => void;
}

export interface BoardConfig {
  rows: number;
  cols: number;
  totalTiles: number;
  snakes: Snake[];
  ladders: Ladder[];
  tiles: TileType[];
}

export type GamePhase =
  | 'lobby'
  | 'rolling'
  | 'moving'
  | 'tile_effect'
  | 'quiz'
  | 'reward'
  | 'punishment'
  | 'game_over';

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  boardConfig: BoardConfig;
  difficulty: Difficulty;
  winner: Player | null;
  finishOrder: number;
  lastRoll: number;
  pendingReward: RewardType | null;
  pendingPunishment: PunishmentType | null;
  quizQuestion: QuizQuestion | null;
  quizActive: boolean;
  message: string;
  round: number;
  theme: WorldTheme;
}

export const CHARACTER_LIST: CharacterType[] = [
  'wizard', 'robot', 'dinosaur', 'superhero',
  'astronaut', 'explorer', 'fairy', 'ninja'
];

export const CHARACTER_EMOJI: Record<CharacterType, string> = {
  wizard: '🧙', robot: '🤖', dinosaur: '🦕', superhero: '🦸',
  astronaut: '👨‍🚀', explorer: '🗺️', fairy: '🧚', ninja: '🥷'
};

export const PLAYER_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];

export const THEMES: Record<WorldTheme, {
  name: string; icon: string;
  boardBase: string; tileEven: string; tileOdd: string;
  snakeColor: string; ladderColor: string;
  ambientLight: string; envPreset: string;
  fogColor: string;
}> = {
  default: {
    name: 'Classic', icon: '🔮',
    boardBase: '#12122A', tileEven: '#2A2A5C', tileOdd: '#1A1A4C',
    snakeColor: '#4CAF50', ladderColor: '#FFD700',
    ambientLight: '#6060c0', envPreset: 'night',
    fogColor: '#0F0A2E',
  },
  jungle: {
    name: 'Jungle', icon: '🌴',
    boardBase: '#0A1A0A', tileEven: '#1A3A1A', tileOdd: '#0F2A0F',
    snakeColor: '#8BC34A', ladderColor: '#FF9800',
    ambientLight: '#609060', envPreset: 'forest',
    fogColor: '#0A1A0A',
  },
  castle: {
    name: 'Magic Castle', icon: '🏰',
    boardBase: '#1A0A2E', tileEven: '#3A1A5C', tileOdd: '#2A0F4C',
    snakeColor: '#9C27B0', ladderColor: '#FFD700',
    ambientLight: '#8060c0', envPreset: 'sunset',
    fogColor: '#1A0A2E',
  },
  space: {
    name: 'Space Galaxy', icon: '🌌',
    boardBase: '#05051A', tileEven: '#0F0F3A', tileOdd: '#0A0A2A',
    snakeColor: '#00BCD4', ladderColor: '#E040FB',
    ambientLight: '#4040a0', envPreset: 'night',
    fogColor: '#05051A',
  },
};
