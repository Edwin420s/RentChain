import React, { useState } from 'react'
import { Bell, Check, Trash2, Settings } from 'lucide-react'

const NotificationsCenter = ({ notifications, onMarkAsRead, onClearAll }) => {
  const [isOpen, setIsOpen] = useState(false)

  const groupedNotifications = {
    unread: notifications.filter(n => !n.read),
    today: notifications.filter(n => {
      const today = new Date()
      const notifDate = new Date(n.timestamp)
      return notifDate.toDateString() === today.toDateString() && n.read
    }),
    earlier: notifications.filter(n => {
      const today = new Date()
      const notifDate = new Date(n.timestamp)
      return notifDate.toDateString() !== today.toDateString() && n.read
    })
  }

  const getNotificationIcon = (type) => {
    const baseClasses = "h-5 w-5"
    switch (type) {
      case 'payment':
        return <div className={`${baseClasses} bg-green-100 text-green-600 rounded-full flex items-center justify-center`}>$</div>
      case 'agreement':
        return <div className={`${baseClasses} bg-blue-100 text-blue-600 rounded-full flex items-center justify-center`}>A</div>
      case 'dispute':
        return <div className={`${baseClasses} bg-red-100 text-red-600 rounded-full flex items-center justify-center`}>!</div>
      case 'system':
        return <div className={`${baseClasses} bg-gray-100 text-gray-600 rounded-full flex items-center justify-center`}>S</div>
      default:
        return <Bell className={`${baseClasses} text-gray-400`} />
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-text hover:bg-secondary rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5" />
        {groupedNotifications.unread.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {groupedNotifications.unread.length}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-text">Notifications</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClearAll}
                className="text-sm text-primary hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {Object.entries(groupedNotifications).map(([group, notifs]) => (
              notifs.length > 0 && (
                <div key={group}>
                  <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-600 uppercase">
                    {group} ({notifs.length})
                  </div>
                  {notifs.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text font-medium">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {!notification.read && (
                            <button
                              onClick={() => onMarkAsRead(notification.id)}
                              className="text-gray-400 hover:text-green-600 transition-colors p-1"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                          <button className="text-gray-400 hover:text-error transition-colors p-1">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      {notification.action && (
                        <div className="mt-2 flex space-x-2">
                          <button className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-blue-800 transition-colors">
                            {notification.action}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ))}
          </div>

          {/* Empty State */}
          {notifications.length === 0 && (
            <div className="text-center py-8">
              <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <div className="text-sm text-gray-600">No notifications</div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button className="w-full text-center text-sm text-primary hover:text-blue-800 font-medium">
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationsCenter