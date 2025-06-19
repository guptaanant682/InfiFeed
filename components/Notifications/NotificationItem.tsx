
import React from 'react';
import { type Notification, type AppView } from '../../types';
import Button from '../Common/Button';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => void;
  onNavigate: (view: AppView, relatedId?: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead, onNavigate }) => {
  const timeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);

    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleClick = () => {
    if (notification.type === 'message' && notification.relatedConversationId) {
      // For messages, relatedConversationId might store the *other user's ID* to select the chat.
      // App.tsx's handleNavigate will take care of this.
      // The `relatedConversationId` should ideally be the ID of the *other user* in the conversation.
      onNavigate('MESSAGES', notification.relatedConversationId); 
    } else if (notification.type === 'post' && notification.postUrl) {
      // For posts, navigate to the post URL hash
      // This is a bit simplistic; a better way would be to navigate to a view that can show a specific post.
      // For now, if postUrl is a hash, it might work with current setup.
      window.location.href = notification.postUrl;
    }
    // Mark as read when clicked, if not already
    if (!notification.read) {
        onMarkAsRead(notification.id);
    }
  };

  return (
    <div 
      className={`p-4 mb-3 rounded-lg shadow-sm transition-all duration-200 ease-in-out border-l-4 cursor-pointer
                  ${notification.read 
                    ? 'bg-white border-gray-200 hover:shadow-md hover:bg-gray-50' 
                    : 'bg-primary-50 border-primary-500 hover:shadow-md hover:bg-primary-100'}`}
      role="listitem"
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      tabIndex={0}
      aria-live={!notification.read ? "polite" : "off"}
      aria-label={`Notification: ${notification.message}, received ${timeAgo(notification.timestamp)}${notification.read ? ", read" : ", unread"}. Click to view.`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-grow">
            <p className={`text-sm ${notification.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
            {notification.message}
            </p>
            <p className={`text-xs mt-1 ${notification.read ? 'text-gray-400' : 'text-primary-700'}`}>
                {timeAgo(notification.timestamp)}
            </p>
        </div>
        {!notification.read && (
          <Button 
            onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification.id); }} 
            variant="outline" 
            size="xs"
            className="border-primary-500 text-primary-600 hover:bg-primary-100 whitespace-nowrap flex-shrink-0"
            aria-label={`Mark notification "${notification.message.substring(0,20)}..." as read`}
          >
            Mark Read
          </Button>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
