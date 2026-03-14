import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gameService from '../services/gameService';
import TicTacToe from '../components/games/TicTacToe';
import SnakeGame from '../components/games/SnakeGame';
import RockPaperScissors from '../components/games/RockPaperScissors';

const GAME_COMPONENTS = {
  'tic-tac-toe': TicTacToe,
  snake: SnakeGame,
  'rock-paper-scissors': RockPaperScissors,
};

const GamePlay = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameInfo, setGameInfo] = useState(null);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const GameComponent = useMemo(() => GAME_COMPONENTS[gameId], [gameId]);

  useEffect(() => {
    let isMounted = true;
    const loadGame = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await gameService.startGame(gameId);
        if (isMounted && res.success) {
          setGameInfo(res.data.game);
          setRemainingMinutes(res.data.remainingMinutes);
        }
      } catch (err) {
        const message = err.response?.data?.message || 'Unable to access this game.';
        setError(message);
        if (err.response?.data?.locked || err.response?.data?.timeLimitReached) {
          navigate('/plans');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadGame();

    return () => {
      isMounted = false;
      gameService.stopGame(gameId).catch(() => null);
    };
  }, [gameId, navigate]);

  useEffect(() => {
    if (!remainingMinutes) return;
    const interval = setInterval(() => {
      setRemainingMinutes((prev) => Math.max(0, prev - 1 / 60));
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingMinutes]);

  const remainingLabel = remainingMinutes >= 60
    ? `${Math.floor(remainingMinutes / 60)}h ${Math.round(remainingMinutes % 60)}m`
    : `${Math.round(remainingMinutes)}m`;

  if (!GameComponent) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-red-400">Game not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-1">{gameInfo?.name || 'Game'}</h1>
          <p className="text-gray-400">{gameInfo?.description}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-gray-300">
          <p className="font-semibold text-white">Remaining time today</p>
          <p className="text-primary font-semibold">{remainingLabel}</p>
        </div>
      </div>

      {loading && <p className="text-gray-400">Preparing your game...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && !error && <GameComponent />}

      {remainingMinutes <= 0 && (
        <div className="mt-6 text-yellow-300 text-sm">
          Daily playtime limit reached. Visit Plans to upgrade.
        </div>
      )}
    </div>
  );
};

export default GamePlay;