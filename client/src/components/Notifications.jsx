import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await api.patch('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'WELCOME': return '🎉';
      case 'COMMENT': return '💬';
      case 'REPLY': return '↩️';
      case 'MESSAGE': return '📨';
      case 'SYSTEM': return '⚙️';
      default: return '🔔';
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
            <h3 className="font-bold text-lg">התראות</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={loading}
                className="text-sm text-primary-600 hover:underline"
              >
                {loading ? 'מסמן...' : 'סמן הכל כנקרא'}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="divide-y">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-gray-50 transition ${
                    !notif.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <span className="text-2xl">{getNotificationIcon(notif.type)}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{notif.title}</p>
                      <p className="text-sm text-gray-600">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleString('he-IL')}
                      </p>
                    </div>
                    <div className="flex space-x-1 space-x-reverse">
                      {!notif.isRead && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="text-blue-600 hover:text-blue-700 text-xs"
                          title="סמן כנקרא"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="text-red-600 hover:text-red-700 text-xs"
                        title="מחק"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <span className="text-4xl block mb-2">🔔</span>
                <p>אין התראות חדשות</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}