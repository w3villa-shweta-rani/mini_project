const cron = require('node-cron');
const User = require('../models/User');

/**
 * Plan Expiration Cron Job
 * Runs every minute to check and expire plans
 */
const startPlanExpirationCron = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // Find users whose plan has expired but planType is not Free
      const result = await User.updateMany(
        {
          planType: { $in: ['Silver', 'Gold'] },
          planExpireTime: { $lt: now },
        },
        {
          $set: {
            planType: 'Free',
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(
          `⏰ [CRON] Plan expiration job: ${result.modifiedCount} user(s) downgraded to Free plan at ${now.toISOString()}`
        );
      }
    } catch (error) {
      console.error('❌ [CRON] Plan expiration error:', error.message);
    }
  });

  console.log('✅ Plan expiration cron job started (runs every minute)');
};

module.exports = { startPlanExpirationCron };
