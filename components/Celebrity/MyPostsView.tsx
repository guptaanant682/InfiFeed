
// This component's functionality is largely integrated into CelebrityDashboard.tsx for simplicity.
// If a separate view for "My Posts" was strictly required, it would look like this:

import React from 'react';
import { type Post, type User } from '../../types';
import PostList from '../Posts/PostList';

interface MyPostsViewProps {
  posts: Post[];
  isLoading: boolean;
  currentUser: User | null; // Added currentUser prop
}

const MyPostsView: React.FC<MyPostsViewProps> = ({ posts, isLoading, currentUser }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Posts</h2>
      <PostList 
        posts={posts} 
        isLoading={isLoading} 
        emptyMessage="You haven't created any posts yet." 
        currentUser={currentUser} // Pass currentUser to PostList
      />
    </div>
  );
};

export default MyPostsView;