const notificationService = require('../services/notificationService');
const { pool } = require('../config/database');

const notificationController = {
  async getUserNotifications(req, res) {
    try {
      const { userAddress } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      if (!userAddress) {
        return res.status(400).json({ 
          success: false,
          error: 'User address is required' 
        });
      }

      const result = await notificationService.getUserNotifications(
        userAddress, 
        parseInt(limit), 
        parseInt(offset)
      );

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  },

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const { userAddress } = req.body;

      if (!userAddress) {
        return res.status(400).json({ 
          success: false,
          error: 'User address is required' 
        });
      }

      await notificationService.markAsRead(id, userAddress);
      
      res.json({ 
        success: true,
        message: 'Notification marked as read' 
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  },

  async markAllAsRead(req, res) {
    try {
      const { userAddress } = req.body;

      if (!userAddress) {
        return res.status(400).json({ 
          success: false,
          error: 'User address is required' 
        });
      }

      await notificationService.markAllAsRead(userAddress);
      
      res.json({ 
        success: true,
        message: 'All notifications marked as read' 
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  },

  async getUnreadCount(req, res) {
    try {
      const { userAddress } = req.params;

      if (!userAddress) {
        return res.status(400).json({ 
          success: false,
          error: 'User address is required' 
        });
      }

      const result = await pool.query(
        'SELECT COUNT(*) FROM notifications WHERE user_address = $1 AND read = false',
        [userAddress.toLowerCase()]
      );

      res.json({
        success: true,
        unreadCount: parseInt(result.rows[0].count)
      });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  }
};

module.exports = notificationController;