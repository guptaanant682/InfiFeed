import React from 'react';
import { type Post, type User } from '../../types';
import PostCard from './PostCard';
import Spinner from '../Common/Spinner';

interface PostListProps {
  posts: Post[];
  isLoading?: boolean;
  emptyMessage?: string;
  listContext?: 'feed' | 'my-posts' | 'celebrity-profile';
  currentUser: User | null; // Added to pass to PostCard for comment/share context
}

const PostList: React.FC<PostListProps> = ({ 
  posts, 
  isLoading = false, 
  emptyMessage = "No posts to display.", 
  listContext = "feed",
  currentUser 
}) => {
  if (isLoading && posts.length === 0) {
    return (
      <div className="text-center py-12">
        <Spinner size="lg" />
        <p className="text-gray-500 mt-4 text-lg">Loading posts...</p>
      </div>
    );
  }

  if (!isLoading && posts.length === 0) {
    let specificMessage = emptyMessage;
    if (listContext === 'feed') {
        specificMessage = "Your feed is empty. Follow some celebrities to see their posts here!";
    } else if (listContext === 'my-posts') {
        specificMessage = "You haven't created any posts yet. Why not share something?"
    }

    return (
      <div className="text-center py-12 bg-white rounded-lg shadow p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500 text-lg">{specificMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUser={currentUser} />
      ))}
    </div>
  );
};

export default PostList;
