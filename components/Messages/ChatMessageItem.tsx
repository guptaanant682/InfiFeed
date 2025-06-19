
import React from 'react';
import { type Message, type User } from '../../types';

interface ChatMessageItemProps {
  message: Message;
  currentUser: User;
  otherParticipant: User; // To display avatar for received messages
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, currentUser, otherParticipant }) => {
  const isSentByCurrentUser = message.senderId === currentUser.id;

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className={`flex items-end space-x-2 ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isSentByCurrentUser && (
        <img
          src={otherParticipant.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.username)}&background=random&size=32&font-size=0.45`}
          alt={otherParticipant.username}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0 self-start"
        />
      )}
      <div className={`max-w-[70%] sm:max-w-[60%]`}>
        <div 
          className={`px-3.5 py-2.5 text-sm sm:text-base break-words
                      ${isSentByCurrentUser ? 'chat-bubble-sent' : 'chat-bubble-received'}`}
        >
          {message.text}
        </div>
        <p className={`text-xxs text-gray-400 mt-1 ${isSentByCurrentUser ? 'text-right' : 'text-left'}`}>
          {timeFormatter.format(new Date(message.timestamp))}
        </p>
      </div>
       {isSentByCurrentUser && (
        <img
          src={currentUser.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=random&size=32&font-size=0.45`}
          alt={currentUser.username}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0 self-start"
        />
      )}
    </div>
  );
};

export default ChatMessageItem;
