const { GAME_CATALOG, getPlanConfig, getRemainingMinutes, getOrCreateSession } = require('../services/gameAccessService');

const requireGameAccess = async (req, res, next) => {
  try {
    const gameId = req.params.gameId;
    const game = GAME_CATALOG.find((entry) => entry.id === gameId);

    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found.' });
    }

    const planConfig = getPlanConfig(req.user.planType);

    if (!planConfig.allowedGames.includes(gameId)) {
      return res.status(403).json({
        success: false,
        message: 'Upgrade your plan to access this game.',
        locked: true,
      });
    }

    const session = await getOrCreateSession(req.user._id, new Date().toISOString().slice(0, 10));
    const remainingMinutes = getRemainingMinutes(req.user.planType, session);

    if (remainingMinutes <= 0) {
      return res.status(403).json({
        success: false,
        message: 'Daily playtime limit reached. Please come back tomorrow.',
        timeLimitReached: true,
      });
    }

    req.gameAccess = { game, remainingMinutes, planConfig, session };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireGameAccess };