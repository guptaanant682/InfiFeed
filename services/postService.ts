
import { type Post, type PaginatedPostsResponse, UserRole, type Comment, type PaginatedCommentsResponse, PostCategory } from '../types';
import { POSTS_PER_PAGE, INITIAL_COMMENTS_DB, COMMENTS_PREVIEW_COUNT, COMMENTS_PER_PAGE } from '../constants';

let postsDB: Post[] = [];
let commentsDB: Record<string, Comment[]> = {}; // Store comments: postId -> Comment[]

type PostUpdateListener = (updatedPost: Post) => void;
const postListeners: PostUpdateListener[] = [];


export const postService = {
  initializePosts: (initialPosts: Post[]): void => {
    postsDB = [...initialPosts].sort((a,b) => b.timestamp - a.timestamp);
    // Initialize commentsDB from constants or ensure it's clean
    commentsDB = JSON.parse(JSON.stringify(INITIAL_COMMENTS_DB)); // Deep copy
    // Ensure all posts in postsDB have their comment counts and latestComments synced with commentsDB
    postsDB.forEach(post => {
        const postComments = commentsDB[post.id] || [];
        post.commentCount = postComments.length;
        post.latestComments = postComments.slice(-COMMENTS_PREVIEW_COUNT).sort((a,b) => a.timestamp - b.timestamp); // show oldest of the latest N, or sort by new in component
        if (!post.category) { // Ensure all posts have a category
            post.category = PostCategory.GENERAL;
        }
    });
  },

  getAllPosts: async (): Promise<Post[]> => {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate delay
    return [...postsDB].sort((a,b) => b.timestamp - a.timestamp);
  },
  
  getFeedPosts: async (
    followedCelebrityIds: string[],
    page: number = 1,
    limit: number = POSTS_PER_PAGE,
    categoryFilter?: PostCategory | 'all'
  ): Promise<PaginatedPostsResponse> => {
    await new Promise(resolve => setTimeout(resolve, 700)); 

    let relevantPosts = postsDB
      .filter(post => followedCelebrityIds.includes(post.userId))
      .sort((a, b) => b.timestamp - a.timestamp);

    if (categoryFilter && categoryFilter !== 'all') {
      relevantPosts = relevantPosts.filter(post => post.category === categoryFilter);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = relevantPosts.slice(startIndex, endIndex);
    
    return {
      posts: paginatedPosts,
      hasMore: endIndex < relevantPosts.length,
      nextCursor: endIndex < relevantPosts.length ? page + 1 : undefined,
    };
  },

  getPostsByUserId: async (userId: string, categoryFilter?: PostCategory | 'all'): Promise<Post[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    let userPosts = postsDB.filter(post => post.userId === userId).sort((a, b) => b.timestamp - a.timestamp);
    if (categoryFilter && categoryFilter !== 'all') {
        userPosts = userPosts.filter(post => post.category === categoryFilter);
    }
    return userPosts;
  },

  createPost: async (
    userId: string, 
    username: string, 
    userProfilePictureUrl: string | undefined, 
    content: string, 
    imageUrls?: string[],
    category?: PostCategory
  ): Promise<Post> => {
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const newPost: Post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      username,
      userProfilePictureUrl,
      content,
      imageUrls,
      timestamp: Date.now(),
      likes: 0,
      commentCount: 0,
      latestComments: [],
      shareCount: 0,
      category: category || PostCategory.GENERAL,
    };
    postsDB = [newPost, ...postsDB]; 
    
    postListeners.forEach(listener => listener(newPost)); // Notify for new post
    
    return newPost;
  },

  // Comments
  addComment: async (
    postId: string, 
    userId: string, 
    username: string, 
    userProfilePictureUrl: string | undefined, 
    content: string
  ): Promise<Comment | null> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const post = postsDB.find(p => p.id === postId);
    if (!post) return null;

    const newComment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      postId,
      userId,
      username,
      userProfilePictureUrl,
      content,
      timestamp: Date.now(),
    };

    if (!commentsDB[postId]) {
      commentsDB[postId] = [];
    }
    commentsDB[postId].push(newComment);
    
    // Update post model
    post.commentCount = commentsDB[postId].length;
    post.latestComments = commentsDB[postId].slice(-COMMENTS_PREVIEW_COUNT).sort((a,b) => a.timestamp - b.timestamp); // update latest comments

    postListeners.forEach(listener => listener(post)); // Notify that post was updated
    return newComment;
  },

  getCommentsByPostId: async (
    postId: string, 
    // page: number = 1, // For future pagination
    // limit: number = COMMENTS_PER_PAGE 
  ): Promise<PaginatedCommentsResponse> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const postComments = commentsDB[postId] || [];
    // const startIndex = (page - 1) * limit;
    // const endIndex = startIndex + limit;
    // const paginatedComments = postComments.slice(startIndex, endIndex).sort((a,b) => a.timestamp - b.timestamp); // older first for display
    
    return {
      // comments: paginatedComments,
      // hasMore: endIndex < postComments.length,
      comments: [...postComments].sort((a,b) => a.timestamp - b.timestamp), // Return all, sorted oldest to newest
      hasMore: false, // For now, load all
    };
  },

  // Share
  incrementShareCount: async (postId: string): Promise<Post | null> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const post = postsDB.find(p => p.id === postId);
    if (post) {
      post.shareCount = (post.shareCount || 0) + 1;
      postListeners.forEach(listener => listener(post)); // Notify that post was updated
      return post;
    }
    return null;
  },
};


export const listenToNewPosts = (callback: PostUpdateListener): (() => void) => {
  postListeners.push(callback);
  return () => { 
    const index = postListeners.indexOf(callback);
    if (index > -1) {
      postListeners.splice(index, 1);
    }
  };
};
