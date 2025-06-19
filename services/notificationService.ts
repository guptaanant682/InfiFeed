
import { type Notification, type User } from '../types'; // Added User for potential use
import { userService } from './userService'; // To get sender details for message notifications

interface NewNotificationPayload {
  userId: string;
  message: string;
  relatedPostId?: string;
  postUrl?: string; 
  relatedConversationId?: string; // For message notifications
  type?: 'post' | 'message' | 'system'; // Notification type
}

// Store notifications per user ID
let notificationsDB: Record<string, Notification[]> = {};
let browserNotificationPermission: NotificationPermission = 'default';

// Helper to show browser notification
const showBrowserNotification = (title: string, options: NotificationOptions, urlToOpen?: string, relatedConversationId?: string) => {
  if (browserNotificationPermission === 'granted') {
    const notification = new window.Notification(title, options);
    notification.onclick = () => {
      if (urlToOpen) { // Prioritize post URL if available
        window.open(urlToOpen, '_blank');
      } else if (relatedConversationId) {
        // If no direct URL, but it's a message, potentially navigate to messages.
        // This requires app-level navigation logic, so it's tricky here.
        // For now, it will just close. A more advanced app might emit an event.
        // Or, the MessagesPage itself could listen for this type of click.
        // Simplest: just focus window.
        window.focus();
      }
      notification.close();
    };
  }
};


export const notificationService = {
  initialize: (): void => {
    notificationsDB = {}; // Reset on init
    if ('Notification' in window) {
        browserNotificationPermission = Notification.permission;
    }
  },

  getNotifications: (userId: string): Notification[] => {
    return (notificationsDB[userId] || []).sort((a, b) => b.timestamp - a.timestamp);
  },

  addNotification: (payload: NewNotificationPayload): Notification => {
    const newNotification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId: payload.userId,
      message: payload.message,
      relatedPostId: payload.relatedPostId,
      timestamp: Date.now(),
      read: false,
      postUrl: payload.postUrl,
      relatedConversationId: payload.relatedConversationId,
      type: payload.type || 'system',
    };

    if (!notificationsDB[payload.userId]) {
      notificationsDB[payload.userId] = [];
    }
    notificationsDB[payload.userId].unshift(newNotification);

    let browserTitle = 'InfiFeed Update';
    if (payload.type === 'message') {
        // Try to get sender info if possible - this part is tricky as notificationService might not know about users easily
        // For simplicity, stick to the generic message from payload
        browserTitle = 'New Message on InfiFeed';
    }


    showBrowserNotification(
        browserTitle, 
        { body: payload.message, icon: '/favicon.ico' }, // Assuming favicon.ico is in public root
        payload.postUrl,
        payload.relatedConversationId
    );

    return newNotification;
  },

  markAsRead: (userId: string, notificationId: string): void => {
    if (notificationsDB[userId]) {
      const notification = notificationsDB[userId].find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    }
  },

  markAllAsRead: (userId: string): void => {
    if (notificationsDB[userId]) {
      notificationsDB[userId].forEach(n => n.read = true);
    }
  },

  getUnreadCount: (userId: string): number => {
    return (notificationsDB[userId] || []).filter(n => !n.read).length;
  },

  requestBrowserNotificationPermission: async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notification');
      browserNotificationPermission = 'denied';
      return 'denied';
    }
    const permission = await Notification.requestPermission();
    browserNotificationPermission = permission;
    return permission;
  },

  getBrowserNotificationPermission: (): NotificationPermission => {
    return browserNotificationPermission;
  }
};
