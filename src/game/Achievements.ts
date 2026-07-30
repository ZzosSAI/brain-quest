import { Player } from './types';

// ─── Achievement Definitions ────────────────────────────

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (player: Player, gameState: { round: number; difficulty: string }) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first game',
    icon: '🏆',
    condition: (p) => p.finishOrder === 1,
  },
  {
    id: 'math_master',
    name: 'Math Master',
    description: 'Get 8 correct math answers',
    icon: '🧮',
    condition: (p) => (p.subjectsCorrect['mathematics'] || 0) >= 8,
  },
  {
    id: 'science_genius',
    name: 'Science Genius',
    description: 'Get 8 correct science answers',
    icon: '🔬',
    condition: (p) => (p.subjectsCorrect['science'] || 0) >= 8,
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Win on Advanced difficulty',
    icon: '🗺️',
    condition: (p, gs) => p.finishOrder === 1 && gs.difficulty === 'advanced',
  },
  {
    id: 'fast_thinker',
    name: 'Fast Thinker',
    description: 'Answer 5 questions in a row correctly without hints',
    icon: '⚡',
    condition: (p) => p.highestCombo >= 5,
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Finish with zero wrong answers',
    icon: '🎯',
    condition: (p) => p.finishOrder > 0 && p.wrongAnswers === 0 && p.correctAnswers >= 5,
  },
  {
    id: 'quiz_champion',
    name: 'Quiz Champion',
    description: 'Get 20 total correct answers',
    icon: '📚',
    condition: (p) => p.correctAnswers >= 20,
  },
  {
    id: 'snake_survivor',
    name: 'Snake Survivor',
    description: 'Survive 3 snake landings with shields',
    icon: '🐍',
    condition: (p) => (p as any).snakesSurvived >= 3 || false,
  },
  {
    id: 'ladder_legend',
    name: 'Ladder Legend',
    description: 'Climb 5 ladders in a single game',
    icon: '🪜',
    condition: (p) => (p as any).laddersClimbed >= 5 || false,
  },
  {
    id: 'knowledge_hero',
    name: 'Knowledge Hero',
    description: 'Answer correctly in 5 different subjects',
    icon: '🌟',
    condition: (p) => Object.keys(p.subjectsCorrect).length >= 5,
  },
  {
    id: 'combo_king',
    name: 'Combo King',
    description: 'Achieve a 5x combo',
    icon: '👑',
    condition: (p) => p.highestCombo >= 5,
  },
  {
    id: 'brain_collector',
    name: 'Brain Collector',
    description: 'Earn 100 Brain Coins',
    icon: '🪙',
    condition: (p) => p.coins >= 100,
  },
  {
    id: 'grammar_guru',
    name: 'Grammar Guru',
    description: 'Get 5 correct English answers',
    icon: '📖',
    condition: (p) => (p.subjectsCorrect['english'] || 0) >= 5,
  },
  {
    id: 'space_explorer',
    name: 'Space Explorer',
    description: 'Get 3 correct space answers',
    icon: '🚀',
    condition: (p) => (p.subjectsCorrect['space'] || 0) >= 3,
  },
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Win after being in last place',
    icon: '💪',
    condition: (p, gs) => p.finishOrder === 1 && gs.round >= 5,
  },
];

// ─── Achievement Tracker ────────────────────────────────

export function checkAchievements(
  player: Player,
  gameState: { round: number; difficulty: string },
  unlockedIds: Set<string>
): Achievement[] {
  return ACHIEVEMENTS.filter(a =>
    !unlockedIds.has(a.id) && a.condition(player, gameState)
  );
}

// ─── Achievement Store (persisted in localStorage) ──────

const STORAGE_KEY = 'brainquest_achievements';

export function loadUnlockedAchievements(): Record<string, number> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveUnlockedAchievements(achievements: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
  } catch {}
}

export function formatAchievementTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
