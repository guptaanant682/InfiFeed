
import React from 'react';
import { type Conversation, type User } from '../../types';
import { chatService } from '../../services/chatService';

interface ConversationListItemProps {
  conversation: Conversation;
  currentUser: User;
  isSelected: boolean;
  onSelect: () => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({ 
  conversation, 
  currentUser, 
  isSelected, 
  onSelect 
}) => {
  const otherParticipant = chatService.getParticipantDetails(conversation, currentUser.id);
  const unreadCount = conversation.unreadCounts[currentUser.id] || 0;

  if (!otherParticipant) {
    // This might happen if a user involved in a convo is deleted, or data inconsistency
    return (
        <li 
            className={`p-3 border-b border-gray-100 cursor-not-allowed opacity-50`}
        >
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 truncate">Unknown User</p>
                    <p className="text-xs text-gray-400 truncate">Conversation error</p>
                </div>
            </div>
        </li>
    );
  }
  
  const lastMessageText = conversation.lastMessage 
    ? (conversation.lastMessage.senderId === currentUser.id ? "You: " : "") + conversation.lastMessage.text 
    : "No messages yet";

  return (
    <li 
      onClick={onSelect}
      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150
                  ${isSelected ? 'bg-primary-50 border-l-4 border-primary-500' : ''}`}
      aria-current={isSelected ? "page" : undefined}
    >
      <div className="flex items-center space-x-3">
        <img
          src={otherParticipant.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.username)}&background=random&size=40`}
          alt={otherParticipant.username}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <p className={`text-sm font-medium truncate ${isSelected ? 'text-primary-700' : 'text-gray-800'}`}>
              {otherParticipant.username}
            </p>
            {unreadCount > 0 && (
              <span className="ml-2 text-xs bg-red-500 text-white font-semibold px-1.5 py-0.5 rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <p className={`text-xs truncate ${unreadCount > 0 && !isSelected ? 'font-semibold text-gray-600' : 'text-gray-500'}`}>
            {lastMessageText}
          </p>
        </div>
      </div>
    </li>
  );
};

export default ConversationListItem;
