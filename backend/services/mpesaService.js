const axios = require('axios');
const config = require('../config/env');

class MpesaService {
  constructor() {
    this.authToken = null;
    this.tokenExpiry = null;
  }

  async getAuthToken() {
    if (this.authToken && Date.now() < this.tokenExpiry) {
      return this.authToken;
    }

    try {
      const auth = Buffer.from(`${config.MPESA_CONSUMER_KEY}:${config.MPESA_CONSUMER_SECRET}`).toString('base64');
      
      const response = await axios.get(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );

      this.authToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      return this.authToken;
    } catch (error) {
      console.error('MPesa auth failed:', error.response?.data || error.message);
      throw new Error('MPesa authentication failed');
    }
  }

  async initiateSTKPush(phoneNumber, amount, accountReference, description) {
    try {
      const token = await this.getAuthToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const requestData = {
        BusinessShortCode: config.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: config.MPESA_SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: `${process.env.BASE_URL}/api/payments/mpesa-callback`,
        AccountReference: accountReference,
        TransactionDesc: description
      };

      const response = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        checkoutRequestId: response.data.CheckoutRequestID,
        responseCode: response.data.ResponseCode,
        customerMessage: response.data.CustomerMessage
      };
    } catch (error) {
      console.error('STK Push initiation failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errorMessage || 'Payment initiation failed'
      };
    }
  }

  generateTimestamp() {
    return new Date().toISOString().replace(/[-:.]/g, '').slice(0, -4);
  }

  generatePassword(timestamp) {
    const passkey = process.env.MPESA_PASSKEY;
    return Buffer.from(`${config.MPESA_SHORTCODE}${passkey}${timestamp}`).toString('base64');
  }

  parseCallbackData(callbackData) {
    try {
      const result = callbackData.Body.stkCallback;
      const isSuccess = result.ResultCode === 0;

      if (!isSuccess) {
        return {
          success: false,
          error: result.ResultDesc,
          checkoutRequestId: result.CheckoutRequestID
        };
      }

      const metadata = result.CallbackMetadata.Item;
      const amount = metadata.find(item => item.Name === 'Amount').Value;
      const mpesaReceipt = metadata.find(item => item.Name === 'MpesaReceiptNumber').Value;
      const phoneNumber = metadata.find(item => item.Name === 'PhoneNumber').Value;
      const transactionDate = metadata.find(item => item.Name === 'TransactionDate').Value;

      return {
        success: true,
        amount,
        mpesaReceipt,
        phoneNumber,
        transactionDate,
        checkoutRequestId: result.CheckoutRequestID
      };
    } catch (error) {
      console.error('Error parsing MPesa callback:', error);
      throw new Error('Invalid callback data format');
    }
  }
}

module.exports = new MpesaService();