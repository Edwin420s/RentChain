const { pool } = require('../config/database');
const nodeCron = require('node-cron');
const { logger } = require('../utils/logger');

class CleanupJob {
  start() {
    // Run daily at 2 AM
    nodeCron.schedule('0 2 * * *', this.cleanupOldData.bind(this));
    
    // Run weekly on Sunday at 3 AM
    nodeCron.schedule('0 3 * * 0', this.cleanupAnalyticsCache.bind(this));
    
    logger.info('Cleanup jobs scheduled');
  }

  async cleanupOldData() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Clean up old notifications (keep last 30 days)
      const notificationResult = await pool.query(
        'DELETE FROM notifications WHERE created_at < $1 AND read = true',
        [thirtyDaysAgo]
      );

      // Clean up old analytics cache (keep last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const analyticsResult = await pool.query(
        'DELETE FROM analytics_cache WHERE updated_at < $1',
        [sevenDaysAgo]
      );

      logger.info('Cleanup completed', {
        notificationsDeleted: notificationResult.rowCount,
        analyticsDeleted: analyticsResult.rowCount
      });
    } catch (error) {
      logger.error('Cleanup job failed:', error);
    }
  }

  async cleanupAnalyticsCache() {
    try {
      // Keep only the latest cache entries for each key
      await pool.query(`
        DELETE FROM analytics_cache 
        WHERE id NOT IN (
          SELECT DISTINCT ON (key) id 
          FROM analytics_cache 
          ORDER BY key, updated_at DESC
        )
      `);
      
      logger.info('Analytics cache cleanup completed');
    } catch (error) {
      logger.error('Analytics cache cleanup failed:', error);
    }
  }

  async cleanupExpiredAgreements() {
    try {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      
      const result = await pool.query(
        'UPDATE agreements SET status = $1 WHERE end_date < $2 AND status = $3',
        ['expired', currentTimestamp, 'active']
      );
      
      if (result.rowCount > 0) {
        logger.info(`Marked ${result.rowCount} agreements as expired`);
      }
    } catch (error) {
      logger.error('Expired agreements cleanup failed:', error);
    }
  }
}

module.exports = new CleanupJob();