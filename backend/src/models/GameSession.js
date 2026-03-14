const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dateKey: {
      type: String,
      required: true,
      index: true,
    },
    totalMinutesUsed: {
      type: Number,
      default: 0,
    },
    activeSessionStart: {
      type: Date,
      default: null,
    },
    activeGameId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

gameSessionSchema.index({ user: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model('GameSession', gameSessionSchema);