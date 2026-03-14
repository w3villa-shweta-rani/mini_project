const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireGameAccess } = require('../middleware/gameAccessMiddleware');
const { getGames, getGameAccess, stopGameSession } = require('../controllers/gameController');

// @route   GET /api/games
// @desc    Get games allowed for current user
// @access  Private
router.get('/', protect, getGames);

// @route   GET /api/games/:gameId
// @desc    Check access and start session for a game
// @access  Private
router.get('/:gameId', protect, requireGameAccess, getGameAccess);

// @route   POST /api/games/:gameId/stop
// @desc    Stop game session and update playtime
// @access  Private
router.post('/:gameId/stop', protect, stopGameSession);

module.exports = router;