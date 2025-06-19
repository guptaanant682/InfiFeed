
import { type User, type Conversation, type Message } from '../types';
import { userService } from './userService';

let conversationsDB: Conversation[] = [];
let messagesDB: { [conversationId: string]: Message[] } = {};

// Listeners for UI updates
type ConversationUpdateListener = (updatedConversation: Conversation, newMessage?: Message) => void;
// Store listeners per user ID, as a user only needs updates for their conversations
const userConversationListeners: { [userId: string]: ConversationUpdateListener[] } = {};


// --- Helper Functions ---
const getConversationId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_'); // Consistent ID regardless of order
};

const getOtherParticipantId = (conversation: Conversation, currentUserId: string): string | undefined => {
  return conversation.participantIds.find(id => id !== currentUserId);
};


// --- Service ---
export const chatService = {
  initializeChats: (): void => {
    conversationsDB = [];
    messagesDB = {};
    // userConversationListeners = {}; // This would clear listeners on re-init, might not be desired if service persists longer than components
  },

  getOrCreateConversation: async (userId1: string, userId2: string): Promise<Conversation | null> => {
    if (userId1 === userId2) return null; // Cannot chat with oneself

    const user1 = userService.getUserById(userId1);
    const user2 = userService.getUserById(userId2);
    if (!user1 || !user2) return null; // Users must exist

    const conversationId = getConversationId(userId1, userId2);
    let conversation = conversationsDB.find(c => c.id === conversationId);

    if (!conversation) {
      conversation = {
        id: conversationId,
        participantIds: [userId1, userId2].sort(),
        lastMessage: undefined,
        unreadCounts: { [userId1]: 0, [userId2]: 0 },
        // lastActivity: Date.now(), // Could be added
      };
      conversationsDB.unshift(conversation); // Add to beginning for default sort by recent
    }
    return conversation;
  },

  getConversationsForUser: (userId: string): Conversation[] => {
    return conversationsDB
      .filter(c => c.participantIds.includes(userId))
      .sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0)); // Sort by most recent message
  },

  getMessagesForConversation: (conversationId: string): Message[] => {
    return (messagesDB[conversationId] || []).sort((a, b) => a.timestamp - b.timestamp); // Chronological
  },

  sendMessage: async (senderId: string, receiverId: string, text: string): Promise<Message | null> => {
    if (!text.trim()) return null;

    const conversation = await chatService.getOrCreateConversation(senderId, receiverId);
    if (!conversation) return null;

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      conversationId: conversation.id,
      senderId,
      receiverId,
      text,
      timestamp: Date.now(),
      read: false, // Default to unread for receiver
    };

    if (!messagesDB[conversation.id]) {
      messagesDB[conversation.id] = [];
    }
    messagesDB[conversation.id].push(newMessage);
    conversation.lastMessage = newMessage;
    // conversation.lastActivity = newMessage.timestamp;

    // Update unread count for the receiver
    if (conversation.unreadCounts[receiverId] !== undefined) {
      conversation.unreadCounts[receiverId]++;
    } else {
      conversation.unreadCounts[receiverId] = 1;
    }
    // Sender's unread count for this convo should be 0 as they just sent it
    conversation.unreadCounts[senderId] = 0;


    // Notify listeners for both participants
    conversation.participantIds.forEach(participantId => {
      const listeners = userConversationListeners[participantId] || [];
      listeners.forEach(listener => listener(conversation, newMessage));
    });

    return newMessage;
  },

  markConversationAsRead: (conversationId: string, userId: string): void => {
    const conversation = conversationsDB.find(c => c.id === conversationId);
    if (conversation && conversation.participantIds.includes(userId)) {
      conversation.unreadCounts[userId] = 0;
      
      // Also mark individual messages as read for this user in this conversation
      // (messagesDB[conversationId] || []).forEach(msg => {
      //   if (msg.receiverId === userId && !msg.read) {
      //     msg.read = true;
      //   }
      // });

      // Notify listeners for the user whose conversation was marked read
      const listeners = userConversationListeners[userId] || [];
      listeners.forEach(listener => listener(conversation)); // No new message, just convo update
    }
  },

  listenToUserConversationsUpdate: (userId: string, callback: ConversationUpdateListener): (() => void) => {
    if (!userConversationListeners[userId]) {
      userConversationListeners[userId] = [];
    }
    userConversationListeners[userId].push(callback);
    
    return () => {
      if (userConversationListeners[userId]) {
        const index = userConversationListeners[userId].indexOf(callback);
        if (index > -1) {
          userConversationListeners[userId].splice(index, 1);
        }
      }
    };
  },
  
  // Helper for components to get user details for conversations
  getParticipantDetails: (conversation: Conversation, currentUserId: string): User | undefined => {
    const otherId = getOtherParticipantId(conversation, currentUserId);
    return otherId ? userService.getUserById(otherId) : undefined;
  }
};
