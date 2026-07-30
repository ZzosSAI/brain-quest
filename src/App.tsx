import React, { useState, useEffect } from 'react';
import { useGameStore } from './game/GameEngine';
import GameScene from './scenes/GameScene';
import Lobby from './ui/Lobby';
import HUD from './ui/HUD';
import QuizPanel from './ui/QuizPanel';
import EndGame from './ui/EndGame';
import AchievementNotification from './ui/AchievementNotification';
import './App.css';

function App() {
  const phase = useGameStore(s => s.phase);
  const [gameStarted, setGameStarted] = useState(false);

  const handleStart = () => setGameStarted(true);
  const handleRestart = () => setGameStarted(false);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const state = useGameStore.getState();

      // Space / Enter → roll dice or resolve tile
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (state.phase === 'rolling') {
          state.rollDice();
        } else if (state.phase === 'reward' || state.phase === 'punishment') {
          state.resolveTile();
        }
      }

      // 1-4 → quiz answers
      if (e.key >= '1' && e.key <= '4' && state.quizActive) {
        const idx = parseInt(e.key) - 1;
        const qt = state.quizQuestion;
        if (qt && idx < qt.choices.length) {
          state.answerQuestion(idx);
        }
      }

      // H → hint
      if (e.key === 'h' || e.key === 'H') {
        if (state.quizActive && !state.showHint) {
          state.requestHint();
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="app">
      {gameStarted && <GameScene />}
      {!gameStarted && <Lobby onStart={handleStart} />}
      {gameStarted && <HUD />}
      {gameStarted && <QuizPanel />}
      {gameStarted && <AchievementNotification />}
      {gameStarted && phase === 'game_over' && <EndGame onRestart={handleRestart} />}
    </div>
  );
}

export default App;
