import { Response } from "express";
import * as PostModel from "../models/post.model";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import * as LikeModel from "../models/like.model";
import * as CommentModel from "../models/comment.model";
import redisClient from "../config/redis";

// --- New version of createNewPost with cache invalidation ---
export const createNewPost = async (req: AuthenticatedRequest, res: Response) => {
  const { content, media_urls } = req.body;
    // TODO: Media Upload Handling
    // If media_urls were actual files (e.g., from a multipart/form-data request),
    // a file upload service would be called here.
    // Example:
    // if (req.files && req.files.length > 0) {
    //   const uploadedUrls = await fileUploadService.uploadFiles(req.files);
    //   processed_media_urls = uploadedUrls; // Use these URLs for the post
    // } else {
    //   processed_media_urls = media_urls; // Assuming pre-uploaded URLs if no files sent
    // }
    // For now, we assume media_urls are already strings (pre-uploaded URLs).
  const user_id = req.user?.id;

  if (!user_id) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  try {
    const post = await PostModel.createPost({ user_id, content, media_urls });

    if (redisClient) {
      console.log("Invalidating post caches for user:", user_id);
      const generalFeedCacheKey = `feed:general::20:`; // Matches default general feed
      const userFeedCacheKey = `feed:user:${user_id}::20`; // Matches default user feed
      try {
        await redisClient.del(generalFeedCacheKey);
        await redisClient.del(userFeedCacheKey);
        // Consider invalidating paginated versions too if they are common
        // e.g. by using a pattern like redisClient.keys(`feed:general:*`) but carefully.
      } catch (err) {
        console.error("Redis DEL error during cache invalidation:", err);
      }
    }

    res.status(201).json(post);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Error creating post" });
  }
};

// --- New version of getFeedPosts with caching ---
export const getFeedPosts = async (req: AuthenticatedRequest, res: Response) => {
  const { cursor, limit: queryLimit, user_id: filterUserId } = req.query;
  const limit = queryLimit ? parseInt(queryLimit as string, 10) : 20;
  const cacheTTL = 60; // Cache for 1 minute

  const cursorStr = cursor || "";
  const filterUserIdStr = filterUserId || "";
  // Ensure consistent key format: general feed includes the empty filterUserIdStr for uniqueness vs user feed
  const cacheKey = filterUserId
    ? `feed:user:${filterUserIdStr}:${cursorStr}:${limit}`
    : `feed:general:${cursorStr}:${limit}:${filterUserIdStr}`;


  if (redisClient) {
    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log(`Cache HIT for key: ${cacheKey}`);
        return res.status(200).json(JSON.parse(cachedData));
      }
      console.log(`Cache MISS for key: ${cacheKey}`);
    } catch (err) {
      console.error("Redis GET error:", err);
    }
  }

  try {
    const result = await PostModel.getPosts(limit, cursor as string | undefined, filterUserId as string | undefined);
    if (redisClient && result.posts.length > 0) {
      try {
        await redisClient.set(cacheKey, JSON.stringify(result), "EX", cacheTTL);
      } catch (err) {
        console.error("Redis SET error:", err);
      }
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Get feed posts error:", error);
    res.status(500).json({ message: "Error fetching posts" });
  }
};

// --- New version of getUserPosts with caching ---
export const getUserPosts = async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params; // This is the user whose posts are being fetched
  const { cursor, limit: queryLimit } = req.query;
  const limit = queryLimit ? parseInt(queryLimit as string, 10) : 20;
  const cacheTTL = 60; // Cache for 1 minute

  if (!userId) {
    return res.status(400).json({ message: "User ID parameter is required" });
  }

  const cursorStr = cursor || "";
  const cacheKey = `feed:user:${userId}:${cursorStr}:${limit}`;

  if (redisClient) {
    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log(`Cache HIT for key: ${cacheKey}`);
        return res.status(200).json(JSON.parse(cachedData));
      }
      console.log(`Cache MISS for key: ${cacheKey}`);
    } catch (err) {
      console.error("Redis GET error:", err);
    }
  }

  try {
    // Pass `userId` from `req.params` as the `filterUserId` to `PostModel.getPosts`
    const result = await PostModel.getPosts(limit, cursor as string | undefined, userId);
    if (redisClient && result.posts.length > 0) {
      try {
        await redisClient.set(cacheKey, JSON.stringify(result), "EX", cacheTTL);
      } catch (err) {
        console.error("Redis SET error:", err);
      }
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({ message: "Error fetching user posts" });
  }
};

// --- Kept original versions of likePost, unlikePost, addCommentToPost, getPostComments ---
export const likePost = async (req: AuthenticatedRequest, res: Response) => {
  const postId = req.params.postId;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "User not authenticated" });
  if (!postId) return res.status(400).json({ message: "Post ID is required" });

  try {
    await LikeModel.addLike(userId, postId);
    res.status(200).json({ message: "Post liked successfully" });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ message: "Error liking post" });
  }
};

export const unlikePost = async (req: AuthenticatedRequest, res: Response) => {
  const postId = req.params.postId;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "User not authenticated" });
  if (!postId) return res.status(400).json({ message: "Post ID is required" });

  try {
    await LikeModel.removeLike(userId, postId);
    res.status(200).json({ message: "Post unliked successfully" });
  } catch (error) {
    console.error("Unlike post error:", error);
    res.status(500).json({ message: "Error unliking post" });
  }
};

export const addCommentToPost = async (req: AuthenticatedRequest, res: Response) => {
  const postId = req.params.postId;
  const userId = req.user?.id;
  const { content } = req.body;

  if (!userId) return res.status(401).json({ message: "User not authenticated" });
  if (!postId) return res.status(400).json({ message: "Post ID is required" });
  if (!content) return res.status(400).json({ message: "Comment content is required" });

  try {
    const comment = await CommentModel.addComment({ postId, userId, content });
    // Consider cache invalidation for comments on this post if comments are cached
    res.status(201).json(comment);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
};

export const getPostComments = async (req: AuthenticatedRequest, res: Response) => {
  const { postId } = req.params;
  const { cursor, limit: queryLimit } = req.query;
  const limit = queryLimit ? parseInt(queryLimit as string, 10) : 10;

  if (!postId) return res.status(400).json({ message: "Post ID is required" });

  // Consider caching for comments here as well, similar to posts
  // const cacheKey = `comments:${postId}:${cursor || ""}:${limit}`;
  // ... caching logic ...

  try {
    const result = await CommentModel.getCommentsByPostId(postId, limit, cursor as string | undefined);
    // ... cache set logic ...
    res.status(200).json(result);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Error fetching comments" });
  }
};
