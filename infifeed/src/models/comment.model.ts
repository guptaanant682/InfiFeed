import pool from "../config/db";
import { QueryResult } from "pg";

export interface Comment {
  id?: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at?: Date;
  // For API response
  username?: string;
  avatar_url?: string;
}

export interface PaginatedCommentsResponse {
  comments: Comment[];
  next_cursor: string | null;
  has_more: boolean;
}

const parseCommentCursor = (cursor?: string): { timestamp?: string, id?: string } => {
  if (!cursor) return {};
  const parts = cursor.split("_");
  if (parts.length === 2) {
    // Assuming timestamp is epoch ms for comments, similar to posts
    return { timestamp: new Date(parseInt(parts[0], 10)).toISOString(), id: parts[1] };
  }
  return {};
};

export const addComment = async (commentData: { postId: string; userId: string; content: string }): Promise<Comment> => {
  const { postId, userId, content } = commentData;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result: QueryResult = await client.query(
      `INSERT INTO Comments (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, post_id, user_id, content, created_at`,
      [postId, userId, content]
    );
    await client.query("UPDATE Posts SET comments_count = comments_count + 1 WHERE id = $1", [postId]);
    await client.query("COMMIT");

    // Fetch comment with user details
    const newCommentId = result.rows[0].id;
    const newCommentWithAuthor = await pool.query(
      `SELECT c.*, u.username, u.avatar_url
       FROM Comments c
       JOIN Users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [newCommentId]
    );
    return newCommentWithAuthor.rows[0];
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

export const getCommentsByPostId = async (
  postId: string,
  limit: number = 10,
  cursor?: string
): Promise<PaginatedCommentsResponse> => {
  limit = Math.min(Math.max(1, limit), 50);
  const { timestamp: cursorTimestamp, id: cursorId } = parseCommentCursor(cursor);

  let query = `
    SELECT c.id, c.post_id, c.user_id, c.content, c.created_at,
           u.username, u.avatar_url
    FROM Comments c
    JOIN Users u ON c.user_id = u.id
    WHERE c.post_id = $1
  `;
  const queryParams: any[] = [postId];
  let paramIndex = 2;

  if (cursorTimestamp && cursorId) {
    // Comments are usually fetched oldest first, then paginated for "load more"
    // Or newest first for display, then "load older". The prompt implies "nested infinite scroll"
    // Let's assume newest first for comments under a post, similar to posts feed.
    query += ` AND (c.created_at < $${paramIndex++} OR (c.created_at = $${paramIndex-1} AND c.id < $${paramIndex++}))`;
    queryParams.push(cursorTimestamp, cursorId);
  } else if (cursorTimestamp) {
     query += ` AND c.created_at < $${paramIndex++}`;
     queryParams.push(cursorTimestamp);
  }

  // Order by created_at DESC for newest first for comments
  query += ` ORDER BY c.created_at DESC, c.id DESC LIMIT $${paramIndex++}`;
  queryParams.push(limit + 1); // Fetch one extra

  const result: QueryResult = await pool.query(query, queryParams);
  const comments = result.rows;

  let has_more = false;
  if (comments.length > limit) {
    has_more = true;
    comments.pop();
  }

  const next_cursor = comments.length > 0 && has_more
    ? `${new Date(comments[comments.length - 1].created_at).getTime()}_${comments[comments.length - 1].id}`
    : null;

  return { comments, next_cursor, has_more };
};
