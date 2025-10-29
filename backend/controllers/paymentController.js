const paymentService = require('../services/paymentService');
const { pool } = require('../config/database');

const paymentController = {
  async initiateMpesaPayment(req, res) {
    try {
      const { phoneNumber, amount, propertyId, tenantAddress } = req.body;

      if (!phoneNumber || !amount || !propertyId || !tenantAddress) {
        return res.status(400).json({ 
          success: false,
          error: 'Missing required fields: phoneNumber, amount, propertyId, tenantAddress' 
        });
      }

      const result = await paymentService.initiateMpesaPayment(
        phoneNumber, 
        amount, 
        propertyId, 
        tenantAddress
      );

      if (result.success) {
        res.json({
          success: true,
          checkoutRequestId: result.checkoutRequestId,
          customerMessage: result.customerMessage
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error initiating MPesa payment:', error);
      res.status(500).json({ 
        success: false,
        error: 'Payment initiation failed' 
      });
    }
  },

  async handleMpesaCallback(req, res) {
    try {
      const result = await paymentService.handleMpesaCallback(req.body);
      
      if (result.success) {
        res.status(200).json({ 
          ResultCode: 0, 
          ResultDesc: 'Success' 
        });
      } else {
        res.status(200).json({ 
          ResultCode: 1, 
          ResultDesc: result.error 
        });
      }
    } catch (error) {
      console.error('Error handling MPesa callback:', error);
      res.status(200).json({ 
        ResultCode: 1, 
        ResultDesc: 'Processing failed' 
      });
    }
  },

  async getPaymentHistory(req, res) {
    try {
      const { userAddress } = req.params;
      const { limit = 10, offset = 0 } = req.query;

      if (!userAddress) {
        return res.status(400).json({ 
          success: false,
          error: 'User address is required' 
        });
      }

      const result = await paymentService.getPaymentHistory(
        userAddress, 
        parseInt(limit), 
        parseInt(offset)
      );

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error fetching payment history:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  },

  async getPaymentById(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT p.*, pr.title as property_title, pr.location 
         FROM payments p
         LEFT JOIN properties pr ON p.property_id = pr.property_id
         WHERE p.payment_id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Payment not found' 
        });
      }

      res.json({
        success: true,
        payment: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching payment:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  }
};

module.exports = paymentController;