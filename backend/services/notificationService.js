const { pool } = require('../config/database');

class NotificationService {
  constructor() {
    this.io = null;
    this.userSockets = new Map();
  }

  setSocketIO(io) {
    this.io = io;
    
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
      
      socket.on('identify', (userAddress) => {
        this.userSockets.set(userAddress.toLowerCase(), socket.id);
        console.log(`User ${userAddress} identified with socket ${socket.id}`);
      });

      socket.on('disconnect', () => {
        for (const [address, socketId] of this.userSockets.entries()) {
          if (socketId === socket.id) {
            this.userSockets.delete(address);
            break;
          }
        }
        console.log('User disconnected:', socket.id);
      });
    });
  }

  async notifyUser(userAddress, title, message, type = 'info') {
    const normalizedAddress = userAddress.toLowerCase();
    
    try {
      await pool.query(
        `INSERT INTO notifications (user_address, title, message, type) 
         VALUES ($1, $2, $3, $4)`,
        [normalizedAddress, title, message, type]
      );

      const socketId = this.userSockets.get(normalizedAddress);
      if (socketId && this.io) {
        this.io.to(socketId).emit('notification', {
          title,
          message,
          type,
          timestamp: new Date().toISOString()
        });
      }

      console.log(`Notification sent to ${userAddress}: ${title}`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  async getUserNotifications(userAddress, limit = 20, offset = 0) {
    try {
      const result = await pool.query(
        `SELECT * FROM notifications 
         WHERE user_address = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userAddress.toLowerCase(), limit, offset]
      );

      const totalResult = await pool.query(
        'SELECT COUNT(*) FROM notifications WHERE user_address = $1',
        [userAddress.toLowerCase()]
      );

      const unreadResult = await pool.query(
        'SELECT COUNT(*) FROM notifications WHERE user_address = $1 AND read = false',
        [userAddress.toLowerCase()]
      );

      return {
        notifications: result.rows,
        total: parseInt(totalResult.rows[0].count),
        unread: parseInt(unreadResult.rows[0].count)
      };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId, userAddress) {
    try {
      await pool.query(
        'UPDATE notifications SET read = true WHERE id = $1 AND user_address = $2',
        [notificationId, userAddress.toLowerCase()]
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userAddress) {
    try {
      await pool.query(
        'UPDATE notifications SET read = true WHERE user_address = $1 AND read = false',
        [userAddress.toLowerCase()]
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();