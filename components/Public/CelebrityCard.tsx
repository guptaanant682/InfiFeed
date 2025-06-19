import React, { useState } from 'react';
import { type Celebrity } from '../../types';
import Button from '../Common/Button';

interface CelebrityCardProps {
  celebrity: Celebrity;
  isFollowing: boolean;
  onFollowToggle: (celebrityId: string) => Promise<void>;
  currentUserId: string;
}

const CelebrityCard: React.FC<CelebrityCardProps> = ({ celebrity, isFollowing, onFollowToggle, currentUserId }) => {
  const [isProcessingFollow, setIsProcessingFollow] = useState(false);

  const handleFollow = async (): Promise<void> => {
    setIsProcessingFollow(true);
    try {
        await onFollowToggle(celebrity.id);
    } catch (error) {
        console.error("Error toggling follow:", error)
        // Optionally show an error to the user
    } finally {
        setIsProcessingFollow(false);
    }
  };
  
  // A celebrity cannot follow/unfollow themselves from this UI (already handled by not showing this page to celebs)
  // if (celebrity.id === currentUserId) return null; // This check is more for robustness

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          <img
            src={celebrity.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(celebrity.username)}&background=random&size=100`}
            alt={celebrity.username}
            className="w-28 h-28 rounded-full object-cover mb-5 border-4 border-primary-200 shadow-md"
          />
          <h3 className="text-xl font-semibold text-gray-800 mb-1">{celebrity.username}</h3>
          {celebrity.bio && (
            <p className="text-xs text-gray-500 mt-1 mb-4 max-w-xs line-clamp-2" title={celebrity.bio}>
              {celebrity.bio}
            </p>
          )}
          <p className="text-sm text-gray-500 mb-5">
            <span className="font-medium text-gray-700">{celebrity.followers.length}</span> Followers
          </p>
          <Button 
            onClick={handleFollow} 
            variant={isFollowing ? 'outline' : 'primary'}
            isLoading={isProcessingFollow}
            disabled={isProcessingFollow}
            size="md"
            fullWidth
            className={isFollowing ? 'border-primary-600 text-primary-600 hover:bg-primary-50' : ''}
          >
            {isProcessingFollow ? (isFollowing ? 'Unfollowing...' : 'Following...') : (isFollowing ? 'Unfollow' : 'Follow')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CelebrityCard;
