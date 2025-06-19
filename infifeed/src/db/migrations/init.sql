-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON Users(username);

-- Posts Table
CREATE TABLE IF NOT EXISTS Posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0
);

-- Index for cursor-based pagination and fetching user posts
CREATE INDEX IF NOT EXISTS idx_posts_created_at_id ON Posts(created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id_created_at_id ON Posts(user_id, created_at DESC, id DESC);

-- Comments Table
CREATE TABLE IF NOT EXISTS Comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES Posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for fetching comments for a post
CREATE INDEX IF NOT EXISTS idx_comments_post_id_created_at_id ON Comments(post_id, created_at ASC, id ASC);

-- Likes Table (Junction table for User-Post likes)
CREATE TABLE IF NOT EXISTS Likes (
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES Posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

-- Index for quickly checking if a user liked a post and for counting likes
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON Likes(post_id);

-- Follows Table (Junction table for User-User follows)
CREATE TABLE IF NOT EXISTS Follows (
    follower_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE, -- User who is following
    following_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE, -- User who is being followed
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id)
);

-- Indexes for follow relationships
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON Follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON Follows(following_id);

-- Triggers to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_users_updated_at
BEFORE UPDATE ON Users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_posts_updated_at
BEFORE UPDATE ON Posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_comments_updated_at
BEFORE UPDATE ON Comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Triggers to update counts (Optional, can be handled by application logic too, but good for data integrity)
-- Example: Increment/decrement likes_count on Posts table when a like is added/removed
-- For simplicity in this step, we'll rely on application logic to update these counters.
-- If performance becomes an issue or strict data integrity via DB is preferred, these can be added.

-- Example trigger for likes_count (Consider if needed vs application logic)
/*
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE Posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE Posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL; -- result is ignored since this is an AFTER trigger
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER likes_count_trigger
AFTER INSERT OR DELETE ON Likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();
*/

-- Similar trigger can be created for comments_count on Posts table.

SELECT 'Database schema initialized successfully.' AS status;
