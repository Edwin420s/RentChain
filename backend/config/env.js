require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/rentchain',
  
  WEB3_RPC_URL: process.env.WEB3_RPC_URL || 'https://sepolia.infura.io/v3/your-key',
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
  
  MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE: process.env.MPESA_SHORTCODE,
  
  JWT_SECRET: process.env.JWT_SECRET || 'rentchain-secret',
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET
};