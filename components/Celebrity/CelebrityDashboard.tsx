
import React, { useState, useEffect } from 'react';
import { type Celebrity, type Post, type User, PostCategory } from '../../types';
import PostForm from '../Posts/PostForm';
import PostList from '../Posts/PostList';
import { postService, listenToNewPosts } from '../../services/postService';
import Spinner from '../Common/Spinner';
// import Button from '../Common/Button'; // If adding category filter
// import { POST_CATEGORIES } from '../../constants'; // If adding category filter


// Example: If CategoryFilter was added here (similar to PublicHome)
// interface CategoryFilterProps {
//   selectedCategory: PostCategory | 'all';
//   onSelectCategory: (category: PostCategory | 'all') => void;
// }
// const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onSelectCategory }) => { ... };


interface CelebrityDashboardProps {
  celebrity: Celebrity;
  onCreatePost: (content: string, imageUrls?: string[], category?: PostCategory) => Promise<void>;
  currentUser: User | null; 
}

const CelebrityDashboard: React.FC<CelebrityDashboardProps> = ({ celebrity, onCreatePost, currentUser }) => {
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(true);
  // const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'all'>('all'); // If adding filter

  useEffect(() => {
    const fetchMyPosts = async (): Promise<void> => {
      setIsLoadingPosts(true);
      // const userPosts = await postService.getPostsByUserId(celebrity.id, selectedCategory); // If adding filter
      const userPosts = await postService.getPostsByUserId(celebrity.id);
      setMyPosts(userPosts.sort((a,b) => b.timestamp - a.timestamp));
      setIsLoadingPosts(false);
    };
    fetchMyPosts();

    const unsubscribe = listenToNewPosts((updatedPost) => {
      // const matchesCategory = selectedCategory === 'all' || updatedPost.category === selectedCategory; // If adding filter

      if (updatedPost.userId === celebrity.id) { // && matchesCategory) { // Check category if filter applied
        setMyPosts(prevPosts => {
            const existingPostIndex = prevPosts.findIndex(p => p.id === updatedPost.id);
            if (existingPostIndex !== -1) {
                const newPosts = [...prevPosts];
                newPosts[existingPostIndex] = updatedPost;
                return newPosts.sort((a,b) => b.timestamp - a.timestamp);
            } else {
                 // Check if it's a new post (not an update to an *already filtered out* one)
                if (!myPosts.find(p=>p.id === updatedPost.id)) { // Ensure it wasn't there before filtering
                    return [updatedPost, ...prevPosts].sort((a,b) => b.timestamp - a.timestamp);
                }
            }
            return prevPosts;
        });
      }
      // If a post category changes and it no longer matches, it might need to be removed from list
      // This part can get complex with local filters and real-time updates.
      // For now, new/updated posts matching the current filter (if any) are handled.
    });
    return () => unsubscribe();

  // }, [celebrity.id, myPosts, selectedCategory]); // myPosts removed, add selectedCategory if filter is implemented
  }, [celebrity.id, myPosts]); // Re-fetch/re-filter if category changes

  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row items-center sm:items-start">
            <img 
              src={celebrity.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(celebrity.username)}&background=random&size=128`}
              alt={celebrity.username} 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mr-0 sm:mr-8 mb-4 sm:mb-0 border-4 border-primary-300 shadow-md"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">{celebrity.username}</h1>
              <p className="text-primary-600 font-medium text-lg">{celebrity.role}</p>
              {celebrity.bio && <p className="text-sm text-gray-600 mt-2 max-w-xl">{celebrity.bio}</p>}
              <div className="mt-4 flex items-center justify-center sm:justify-start space-x-4 text-sm text-gray-500">
                <div>
                  <span className="font-semibold text-gray-700">{celebrity.followers.length}</span> Followers
                </div>
              </div>
            </div>
          </div>
        </header>

      <PostForm onCreatePost={onCreatePost} />
      
      <section className="mt-10 sm:mt-12">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">My Posts</h2>
            {/* Optional: Add CategoryFilter here */}
            {/* <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} /> */}
        </div>
        {isLoadingPosts && myPosts.length === 0 ? (
          <div className="text-center py-10">
            <Spinner size="lg"/>
            <p className="mt-3 text-gray-500">Loading your posts...</p>
          </div>
        ) : (
          <PostList 
            posts={myPosts} 
            isLoading={isLoadingPosts} 
            emptyMessage="You haven't created any posts yet. Share your first update!" 
            listContext="my-posts"
            currentUser={currentUser}
          />
        )}
      </section>
    </div>
  );
};

export default CelebrityDashboard;
