import { Router } from "express";
import * as PostController from "../controllers/post.controller"; // For getUserPosts
import * as UserController from "../controllers/user.controller"; // For follow/unfollow and profile
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// GET /api/users/:userId/posts - Get posts by a specific user ID
router.get("/:userId/posts", PostController.getUserPosts);

// Follow/Unfollow a user
router.post("/:userId/follow", authenticateToken, UserController.followUser);
router.delete("/:userId/follow", authenticateToken, UserController.unfollowUser);

// Get user profile
router.get("/:userId", UserController.getUserProfile);

export default router;
