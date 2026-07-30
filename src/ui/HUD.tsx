import React from 'react';
import { useGameStore } from '../game/GameEngine';
import { CHARACTER_EMOJI } from '../game/types';

export default function HUD() {
  const players = useGameStore(s => s.players);
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
  const phase = useGameStore(s => s.phase);
  const message = useGameStore(s => s.message);
  const resolveTile = useGameStore(s => s.resolveTile);
  const pendingRewardEffect = useGameStore(s => s.pendingRewardEffect);
  const pendingPunishmentEffect = useGameStore(s => s.pendingPunishmentEffect);
  const comboMessage = useGameStore(s => s.comboMessage);

  if (phase === 'lobby' || phase === 'game_over') return null;

  return (
    <div className="hud-container">
      {/* Message bar */}
      <div className="message-bar">
        <span>{message}</span>
      </div>

      {/* Combo message */}
      {comboMessage && (
        <div className="combo-message">
          {comboMessage}
        </div>
      )}

      {/* Player scores */}
      <div className="player-scores">
        {players.map((player, i) => (
          <div
            key={i}
            className={`player-score-card ${currentPlayerIndex === i ? 'active' : ''}`}
            style={{
              borderColor: player.color,
              background: currentPlayerIndex === i ? `${player.color}22` : 'rgba(0,0,0,0.3)',
            }}
          >
            <div className="player-score-header">
              <span className="score-char">{CHARACTER_EMOJI[player.character]}</span>
              <span className="score-name">{player.name}</span>
              {player.hasFinished && (
                <span className="finished-badge">#{player.finishOrder}</span>
              )}
            </div>
            <div className="player-score-stats">
              <span className="stat">🪜 {player.position + 1}</span>
              <span className="stat">🪙 {player.coins}</span>
              <span className="stat">✅ {player.correctAnswers}</span>
              <span className="stat">🔥 {player.combo > 1 ? player.combo : ''}</span>
            </div>
            {player.shield && <span className="shield-badge">🛡️ Shield</span>}
          </div>
        ))}
      </div>

      {/* Resolve tile button */}
      {(phase === 'reward' || phase === 'punishment') && (
        <div className="tile-resolve">
          <button className="resolve-btn" onClick={resolveTile}>
            {phase === 'reward' ? '🎁 Claim Reward' : '💣 Accept Punishment'}
          </button>
        </div>
      )}
    </div>
  );
}
