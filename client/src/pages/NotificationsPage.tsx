import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, NotificationItem } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, Sparkles, ShieldCheck, RefreshCw, CheckCheck } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { refreshNotificationsCount } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationAsRead(id);
      await loadNotifications();
      await refreshNotificationsCount();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      await loadNotifications();
      await refreshNotificationsCount();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">In-App Notifications</h1>
          <p className="text-xs text-gray-500">Real-time alerts for suggested matches, claim approvals, and moderation updates</p>
        </div>

        <button
          onClick={handleMarkAllAsRead}
          className="text-xs font-bold text-[#1E3A2B] hover:underline flex items-center space-x-1"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-500">Loading notification feed...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-2 text-gray-500 text-xs">
          <Bell className="w-10 h-10 mx-auto text-gray-300 mb-1" />
          <p>No notifications yet. Alerts will appear here when matches or claim decisions occur.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                n.is_read ? 'bg-white border-gray-200' : 'bg-amber-50/60 border-amber-200 shadow-2xs'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  n.type === 'MATCH' ? 'bg-[#D97706] text-white' : 'bg-[#1E3A2B] text-white'
                }`}>
                  {n.type === 'MATCH' ? <Sparkles className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-900">{n.title}</h3>
                    <span className="text-[10px] text-gray-400">• {n.created_at}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{n.message}</p>

                  {n.reference_id && (
                    <Link
                      to={`/items/${n.reference_id}`}
                      className="inline-block mt-1 font-bold text-[#1E3A2B] hover:underline"
                    >
                      View Associated Item Report →
                    </Link>
                  )}
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  title="Mark as read"
                  className="p-1 text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
