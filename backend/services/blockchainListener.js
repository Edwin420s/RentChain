const { Web3 } = require('web3');
const config = require('../config/env');
const { pool } = require('../config/database');
const notificationService = require('./notificationService');

class BlockchainListener {
  constructor() {
    this.web3 = new Web3(config.WEB3_RPC_URL);
    this.contract = null;
    this.isListening = false;
    this.initContract();
  }

  async initContract() {
    try {
      const contractABI = require('../config/contract-abi.json');
      this.contract = new this.web3.eth.Contract(
        contractABI,
        config.CONTRACT_ADDRESS
      );
      console.log('Smart contract initialized');
    } catch (error) {
      console.error('Failed to initialize contract:', error);
    }
  }

  async start() {
    if (this.isListening || !this.contract) return;

    console.log('Starting blockchain event listener...');
    
    this.contract.events.PropertyListed({
      fromBlock: 'latest'
    })
    .on('data', this.handlePropertyListed.bind(this))
    .on('error', console.error);

    this.contract.events.AgreementSigned({
      fromBlock: 'latest'
    })
    .on('data', this.handleAgreementSigned.bind(this))
    .on('error', console.error);

    this.contract.events.PaymentReceived({
      fromBlock: 'latest'
    })
    .on('data', this.handlePaymentReceived.bind(this))
    .on('error', console.error);

    this.contract.events.DepositReleased({
      fromBlock: 'latest'
    })
    .on('data', this.handleDepositReleased.bind(this))
    .on('error', console.error);

    this.isListening = true;
  }

  async handlePropertyListed(event) {
    const { propertyId, landlord, title, location, price, images } = event.returnValues;
    
    try {
      await pool.query(
        `INSERT INTO properties (property_id, landlord, title, location, price, image_urls) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (property_id) DO UPDATE SET 
         title = $3, location = $4, price = $5, image_urls = $6, updated_at = CURRENT_TIMESTAMP`,
        [propertyId, landlord, title, location, price, images]
      );

      notificationService.broadcast('newProperty', {
        propertyId, landlord, title, location, price, images
      });

      console.log(`Property ${propertyId} listed by ${landlord}`);
    } catch (error) {
      console.error('Error handling PropertyListed:', error);
    }
  }

  async handleAgreementSigned(event) {
    const { agreementId, tenant, landlord, propertyId, startDate, endDate, rentAmount } = event.returnValues;
    
    try {
      await pool.query(
        `INSERT INTO agreements (agreement_id, tenant, landlord, property_id, start_date, end_date, rent_amount, status, signed_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', CURRENT_TIMESTAMP)`,
        [agreementId, tenant, landlord, propertyId, startDate, endDate, rentAmount]
      );

      notificationService.notifyUser(landlord, 'Agreement Signed', 
        `Tenant ${tenant.substring(0, 8)}... signed agreement for property ${propertyId}`);

      notificationService.notifyUser(tenant, 'Agreement Confirmed', 
        `Your rental agreement for property ${propertyId} has been signed`);

      console.log(`Agreement ${agreementId} signed between ${tenant} and ${landlord}`);
    } catch (error) {
      console.error('Error handling AgreementSigned:', error);
    }
  }

  async handlePaymentReceived(event) {
    const { tenant, propertyId, amount, currency, paymentId } = event.returnValues;
    
    try {
      await pool.query(
        `INSERT INTO payments (payment_id, tenant, property_id, amount, currency, status) 
         VALUES ($1, $2, $3, $4, $5, 'completed')`,
        [paymentId, tenant, propertyId, amount, currency]
      );

      const propResult = await pool.query(
        'SELECT landlord, title FROM properties WHERE property_id = $1',
        [propertyId]
      );

      if (propResult.rows.length > 0) {
        const { landlord, title } = propResult.rows[0];
        
        notificationService.notifyUser(tenant, 'Payment Confirmed', 
          `Your payment of ${amount} ${currency} for ${title} was received`);
        
        notificationService.notifyUser(landlord, 'Rent Payment Received', 
          `Tenant ${tenant.substring(0, 8)}... paid ${amount} ${currency} for ${title}`);
      }

      console.log(`Payment ${paymentId} received from ${tenant}`);
    } catch (error) {
      console.error('Error handling PaymentReceived:', error);
    }
  }

  async handleDepositReleased(event) {
    const { tenant, landlord, propertyId, amount, reason } = event.returnValues;
    
    try {
      const propResult = await pool.query(
        'SELECT title FROM properties WHERE property_id = $1',
        [propertyId]
      );

      const propertyTitle = propResult.rows[0]?.title || `Property ${propertyId}`;

      notificationService.notifyUser(tenant, 'Deposit Released', 
        `Your deposit of ${amount} USDT for ${propertyTitle} has been released. Reason: ${reason}`);
      
      notificationService.notifyUser(landlord, 'Deposit Released', 
        `Deposit of ${amount} USDT for ${propertyTitle} has been released to tenant. Reason: ${reason}`);

      console.log(`Deposit ${amount} released for property ${propertyId}`);
    } catch (error) {
      console.error('Error handling DepositReleased:', error);
    }
  }
}

module.exports = new BlockchainListener();