import React, { useState } from 'react';
import { useGameStore } from '../game/GameEngine';
import { Difficulty, WorldTheme, CharacterType, CHARACTER_LIST, CHARACTER_EMOJI, THEMES } from '../game/types';

const DIFFICULTIES: { key: Difficulty; label: string; desc: string; color: string }[] = [
  { key: 'beginner', label: '🌱 Beginner', desc: '8×8 board · Easy quizzes', color: '#4CAF50' },
  { key: 'intermediate', label: '🔥 Intermediate', desc: '10×10 board · Medium quizzes', color: '#FF9800' },
  { key: 'advanced', label: '⚡ Advanced', desc: '12×12 board · Hard quizzes', color: '#F44336' },
];

export default function Lobby({ onStart }: { onStart: () => void }) {
  const initGame = useGameStore(s => s.initGame);
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  const [playerChars, setPlayerChars] = useState<CharacterType[]>(['wizard', 'robot', 'dinosaur', 'superhero']);
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [theme, setTheme] = useState<WorldTheme>('default');

  const handleStart = () => {
    initGame(
      playerNames.slice(0, playerCount),
      playerChars.slice(0, playerCount),
      difficulty,
      theme
    );
    onStart();
  };

  const cycleCharacter = (playerIdx: number) => {
    const current = playerChars[playerIdx];
    const idx = CHARACTER_LIST.indexOf(current);
    const next = CHARACTER_LIST[(idx + 1) % CHARACTER_LIST.length];
    const chars = [...playerChars];
    chars[playerIdx] = next;
    setPlayerChars(chars);
  };

  const themeList = (Object.entries(THEMES) as [WorldTheme, typeof THEMES['default']][]);

  return (
    <div className="lobby-overlay">
      <div className="lobby-card">
        <div className="lobby-header">
          <span className="lobby-icon">🧠</span>
          <h1>Brain Quest</h1>
          <p className="lobby-subtitle">Snakes, Ladders &amp; Challenges</p>
        </div>

        {/* Player Count */}
        <div className="lobby-section">
          <label>Players</label>
          <div className="player-count-buttons">
            {[2, 3, 4].map(n => (
              <button
                key={n}
                className={`count-btn ${playerCount === n ? 'active' : ''}`}
                onClick={() => setPlayerCount(n)}
              >
                {n} Players
              </button>
            ))}
          </div>
        </div>

        {/* Player Names & Characters */}
        <div className="lobby-section">
          <label>Characters</label>
          <div className="player-setup-grid">
            {Array.from({ length: playerCount }).map((_, i) => (
              <div key={i} className="player-setup-card">
                <div className="player-color-dot" style={{
                  background: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i],
                }} />
                <input
                  className="player-name-input"
                  value={playerNames[i]}
                  onChange={(e) => {
                    const names = [...playerNames];
                    names[i] = e.target.value;
                    setPlayerNames(names);
                  }}
                  maxLength={12}
                />
                <button
                  className="char-select-btn"
                  onClick={() => cycleCharacter(i)}
                >
                  <span className="char-emoji">{CHARACTER_EMOJI[playerChars[i]]}</span>
                  <span className="char-name">{playerChars[i]}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="lobby-section">
          <label>Difficulty</label>
          <div className="difficulty-buttons">
            {DIFFICULTIES.map(d => (
              <button
                key={d.key}
                className={`diff-btn ${difficulty === d.key ? 'active' : ''}`}
                style={{
                  borderColor: difficulty === d.key ? d.color : 'transparent',
                  background: difficulty === d.key ? `${d.color}22` : 'rgba(255,255,255,0.05)',
                }}
                onClick={() => setDifficulty(d.key)}
              >
                <span style={{ fontSize: '1.2rem' }}>{d.label.split(' ')[0]}</span>
                <strong>{d.label.split(' ').slice(1).join(' ')}</strong>
                <small>{d.desc}</small>
              </button>
            ))}
          </div>
        </div>

        {/* World Theme */}
        <div className="lobby-section">
          <label>World Theme</label>
          <div className="difficulty-buttons">
            {themeList.map(([key, t]) => (
              <button
                key={key}
                className={`diff-btn ${theme === key ? 'active' : ''}`}
                style={{
                  borderColor: theme === key ? '#7C3AED' : 'transparent',
                  background: theme === key ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.05)',
                }}
                onClick={() => setTheme(key)}
              >
                <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
                <strong>{t.name}</strong>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button className="start-btn" onClick={handleStart}>
          🚀 Start Adventure!
        </button>
      </div>
    </div>
  );
}
