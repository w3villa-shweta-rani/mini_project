const GameSession = require('../models/GameSession');

const PLAN_CONFIG = {
  Free: {
    allowedGames: ['tic-tac-toe'],
    dailyLimitMinutes: 30,
  },
  Silver: {
    allowedGames: ['tic-tac-toe', 'snake'],
    dailyLimitMinutes: 6 * 60,
  },
  Gold: {
    allowedGames: ['tic-tac-toe', 'snake', 'rock-paper-scissors'],
    dailyLimitMinutes: 12 * 60,
  },
};

const GAME_CATALOG = [
  {
    id: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    description: 'Classic 3x3 strategy game.',
  },
  {
    id: 'snake',
    name: 'Snake Game',
    description: 'Eat, grow, and avoid the walls.',
  },
  {
    id: 'rock-paper-scissors',
    name: 'Rock Paper Scissors',
    description: 'Challenge the computer and keep score.',
  },
];

const getDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

const getPlanConfig = (planType) => PLAN_CONFIG[planType] || PLAN_CONFIG.Free;

const getOrCreateSession = async (userId, dateKey) => {
  let session = await GameSession.findOne({ user: userId, dateKey });
  if (!session) {
    session = await GameSession.create({ user: userId, dateKey });
  }
  return session;
};

const calculateEffectiveMinutes = (session, now = new Date()) => {
  const activeMinutes = session.activeSessionStart
    ? Math.max(0, (now - session.activeSessionStart) / 1000 / 60)
    : 0;
  return Math.max(0, session.totalMinutesUsed + activeMinutes);
};

const getRemainingMinutes = (planType, session, now = new Date()) => {
  const { dailyLimitMinutes } = getPlanConfig(planType);
  const usedMinutes = calculateEffectiveMinutes(session, now);
  return Math.max(0, dailyLimitMinutes - usedMinutes);
};

const startSession = async (userId, gameId, planType) => {
  const dateKey = getDateKey();
  const session = await getOrCreateSession(userId, dateKey);
  const now = new Date();

  if (session.activeSessionStart) {
    if (session.activeGameId !== gameId) {
      const elapsedMinutes = Math.max(0, (now - session.activeSessionStart) / 1000 / 60);
      session.totalMinutesUsed += elapsedMinutes;
      session.activeSessionStart = now;
      session.activeGameId = gameId;
    }
  } else {
    session.activeSessionStart = now;
    session.activeGameId = gameId;
  }

  await session.save();

  const remainingMinutes = getRemainingMinutes(planType, session, now);
  return { session, remainingMinutes };
};

const stopSession = async (userId, gameId) => {
  const dateKey = getDateKey();
  const session = await getOrCreateSession(userId, dateKey);

  if (session.activeSessionStart && session.activeGameId === gameId) {
    const now = new Date();
    const elapsedMinutes = Math.max(0, (now - session.activeSessionStart) / 1000 / 60);
    session.totalMinutesUsed += elapsedMinutes;
    session.activeSessionStart = null;
    session.activeGameId = null;
    await session.save();
  }

  return session;
};

const getUserGameSummary = async (user) => {
  const dateKey = getDateKey();
  const session = await getOrCreateSession(user._id, dateKey);
  const config = getPlanConfig(user.planType);
  const remainingMinutes = getRemainingMinutes(user.planType, session);

  const games = GAME_CATALOG.map((game) => {
    const allowed = config.allowedGames.includes(game.id);
    return {
      ...game,
      allowed,
      lockedReason: allowed ? null : 'Upgrade your plan to access this game.',
    };
  });

  return {
    games,
    planType: user.planType,
    dailyLimitMinutes: config.dailyLimitMinutes,
    minutesUsed: calculateEffectiveMinutes(session),
    remainingMinutes,
    activeGameId: session.activeGameId,
  };
};

module.exports = {
  PLAN_CONFIG,
  GAME_CATALOG,
  getPlanConfig,
  getOrCreateSession,
  calculateEffectiveMinutes,
  getRemainingMinutes,
  startSession,
  stopSession,
  getUserGameSummary,
};