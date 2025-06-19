
import React from 'react';
import Navbar from './Navbar';
import { type User, type AppView, type Conversation } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
  onNavigate: (view: AppView, selectedChatUserId?: string) => void;
  unreadNotificationCount: number;
  currentView: AppView;
  browserNotificationPermission: NotificationPermission;
  onRequestBrowserNotificationPermission: () => Promise<void>;
  onInitiateChat: (targetUserId: string) => void; // For user search
  activeConversations: Conversation[]; // For message badge in Navbar
}

const Layout: React.FC<LayoutProps> = ({ 
    children, 
    currentUser, 
    onLogout, 
    onNavigate, 
    unreadNotificationCount, 
    currentView,
    browserNotificationPermission,
    onRequestBrowserNotificationPermission,
    onInitiateChat,
    activeConversations
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar 
        currentUser={currentUser} 
        onLogout={onLogout} 
        onNavigate={onNavigate} 
        unreadNotificationCount={unreadNotificationCount}
        currentView={currentView}
        browserNotificationPermission={browserNotificationPermission}
        onRequestBrowserNotificationPermission={onRequestBrowserNotificationPermission}
        onInitiateChat={onInitiateChat}
        activeConversations={activeConversations}
      />
      <main className="flex-grow max-w-5xl w-full mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="text-center py-6 bg-gray-100 border-t border-gray-200">
        <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} InfiFeed. Crafted with ❤️.</p>
      </footer>
    </div>
  );
};

export default Layout;
