import { Player, CharacterType } from './types';

export function createPlayer(
  id: number,
  name: string,
  character: CharacterType,
  color: string
): Player {
  return {
    id,
    name,
    character,
    color,
    position: 0,
    coins: 0,
    shield: false,
    skipNextPunishment: false,
    reverseNext: false,
    correctAnswers: 0,
    wrongAnswers: 0,
    subjectsCorrect: {},
    subjectsWrong: {},
    combo: 0,
    highestCombo: 0,
    hasFinished: false,
    finishOrder: 0,
    snakesSurvived: 0,
    laddersClimbed: 0,
    hintsUsed: 0,
    totalCoinsEarned: 0,
  };
}

export function awardCoins(player: Player, amount: number) {
  player.coins += amount;
  if (amount > 0) player.totalCoinsEarned = (player.totalCoinsEarned || 0) + amount;
}

export function addCorrectAnswer(player: Player, subject: string) {
  player.correctAnswers++;
  player.subjectsCorrect[subject] = (player.subjectsCorrect[subject] || 0) + 1;
  player.combo++;
  if (player.combo > player.highestCombo) player.highestCombo = player.combo;
}

export function addWrongAnswer(player: Player, subject: string) {
  player.wrongAnswers++;
  player.subjectsWrong[subject] = (player.subjectsWrong[subject] || 0) + 1;
  player.combo = 0;
}
