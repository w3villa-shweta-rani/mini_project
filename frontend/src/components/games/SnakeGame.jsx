import { useEffect, useMemo, useRef, useState } from 'react';

const BOARD_SIZE = 10;
const INITIAL_SNAKE = [
  { x: 4, y: 5 },
  { x: 3, y: 5 },
];

const getRandomPosition = (occupied) => {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  } while (occupied.some((cell) => cell.x === pos.x && cell.y === pos.y));
  return pos;
};

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState(() => getRandomPosition(INITIAL_SNAKE));
  const [isRunning, setIsRunning] = useState(true);
  const [score, setScore] = useState(0);
  const directionRef = useRef(direction);

  directionRef.current = direction;

  useEffect(() => {
    const handleKey = (event) => {
      const keyMap = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };
      const next = keyMap[event.key];
      if (!next) return;
      const current = directionRef.current;
      if (current.x + next.x === 0 && current.y + next.y === 0) return;
      setDirection(next);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const nextHead = { x: head.x + directionRef.current.x, y: head.y + directionRef.current.y };

        if (nextHead.x < 0 || nextHead.x >= BOARD_SIZE || nextHead.y < 0 || nextHead.y >= BOARD_SIZE) {
          setIsRunning(false);
          return prev;
        }

        if (prev.some((cell) => cell.x === nextHead.x && cell.y === nextHead.y)) {
          setIsRunning(false);
          return prev;
        }

        const nextSnake = [nextHead, ...prev];
        if (nextHead.x === food.x && nextHead.y === food.y) {
          setScore((s) => s + 1);
          setFood(getRandomPosition(nextSnake));
        } else {
          nextSnake.pop();
        }

        return nextSnake;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [food, isRunning]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection({ x: 1, y: 0 });
    setFood(getRandomPosition(INITIAL_SNAKE));
    setIsRunning(true);
    setScore(0);
  };

  const cells = useMemo(() => {
    const map = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, () => ({
      type: 'empty',
    }));
    snake.forEach((cell) => {
      map[cell.y * BOARD_SIZE + cell.x] = { type: 'snake' };
    });
    map[food.y * BOARD_SIZE + food.x] = { type: 'food' };
    return map;
  }, [snake, food]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-300">
        <span>Score: {score}</span>
        <span>{isRunning ? 'Use arrow keys' : 'Game Over'}</span>
      </div>
      <div className="grid grid-cols-10 gap-1" style={{ width: '260px' }}>
        {cells.map((cell, index) => (
          <div
            key={index}
            className={`h-5 w-5 rounded ${
              cell.type === 'snake'
                ? 'bg-primary'
                : cell.type === 'food'
                  ? 'bg-emerald-400'
                  : 'bg-white/5'
            }`}
          />
        ))}
      </div>
      <button onClick={resetGame} className="btn-primary px-5 py-2 text-sm">
        Restart
      </button>
    </div>
  );
};

export default SnakeGame;