import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import * as UserModel from "../models/user.model";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const SALT_ROUNDS = 10;

export const signup = async (req: Request, res: Response) => {
  const { username, email, password, avatar_url } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email, and password are required" });
  }

  try {
    const existingUserByEmail = await UserModel.findUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const existingUserByUsername = await UserModel.findUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(409).json({ message: "Username already in use" });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await UserModel.createUser({ username, email, password_hash, avatar_url });

    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: "1h" });

    // Return user info without password hash
    const { password_hash: _, ...userWithoutPassword } = newUser;

    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await UserModel.findUserByEmail(email);
    if (!user || !user.password_hash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });

    // Return user info without password hash
    const { password_hash: _, ...userWithoutPassword } = user;

    res.status(200).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};
