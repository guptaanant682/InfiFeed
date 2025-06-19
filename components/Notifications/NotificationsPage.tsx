
import React from 'react';
import { type Notification, type AppView } from '../../types';
import NotificationItem from './NotificationItem';
import Button from '../Common/Button';

interface NotificationsPageProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onNavigate: (view: AppView, relatedId?: string) => void; // For navigating to post/message
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ notifications, onMarkAsRead, onMarkAllAsRead, onNavigate }) => {
  const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-0">Notifications</h1>
        {unreadCount > 0 && (
          <Button 
            onClick={onMarkAllAsRead} 
            variant="secondary" 
            size="sm"
            className="hover:bg-primary-100 hover:text-primary-700"
            aria-label={`Mark all ${unreadCount} notifications as read`}
            >
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </header>
      
      {sortedNotifications.length === 0 ? (
        <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          <p className="text-gray-500 text-lg">You have no notifications yet. Stay tuned!</p>
        </div>
      ) : (
        <div role="list">
          {sortedNotifications.map((notification) => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
              onMarkAsRead={onMarkAsRead}
              onNavigate={onNavigate} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
