import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { readDb, writeDb, User, generateId } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'throne-light-secret-key-change-in-production';
const SESSION_EXPIRY = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  sessionToken: string;
}

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate session token (for "One Device" enforcement)
export function generateSessionToken(): string {
  return uuidv4();
}

// Create JWT with session token embedded
export function createToken(userId: string, email: string, sessionToken: string): string {
  return jwt.sign(
    { userId, email, sessionToken } as JWTPayload,
    JWT_SECRET,
    { expiresIn: SESSION_EXPIRY }
  );
}

// Verify JWT and extract payload
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Register new user
export async function registerUser(email: string, password: string, name?: string): Promise<{ user: User; token: string } | { error: string }> {
  const db = readDb();
  
  // Check if user already exists
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return { error: 'Email already registered' };
  }
  
  const hashedPassword = await hashPassword(password);
  const sessionToken = generateSessionToken();
  const now = new Date().toISOString();
  
  const newUser: User = {
    id: generateId(),
    email: email.toLowerCase(),
    password: hashedPassword,
    name,
    activeSessionToken: sessionToken,
    createdAt: now,
    updatedAt: now,
  };
  
  db.users.push(newUser);
  writeDb(db);
  
  const token = createToken(newUser.id, newUser.email, sessionToken);
  
  // Return user without password
  const { password: _, ...safeUser } = newUser;
  return { user: safeUser as User, token };
}

// Login user (generates new session, invalidates old devices)
export async function loginUser(email: string, password: string): Promise<{ user: User; token: string } | { error: string }> {
  const db = readDb();
  
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return { error: 'Invalid email or password' };
  }
  
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return { error: 'Invalid email or password' };
  }
  
  // Generate NEW session token (this invalidates any other device)
  const newSessionToken = generateSessionToken();
  user.activeSessionToken = newSessionToken;
  user.updatedAt = new Date().toISOString();
  
  writeDb(db);
  
  const token = createToken(user.id, user.email, newSessionToken);
  
  // Return user without password
  const { password: _, ...safeUser } = user;
  return { user: safeUser as User, token };
}

// Validate session (the "One Device" check)
export function validateSession(token: string): { valid: true; user: User } | { valid: false; error: string } {
  const payload = verifyToken(token);
  if (!payload) {
    return { valid: false, error: 'Invalid or expired token' };
  }
  
  const db = readDb();
  const user = db.users.find(u => u.id === payload.userId);
  
  if (!user) {
    return { valid: false, error: 'User not found' };
  }
  
  // THE KEY CHECK: Does the token's session match the user's active session?
  if (user.activeSessionToken !== payload.sessionToken) {
    return { valid: false, error: 'Session active on another device. Please log in again.' };
  }
  
  // Return user without password
  const { password: _, ...safeUser } = user;
  return { valid: true, user: safeUser as User };
}

// Get user by ID
export function getUserById(userId: string): User | null {
  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) return null;
  
  const { password: _, ...safeUser } = user;
  return safeUser as User;
}

// Get user by email
export function getUserByEmail(email: string): User | null {
  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;
  
  const { password: _, ...safeUser } = user;
  return safeUser as User;
}

// Logout (clear session token)
export function logoutUser(userId: string): boolean {
  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  
  if (!user) return false;
  
  user.activeSessionToken = undefined;
  user.updatedAt = new Date().toISOString();
  writeDb(db);
  
  return true;
}
