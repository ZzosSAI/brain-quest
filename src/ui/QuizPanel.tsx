import React from 'react';
import { useGameStore } from '../game/GameEngine';

export default function QuizPanel() {
  const quizQuestion = useGameStore(s => s.quizQuestion);
  const quizActive = useGameStore(s => s.quizActive);
  const answerQuestion = useGameStore(s => s.answerQuestion);
  const requestHint = useGameStore(s => s.requestHint);
  const showHint = useGameStore(s => s.showHint);
  const currentHint = useGameStore(s => s.currentHint);

  if (!quizActive || !quizQuestion) return null;

  const subjectEmojis: Record<string, string> = {
    mathematics: '🧮', science: '🔬', english: '📖', geography: '🌍',
    general_knowledge: '🧠', animals: '🐾', space: '🚀', coding: '💻',
    history: '🏛️', environment: '🌿', art: '🎨', music: '🎵', sports: '⚽', logic: '🧩',
  };

  return (
    <div className="quiz-overlay">
      <div className="quiz-card">
        <div className="quiz-header">
          <span className="quiz-subject">
            {subjectEmojis[quizQuestion.subject] || '❓'} {quizQuestion.subject.replace('_', ' ')}
          </span>
          <span className="quiz-difficulty">
            {'⭐'.repeat(Math.max(1, quizQuestion.difficulty))}
          </span>
        </div>

        <h2 className="quiz-question">{quizQuestion.question}</h2>

        <div className="quiz-choices">
          {quizQuestion.choices.map((choice, i) => (
            <button
              key={i}
              className="quiz-choice-btn"
              onClick={() => answerQuestion(i)}
            >
              <span className="choice-letter">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="choice-text">{choice}</span>
            </button>
          ))}
        </div>

        <div className="quiz-footer">
          <button className="hint-btn" onClick={requestHint}>
            💡 Hint (-3 coins)
          </button>
        </div>

        {showHint && (
          <div className="hint-box">
            <span className="hint-icon">💡</span>
            <span>{currentHint}</span>
          </div>
        )}
      </div>
    </div>
  );
}
