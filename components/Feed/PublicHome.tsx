
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { type PublicUser, type Post, type PaginatedPostsResponse, type User, PostCategory } from '../../types';
import { postService, listenToNewPosts } from '../../services/postService';
import PostList from '../Posts/PostList';
import Spinner from '../Common/Spinner';
import { POSTS_PER_PAGE, POST_CATEGORIES } from '../../constants';
import Button from '../Common/Button'; // For category filter buttons

interface CategoryFilterProps {
  selectedCategory: PostCategory | 'all';
  onSelectCategory: (category: PostCategory | 'all') => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onSelectCategory }) => {
  const categories: (PostCategory | 'all')[] = ['all', ...POST_CATEGORIES];
  return (
    <div className="mb-6 sm:mb-8 flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium text-gray-600 mr-2">Filter by:</span>
      {categories.map(category => (
        <Button
          key={category}
          onClick={() => onSelectCategory(category)}
          variant={selectedCategory === category ? 'primary' : 'outline'}
          size="sm"
          className={selectedCategory === category ? '' : 'text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'}
        >
          {category === 'all' ? 'All' : category}
        </Button>
      ))}
    </div>
  );
};


interface PublicHomeProps {
  publicUser: PublicUser;
  currentUser: User | null; 
}

const PublicHome: React.FC<PublicHomeProps> = ({ publicUser, currentUser }) => {
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const observer = useRef<IntersectionObserver | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'all'>('all');


  const loadMorePosts = useCallback(async (isInitialLoad = false, categoryChanged = false) => {
    if ((isLoading || !hasMore) && !categoryChanged) return;

    setIsLoading(true);
    const pageToFetch = categoryChanged ? 1 : currentPage;

    try {
      const response: PaginatedPostsResponse = await postService.getFeedPosts(
        publicUser.following,
        pageToFetch,
        POSTS_PER_PAGE,
        selectedCategory
      );
      
      setFeedPosts(prevPosts => {
        const newPosts = response.posts.filter(p => !(categoryChanged ? [] : prevPosts).some(ep => ep.id === p.id));
        return (isInitialLoad || categoryChanged) ? newPosts : [...prevPosts, ...newPosts];
      });
      setHasMore(response.hasMore);
      if (response.hasMore) {
        setCurrentPage(pageToFetch + 1);
      } else {
        setCurrentPage(pageToFetch); // Stay on current page if no more, or last page fetched
      }
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setIsLoading(false);
      if(isInitialLoad || categoryChanged) setInitialLoadDone(true);
    }
  }, [isLoading, hasMore, publicUser.following, currentPage, selectedCategory]);

  useEffect(() => {
    // Reset and load for user changes or category changes
    setFeedPosts([]); 
    setCurrentPage(1); 
    setHasMore(true); 
    setInitialLoadDone(false);
    if (publicUser.following.length > 0) {
        loadMorePosts(true, true); // true for initialLoad, true for categoryChanged (or equivalent to reset)
    } else {
        setInitialLoadDone(true); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicUser.following, selectedCategory]); // Reload if followed list or category changes


  useEffect(() => {
    const unsubscribe = listenToNewPosts((updatedPost) => {
        // Only add/update if it matches current filter (or if it's an update to an existing one)
        const matchesCategory = selectedCategory === 'all' || updatedPost.category === selectedCategory;
        const isFollowed = publicUser.following.includes(updatedPost.userId);

        setFeedPosts(prevPosts => {
            const existingPostIndex = prevPosts.findIndex(p => p.id === updatedPost.id);
            if (existingPostIndex !== -1) { // Post exists, update it
                if (!isFollowed || !matchesCategory) return prevPosts.filter(p => p.id !== updatedPost.id); // Remove if no longer matches
                const newPosts = [...prevPosts];
                newPosts[existingPostIndex] = updatedPost;
                return newPosts;
            } else if (isFollowed && matchesCategory) { // New post that matches filters
                return [updatedPost, ...prevPosts].sort((a,b) => b.timestamp - a.timestamp); // Add and re-sort (or just prepend)
            }
            return prevPosts; // No change
        });
    });
    return () => unsubscribe();
  }, [selectedCategory, publicUser.following]);


  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && initialLoadDone) { 
        loadMorePosts();
      }
    }, { threshold: 0.8, rootMargin: "0px 0px 200px 0px" }); 
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadMorePosts, initialLoadDone]);

  if (!initialLoadDone && publicUser.following.length > 0) {
     return (
        <div className="text-center py-20">
            <Spinner size="lg" />
            <p className="text-gray-500 mt-4 text-lg">Loading your personalized feed...</p>
        </div>
     );
  }

  if (publicUser.following.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-lg shadow-md p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-primary-300 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Your Feed is Quiet</h2>
        <p className="text-gray-500 mb-6">Follow celebrities to see their latest posts here. Find them in "Browse Stars"!</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">Your Feed</h1>
      <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      <PostList 
        posts={feedPosts} 
        isLoading={isLoading && feedPosts.length === 0} 
        emptyMessage={selectedCategory === 'all' ? "No posts from celebrities you follow yet." : `No posts in the '${selectedCategory}' category from celebrities you follow.`} 
        listContext="feed"
        currentUser={currentUser}
      />
      
      {isLoading && feedPosts.length > 0 && (
        <div className="text-center py-8">
            <Spinner />
            <p className="text-sm text-gray-500 mt-2">Loading more posts...</p>
        </div>
      )}
      
      {!isLoading && hasMore && feedPosts.length > 0 && (
         <div ref={lastPostElementRef} className="h-10" aria-hidden="true"></div>
      )}

      {!isLoading && !hasMore && feedPosts.length > 0 && (
        <p className="text-center text-gray-500 py-10 text-lg">
            🎉 You've caught up with all posts! 🎉
        </p>
      )}
    </div>
  );
};

export default PublicHome;
