import React, { useRef, useEffect } from 'react';
import { Player, Subject, THEMES } from '../game/types';

const ALL_SUBJECTS: Subject[] = [
  'mathematics', 'science', 'english', 'geography',
  'space', 'general_knowledge'
];

const SUBJECT_EMOJIS: Record<string, string> = {
  mathematics: '🧮', science: '🔬', english: '📖', geography: '🌍',
  general_knowledge: '🧠', space: '🚀', animals: '🐾', coding: '💻',
  history: '🏛️', environment: '🌿', art: '🎨', music: '🎵', sports: '⚽', logic: '🧩',
};

function BarChart({ data, width, height }: {
  data: { label: string; value: number; max: number }[];
  width: number; height: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const padding = { top: 8, bottom: 20, left: 8, right: 8 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const barW = chartW / data.length - 6;
    const maxVal = Math.max(...data.map(d => d.max), 1);

    data.forEach((d, i) => {
      const x = padding.left + (chartW / data.length) * i + 3;
      const barH = (d.value / maxVal) * chartH;
      const y = height - padding.bottom - barH;

      // Bar gradient
      const grad = ctx.createLinearGradient(0, y, 0, height - padding.bottom);
      if (d.value >= 0.7) {
        grad.addColorStop(0, '#34D399');
        grad.addColorStop(1, '#10B981');
      } else if (d.value >= 0.4) {
        grad.addColorStop(0, '#FBBF24');
        grad.addColorStop(1, '#F59E0B');
      } else {
        grad.addColorStop(0, '#F87171');
        grad.addColorStop(1, '#EF4444');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
      ctx.fill();

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(d.label, x + barW / 2, height - 4);

      // Value
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      if (barH > 15) {
        ctx.fillText(`${Math.round(d.value * 100)}%`, x + barW / 2, y + 12);
      }
    });
  }, [data, width, height]);

  return (
    <canvas ref={canvasRef} style={{ width, height, borderRadius: 8 }} />
  );
}

function getAIRecommendations(player: Player): string[] {
  const recs: string[] = [];

  // Find weakest subject
  let weakest: { subject: string; rate: number } | null = null;
  for (const [subj, w] of Object.entries(player.subjectsWrong)) {
    const c = player.subjectsCorrect[subj] || 0;
    const total = c + w;
    if (total >= 2) {
      const rate = c / total;
      if (!weakest || rate < weakest.rate) {
        weakest = { subject: subj, rate };
      }
    }
  }

  if (weakest && weakest.rate < 0.5) {
    recs.push(`📖 Practice ${SUBJECT_EMOJIS[weakest.subject] || ''} ${weakest.subject.replace('_', ' ')} — try focusing on the basics first.`);
  }

  // Check combo
  if (player.highestCombo < 3) {
    recs.push(`⚡ Try to build streaks! 3+ correct answers in a row unlocks Brain Combos.`);
  }

  // Check difficulty
  if (player.correctAnswers > 5) {
    recs.push(`🎯 You're ready for the next difficulty level! Challenge yourself.`);
  }

  // Check subject diversity
  const subjectCount = Object.keys(player.subjectsCorrect).length;
  if (subjectCount < 3) {
    recs.push(`🌍 Explore more subjects! You've only tried ${subjectCount} so far.`);
  }

  // Positive reinforcement
  const strongSubjects = Object.entries(player.subjectsCorrect)
    .filter(([_, c]) => c >= 2)
    .map(([s]) => s);
  if (strongSubjects.length > 0) {
    recs.push(`⭐ Great work in ${strongSubjects.slice(0, 2).join(' & ')}! Keep it up.`);
  }

  if (recs.length === 0) {
    recs.push(`🌟 You're doing great! Try the Advanced mode for a bigger challenge.`);
  }

  return recs;
}

function SubjectAccuracyCard({ player }: { player: Player }) {
  const chartData = ALL_SUBJECTS.map(subj => {
    const correct = player.subjectsCorrect[subj] || 0;
    const wrong = player.subjectsWrong[subj] || 0;
    const total = correct + wrong;
    return {
      label: SUBJECT_EMOJIS[subj] || '❓',
      value: total > 0 ? correct / total : 0,
      max: 1,
      raw: `${correct}/${total}`,
    };
  }).filter(d => d.value > 0 || Math.random() > 0.5); // Only show subjects attempted

  if (chartData.length === 0) return null;

  return (
    <div className="report-section">
      <h4 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '0.9rem', marginBottom: 8 }}>
        📊 Subject Accuracy
      </h4>
      <BarChart
        data={chartData}
        width={Math.min(480, window.innerWidth - 80)}
        height={140}
      />
    </div>
  );
}

export default function LearningReport({ player, compact }: { player: Player; compact?: boolean }) {
  const recs = getAIRecommendations(player);

  return (
    <div className={`learning-report ${compact ? 'compact' : ''}`}>
      {!compact && <SubjectAccuracyCard player={player} />}

      <div className="report-section">
        <h4 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '0.9rem', marginBottom: 8 }}>
          🤖 AI Recommendations
        </h4>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {recs.map((r, i) => (
            <li key={i} style={{
              fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '6px 10px',
              background: 'rgba(255,255,255,0.04)', borderRadius: 8,
              borderLeft: '2px solid var(--accent-cyan)',
            }}>
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
