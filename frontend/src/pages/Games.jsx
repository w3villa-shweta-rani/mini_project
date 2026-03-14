import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gameService from '../services/gameService';

const formatMinutes = (minutes) => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remaining = Math.round(minutes % 60);
    return `${hours}h ${remaining}m`;
  }
  return `${Math.round(minutes)}m`;
};

const Games = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGames = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await gameService.getGames();
      if (res.success) {
        setGames(res.data.games);
        setSummary(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load games.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleGameClick = (game) => {
    if (!game.allowed) {
      navigate('/plans');
      return;
    }
    navigate(`/games/${game.id}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-1">Games Library</h1>
          <p className="text-gray-400">Play games based on your plan access.</p>
        </div>
        {summary && (
          <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-gray-300">
            <p className="font-semibold text-white">Daily Playtime</p>
            <p>
              Remaining: <span className="text-primary font-semibold">{formatMinutes(summary.remainingMinutes)}</span>
            </p>
            <p className="text-xs text-gray-500">
              Limit: {formatMinutes(summary.dailyLimitMinutes)} • Used: {formatMinutes(summary.minutesUsed)}
            </p>
          </div>
        )}
      </div>

      {loading && <p className="text-gray-400">Loading games...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => handleGameClick(game)}
              className="relative text-left p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{game.name}</h3>
                {!game.allowed && <span className="text-xl">🔒</span>}
              </div>
              <p className="text-sm text-gray-400 mt-2">{game.description}</p>
              {!game.allowed && (
                <p className="mt-4 text-xs text-yellow-300">Locked – Upgrade Plan</p>
              )}
              {game.allowed && (
                <p className="mt-4 text-xs text-emerald-300">Ready to play</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Games;