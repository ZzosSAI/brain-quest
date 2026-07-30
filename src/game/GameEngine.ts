import { create } from 'zustand';
import {
  GameState, GamePhase, Player, Difficulty, Subject,
  RewardType, PunishmentType, RewardEffect, PunishmentEffect,
  QuizQuestion
} from './types';
import { generateBoard, getSnakeTail, getLadderTop } from './Board';
import { createPlayer, awardCoins, addCorrectAnswer, addWrongAnswer } from './Players';
import { rollDice } from './Dice';
import { generateQuestion, adaptDifficulty, GeneratedQuestion } from '../lib/ai';
import { playDiceRoll, playCorrect, playWrong, playSnake, playLadder, playVictory, playCombo } from '../lib/audio';
import { checkAchievements, loadUnlockedAchievements, saveUnlockedAchievements, Achievement } from './Achievements';

// ─── Reward Effects ─────────────────────────────────────

function getRandomReward(): RewardEffect {
  const rewards: RewardType[] = [
    'move_forward', 'extra_roll', 'shield',
    'double_reward', 'lucky_clover', 'skip_punishment', 'bonus_coins'
  ];
  const type = rewards[Math.floor(Math.random() * rewards.length)];
  const descriptions: Record<RewardType, string> = {
    move_forward: 'Move forward 3 spaces!',
    extra_roll: 'Roll again!',
    shield: 'Shield against the next snake!',
    double_reward: 'Double coins next turn!',
    lucky_clover: 'Auto-pass the next quiz!',
    skip_punishment: 'Skip the next punishment!',
    bonus_coins: 'Bonus 20 Brain Coins!',
  };
  return {
    type,
    description: descriptions[type],
    apply: (playerIndex: number) => {
      const s = useGameStore.getState();
      const player = s.players[playerIndex];
      switch (type) {
        case 'move_forward':
          const newPos = Math.min(s.boardConfig.totalTiles - 1, player.position + 3);
          useGameStore.getState().movePlayer(playerIndex, newPos);
          break;
        case 'extra_roll':
          useGameStore.setState({ phase: 'rolling' });
          break;
        case 'shield':
          useGameStore.setState(state => {
            const p = [...state.players];
            p[playerIndex] = { ...p[playerIndex], shield: true };
            return { players: p };
          });
          break;
        case 'double_reward':
          awardCoins(player, 20);
          break;
        case 'lucky_clover':
          // Handled in quiz flow
          break;
        case 'skip_punishment':
          useGameStore.setState(state => {
            const p = [...state.players];
            p[playerIndex] = { ...p[playerIndex], skipNextPunishment: true };
            return { players: p };
          });
          break;
        case 'bonus_coins':
          awardCoins(player, 20);
          break;
      }
    },
  };
}

function getRandomPunishment(): PunishmentEffect {
  const types: PunishmentType[] = [
    'move_backward', 'lose_turn', 'slide_snake',
    'lose_coins', 'reverse', 'lose_reward'
  ];
  const type = types[Math.floor(Math.random() * types.length)];
  const descriptions: Record<PunishmentType, string> = {
    move_backward: 'Move back 3 spaces!',
    lose_turn: 'Lose your next turn!',
    slide_snake: 'Find the nearest snake!',
    lose_coins: 'Lose 10 Brain Coins!',
    reverse: 'Go backwards next turn!',
    lose_reward: 'Lose your current reward!',
  };
  return {
    type,
    description: descriptions[type],
    apply: (playerIndex: number) => {
      const state = useGameStore.getState();
      const player = state.players[playerIndex];
      switch (type) {
        case 'move_backward':
          const newPos = Math.max(0, player.position - 3);
          useGameStore.getState().movePlayer(playerIndex, newPos);
          break;
        case 'lose_turn':
          useGameStore.setState(state => {
            const p = [...state.players];
            p[playerIndex] = { ...p[playerIndex], hasFinished: true, finishOrder: state.finishOrder };
            return { players: p, finishOrder: state.finishOrder + 1 };
          });
          // Actually just skip them next round
          break;
        case 'lose_coins':
          awardCoins(player, -10);
          break;
        case 'reverse':
          useGameStore.setState(state => {
            const p = [...state.players];
            p[playerIndex] = { ...p[playerIndex], reverseNext: true };
            return { players: p };
          });
          break;
        default:
          break;
      }
    },
  };
}

