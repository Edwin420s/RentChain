require('dotenv').config();
const { pool } = require('../config/database');
const { initDB } = require('../models/database');

async function initializeDatabase() {
  try {
    console.log('Initializing RentChain database...');
    
    await initDB();
    
    console.log('Database initialization completed successfully!');
    
    // Insert sample data for testing
    await insertSampleData();
    
    console.log('Sample data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

async function insertSampleData() {
  try {
    // Insert sample properties
    const sampleProperties = [
      {
        property_id: 1,
        landlord: '0x742E4C3B6B6c5d8f8e8f9f0a1b2c3d4e5f6a7b8c',
        title: 'Modern Apartment in Westlands',
        description: 'Spacious 2-bedroom apartment with modern amenities',
        location: 'Westlands, Nairobi',
        price: 45000.00,
        image_urls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        status: 'active'
      },
      {
        property_id: 2,
        landlord: '0x842E4C3B6B6c5d8f8e8f9f0a1b2c3d4e5f6a7b8c',
        title: 'Cozy Studio in Kilimani',
        description: 'Beautiful studio apartment perfect for students',
        location: 'Kilimani, Nairobi',
        price: 25000.00,
        image_urls: ['https://example.com/image3.jpg'],
        status: 'active'
      }
    ];

    for (const property of sampleProperties) {
      await pool.query(
        `INSERT INTO properties (property_id, landlord, title, description, location, price, image_urls, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (property_id) DO NOTHING`,
        [property.property_id, property.landlord, property.title, property.description, 
         property.location, property.price, property.image_urls, property.status]
      );
    }

    console.log('Sample properties inserted');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };