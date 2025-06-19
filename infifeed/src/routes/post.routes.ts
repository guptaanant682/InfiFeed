import { Router } from "express";
import * as PostController from "../controllers/post.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// POST /api/posts - Create a new post
router.post("/", authenticateToken, PostController.createNewPost);

// GET /api/posts - Get all posts (feed) or filter by user_id query param
router.get("/", PostController.getFeedPosts);

// Like/Unlike a post
router.post("/:postId/like", authenticateToken, PostController.likePost);
router.delete("/:postId/like", authenticateToken, PostController.unlikePost);

// Comments on a post
router.post("/:postId/comments", authenticateToken, PostController.addCommentToPost);
router.get("/:postId/comments", PostController.getPostComments); // Typically public

export default router;
