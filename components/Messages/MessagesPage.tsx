
import React, { useState, useEffect, useCallback } from 'react';
import { type User, type Conversation as ConversationType } from '../../types';
import ConversationListItem from './ConversationListItem';
import ChatWindow from './ChatWindow';
import { chatService } from '../../services/chatService';
import Spinner from '../Common/Spinner';

interface MessagesPageProps {
  currentUser: User;
  conversations: ConversationType[]; // Passed from App.tsx
  selectedChatUserId: string | null; // User ID of the chat to open
  onSelectChatUser: (userId: string | null) => void; // To update App state
  onConversationsUpdate: () => void; // To tell App.tsx to refresh conversations
}

const MessagesPage: React.FC<MessagesPageProps> = ({ 
  currentUser, 
  conversations,
  selectedChatUserId,
  onSelectChatUser,
  onConversationsUpdate
}) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  // Effect to handle initially selected chat user (e.g., from search)
  useEffect(() => {
    if (selectedChatUserId && currentUser) {
      setIsLoadingConversation(true);
      chatService.getOrCreateConversation(currentUser.id, selectedChatUserId)
        .then(convo => {
          if (convo) {
            setActiveConversationId(convo.id);
            chatService.markConversationAsRead(convo.id, currentUser.id);
            onConversationsUpdate(); // Update unread counts in App state
          }
        })
        .finally(() => setIsLoadingConversation(false));
    } else if (!selectedChatUserId) {
        // If selectedChatUserId is cleared (e.g. navigating away from a specific chat but still on Messages page)
        // Optionally, clear activeConversationId or select the first in the list
        setActiveConversationId(null); 
    }
  }, [selectedChatUserId, currentUser, onConversationsUpdate]);

  const handleConversationSelect = useCallback(async (conversation: ConversationType) => {
    setActiveConversationId(conversation.id);
    const otherParticipant = chatService.getParticipantDetails(conversation, currentUser.id);
    if (otherParticipant) {
        onSelectChatUser(otherParticipant.id); // Update selected user in App state
    }
    await chatService.markConversationAsRead(conversation.id, currentUser.id);
    onConversationsUpdate(); // Refresh overall conversation list for unread counts
  }, [currentUser, onConversationsUpdate, onSelectChatUser]);

  // If no conversations and not trying to load a specific one from selectedChatUserId
  if (conversations.length === 0 && !selectedChatUserId && !isLoadingConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center bg-white rounded-lg shadow-md p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-primary-300 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">No Messages Yet</h2>
        <p className="text-gray-500">Search for users in the navigation bar to start a conversation.</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col sm:flex-row h-[calc(100vh-150px)] sm:h-[calc(100vh-180px)] bg-white shadow-xl rounded-lg overflow-hidden">
      {/* Sidebar: Conversation List */}
      <div className={`w-full sm:w-1/3 md:w-1/4 border-r border-gray-200 overflow-y-auto transition-all duration-300 ease-in-out ${activeConversationId && 'hidden sm:block'}`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
        </div>
        {conversations.length === 0 && !isLoadingConversation && (
             <p className="p-4 text-sm text-gray-500">No active conversations. Search users to start chatting.</p>
        )}
        {isLoadingConversation && conversations.length === 0 && (
             <div className="p-4 text-center"><Spinner/></div>
        )}
        <ul>
          {conversations.map(convo => (
            <ConversationListItem
              key={convo.id}
              conversation={convo}
              currentUser={currentUser}
              isSelected={convo.id === activeConversationId}
              onSelect={() => handleConversationSelect(convo)}
            />
          ))}
        </ul>
      </div>

      {/* Main Area: Chat Window */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${!activeConversationId && 'hidden sm:flex'}`}>
        {isLoadingConversation && activeConversationId && (
            <div className="flex-1 flex items-center justify-center"><Spinner size="lg"/></div>
        )}
        {!isLoadingConversation && activeConversationId ? (
          <ChatWindow
            key={activeConversationId} // Re-mount if conversation changes
            conversationId={activeConversationId}
            currentUser={currentUser}
            onMessageSent={onConversationsUpdate} // Trigger App to update conversation list (last message, unread)
          />
        ) : (
          <div className="flex-1 flex-col items-center justify-center text-center p-8 hidden sm:flex">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
             </svg>
            <h3 className="text-xl font-semibold text-gray-600">Select a chat to start messaging</h3>
            <p className="text-gray-400 mt-2">Or search for a user to begin a new conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
