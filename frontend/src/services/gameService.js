import api from './api';

const gameService = {
  getGames: async () => {
    const res = await api.get('/games');
    return res.data;
  },
  startGame: async (gameId) => {
    const res = await api.get(`/games/${gameId}`);
    return res.data;
  },
  stopGame: async (gameId) => {
    const res = await api.post(`/games/${gameId}/stop`);
    return res.data;
  },
};

export default gameService;