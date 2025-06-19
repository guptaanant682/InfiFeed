
import React, { useState, useEffect, useRef } from 'react';
import { UserRole, type User, type AppView, type Conversation } from '../../types';
import NotificationBadge from '../Notifications/NotificationBadge';
import Button from '../Common/Button';
import UserSearchDropdown from '../Messages/UserSearchDropdown'; // New
import { userService } from '../../services/userService';

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
  onNavigate: (view: AppView, selectedChatUserId?: string) => void;
  unreadNotificationCount: number;
  currentView: AppView;
  browserNotificationPermission: NotificationPermission;
  onRequestBrowserNotificationPermission: () => Promise<void>;
  onInitiateChat: (targetUserId: string) => void;
  activeConversations: Conversation[];
}

const NavLink: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  children?: React.ReactNode;
  ariaLabel?: string;
  badgeCount?: number;
}> = ({ label, isActive, onClick, children, ariaLabel, badgeCount }) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel || label}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out relative group
      ${isActive 
        ? 'bg-primary-600 text-white shadow-sm' 
        : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
      }`}
  >
    <div className="flex items-center">
      {children || label}
      {badgeCount && badgeCount > 0 && <NotificationBadge count={badgeCount} />}
    </div>
    <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-primary-600 transition-all duration-300 ease-out ${isActive ? 'w-3/5' : 'w-0 group-hover:w-3/5'}`}></span>
  </button>
);


const Navbar: React.FC<NavbarProps> = ({ 
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const unreadMessagesCount = activeConversations.reduce((sum, convo) => {
    return sum + (convo.unreadCounts[currentUser.id] || 0);
  }, 0);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    const fetchUsers = async () => {
      const allUsers = await userService.getAllUsers(); // Assuming this is fast for mock
      const filteredUsers = allUsers.filter(user => 
        user.id !== currentUser.id && // Don't show self
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredUsers.slice(0, 5)); // Limit results
    };
    fetchUsers();
  }, [searchQuery, currentUser.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchItemClick = (userId: string) => {
    onInitiateChat(userId);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate(currentUser.role === UserRole.CELEBRITY ? 'CELEBRITY_DASHBOARD' : 'PUBLIC_HOME')}
              className="font-bold text-2xl text-primary-600 hover:text-primary-700 transition-colors"
              aria-label="Go to Home"
            >
              InfiFeed
            </button>
          </div>
          
          {/* User Search - Centered for larger screens */}
          <div className="hidden sm:flex flex-grow justify-center px-4">
            <div className="relative w-full max-w-xs lg:max-w-sm" ref={searchContainerRef}>
              <input 
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
              {isSearchFocused && searchResults.length > 0 && (
                <UserSearchDropdown results={searchResults} onItemClick={handleSearchItemClick} />
              )}
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-1 md:space-x-2">
            {currentUser.role === UserRole.CELEBRITY && (
              <NavLink 
                label="Dashboard" 
                isActive={currentView === 'CELEBRITY_DASHBOARD'} 
                onClick={() => onNavigate('CELEBRITY_DASHBOARD')} 
              />
            )}
            {currentUser.role === UserRole.PUBLIC && (
              <>
                <NavLink 
                  label="My Feed" 
                  isActive={currentView === 'PUBLIC_HOME'} 
                  onClick={() => onNavigate('PUBLIC_HOME')} 
                />
                <NavLink 
                  label="Browse Stars" 
                  isActive={currentView === 'BROWSE_CELEBRITIES'} 
                  onClick={() => onNavigate('BROWSE_CELEBRITIES')} 
                />
              </>
            )}
             <NavLink
              label="Messages"
              isActive={currentView === 'MESSAGES'}
              onClick={() => onNavigate('MESSAGES')}
              ariaLabel={`Messages, ${unreadMessagesCount} unread`}
              badgeCount={unreadMessagesCount}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="hidden lg:inline">Messages</span>
            </NavLink>
            <NavLink 
              label="Notifications" 
              isActive={currentView === 'NOTIFICATIONS'} 
              onClick={() => onNavigate('NOTIFICATIONS')}
              ariaLabel={`Notifications, ${unreadNotificationCount} unread`}
              badgeCount={unreadNotificationCount}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="hidden lg:inline">Alerts</span>
              </div>
            </NavLink>
             {browserNotificationPermission === 'default' && (
                <Button onClick={onRequestBrowserNotificationPermission} size="xs" variant="outline" className="text-xs !px-2 !py-1">Enable Alerts</Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <img 
                src={currentUser.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=random&size=40`} 
                alt={`${currentUser.username}'s profile`}
                className="w-9 h-9 rounded-full object-cover border-2 border-primary-200 shadow-sm"
              />
              <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">{currentUser.username}</span>
            </div>
            <Button onClick={onLogout} variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-50 !px-2.5 !py-1.5">Logout</Button>
          </div>
        </div>
        
        {/* Mobile Nav & Search */}
        <div className="sm:hidden border-t border-gray-200">
          <div className="py-2 px-2">
             <div className="relative w-full mb-2" ref={searchContainerRef}>
              <input 
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
              {isSearchFocused && searchResults.length > 0 && (
                <UserSearchDropdown results={searchResults} onItemClick={handleSearchItemClick} />
              )}
            </div>
          </div>
          <div className="flex justify-around items-center py-2 border-t border-gray-200">
            {currentUser.role === UserRole.CELEBRITY && (
                <NavLink 
                  label="Dashboard" 
                  isActive={currentView === 'CELEBRITY_DASHBOARD'} 
                  onClick={() => onNavigate('CELEBRITY_DASHBOARD')} 
                />
              )}
              {currentUser.role === UserRole.PUBLIC && (
                <>
                  <NavLink 
                    label="Feed" 
                    isActive={currentView === 'PUBLIC_HOME'} 
                    onClick={() => onNavigate('PUBLIC_HOME')} 
                  />
                  <NavLink 
                    label="Browse" 
                    isActive={currentView === 'BROWSE_CELEBRITIES'} 
                    onClick={() => onNavigate('BROWSE_CELEBRITIES')} 
                  />
                </>
              )}
              <NavLink
                label="Messages"
                isActive={currentView === 'MESSAGES'}
                onClick={() => onNavigate('MESSAGES')}
                ariaLabel={`Messages, ${unreadMessagesCount} unread`}
                badgeCount={unreadMessagesCount}
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </NavLink>
              <NavLink 
                label="Alerts" 
                ariaLabel={`Notifications, ${unreadNotificationCount} unread`}
                isActive={currentView === 'NOTIFICATIONS'} 
                onClick={() => onNavigate('NOTIFICATIONS')}
                badgeCount={unreadNotificationCount}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </NavLink>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
