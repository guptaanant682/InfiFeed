import pool from "../config/db";
import { QueryResult } from "pg";

export interface Post {
  id?: string;
  user_id: string;
  content: string;
  media_urls?: string[];
  created_at?: Date;
  updated_at?: Date;
  likes_count?: number;
  comments_count?: number;
  // For API response, we will join user details
  username?: string;
  avatar_url?: string;
}

export interface PaginatedPostsResponse {
  posts: Post[];
  next_cursor: string | null;
  has_more: boolean;
}

// Helper to parse cursor
const parseCursor = (cursor?: string): { timestamp?: string, id?: string } => {
  if (!cursor) return {};
  const parts = cursor.split("_");
  if (parts.length === 2) {
    return { timestamp: new Date(parseInt(parts[0], 10)).toISOString(), id: parts[1] };
  }
  return {}; // Invalid cursor
};

export const createPost = async (postData: { user_id: string; content: string; media_urls?: string[] }): Promise<Post> => {
  const { user_id, content, media_urls } = postData;
  const result: QueryResult = await pool.query(
    `INSERT INTO Posts (user_id, content, media_urls)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, content, media_urls, created_at, updated_at, likes_count, comments_count`,
    [user_id, content, media_urls ? JSON.stringify(media_urls) : null]
  );
  // Fetch the post with user details for immediate response consistency
  const newPostId = result.rows[0].id;
  const newPostWithAuthor = await pool.query(
    `SELECT p.*, u.username, u.avatar_url
     FROM Posts p
     JOIN Users u ON p.user_id = u.id
     WHERE p.id = $1`,
    [newPostId]
  );
  return newPostWithAuthor.rows[0];
};

export const getPosts = async (
  limit: number = 20,
  cursor?: string,
  filterUserId?: string
): Promise<PaginatedPostsResponse> => {
  limit = Math.min(Math.max(1, limit), 50); // Enforce limit bounds
  const { timestamp: cursorTimestamp, id: cursorId } = parseCursor(cursor);

  let query = `
    SELECT p.id, p.user_id, p.content, p.media_urls, p.created_at, p.likes_count, p.comments_count,
           u.username, u.avatar_url
    FROM Posts p
    JOIN Users u ON p.user_id = u.id
  `;
  const queryParams: any[] = [];
  let conditionIndex = 1;
  let conditions = "";

  if (filterUserId) {
    conditions += `p.user_id = $${conditionIndex++}`;
    queryParams.push(filterUserId);
  }

  if (cursorTimestamp && cursorId) {
    if (conditions) conditions += " AND ";
    conditions += `(p.created_at < $${conditionIndex++} OR (p.created_at = $${conditionIndex-1} AND p.id < $${conditionIndex++}))`;
    queryParams.push(cursorTimestamp, cursorId);
  } else if (cursorTimestamp) { // Fallback if only timestamp somehow provided (though our format is timestamp_id)
    if (conditions) conditions += " AND ";
    conditions += `p.created_at < $${conditionIndex++}`;
    queryParams.push(cursorTimestamp);
  }

  if (conditions) {
    query += " WHERE " + conditions;
  }

  query += ` ORDER BY p.created_at DESC, p.id DESC LIMIT $${conditionIndex++}`;
  queryParams.push(limit + 1); // Fetch one extra to check for has_more

  const result: QueryResult = await pool.query(query, queryParams);
  const posts = result.rows;

  let has_more = false;
  if (posts.length > limit) {
    has_more = true;
    posts.pop(); // Remove the extra one
  }

  const next_cursor = posts.length > 0 && has_more
    ? `${new Date(posts[posts.length - 1].created_at).getTime()}_${posts[posts.length - 1].id}`
    : null;

  return {
    posts: posts.map(p => ({...p, media_urls: typeof p.media_urls === "string" ? JSON.parse(p.media_urls) : p.media_urls })), // Ensure media_urls is array
    next_cursor,
    has_more,
  };
};
