const request = require('supertest');
const app = require('../server');
const { pool } = require('../config/database');

describe('Properties API', () => {
  beforeAll(async () => {
    // Setup: create a test property
    await pool.query(`
      INSERT INTO properties (property_id, landlord, title, location, price, status)
      VALUES (999, '0xTestLandlord', 'Test Property', 'Test Location', 100000, 'active')
      ON CONFLICT (property_id) DO NOTHING
    `);
  });

  afterAll(async () => {
    // Teardown: remove test data
    await pool.query('DELETE FROM properties WHERE property_id = 999');
    await pool.end();
  });

  describe('GET /api/properties', () => {
    it('should return a list of properties', async () => {
      const res = await request(app)
        .get('/api/properties')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('properties');
      expect(Array.isArray(res.body.properties)).toBe(true);
    });
  });

  describe('GET /api/properties/:id', () => {
    it('should return a property by id', async () => {
      const res = await request(app)
        .get('/api/properties/999')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('property');
      expect(res.body.property).toHaveProperty('property_id', 999);
    });

    it('should return 404 for non-existent property', async () => {
      const res = await request(app)
        .get('/api/properties/000')
        .expect(404);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('error');
    });
  });
});