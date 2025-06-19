
import React, { useState, useEffect } from 'react';
import { type Post, type Comment as CommentType, type User, PostCategory } from '../../types';
import ImageWithLazyLoad from '../Common/ImageWithLazyLoad';
import { postService } from '../../services/postService';
import AddCommentForm from './AddCommentForm';
import CommentItem from './CommentItem';
import Spinner from '../Common/Spinner';
import Button from '../Common/Button';
import Toast from '../Common/Toast';
import CategoryTag from '../Common/CategoryTag'; // New component

interface PostCardProps {
  post: Post;
  currentUser: User | null;
}

const PostCard: React.FC<PostCardProps> = ({ post: initialPost, currentUser }) => {
  const [post, setPost] = useState<Post>(initialPost);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentType[]>(initialPost.latestComments || []);
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(false);
  const [allCommentsLoaded, setAllCommentsLoaded] = useState<boolean>((initialPost.latestComments?.length || 0) === initialPost.commentCount);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // For image carousel
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // For typing indicator
  const [isSomeoneTypingComment, setIsSomeoneTypingComment] = useState<boolean>(false);

  useEffect(() => {
    setPost(initialPost);
    setComments(initialPost.latestComments || []);
    setAllCommentsLoaded((initialPost.latestComments?.length || 0) === initialPost.commentCount);
    setCurrentImageIndex(0); // Reset image index if post changes
  }, [initialPost]);


  const timeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleToggleComments = (): void => {
    setShowComments(!showComments);
    if (!showComments && !allCommentsLoaded && post.commentCount > (post.latestComments?.length || 0) ) {
      handleLoadAllComments();
    }
  };

  const handleLoadAllComments = async (): Promise<void> => {
    if (allCommentsLoaded || isLoadingComments) return;
    setIsLoadingComments(true);
    try {
      const response = await postService.getCommentsByPostId(post.id);
      setComments(response.comments);
      setAllCommentsLoaded(true);
    } catch (error) {
      console.error("Failed to load comments:", error);
      setToastMessage("Error loading comments.");
      setToastType("error");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleAddComment = async (content: string): Promise<void> => {
    if (!currentUser || !content.trim()) return;
    setIsSomeoneTypingComment(false); // Stop typing indicator on submit
    try {
      const newComment = await postService.addComment(
        post.id,
        currentUser.id,
        currentUser.username,
        currentUser.profilePictureUrl,
        content
      );
      if (newComment) {
        setComments(prevComments => [...prevComments, newComment].sort((a,b)=> a.timestamp - b.timestamp));
        setPost(prevPost => ({
            ...prevPost,
            commentCount: (prevPost.commentCount || 0) + 1,
        }));
        if (post.commentCount + 1 === comments.length +1 ) {
             setAllCommentsLoaded(true);
        }
        setToastMessage("Comment posted!");
        setToastType("success");
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      setToastMessage("Failed to post comment.");
      setToastType("error");
    }
  };

  const handleShare = async (): Promise<void> => {
    const postUrl = `${window.location.origin}${window.location.pathname}#post-${post.id}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(postUrl);
        setToastMessage("Link copied to clipboard!");
        setToastType("success");
      } else {
        // Fallback for browsers that don't support clipboard API well or if in insecure context
        setToastMessage("Link: " + postUrl + " (Copy manually)");
        setToastType("info");
      }
      const updatedPost = await postService.incrementShareCount(post.id);
      if (updatedPost) {
        setPost(updatedPost);
      }
    } catch (error) {
      console.error("Failed to share post or copy link:", error);
      setToastMessage("Failed to share. Link: " + postUrl);
      setToastType("error");
    }
  };

  const handleTypingComment = (isTyping: boolean) => {
    setIsSomeoneTypingComment(isTyping);
  };
  
  const nextImage = () => {
    if (post.imageUrls && post.imageUrls.length > 1) {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % post.imageUrls!.length);
    }
  };

  const prevImage = () => {
    if (post.imageUrls && post.imageUrls.length > 1) {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + post.imageUrls!.length) % post.imageUrls!.length);
    }
  };


  return (
    <>
      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />}
      <article className="bg-white shadow-lg rounded-xl overflow-hidden mb-6 sm:mb-8 transition-all duration-300 ease-in-out hover:shadow-xl" id={`post-${post.id}`}>
        <div className="p-4 sm:p-5">
          <header className="flex items-center mb-3">
            <img
              src={post.userProfilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.username)}&background=random&size=48`}
              alt={post.username}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover mr-3 sm:mr-4 border-2 border-primary-100"
            />
            <div>
              <h3 className="font-semibold text-gray-800 text-md sm:text-lg leading-tight">{post.username}</h3>
              <p className="text-xs text-gray-500">{timeAgo(post.timestamp)}</p>
            </div>
          </header>
          {post.category && <CategoryTag category={post.category} className="mb-2 ml-1 sm:ml-0" />}
          <div className="text-gray-700 mb-4 whitespace-pre-line text-sm sm:text-base leading-relaxed break-words">
            {post.content}
          </div>
        </div>

        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="bg-gray-100 relative">
            <ImageWithLazyLoad
              src={post.imageUrls[currentImageIndex]}
              alt={`Image ${currentImageIndex + 1} for post by ${post.username}`}
              className="w-full h-auto max-h-[600px] object-contain sm:object-cover"
              aspectRatio="aspect-video"
            />
            {post.imageUrls.length > 1 && (
              <>
                <Button 
                    onClick={prevImage} 
                    variant="secondary" 
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 !p-2 rounded-full !shadow-md opacity-70 hover:opacity-100"
                    aria-label="Previous image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </Button>
                <Button 
                    onClick={nextImage}
                    variant="secondary"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 !p-2 rounded-full !shadow-md opacity-70 hover:opacity-100"
                    aria-label="Next image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5 p-1 bg-black/40 rounded-full">
                    {post.imageUrls.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white scale-125' : 'bg-gray-300/70 hover:bg-white/70'}`}
                            aria-label={`Go to image ${index + 1}`}
                        ></button>
                    ))}
                </div>
              </>
            )}
          </div>
        )}

        <footer className="p-4 sm:p-5 border-t border-gray-100">
          <div className="flex items-center justify-start space-x-5 text-gray-600">
            <button
              className="flex items-center text-red-500 hover:text-red-600 transition-colors duration-150 group"
              aria-label={`Like post, current likes: ${post.likes}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-[22px] sm:w-[22px] mr-1.5 group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{post.likes}</span>
              <span className="ml-1 text-xs hidden sm:inline">Likes</span>
            </button>
            <button
              onClick={handleToggleComments}
              className="flex items-center text-gray-500 hover:text-primary-600 transition-colors duration-150 group"
              aria-label={`View comments, ${post.commentCount} comments`}
              aria-expanded={showComments}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-[22px] sm:w-[22px] mr-1.5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium">{post.commentCount}</span>
              <span className="ml-1 text-xs hidden sm:inline">Comments</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center text-gray-500 hover:text-primary-600 transition-colors duration-150 group"
              aria-label={`Share post, ${post.shareCount} shares`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-[22px] sm:w-[22px] mr-1.5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span className="text-sm font-medium">{post.shareCount}</span>
              <span className="ml-1 text-xs hidden sm:inline">Shares</span>
            </button>
          </div>
        </footer>

        {showComments && (
          <section className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/50">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Comments ({post.commentCount})</h4>
            {currentUser && <AddCommentForm onSubmit={handleAddComment} onTyping={handleTypingComment} />}
            {isSomeoneTypingComment && (
                <p className="text-xs text-gray-500 italic mt-1 ml-1 animate-pulse-subtle">Someone is typing...</p>
            )}
            <div className="mt-3 space-y-3 max-h-96 overflow-y-auto pr-2">
              {comments.length > 0 ? (
                comments.map(comment => <CommentItem key={comment.id} comment={comment} />)
              ) : (
                !isLoadingComments && <p className="text-xs text-gray-500">No comments yet. Be the first!</p>
              )}
              {isLoadingComments && (
                <div className="flex justify-center py-3"><Spinner size="sm" /></div>
              )}
            </div>
            {!allCommentsLoaded && post.commentCount > comments.length && !isLoadingComments && (
              <Button 
                onClick={handleLoadAllComments} 
                variant="ghost" 
                size="sm" 
                className="mt-3 text-primary-600 hover:text-primary-700 w-full"
              >
                View all {post.commentCount} comments
              </Button>
            )}
          </section>
        )}
      </article>
    </>
  );
};

export default PostCard;
