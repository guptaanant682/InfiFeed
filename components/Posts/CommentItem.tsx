import React from 'react';
import { type Comment as CommentType } from '../../types';

interface CommentItemProps {
  comment: CommentType;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const timeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex items-start space-x-2.5 py-2.5 px-1">
      <img
        src={comment.userProfilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.username)}&background=random&size=32&font-size=0.4`}
        alt={comment.username}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
      />
      <div className="flex-grow bg-gray-100 p-2.5 rounded-lg">
        <div className="flex items-baseline space-x-2">
          <span className="font-semibold text-xs text-gray-800">{comment.username}</span>
          <span className="text-xxs text-gray-400">{timeAgo(comment.timestamp)}</span>
        </div>
        <p className="text-xs text-gray-700 mt-0.5 whitespace-pre-line break-words">{comment.content}</p>
      </div>
    </div>
  );
};

// Add text-xxs to tailwind config if not available
// tailwind.config = { theme: { extend: { fontSize: { 'xxs': '.65rem' } } } } in index.html for example

export default CommentItem;
