const { pool } = require('../config/database');

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        property_id INTEGER UNIQUE NOT NULL,
        landlord VARCHAR(42) NOT NULL,
        title VARCHAR(255),
        description TEXT,
        location VARCHAR(255),
        price DECIMAL(12,2),
        image_urls TEXT[],
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        payment_id VARCHAR(255) UNIQUE,
        tenant VARCHAR(42) NOT NULL,
        property_id INTEGER NOT NULL,
        amount DECIMAL(12,2),
        currency VARCHAR(10) DEFAULT 'USDT',
        payment_method VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        tx_hash VARCHAR(66),
        mpesa_receipt VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS agreements (
        id SERIAL PRIMARY KEY,
        agreement_id INTEGER UNIQUE NOT NULL,
        tenant VARCHAR(42) NOT NULL,
        landlord VARCHAR(42) NOT NULL,
        property_id INTEGER NOT NULL,
        start_date BIGINT,
        end_date BIGINT,
        rent_amount DECIMAL(12,2),
        status VARCHAR(50),
        signed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(42) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50),
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS analytics_cache (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
      CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
      CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_address);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
    `);
    console.log('Database schema initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    client.release();
  }
};

module.exports = { initDB };