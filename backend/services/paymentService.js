const { pool } = require('../config/database');
const mpesaService = require('./mpesaService');
const notificationService = require('./notificationService');

class PaymentService {
  async initiateMpesaPayment(phoneNumber, amount, propertyId, tenantAddress) {
    try {
      const result = await mpesaService.initiateSTKPush(
        phoneNumber,
        amount,
        `RENT-${propertyId}`,
        `Rent payment for property ${propertyId}`
      );

      if (result.success) {
        await pool.query(
          `INSERT INTO payments (payment_id, tenant, property_id, amount, currency, payment_method, status) 
           VALUES ($1, $2, $3, $4, $5, 'mpesa', 'pending')`,
          [result.checkoutRequestId, tenantAddress, propertyId, amount, 'KES']
        );

        notificationService.notifyUser(tenantAddress, 'Payment Initiated', 
          `MPesa payment of KES ${amount} initiated. Please complete the payment on your phone.`);
      }

      return result;
    } catch (error) {
      console.error('Error initiating MPesa payment:', error);
      throw error;
    }
  }

  async handleMpesaCallback(callbackData) {
    try {
      const result = mpesaService.parseCallbackData(callbackData);
      
      if (result.success) {
        await pool.query(
          `UPDATE payments SET status = 'completed', mpesa_receipt = $1 
           WHERE payment_id = $2 AND status = 'pending'`,
          [result.mpesaReceipt, result.checkoutRequestId]
        );

        const paymentResult = await pool.query(
          'SELECT tenant, property_id, amount FROM payments WHERE payment_id = $1',
          [result.checkoutRequestId]
        );

        if (paymentResult.rows.length > 0) {
          const { tenant, property_id, amount } = paymentResult.rows[0];
          
          const propResult = await pool.query(
            'SELECT landlord, title FROM properties WHERE property_id = $1',
            [property_id]
          );

          if (propResult.rows.length > 0) {
            const { landlord, title } = propResult.rows[0];
            
            notificationService.notifyUser(tenant, 'Payment Successful', 
              `Your MPesa payment of KES ${amount} for ${title} was successful. Receipt: ${result.mpesaReceipt}`);
            
            notificationService.notifyUser(landlord, 'Rent Payment Received', 
              `Tenant paid KES ${amount} via MPesa for ${title}. Receipt: ${result.mpesaReceipt}`);
          }
        }

        return { success: true, receipt: result.mpesaReceipt };
      } else {
        await pool.query(
          `UPDATE payments SET status = 'failed' WHERE payment_id = $1 AND status = 'pending'`,
          [result.checkoutRequestId]
        );

        const paymentResult = await pool.query(
          'SELECT tenant FROM payments WHERE payment_id = $1',
          [result.checkoutRequestId]
        );

        if (paymentResult.rows.length > 0) {
          const { tenant } = paymentResult.rows[0];
          notificationService.notifyUser(tenant, 'Payment Failed', 
            `Your MPesa payment failed. Reason: ${result.error}`);
        }

        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error handling MPesa callback:', error);
      throw error;
    }
  }

  async getPaymentHistory(userAddress, limit = 10, offset = 0) {
    try {
      const paymentsResult = await pool.query(
        `SELECT p.*, pr.title as property_title, pr.location 
         FROM payments p
         LEFT JOIN properties pr ON p.property_id = pr.property_id
         WHERE p.tenant = $1 
         ORDER BY p.created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userAddress, limit, offset]
      );

      const totalResult = await pool.query(
        'SELECT COUNT(*) FROM payments WHERE tenant = $1',
        [userAddress]
      );

      return {
        payments: paymentsResult.rows,
        total: parseInt(totalResult.rows[0].count),
        limit,
        offset
      };
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();