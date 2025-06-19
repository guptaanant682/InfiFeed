import pool from "../config/db";
import { QueryResult } from "pg";

// Basic User type - expand as needed
export interface User {
  id?: string;
  username: string;
  email: string;
  password_hash: string;
  avatar_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

export const createUser = async (user: User): Promise<User> => {
  const { username, email, password_hash, avatar_url } = user;
  const result: QueryResult = await pool.query(
    "INSERT INTO Users (username, email, password_hash, avatar_url) VALUES ($1, $2, $3, $4) RETURNING id, username, email, avatar_url, created_at, updated_at",
    [username, email, password_hash, avatar_url]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result: QueryResult = await pool.query("SELECT * FROM Users WHERE email = $1", [email]);
  return result.rows[0] || null;
};

export const findUserByUsername = async (username: string): Promise<User | null> => {
  const result: QueryResult = await pool.query("SELECT * FROM Users WHERE username = $1", [username]);
  return result.rows[0] || null;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const result: QueryResult = await pool.query("SELECT id, username, email, avatar_url, created_at FROM Users WHERE id = $1", [id]);
  return result.rows[0] || null;
};
