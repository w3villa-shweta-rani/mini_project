import { useState } from 'react';

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const winner = winningLines
    .map((line) => {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
      return null;
    })
    .find(Boolean);

  const status = winner
    ? `Winner: ${winner}`
    : board.every(Boolean)
      ? 'Draw!'
      : `Next player: ${xIsNext ? 'X' : 'O'}`;

  const handleClick = (index) => {
    if (board[index] || winner) return;
    const nextBoard = [...board];
    nextBoard[index] = xIsNext ? 'X' : 'O';
    setBoard(nextBoard);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };


  return (
    <div className="space-y-4">
      <p className={`text-sm ${winner ? 'text-white font-bold' : 'text-gray-300'}`}>
        {status}
      </p>
      <div className="grid grid-cols-3 gap-3 w-64">
        {board.map((value, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className="h-16 w-16 rounded-xl border border-white/10 text-2xl font-bold text-white bg-white/5 hover:bg-white/10"
          >
            {value}
          </button>
        ))}
      </div>
      {(winner || board.every(Boolean)) && (
        <button onClick={resetGame} className="btn-primary px-5 py-2 text-sm">
          New Game
        </button>
      )}
    </div>
  );
};

export default TicTacToe;