const { pool } = require('../config/database');
const nodeCron = require('node-cron');

class AnalyticsService {
  constructor() {
    this.cache = new Map();
  }

  startScheduledTasks() {
    nodeCron.schedule('*/10 * * * *', () => {
      this.updateAnalyticsCache();
    });

    nodeCron.schedule('0 * * * *', () => {
      this.updateTrendingProperties();
    });

    nodeCron.schedule('0 0 * * *', () => {
      this.updateDailyStats();
    });
  }

  async updateAnalyticsCache() {
    try {
      const analytics = await this.computeAnalytics();
      
      await pool.query(
        `INSERT INTO analytics_cache (key, data) 
         VALUES ('general_analytics', $1) 
         ON CONFLICT (key) DO UPDATE SET data = $1, updated_at = CURRENT_TIMESTAMP`,
        [JSON.stringify(analytics)]
      );

      this.cache.set('general_analytics', analytics);
      console.log('Analytics cache updated');
    } catch (error) {
      console.error('Error updating analytics cache:', error);
    }
  }

  async computeAnalytics() {
    try {
      const [
        totalProperties,
        activeProperties,
        totalAgreements,
        activeAgreements,
        totalPayments,
        paymentVolume,
        popularLocations,
        monthlyRevenue
      ] = await Promise.all([
        pool.query('SELECT COUNT(*) FROM properties'),
        pool.query('SELECT COUNT(*) FROM properties WHERE status = $1', ['active']),
        pool.query('SELECT COUNT(*) FROM agreements'),
        pool.query('SELECT COUNT(*) FROM agreements WHERE status = $1', ['active']),
        pool.query('SELECT COUNT(*) FROM payments WHERE status = $1', ['completed']),
        pool.query('SELECT SUM(amount) FROM payments WHERE status = $1', ['completed']),
        pool.query(`
          SELECT location, COUNT(*) as property_count 
          FROM properties 
          WHERE status = 'active' 
          GROUP BY location 
          ORDER BY property_count DESC 
          LIMIT 5
        `),
        pool.query(`
          SELECT 
            DATE_TRUNC('month', created_at) as month,
            SUM(amount) as revenue
          FROM payments 
          WHERE status = 'completed'
          GROUP BY month
          ORDER BY month DESC
          LIMIT 6
        `)
      ]);

      return {
        totalProperties: parseInt(totalProperties.rows[0].count),
        activeProperties: parseInt(activeProperties.rows[0].count),
        totalAgreements: parseInt(totalAgreements.rows[0].count),
        activeAgreements: parseInt(activeAgreements.rows[0].count),
        totalPayments: parseInt(totalPayments.rows[0].count),
        totalVolume: parseFloat(paymentVolume.rows[0].sum || 0),
        popularLocations: popularLocations.rows,
        monthlyRevenue: monthlyRevenue.rows,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error computing analytics:', error);
      throw error;
    }
  }

  async updateTrendingProperties() {
    try {
      const trendingProperties = await pool.query(`
        SELECT 
          p.*,
          COUNT(DISTINCT a.id) as agreement_count,
          COUNT(DISTINCT pm.id) as payment_count,
          COALESCE(SUM(pm.amount), 0) as total_revenue
        FROM properties p
        LEFT JOIN agreements a ON p.property_id = a.property_id 
          AND a.created_at >= NOW() - INTERVAL '30 days'
        LEFT JOIN payments pm ON p.property_id = pm.property_id 
          AND pm.created_at >= NOW() - INTERVAL '30 days'
        WHERE p.status = 'active'
        GROUP BY p.id
        ORDER BY (agreement_count * 2 + payment_count) DESC
        LIMIT 10
      `);

      await pool.query(
        `INSERT INTO analytics_cache (key, data) 
         VALUES ('trending_properties', $1) 
         ON CONFLICT (key) DO UPDATE SET data = $1, updated_at = CURRENT_TIMESTAMP`,
        [JSON.stringify(trendingProperties.rows)]
      );

      this.cache.set('trending_properties', trendingProperties.rows);
      console.log('Trending properties updated');
    } catch (error) {
      console.error('Error updating trending properties:', error);
    }
  }

  async updateDailyStats() {
    try {
      const dailyStats = await pool.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as new_properties,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_properties,
          (SELECT COUNT(*) FROM agreements WHERE DATE(created_at) = DATE(p.created_at)) as new_agreements,
          (SELECT SUM(amount) FROM payments WHERE DATE(created_at) = DATE(p.created_at) AND status = 'completed') as daily_revenue
        FROM properties p
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);

      await pool.query(
        `INSERT INTO analytics_cache (key, data) 
         VALUES ('daily_stats', $1) 
         ON CONFLICT (key) DO UPDATE SET data = $1, updated_at = CURRENT_TIMESTAMP`,
        [JSON.stringify(dailyStats.rows)]
      );

      this.cache.set('daily_stats', dailyStats.rows);
      console.log('Daily stats updated');
    } catch (error) {
      console.error('Error updating daily stats:', error);
    }
  }

  async getAnalytics() {
    if (this.cache.has('general_analytics')) {
      return this.cache.get('general_analytics');
    }

    const result = await pool.query(
      'SELECT data FROM analytics_cache WHERE key = $1',
      ['general_analytics']
    );

    if (result.rows.length > 0) {
      const data = result.rows[0].data;
      this.cache.set('general_analytics', data);
      return data;
    }

    return await this.computeAnalytics();
  }

  async getTrendingProperties() {
    if (this.cache.has('trending_properties')) {
      return this.cache.get('trending_properties');
    }

    const result = await pool.query(
      'SELECT data FROM analytics_cache WHERE key = $1',
      ['trending_properties']
    );

    if (result.rows.length > 0) {
      const data = result.rows[0].data;
      this.cache.set('trending_properties', data);
      return data;
    }

    return await this.updateTrendingProperties();
  }

  async getPropertyAnalytics(propertyId) {
    try {
      const [propertyStats, paymentHistory, agreementHistory] = await Promise.all([
        pool.query(`
          SELECT 
            COUNT(DISTINCT a.id) as total_agreements,
            COUNT(DISTINCT p.id) as total_payments,
            COALESCE(SUM(p.amount), 0) as total_revenue,
            AVG(p.amount) as avg_payment
          FROM properties pr
          LEFT JOIN agreements a ON pr.property_id = a.property_id
          LEFT JOIN payments p ON pr.property_id = p.property_id AND p.status = 'completed'
          WHERE pr.property_id = $1
          GROUP BY pr.property_id
        `, [propertyId]),
        pool.query(`
          SELECT amount, currency, created_at, payment_method
          FROM payments
          WHERE property_id = $1 AND status = 'completed'
          ORDER BY created_at DESC
          LIMIT 10
        `, [propertyId]),
        pool.query(`
          SELECT tenant, start_date, end_date, rent_amount, status
          FROM agreements
          WHERE property_id = $1
          ORDER BY created_at DESC
          LIMIT 10
        `, [propertyId])
      ]);

      return {
        propertyStats: propertyStats.rows[0] || {},
        paymentHistory: paymentHistory.rows,
        agreementHistory: agreementHistory.rows
      };
    } catch (error) {
      console.error('Error fetching property analytics:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();