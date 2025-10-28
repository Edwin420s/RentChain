const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/mpesa/initiate', paymentController.initiateMpesaPayment);
router.post('/mpesa-callback', paymentController.handleMpesaCallback);
router.get('/history/:userAddress', paymentController.getPaymentHistory);
router.get('/:id', paymentController.getPaymentById);

module.exports = router;