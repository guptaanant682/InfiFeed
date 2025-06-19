
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { type User, type Message as MessageType, type Conversation } from '../../types';
import { chatService } from '../../services/chatService';
import { userService } from '../../services/userService';
import ChatMessageItem from './ChatMessageItem';
import Button from '../Common/Button';
import Spinner from '../Common/Spinner';

interface ChatWindowProps {
  conversationId: string;
  currentUser: User;
  onMessageSent: (conversation: Conversation, newMessage: MessageType) => void; // To update conversation list
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, currentUser, onMessageSent }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [otherParticipant, setOtherParticipant] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatDetails = useCallback(async () => {
    setIsLoading(true);
    const currentConvo = chatService.getConversationsForUser(currentUser.id).find(c => c.id === conversationId);
    if (currentConvo) {
      const otherUserId = currentConvo.participantIds.find(id => id !== currentUser.id);
      if (otherUserId) {
        const participant = userService.getUserById(otherUserId);
        setOtherParticipant(participant || null);
      }
      const fetchedMessages = chatService.getMessagesForConversation(conversationId);
      setMessages(fetchedMessages);
      // Mark as read when opening window
      chatService.markConversationAsRead(conversationId, currentUser.id);
      // Inform parent about potential update to unread counts
      const updatedConvoForParent = chatService.getConversationsForUser(currentUser.id).find(c => c.id === conversationId);
      if (updatedConvoForParent) onMessageSent(updatedConvoForParent, {} as MessageType); // Bit of a hack to trigger update without a "new message"

    } else {
      setOtherParticipant(null); // Conversation not found or invalid
      setMessages([]);
    }
    setIsLoading(false);
  }, [conversationId, currentUser.id, onMessageSent]);

  useEffect(() => {
    loadChatDetails();

    const unsubscribe = chatService.listenToUserConversationsUpdate(currentUser.id, (updatedConversation, newMessage) => {
        if (updatedConversation.id === conversationId) {
            setMessages(chatService.getMessagesForConversation(conversationId)); // Refresh messages
             if (newMessage && newMessage.senderId !== currentUser.id) { // If new message is from other user
                 chatService.markConversationAsRead(conversationId, currentUser.id);
             }
             // Notify parent about the update (even if it's just a read status change)
             onMessageSent(updatedConversation, newMessage || {} as MessageType);
        }
    });
    return () => unsubscribe();
  }, [conversationId, currentUser.id, loadChatDetails, onMessageSent]);


  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!newMessageText.trim() || !otherParticipant || isSending) return;

    setIsSending(true);
    try {
      const sentMessage = await chatService.sendMessage(currentUser.id, otherParticipant.id, newMessageText);
      if (sentMessage) {
        // The listener should update messages, but we can optimistically add too.
        // setMessages(prev => [...prev, sentMessage]);
        setNewMessageText('');
        // Parent notification is handled by the listener
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Show error toast or similar
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!otherParticipant) {
    return <div className="flex-1 flex items-center justify-center text-gray-500 p-4">Could not load chat. User not found or invalid conversation.</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <header className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-3">
        <img 
          src={otherParticipant.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.username)}&background=random&size=40`} 
          alt={otherParticipant.username} 
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
        />
        <div>
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{otherParticipant.username}</h3>
            {/* Online status could go here */}
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 chat-messages-container">
        {messages.map(msg => (
          <ChatMessageItem key={msg.id} message={msg} currentUser={currentUser} otherParticipant={otherParticipant} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <footer className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2 sm:space-x-3">
          <input
            type="text"
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
            disabled={isSending}
          />
          <Button type="submit" size="md" isLoading={isSending} disabled={!newMessageText.trim() || isSending}>
            Send
          </Button>
        </form>
      </footer>
    </div>
  );
};

export default ChatWindow;
