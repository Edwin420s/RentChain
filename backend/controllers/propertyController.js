const { pool } = require('../config/database');

const propertyController = {
  async getProperties(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        location, 
        minPrice, 
        maxPrice, 
        sortBy = 'created_at',
        status = 'active'
      } = req.query;
      
      const offset = (page - 1) * limit;

      let query = `SELECT * FROM properties WHERE status = $1`;
      let countQuery = `SELECT COUNT(*) FROM properties WHERE status = $1`;
      const params = [status];
      let paramCount = 1;

      if (location) {
        paramCount++;
        query += ` AND location ILIKE $${paramCount}`;
        countQuery += ` AND location ILIKE $${paramCount}`;
        params.push(`%${location}%`);
      }

      if (minPrice) {
        paramCount++;
        query += ` AND price >= $${paramCount}`;
        countQuery += ` AND price >= $${paramCount}`;
        params.push(parseFloat(minPrice));
      }

      if (maxPrice) {
        paramCount++;
        query += ` AND price <= $${paramCount}`;
        countQuery += ` AND price <= $${paramCount}`;
        params.push(parseFloat(maxPrice));
      }

      const validSortFields = ['created_at', 'price', 'updated_at'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
      const sortOrder = sortBy === 'price' ? 'ASC' : 'DESC';
      query += ` ORDER BY ${sortField} ${sortOrder}`;

      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(parseInt(limit));
      
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(parseInt(offset));

      const [propertiesResult, countResult] = await Promise.all([
        pool.query(query, params),
        pool.query(countQuery, params.slice(0, -2))
      ]);

      res.json({
        success: true,
        properties: propertiesResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].count),
          pages: Math.ceil(countResult.rows[0].count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching properties:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  },

  async getPropertyById(req, res) {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        'SELECT * FROM properties WHERE property_id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Property not found' 
        });
      }

      res.json({
        success: true,
        property: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching property:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  },

  async searchProperties(req, res) {
    try {
      const { q, limit = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json({ 
          success: false,
          error: 'Search query required' 
        });
      }

      const result = await pool.query(
        `SELECT * FROM properties 
         WHERE status = 'active' 
         AND (location ILIKE $1 OR title ILIKE $1 OR description ILIKE $1)
         ORDER BY created_at DESC
         LIMIT $2`,
        [`%${q}%`, parseInt(limit)]
      );

      res.json({
        success: true,
        properties: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error searching properties:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  },

  async getPropertiesByLandlord(req, res) {
    try {
      const { landlord } = req.params;
      const { status } = req.query;

      let query = 'SELECT * FROM properties WHERE landlord = $1';
      const params = [landlord];

      if (status) {
        query += ' AND status = $2';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC';

      const result = await pool.query(query, params);

      res.json({
        success: true,
        properties: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error fetching landlord properties:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  }
};

module.exports = propertyController;