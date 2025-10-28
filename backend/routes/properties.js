const express = require('express');
const propertyController = require('../controllers/propertyController');

const router = express.Router();

router.get('/', propertyController.getProperties);
router.get('/search', propertyController.searchProperties);
router.get('/landlord/:landlord', propertyController.getPropertiesByLandlord);
router.get('/:id', propertyController.getPropertyById);

module.exports = router;