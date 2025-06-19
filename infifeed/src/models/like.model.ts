import pool from "../config/db";
import { QueryResult } from "pg";

export const addLike = async (userId: string, postId: string): Promise<void> => {
  // Use a transaction to ensure atomicity: add like and update count
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Add to Likes table, ignore if already exists (ON CONFLICT DO NOTHING)
    // This query ensures we only update if the like was newly inserted.
    const insertRes = await client.query(
        "INSERT INTO Likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT (user_id, post_id) DO NOTHING RETURNING *" ,
        [userId, postId]
    );
    if (insertRes.rowCount > 0) { // A row was inserted
        await client.query("UPDATE Posts SET likes_count = likes_count + 1 WHERE id = $1", [postId]);
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

export const removeLike = async (userId: string, postId: string): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const deleteRes = await client.query("DELETE FROM Likes WHERE user_id = $1 AND post_id = $2 RETURNING *", [userId, postId]);
    if (deleteRes.rowCount > 0) { // A row was deleted
        await client.query("UPDATE Posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1", [postId]);
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

export const checkUserLike = async (userId: string, postId: string): Promise<boolean> => {
  const result: QueryResult = await pool.query(
    "SELECT 1 FROM Likes WHERE user_id = $1 AND post_id = $2",
    [userId, postId]
  );
  return result.rowCount > 0;
};
