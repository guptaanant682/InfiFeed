import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import * as FollowModel from "../models/follow.model";
import * as UserModel from "../models/user.model"; // For fetching user details

// Placeholder for other user-related functions like get profile
export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    try {
        const user = await UserModel.findUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Exclude sensitive data like password_hash if it was fetched
        const { password_hash, ...userProfile } = user;
        res.status(200).json(userProfile);
    } catch (error) {
        console.error("Get user profile error:", error);
        res.status(500).json({ message: "Error fetching user profile" });
    }
};


export const followUser = async (req: AuthenticatedRequest, res: Response) => {
  const followingId = req.params.userId; // The user to be followed
  const followerId = req.user?.id;    // The authenticated user doing the following

  if (!followerId) return res.status(401).json({ message: "User not authenticated" });
  if (!followingId) return res.status(400).json({ message: "User ID to follow is required" });
  if (followerId === followingId) return res.status(400).json({ message: "Cannot follow yourself" });

  try {
    const success = await FollowModel.addFollow(followerId, followingId);
    if (!success) { // Relation might already exist
        // Check if already following to give specific message or just 200
        const alreadyFollowing = await FollowModel.checkFollow(followerId, followingId);
        if (alreadyFollowing) return res.status(200).json({ message: "Already following this user" });
    }
    res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    console.error("Follow user error:", error);
    if (error.message === "User cannot follow themselves.") { // From model check
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Error following user" });
  }
};

export const unfollowUser = async (req: AuthenticatedRequest, res: Response) => {
  const followingId = req.params.userId; // The user to be unfollowed
  const followerId = req.user?.id;     // The authenticated user doing the unfollowing

  if (!followerId) return res.status(401).json({ message: "User not authenticated" });
  if (!followingId) return res.status(400).json({ message: "User ID to unfollow is required" });

  try {
    const success = await FollowModel.removeFollow(followerId, followingId);
    // if (!success) return res.status(404).json({ message: "Not following this user or user not found" });
    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (error) {
    console.error("Unfollow user error:", error);
    res.status(500).json({ message: "Error unfollowing user" });
  }
};
