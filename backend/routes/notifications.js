const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get('/:userAddress', notificationController.getUserNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.get('/:userAddress/unread-count', notificationController.getUnreadCount);

module.exports = router;