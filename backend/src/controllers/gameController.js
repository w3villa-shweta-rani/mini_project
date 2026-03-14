const {
  getUserGameSummary,
  startSession,
  stopSession,
} = require('../services/gameAccessService');

// ─── GET /api/games ─────────────────────────────────────────────────────────
const getGames = async (req, res, next) => {
  try {
    const summary = await getUserGameSummary(req.user);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/games/:gameId ─────────────────────────────────────────────────
const getGameAccess = async (req, res, next) => {
  try {
    const { game } = req.gameAccess;
    const { remainingMinutes } = await startSession(req.user._id, game.id, req.user.planType);

    res.status(200).json({
      success: true,
      data: {
        game,
        remainingMinutes,
        planType: req.user.planType,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/games/:gameId/stop ───────────────────────────────────────────
const stopGameSession = async (req, res, next) => {
  try {
    const session = await stopSession(req.user._id, req.params.gameId);
    res.status(200).json({
      success: true,
      data: {
        minutesUsed: session.totalMinutesUsed,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGames,
  getGameAccess,
  stopGameSession,
};