// ─── Question Generation ────────────────────────────────

function generateQuizQuestion(difficulty: number, playerIndex: number): QuizQuestion {
  const state = useGameStore.getState();
  const player = state.players[playerIndex];
  
  // Find weakest subject
  let weakestSubject: Subject | undefined;
  let worstRate = 1;
  for (const [subj, w] of Object.entries(player.subjectsWrong)) {
    const c = player.subjectsCorrect[subj] || 0;
    const rate = w / (c + w + 1);
    if (rate > worstRate) {
      worstRate = rate;
      weakestSubject = subj as Subject;
    }
  }

  const generated = generateQuestion(difficulty, weakestSubject);
  return {
    question: generated.question,
    choices: generated.choices,
    correctIndex: generated.correctIndex,
    subject: generated.subject,
    difficulty: generated.difficulty,
    hint: generated.hint,
    explanation: generated.explanation,
  };
}

// ─── Zustand Store ──────────────────────────────────────

interface GameActions {
  initGame: (playerNames: string[], playerCharacters: any[], difficulty: Difficulty, theme?: WorldTheme) => void;
  rollDice: () => void;
  movePlayer: (playerIndex: number, toPosition: number) => void;
  answerQuestion: (choiceIndex: number) => void;
  requestHint: () => void;
  resolveTile: () => void;
  nextTurn: () => void;
  resetGame: () => void;
  setPhase: (phase: GamePhase) => void;
  setMessage: (msg: string) => void;
}

export interface GameStore extends GameState, GameActions {
  pendingRewardEffect: RewardEffect | null;
  pendingPunishmentEffect: PunishmentEffect | null;
  showHint: boolean;
  currentHint: string;
  comboMessage: string;
  playerDifficulties: number[];
  starCounts: number[];
  showStarBurst: boolean;
  newAchievements: Achievement[];
  persistedAchievements: Record<string, number>;
  dismissAchievement: (id: string) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // ── Initial State ──
  phase: 'lobby',
  players: [],
  currentPlayerIndex: 0,
  boardConfig: { rows: 8, cols: 8, totalTiles: 64, snakes: [], ladders: [], tiles: [] },
  difficulty: 'beginner',
  winner: null,
  finishOrder: 0,
  lastRoll: 0,
  pendingReward: null,
  pendingPunishment: null,
  quizQuestion: null,
  quizActive: false,
  message: 'Welcome to Brain Quest!',
  round: 0,
  pendingRewardEffect: null,
  pendingPunishmentEffect: null,
  showHint: false,
  currentHint: '',
  comboMessage: '',
  playerDifficulties: [],
  starCounts: [],
  showStarBurst: false,
  newAchievements: [],
  persistedAchievements: loadUnlockedAchievements(),
  theme: 'default',

  // ── Init ──
  initGame: (names, characters, difficulty, theme) => {
    const boardConfig = generateBoard(difficulty, Date.now());
    const players: Player[] = names.map((name, i) =>
      createPlayer(i, name, characters[i] || 'robot', 
        ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i])
    );

