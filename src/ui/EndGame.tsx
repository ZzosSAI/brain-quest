import React from 'react';
import { useGameStore } from '../game/GameEngine';
import { CHARACTER_EMOJI } from '../game/types';
import { AchievementGallery } from './AchievementNotification';
import LearningReport from './LearningReport';

export default function EndGame({ onRestart }: { onRestart: () => void }) {
  const players = useGameStore(s => s.players);
  const winner = useGameStore(s => s.winner);
  const resetGame = useGameStore(s => s.resetGame);
  const persistedAchievements = useGameStore(s => s.persistedAchievements);

  if (!winner) return null;

  // Sort by finish order
  const ranked = [...players].sort((a, b) => {
    if (a.finishOrder === 0 && b.finishOrder === 0) return b.correctAnswers - a.correctAnswers;
    if (a.finishOrder === 0) return 1;
    if (b.finishOrder === 0) return -1;
    return a.finishOrder - b.finishOrder;
  });

  const getStrongestSubject = (player: typeof players[0]): string => {
    let best = '';
    let bestCount = 0;
    for (const [subj, c] of Object.entries(player.subjectsCorrect)) {
      if (c > bestCount) { bestCount = c; best = subj; }
    }
    return best || 'N/A';
  };

  const getWeakestSubject = (player: typeof players[0]): string => {
    let worst = '';
    let worstRate = 0;
    for (const [subj, w] of Object.entries(player.subjectsWrong)) {
      const c = player.subjectsCorrect[subj] || 0;
      const rate = w / (c + w + 1);
      if (rate > worstRate) { worstRate = rate; worst = subj; }
    }
    return worst || 'None';
  };

  const handleRestart = () => {
    resetGame();
    onRestart();
  };

  return (
    <div className="endgame-overlay">
      <div className="endgame-card">
        <div className="endgame-header">
          <span className="trophy">🏆</span>
          <h1>Game Over!</h1>
          <h2 className="winner-name" style={{ color: winner.color }}>
            {winner.name} wins!
          </h2>
        </div>

        <div className="endgame-rankings">
          {ranked.map((player, i) => {
            const trophies = ['🥇', '🥈', '🥉', '4️⃣'];
            const strongest = getStrongestSubject(player);
            const weakest = getWeakestSubject(player);

            return (
              <div
                key={player.id}
                className="ranking-card"
                style={{ borderColor: player.color }}
              >
                <div className="rank-badge">{trophies[i] || `${i + 1}th`}</div>
                <div className="rank-char">{CHARACTER_EMOJI[player.character]}</div>
                <div className="rank-info">
                  <strong>{player.name}</strong>
                  <div className="rank-stats">
                    <span>✅ {player.correctAnswers} correct</span>
                    <span>❌ {player.wrongAnswers} wrong</span>
                    <span>🪙 {player.coins} coins</span>
                    <span>🔥 Combo: {player.highestCombo}x</span>
                  </div>
                  <div className="rank-subjects">
                    <span className="strong-badge">⭐ {strongest}</span>
                    <span className="weak-badge">📈 Improve: {weakest}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Achievements section */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1rem', marginBottom: 8, textAlign: 'center' }}>
            🏅 Achievements
          </h3>
          <AchievementGallery unlockedIds={persistedAchievements} />
        </div>

        {/* Learning Report for winner */}
        {winner && (
          <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '1rem', marginBottom: 8, textAlign: 'center' }}>
              📖 Learning Report
            </h3>
            <LearningReport player={winner} compact />
          </div>
        )}

        <button className="restart-btn" onClick={handleRestart}>
          🔄 Play Again
        </button>
      </div>
    </div>
  );
}
