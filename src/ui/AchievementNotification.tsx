import React, { useEffect, useState } from 'react';
import { useGameStore } from '../game/GameEngine';
import { Achievement, ACHIEVEMENTS, formatAchievementTime } from '../game/Achievements';

export default function AchievementNotification() {
  const newAchievements = useGameStore(s => s.newAchievements);
  const dismissAchievement = useGameStore(s => s.dismissAchievement);
  const [visible, setVisible] = useState<Achievement | null>(null);

  useEffect(() => {
    if (newAchievements.length > 0 && !visible) {
      const [first, ...rest] = newAchievements;
      setVisible(first);

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        dismissAchievement(first.id);
        setVisible(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [newAchievements, visible]);

  if (!visible) return null;

  return (
    <div className="achievement-popup">
      <div className="ach-popup-inner">
        <div className="ach-popup-icon">{visible.icon}</div>
        <div className="ach-popup-content">
          <span className="ach-popup-label">🏅 Achievement Unlocked!</span>
          <strong className="ach-popup-name">{visible.name}</strong>
          <span className="ach-popup-desc">{visible.description}</span>
        </div>
        <button className="ach-popup-close" onClick={() => { dismissAchievement(visible.id); setVisible(null); }}>
          ✕
        </button>
      </div>
    </div>
  );
}

export function AchievementBadge({ achievementId, size = 'small' }: {
  achievementId: string;
  size?: 'small' | 'large';
}) {
  const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!ach) return null;

  return (
    <div className={`ach-badge ach-badge-${size}`} title={ach.description}>
      <span className="ach-badge-icon">{ach.icon}</span>
      {size === 'large' && (
        <div className="ach-badge-text">
          <strong>{ach.name}</strong>
          <small>{ach.description}</small>
        </div>
      )}
    </div>
  );
}

export function AchievementGallery({ unlockedIds }: { unlockedIds: Record<string, number> }) {
  return (
    <div className="ach-gallery">
      {ACHIEVEMENTS.map(ach => {
        const unlocked = ach.id in unlockedIds;
        return (
          <div key={ach.id} className={`ach-gallery-item ${unlocked ? 'unlocked' : 'locked'}`}>
            <span className="ach-gallery-icon">{unlocked ? ach.icon : '🔒'}</span>
            <span className="ach-gallery-name">{ach.name}</span>
            {unlocked && (
              <span className="ach-gallery-date">{formatAchievementTime(unlockedIds[ach.id])}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
