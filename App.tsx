
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, type User, type Post, type Notification, type AppView, type Celebrity, type PublicUser, PostCategory, type Conversation } from './types';
import { INITIAL_CELEBRITIES, INITIAL_PUBLIC_USERS, INITIAL_POSTS } from './constants';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm'; // New
import CelebrityDashboard from './components/Celebrity/CelebrityDashboard';
import PublicHome from './components/Feed/PublicHome';
import NotificationsPage from './components/Notifications/NotificationsPage';
import Layout from './components/Layout/Layout';
import MessagesPage from './components/Messages/MessagesPage'; 
import { authService } from './services/authService';
import { postService, listenToNewPosts } from './services/postService';
import { userService } from './services/userService';
import { notificationService } from './services/notificationService';
import { chatService } from './services/chatService'; 
import BrowseCelebrities from './components/Public/BrowseCelebrities';

// Initialize services with mock data
postService.initializePosts(INITIAL_POSTS);
userService.initializeUsers([...INITIAL_CELEBRITIES, ...INITIAL_PUBLIC_USERS]);
notificationService.initialize();
chatService.initializeChats(); 


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('LOGIN');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [browserNotificationPerm, setBrowserNotificationPerm] = useState<NotificationPermission>(notificationService.getBrowserNotificationPermission());

  // For messaging
  const [activeConversations, setActiveConversations] = useState<Conversation[]>([]);
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null); // To navigate to a chat from search

  const requestAndSetNotificationPermission = async () => {
    const permission = await notificationService.requestBrowserNotificationPermission();
    setBrowserNotificationPerm(permission);
    localStorage.setItem('infiFeedNotificationPermission', permission);
  };

  useEffect(() => {
    const storedPermission = localStorage.getItem('infiFeedNotificationPermission') as NotificationPermission | null;
    if (storedPermission) {
        setBrowserNotificationPerm(storedPermission);
        if (storedPermission === 'granted') {
             notificationService.initialize(); 
             setBrowserNotificationPerm(notificationService.getBrowserNotificationPermission());
        }
    }
  }, []);

  const updateNotificationsInternal = useCallback((userId: string) => {
    const userNotifications = notificationService.getNotifications(userId);
    setNotifications(userNotifications);
    setUnreadNotificationCount(userNotifications.filter(n => !n.read).length);
  }, []);
  
  const updateNotifications = useCallback(() => {
    if (currentUser) {
      updateNotificationsInternal(currentUser.id);
    }
  }, [currentUser, updateNotificationsInternal]);

  const updateConversations = useCallback(() => {
    if (currentUser) {
      const convos = chatService.getConversationsForUser(currentUser.id);
      setActiveConversations(convos);
    }
  }, [currentUser]);


  useEffect(() => {
    const checkCurrentUser = async () => {
      setIsAppLoading(true);
      const userFromSession = authService.getCurrentUser();
      if (userFromSession) {
        const fullUser = userService.getUserById(userFromSession.id); 
        if (fullUser) {
            setCurrentUser(fullUser);
            setCurrentView(fullUser.role === UserRole.CELEBRITY ? 'CELEBRITY_DASHBOARD' : 'PUBLIC_HOME');
            updateNotificationsInternal(fullUser.id);
            updateConversations(); // Load initial conversations
        } else {
            authService.logout();
        }
      }
      setIsAppLoading(false);
    };
    checkCurrentUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  useEffect(() => {
    if (currentUser) {
      updateNotifications();
      updateConversations(); // Ensure conversations are up-to-date

      const unsubscribePosts = listenToNewPosts((updatedPost) => {
        if (updatedPost.userId !== currentUser.id && updatedPost.timestamp > (Date.now() - 1000 * 10)) { 
             const isFollower = currentUser.role === UserRole.PUBLIC && (currentUser as PublicUser).following.includes(updatedPost.userId);
             if (isFollower) {
                const postUrl = `${window.location.origin}${window.location.pathname}#post-${updatedPost.id}`;
                notificationService.addNotification({
                    userId: currentUser.id,
                    message: `${updatedPost.username} just posted: "${updatedPost.content.substring(0, 30)}..."`,
                    relatedPostId: updatedPost.id,
                    postUrl: postUrl,
                    type: 'post',
                });
                updateNotifications();
             }
        }
      });

      const unsubscribeMessages = chatService.listenToUserConversationsUpdate(currentUser.id, (updatedConversation, newMessage) => {
        updateConversations(); // Re-fetch all conversations to update list and unread counts
        if (newMessage && newMessage.senderId !== currentUser.id) {
          // Check if current view is MESSAGES and if the chat with newMessage.senderId is active
          const isChatActive = currentView === 'MESSAGES' && selectedChatUserId === newMessage.senderId;
          if (!isChatActive) {
            const sender = userService.getUserById(newMessage.senderId);
            notificationService.addNotification({
              userId: currentUser.id,
              message: `New message from ${sender?.username || 'Someone'}`,
              relatedConversationId: updatedConversation.id, // Should be other user's ID for direct navigation
              type: 'message',
            });
            updateNotifications();
          }
        }
      });
      
      return () => {
        unsubscribePosts();
        unsubscribeMessages();
      };
    }
  }, [currentUser, updateNotifications, updateConversations, currentView, selectedChatUserId]);


  const handleLogin = async (username: string): Promise<void> => {
    const user = await authService.login(username);
    if (user) {
      const fullUser = userService.getUserById(user.id);
      if (fullUser) {
        setCurrentUser(fullUser);
        setCurrentView(fullUser.role === UserRole.CELEBRITY ? 'CELEBRITY_DASHBOARD' : 'PUBLIC_HOME');
        updateNotificationsInternal(fullUser.id);
        updateConversations();
      } else {
         alert('Login successful, but could not retrieve full user details.');
         authService.logout(); 
      }
    } else {
      alert('Login failed. Invalid username. Try a demo account or use the conceptual "Sign Up" / "Other Login Methods" for future backend integration.');
    }
  };

  const handleSignup = async (username: string, email: string, role: UserRole): Promise<void> => {
    // This is a placeholder for actual signup logic
    alert(`Conceptual Signup:\nUsername: ${username}\nEmail: ${email}\nRole: ${role}\n\nThis feature requires backend implementation.`);
    // In a real app, you would call authService.signup, then potentially login.
    // For now, navigate back to login.
    setCurrentView('LOGIN');
  };


  const handleLogout = (): void => {
    authService.logout();
    setCurrentUser(null);
    setCurrentView('LOGIN');
    setNotifications([]);
    setUnreadNotificationCount(0);
    setActiveConversations([]);
    setSelectedChatUserId(null);
  };

  const handleNavigate = (view: AppView, newSelectedChatUserId?: string): void => {
    setCurrentView(view);
    if (view === 'MESSAGES' && newSelectedChatUserId) {
      setSelectedChatUserId(newSelectedChatUserId);
    } else if (view !== 'MESSAGES') {
      setSelectedChatUserId(null); // Clear selected chat user if navigating away from messages
    }
  };
  
  const handleCreatePost = async (content: string, imageUrls?: string[], category?: PostCategory): Promise<void> => {
    if (currentUser && currentUser.role === UserRole.CELEBRITY) {
      await postService.createPost(currentUser.id, currentUser.username, currentUser.profilePictureUrl, content, imageUrls, category);
      alert('Post created successfully!');
    }
  };

  const handleFollowToggle = async (celebrityId: string): Promise<void> => {
    if (currentUser && currentUser.role === UserRole.PUBLIC) {
      const updatedUser = await userService.toggleFollowCelebrity(currentUser.id, celebrityId);
      if (updatedUser) {
        setCurrentUser(updatedUser as PublicUser); 
      }
    }
  };

  const handleMarkNotificationAsRead = (notificationId: string): void => {
    if(currentUser){
      notificationService.markAsRead(currentUser.id, notificationId);
      updateNotifications();
    }
  };
  
  const handleMarkAllNotificationsAsRead = (): void => {
    if(currentUser){
      notificationService.markAllAsRead(currentUser.id);
      updateNotifications();
    }
  };

  const handleInitiateChat = (targetUserId: string) => {
    if (currentUser && currentUser.id !== targetUserId) {
      setSelectedChatUserId(targetUserId);
      setCurrentView('MESSAGES');
    }
  };


  if (isAppLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Loading InfiFeed...</p>
      </div>
    );
  }

  const renderAuthView = () => {
    switch (currentView) {
      case 'LOGIN':
        return <LoginForm onLogin={handleLogin} onNavigate={handleNavigate} />;
      case 'SIGNUP':
        return <SignupForm onSignup={handleSignup} onNavigate={handleNavigate} />;
      default:
        return <LoginForm onLogin={handleLogin} onNavigate={handleNavigate} />;
    }
  }

  if (!currentUser || currentView === 'LOGIN' || currentView === 'SIGNUP') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-700 via-primary-500 to-purple-600 p-4">
        {renderAuthView()}
      </div>
    );
  }
  

  return (
    <Layout
      currentUser={currentUser}
      onLogout={handleLogout}
      onNavigate={handleNavigate}
      unreadNotificationCount={unreadNotificationCount}
      currentView={currentView}
      browserNotificationPermission={browserNotificationPerm}
      onRequestBrowserNotificationPermission={requestAndSetNotificationPermission}
      onInitiateChat={handleInitiateChat} 
      activeConversations={activeConversations} 
    >
      {currentView === 'CELEBRITY_DASHBOARD' && currentUser.role === UserRole.CELEBRITY && (
        <CelebrityDashboard 
          celebrity={currentUser as Celebrity} 
          onCreatePost={handleCreatePost}
          currentUser={currentUser} 
        />
      )}
      {currentView === 'PUBLIC_HOME' && currentUser.role === UserRole.PUBLIC && (
        <PublicHome 
          publicUser={currentUser as PublicUser} 
          key={(currentUser as PublicUser).following.join(',') + selectedChatUserId} // Re-evaluate key if needed
          currentUser={currentUser}
        />
      )}
      {currentView === 'BROWSE_CELEBRITIES' && currentUser.role === UserRole.PUBLIC && (
        <BrowseCelebrities publicUser={currentUser as PublicUser} onFollowToggle={handleFollowToggle} />
      )}
      {currentView === 'NOTIFICATIONS' && (
        <NotificationsPage 
          notifications={notifications} 
          onMarkAsRead={handleMarkNotificationAsRead}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onNavigate={handleNavigate}
        />
      )}
      {currentView === 'MESSAGES' && (
        <MessagesPage
          currentUser={currentUser}
          conversations={activeConversations}
          selectedChatUserId={selectedChatUserId}
          onSelectChatUser={setSelectedChatUserId}
          onConversationsUpdate={updateConversations} 
        />
      )}
    </Layout>
  );
};

export default App;
