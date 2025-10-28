const { pool } = require('../config/database');
const { logger } = require('../utils/logger');

class DataMigrator {
  async migratePropertyData() {
    try {
      // Example migration: Add new columns to properties table
      await pool.query(`
        ALTER TABLE properties 
        ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS square_feet INTEGER,
        ADD COLUMN IF NOT EXISTS bedrooms INTEGER,
        ADD COLUMN IF NOT EXISTS bathrooms INTEGER
      `);
      
      logger.info('Property table migration completed');
    } catch (error) {
      logger.error('Property migration failed:', error);
      throw error;
    }
  }

  async migratePaymentData() {
    try {
      // Add payment method details column
      await pool.query(`
        ALTER TABLE payments 
        ADD COLUMN IF NOT EXISTS payment_details JSONB DEFAULT '{}'
      `);
      
      logger.info('Payment table migration completed');
    } catch (error) {
      logger.error('Payment migration failed:', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      // Create additional indexes for performance
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
        CREATE INDEX IF NOT EXISTS idx_properties_created ON properties(created_at);
        CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at);
        CREATE INDEX IF NOT EXISTS idx_agreements_status ON agreements(status);
        CREATE INDEX IF NOT EXISTS idx_agreements_dates ON agreements(start_date, end_date);
      `);
      
      logger.info('Database indexes created');
    } catch (error) {
      logger.error('Index creation failed:', error);
      throw error;
    }
  }

  async runAllMigrations() {
    try {
      logger.info('Starting database migrations...');
      
      await this.migratePropertyData();
      await this.migratePaymentData();
      await this.createIndexes();
      
      logger.info('All migrations completed successfully');
    } catch (error) {
      logger.error('Migration process failed:', error);
      throw error;
    }
  }
}

module.exports = new DataMigrator();

// Run migrations if script is called directly
if (require.main === module) {
  const migrator = new DataMigrator();
  migrator.runAllMigrations().then(() => {
    console.log('Migrations completed successfully');
    process.exit(0);
  }).catch(error => {
    console.error('Migrations failed:', error);
    process.exit(1);
  });
}