import { useState } from 'react';

const OPTIONS = [
  { id: 'rock', label: '🪨 Rock' },
  { id: 'paper', label: '📄 Paper' },
  { id: 'scissors', label: '✂️ Scissors' },
];

const getOutcome = (player, computer) => {
  if (player === computer) return 'Draw';
  if (
    (player === 'rock' && computer === 'scissors') ||
    (player === 'paper' && computer === 'rock') ||
    (player === 'scissors' && computer === 'paper')
  ) {
    return 'Win';
  }
  return 'Lose';
};

const RockPaperScissors = () => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState('');
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });

  const playRound = (choice) => {
    const computer = OPTIONS[Math.floor(Math.random() * OPTIONS.length)].id;
    const outcome = getOutcome(choice, computer);
    setPlayerChoice(choice);
    setComputerChoice(computer);
    setResult(outcome);

    setScore((prev) => ({
      wins: prev.wins + (outcome === 'Win' ? 1 : 0),
      losses: prev.losses + (outcome === 'Lose' ? 1 : 0),
      draws: prev.draws + (outcome === 'Draw' ? 1 : 0),
    }));
  };

  const resetScore = () => {
    setScore({ wins: 0, losses: 0, draws: 0 });
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult('');
  };

  const playerLabel = OPTIONS.find((item) => item.id === playerChoice)?.label || '—';
  const computerLabel = OPTIONS.find((item) => item.id === computerChoice)?.label || '—';

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => playRound(option.id)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase text-gray-500">Your choice</p>
            <p className="text-white font-semibold">{playerLabel}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500">Computer choice</p>
            <p className="text-white font-semibold">{computerLabel}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500">Result</p>
            <p className={`font-semibold ${
              result === 'Win' ? 'text-emerald-300' : result === 'Lose' ? 'text-red-300' : 'text-yellow-300'
            }`}>
              {result || '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
        <span className="text-emerald-300">Wins: {score.wins}</span>
        <span className="text-red-300">Losses: {score.losses}</span>
        <span className="text-yellow-300">Draws: {score.draws}</span>
      </div>

      <button onClick={resetScore} className="btn-primary px-5 py-2 text-sm">
        Reset Score
      </button>
    </div>
  );
};

export default RockPaperScissors;