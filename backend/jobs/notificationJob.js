const { pool } = require('../config/database');
const nodeCron = require('node-cron');
const { logger } = require('../utils/logger');
const notificationService = require('../services/notificationService');

class NotificationJob {
  start() {
    // Check for upcoming rent payments daily at 9 AM
    nodeCron.schedule('0 9 * * *', this.checkRentReminders.bind(this));
    
    // Check for expiring agreements daily at 10 AM
    nodeCron.schedule('0 10 * * *', this.checkExpiringAgreements.bind(this));
    
    logger.info('Notification jobs scheduled');
  }

  async checkRentReminders() {
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      // Find agreements with rent due in 3 days
      const result = await pool.query(`
        SELECT a.tenant, a.landlord, a.rent_amount, p.title, p.location
        FROM agreements a
        JOIN properties p ON a.property_id = p.property_id
        WHERE a.status = 'active'
        AND EXTRACT(DAY FROM NOW()) + 3 = EXTRACT(DAY FROM (NOW() + INTERVAL '1 month'))
      `);

      for (const agreement of result.rows) {
        notificationService.notifyUser(
          agreement.tenant,
          'Rent Payment Reminder',
          `Your rent of ${agreement.rent_amount} USDT for ${agreement.title} is due in 3 days.`,
          'warning'
        );

        notificationService.notifyUser(
          agreement.landlord,
          'Upcoming Rent Payment',
          `Tenant's rent payment of ${agreement.rent_amount} USDT for ${agreement.title} is due in 3 days.`,
          'info'
        );
      }

      logger.info(`Sent ${result.rows.length} rent reminder notifications`);
    } catch (error) {
      logger.error('Rent reminder job failed:', error);
    }
  }

  async checkExpiringAgreements() {
    try {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      const sevenDaysTimestamp = Math.floor(sevenDaysFromNow.getTime() / 1000);

      // Find agreements expiring in 7 days
      const result = await pool.query(`
        SELECT a.tenant, a.landlord, a.end_date, p.title, p.location
        FROM agreements a
        JOIN properties p ON a.property_id = p.property_id
        WHERE a.status = 'active'
        AND a.end_date <= $1
        AND a.end_date > EXTRACT(EPOCH FROM NOW())
      `, [sevenDaysTimestamp]);

      for (const agreement of result.rows) {
        const daysLeft = Math.ceil((agreement.end_date * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
        
        notificationService.notifyUser(
          agreement.tenant,
          'Agreement Expiring Soon',
          `Your rental agreement for ${agreement.title} expires in ${daysLeft} days.`,
          'warning'
        );

        notificationService.notifyUser(
          agreement.landlord,
          'Agreement Expiring Soon',
          `Rental agreement for ${agreement.title} expires in ${daysLeft} days.`,
          'warning'
        );
      }

      logger.info(`Sent ${result.rows.length} agreement expiration notifications`);
    } catch (error) {
      logger.error('Expiring agreements job failed:', error);
    }
  }

  async sendWeeklyStats() {
    try {
      // Send weekly statistics to landlords on Monday at 8 AM
      const result = await pool.query(`
        SELECT 
          p.landlord,
          COUNT(DISTINCT p.property_id) as total_properties,
          COUNT(DISTINCT a.id) as active_agreements,
          COALESCE(SUM(pm.amount), 0) as weekly_revenue
        FROM properties p
        LEFT JOIN agreements a ON p.property_id = a.property_id AND a.status = 'active'
        LEFT JOIN payments pm ON p.property_id = pm.property_id 
          AND pm.status = 'completed' 
          AND pm.created_at >= NOW() - INTERVAL '7 days'
        GROUP BY p.landlord
      `);

      for (const stats of result.rows) {
        notificationService.notifyUser(
          stats.landlord,
          'Weekly Property Stats',
          `You have ${stats.total_properties} properties, ${stats.active_agreements} active agreements, and earned ${stats.weekly_revenue} USDT this week.`,
          'info'
        );
      }

      logger.info(`Sent ${result.rows.length} weekly stats notifications`);
    } catch (error) {
      logger.error('Weekly stats job failed:', error);
    }
  }
}

module.exports = new NotificationJob();