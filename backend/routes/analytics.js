const express = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

router.get('/', analyticsController.getGeneralAnalytics);
router.get('/trending-properties', analyticsController.getTrendingProperties);
router.get('/property/:propertyId', analyticsController.getPropertyAnalytics);
router.get('/landlord/:landlord', analyticsController.getLandlordAnalytics);

module.exports = router;