    set({
      phase: 'rolling',
      players,
      currentPlayerIndex: 0,
      boardConfig,
      difficulty,
      winner: null,
      finishOrder: 0,
      lastRoll: 0,
      quizQuestion: null,
      quizActive: false,
      message: `${names[0]}'s turn! Roll the dice!`,
      round: 0,
      pendingRewardEffect: null,
      pendingPunishmentEffect: null,
      showHint: false,
      currentHint: '',
      comboMessage: '',
      playerDifficulties: players.map(() => 3),
      starCounts: players.map(() => 0),
      showStarBurst: false,
      newAchievements: [],
      theme: theme || 'default',
    });
  },

  // ── Roll Dice ──
  rollDice: () => {
    const state = get();
    if (state.phase !== 'rolling') return;
    
    const roll = rollDice();
    playDiceRoll();
    set({ lastRoll: roll, phase: 'moving', message: `Rolled a ${roll}!` });

    // After a short delay, move the player
    setTimeout(() => {
      const s = get();
      const player = s.players[s.currentPlayerIndex];
      const newPos = player.reverseNext
        ? Math.max(0, player.position - roll)
        : Math.min(s.boardConfig.totalTiles - 1, player.position + roll);

      // Reset reverse
      const players = [...s.players];
      players[s.currentPlayerIndex] = { ...players[s.currentPlayerIndex], reverseNext: false };
      set({ players });

      // Check for snake or ladder
      const snakeTail = getSnakeTail(s.boardConfig, newPos);
      const ladderTop = getLadderTop(s.boardConfig, newPos);

      if (snakeTail !== null && !player.shield) {
        playSnake();
        set(state => {
          const p = [...state.players];
          p[s.currentPlayerIndex] = { ...p[s.currentPlayerIndex], snakesSurvived: (p[s.currentPlayerIndex].snakesSurvived || 0) + 1 };
          return { players: p };
        });
        s.movePlayer(s.currentPlayerIndex, snakeTail);
        set({ message: `Oh no! Snake! Slide down to ${snakeTail + 1}!`, phase: 'tile_effect' });
      } else if (ladderTop !== null) {
        playLadder();
        set(state => {
          const p = [...state.players];
          p[s.currentPlayerIndex] = { ...p[s.currentPlayerIndex], laddersClimbed: (p[s.currentPlayerIndex].laddersClimbed || 0) + 1 };
          return { players: p };
        });
        s.movePlayer(s.currentPlayerIndex, ladderTop);
        set({ message: `Ladder! Climb up to ${ladderTop + 1}!`, phase: 'tile_effect' });
      } else {
        s.movePlayer(s.currentPlayerIndex, newPos);
      }

      // Check tile type
      const tileType = s.boardConfig.tiles[newPos];
      if (tileType === 'reward') {
        s.setMessage('Reward tile! Answer correctly to claim your prize!');
        const question = generateQuizQuestion(s.playerDifficulties[s.currentPlayerIndex] || 3, s.currentPlayerIndex);
        set({ quizQuestion: question, quizActive: true, phase: 'quiz', showHint: false });
      } else if (tileType === 'bomb') {
        s.setMessage('Bomb tile! Answer correctly to escape!');
        const question = generateQuizQuestion(s.playerDifficulties[s.currentPlayerIndex] || 3, s.currentPlayerIndex);
        set({ quizQuestion: question, quizActive: true, phase: 'quiz', showHint: false });
      } else {
        // Normal tile - next turn after delay
        setTimeout(() => s.nextTurn(), 1000);
      }
    }, 800);
  },

  // ── Move Player ──
  movePlayer: (playerIndex, toPosition) => {
    set(state => {
      const players = [...state.players];
      const clampedPos = Math.max(0, Math.min(state.boardConfig.totalTiles - 1, toPosition));
      players[playerIndex] = { ...players[playerIndex], position: clampedPos };

      // Check for win
      if (clampedPos === state.boardConfig.totalTiles - 1 && !players[playerIndex].hasFinished) {
        playVictory();
        players[playerIndex] = { ...players[playerIndex], hasFinished: true, finishOrder: state.finishOrder + 1 };
        awardCoins(players[playerIndex], 50);
        
        if (state.finishOrder + 1 >= state.players.length) {
          // Game over - all finished
          const winner = players.reduce((a, b) => 
            (a.finishOrder > 0 && a.finishOrder < b.finishOrder) ? a : b
          );
          return {
            players,
            finishOrder: state.finishOrder + 1,
            phase: 'game_over' as GamePhase,
            winner: players.find(p => p.finishOrder === 1) || null,
            message: `${winner?.name || 'Player'} wins the game! 🏆`,
          };
        }
        
        return {
          players,
          finishOrder: state.finishOrder + 1,
          message: `${players[playerIndex].name} finished ${state.finishOrder + 1}!`,
        };
      }

      return { players };
    });
  },

  // ── Answer Question ──
  answerQuestion: (choiceIndex) => {
    const state = get();
    if (!state.quizQuestion) return;

    const isCorrect = choiceIndex === state.quizQuestion.correctIndex;
    const player = state.players[state.currentPlayerIndex];
    const subject = state.quizQuestion.subject;

    if (isCorrect) {
      playCorrect();
      addCorrectAnswer(player, subject);
      awardCoins(player, 10);

      // Check combos
      let comboMsg = '';
      if (player.combo === 3) {
        comboMsg = '🔥 Brain Combo! Extra points!';
        awardCoins(player, 20);
      } else if (player.combo === 5) {
        comboMsg = '🏆 Genius Combo! Massive bonus!';
        awardCoins(player, 50);
      } else if (player.combo >= 7) {
        comboMsg = '👑 Legendary Combo! Unstoppable!';
        awardCoins(player, 100);
      }

      // Adapt difficulty up
      const newDiff = adaptDifficulty(3, 0, state.playerDifficulties[state.currentPlayerIndex]);
      const diffs = [...state.playerDifficulties];
      diffs[state.currentPlayerIndex] = newDiff;

      const stars = [...state.starCounts];
      stars[state.currentPlayerIndex] = (stars[state.currentPlayerIndex] || 0) + 1;

      set({
        showStarBurst: true,
        playerDifficulties: diffs,
        starCounts: stars,
      });
      setTimeout(() => set({ showStarBurst: false }), 1200);

      // Determine what happens based on tile
      const tileType = state.boardConfig.tiles[player.position];
      if (tileType === 'reward') {
        const reward = getRandomReward();
        set({
          quizActive: false,
          quizQuestion: null,
          phase: 'reward',
          pendingRewardEffect: reward,
          comboMessage: comboMsg,
          message: `Correct! ${reward.description} ${comboMsg}`,
        });
      } else if (tileType === 'bomb') {
        // Escaped the bomb!
        set({
          quizActive: false,
          quizQuestion: null,
          phase: 'tile_effect',
          comboMessage: comboMsg,
          message: `Correct! Bomb defused! ${comboMsg}`,
        });
        setTimeout(() => get().nextTurn(), 1500);
      } else {
        set({
          quizActive: false,
          quizQuestion: null,
          message: `Correct! 🎉 ${comboMsg}`,
        });
        setTimeout(() => get().nextTurn(), 1500);
      }
    } else {
      playWrong();
      addWrongAnswer(player, subject);
      awardCoins(player, -5);

      // Adapt difficulty down
      const newDiff = adaptDifficulty(0, 2, state.playerDifficulties[state.currentPlayerIndex]);
      const diffs = [...state.playerDifficulties];
      diffs[state.currentPlayerIndex] = newDiff;
      set({ playerDifficulties: diffs });

      // Determine what happens based on tile
      const tileType = state.boardConfig.tiles[player.position];
      if (tileType === 'bomb') {
        const punishment = getRandomPunishment();
        set({
          quizActive: false,
          quizQuestion: null,
          phase: 'punishment',
          pendingPunishmentEffect: punishment,
          message: `Wrong! ${punishment.description}`,
        });
      } else if (tileType === 'reward') {
        // Reward tile wrong - no reward, move on
        set({
          quizActive: false,
          quizQuestion: null,
          message: 'Wrong answer! No reward this time. Try again next turn!',
        });
        setTimeout(() => get().nextTurn(), 2000);
      } else {
        set({
          quizActive: false,
          quizQuestion: null,
          message: 'Wrong answer! 😵 Better luck next time!',
        });
        setTimeout(() => get().nextTurn(), 2000);
      }
    }
  },

  // ── Hint ──
  requestHint: () => {
    const state = get();
    if (state.quizQuestion) {
      awardCoins(state.players[state.currentPlayerIndex], -3);
      set(state => {
        const p = [...state.players];
        p[state.currentPlayerIndex] = { ...p[state.currentPlayerIndex], hintsUsed: (p[state.currentPlayerIndex].hintsUsed || 0) + 1 };
        return { players: p };
      });
      set({ showHint: true, currentHint: state.quizQuestion.hint });
    }
  },

  // ── Resolve Tile ──
  resolveTile: () => {
    const state = get();
    if (state.pendingRewardEffect) {
      state.pendingRewardEffect.apply(state.currentPlayerIndex);
      if (state.phase === 'rolling') return; // extra roll
      setTimeout(() => get().nextTurn(), 1000);
    }
    if (state.pendingPunishmentEffect) {
      state.pendingPunishmentEffect.apply(state.currentPlayerIndex);
      setTimeout(() => get().nextTurn(), 1000);
    }
    set({ pendingRewardEffect: null, pendingPunishmentEffect: null });
  },

  // ── Next Turn ──
  nextTurn: () => {
    const state = get();
    if (state.phase === 'game_over') return;

    let nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
    let attempts = 0;
    while (state.players[nextIndex].hasFinished && attempts < state.players.length) {
      nextIndex = (nextIndex + 1) % state.players.length;
      attempts++;
    }

    if (attempts >= state.players.length) {
      // All finished — check achievements
      const winner = state.players.reduce((a, b) => 
        (!a.hasFinished || (a.finishOrder > 0 && a.finishOrder < b.finishOrder)) ? a : b
      );

      // Collect all newly unlocked achievements across all players
      const persisted = { ...get().persistedAchievements };
      const allNew: Achievement[] = [];
      for (const player of get().players) {
        const unlocked = new Set(Object.keys(persisted));
        const newOnes = checkAchievements(player, { round: get().round, difficulty: get().difficulty }, unlocked);
        for (const a of newOnes) {
          if (!persisted[a.id]) {
            persisted[a.id] = Date.now();
            allNew.push(a);
          }
        }
      }
      saveUnlockedAchievements(persisted);

      set({
        phase: 'game_over',
        winner,
        message: `${winner?.name || 'Player'} wins! 🏆`,
        newAchievements: allNew,
        persistedAchievements: persisted,
      });
      return;
    }

    const newRound = nextIndex === 0 ? state.round + 1 : state.round;
    set({
      currentPlayerIndex: nextIndex,
      phase: 'rolling',
      quizActive: false,
      quizQuestion: null,
      showHint: false,
      currentHint: '',
      message: `${state.players[nextIndex].name}'s turn! Roll the dice!`,
      round: newRound,
    });
  },

  // ── Reset ──
  resetGame: () => {
    set({
      phase: 'lobby',
      players: [],
      currentPlayerIndex: 0,
      boardConfig: { rows: 8, cols: 8, totalTiles: 64, snakes: [], ladders: [], tiles: [] },
      winner: null,
      finishOrder: 0,
      lastRoll: 0,
      quizQuestion: null,
      quizActive: false,
      message: 'Welcome to Brain Quest!',
      round: 0,
      pendingRewardEffect: null,
      pendingPunishmentEffect: null,
      showHint: false,
      currentHint: '',
      comboMessage: '',
      playerDifficulties: [],
      starCounts: [],
      showStarBurst: false,
    });
  },

  dismissAchievement: (id) => {
    set(state => ({
      newAchievements: state.newAchievements.filter(a => a.id !== id),
    }));
  },

  setPhase: (phase) => set({ phase }),
  setMessage: (msg) => set({ message: msg }),
}));
