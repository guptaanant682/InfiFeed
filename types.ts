
export enum UserRole {
  CELEBRITY = 'CELEBRITY',
  PUBLIC = 'PUBLIC',
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  profilePictureUrl?: string; // Optional
  bio?: string; // Optional, for celebrities
  email?: string; // For potential email/password auth
  phoneNumber?: string; // For phone auth
}

export interface Celebrity extends User {
  role: UserRole.CELEBRITY;
  followers: string[]; // Array of user IDs
}

export interface PublicUser extends User {
  role: UserRole.PUBLIC;
  following: string[]; // Array of celebrity IDs
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  userProfilePictureUrl?: string;
  content: string;
  timestamp: number;
  isTyping?: boolean; // For local typing indicator simulation
}

export enum PostCategory {
  GENERAL = 'General',
  MUSIC = 'Music',
  SPORTS = 'Sports',
  LIFESTYLE = 'Lifestyle',
  TECH = 'Tech',
  FOOD = 'Food',
  ART = 'Art',
  TRAVEL = 'Travel',
}

export interface Post {
  id: string;
  userId: string; // Author's ID
  username: string; // Author's username (denormalized for convenience)
  userProfilePictureUrl?: string;
  content: string;
  imageUrls?: string[]; // Changed from imageUrl to imageUrls for carousel
  timestamp: number; // Unix timestamp
  likes: number; // Simple like count
  commentCount: number;
  latestComments?: Comment[]; // For preview on the card
  shareCount: number;
  category: PostCategory; // Added category
}

export interface Notification {
  id: string;
  userId: string; // User to whom notification belongs
  message: string;
  timestamp: number;
  read: boolean;
  relatedPostId?: string; // Optional: link to a post
  postUrl?: string; // Optional: direct URL to the post for notifications
  relatedConversationId?: string; // Optional: link to a conversation, typically other user's ID for 1-on-1
  type?: 'post' | 'message' | 'system'; // To differentiate notification types
}

// AppView
export type AppView = 
  | 'LOGIN' 
  | 'SIGNUP' // New view for signup
  | 'CELEBRITY_DASHBOARD' 
  | 'PUBLIC_HOME' 
  | 'NOTIFICATIONS' 
  | 'BROWSE_CELEBRITIES'
  | 'MESSAGES'; 

// Simulating API response types
export interface PaginatedPostsResponse {
  posts: Post[];
  hasMore: boolean;
  nextCursor?: string | number; // For pagination
}

export interface PaginatedCommentsResponse {
  comments: Comment[];
  hasMore: boolean; // For future pagination of comments
}

// Messaging Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string; 
  text: string;
  timestamp: number;
  read?: boolean; 
}

export interface Conversation {
  id: string; 
  participantIds: string[];
  lastMessage?: Message;
  unreadCounts: { [userId: string]: number }; 
}
