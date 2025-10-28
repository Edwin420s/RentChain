const analyticsService = require('../services/analyticsService');

const analyticsController = {
  async getGeneralAnalytics(req, res) {
    try {
      const analytics = await analyticsService.getAnalytics();
      
      res.json({
        success: true,
        analytics
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  },

  async getTrendingProperties(req, res) {
    try {
      const properties = await analyticsService.getTrendingProperties();
      
      res.json({
        success: true,
        properties
      });
    } catch (error) {
      console.error('Error fetching trending properties:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  },

  async getPropertyAnalytics(req, res) {
    try {
      const { propertyId } = req.params;
      
      const analytics = await analyticsService.getPropertyAnalytics(propertyId);
      
      res.json({
        success: true,
        analytics
      });
    } catch (error) {
      console.error('Error fetching property analytics:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  },

  async getLandlordAnalytics(req, res) {
    try {
      const { landlord } = req.params;

      const [properties, payments, agreements] = await Promise.all([
        pool.query(
          'SELECT COUNT(*) as total, COUNT(CASE WHEN status = $1 THEN 1 END) as active FROM properties WHERE landlord = $2',
          ['active', landlord]
        ),
        pool.query(
          `SELECT COUNT(*) as total_payments, COALESCE(SUM(amount), 0) as total_revenue 
           FROM payments p 
           JOIN properties pr ON p.property_id = pr.property_id 
           WHERE pr.landlord = $1 AND p.status = $2`,
          [landlord, 'completed']
        ),
        pool.query(
          `SELECT COUNT(*) as total_agreements, COUNT(CASE WHEN status = $1 THEN 1 END) as active_agreements 
           FROM agreements a 
           JOIN properties pr ON a.property_id = pr.property_id 
           WHERE pr.landlord = $2`,
          ['active', landlord]
        )
      ]);

      res.json({
        success: true,
        analytics: {
          properties: properties.rows[0],
          payments: payments.rows[0],
          agreements: agreements.rows[0]
        }
      });
    } catch (error) {
      console.error('Error fetching landlord analytics:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  }
};

module.exports = analyticsController;