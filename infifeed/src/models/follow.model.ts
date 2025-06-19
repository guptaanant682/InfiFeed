import pool from "../config/db";
import { QueryResult } from "pg";

export const addFollow = async (followerId: string, followingId: string): Promise<boolean> => {
  if (followerId === followingId) {
    throw new Error("User cannot follow themselves.");
  }
  // ON CONFLICT DO NOTHING will prevent duplicates and errors if relationship already exists
  const result: QueryResult = await pool.query(
    "INSERT INTO Follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT (follower_id, following_id) DO NOTHING RETURNING *",
    [followerId, followingId]
  );
  return result.rowCount > 0; // True if a new follow was actually inserted
};

export const removeFollow = async (followerId: string, followingId: string): Promise<boolean> => {
  const result: QueryResult = await pool.query(
    "DELETE FROM Follows WHERE follower_id = $1 AND following_id = $2 RETURNING *",
    [followerId, followingId]
  );
  return result.rowCount > 0; // True if a follow was actually deleted
};

export const checkFollow = async (followerId: string, followingId: string): Promise<boolean> => {
  const result: QueryResult = await pool.query(
    "SELECT 1 FROM Follows WHERE follower_id = $1 AND following_id = $2",
    [followerId, followingId]
  );
  return result.rowCount > 0;
};
