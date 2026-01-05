import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { readDb, writeDb, User, SessionToken, generateId } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'throne-light-secret-key-change-in-production';
const SESSION_EXPIRY = '7d';
const MAX_ACTIVE_SESSIONS = 2; // 2-device limit

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

// Generate session token (for device enforcement)
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
export async function registerUser(email: string, password: string, name?: string, deviceInfo?: string): Promise<{ user: User; token: string } | { error: string }> {
  const db = readDb();
  
  // Check if user already exists
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return { error: 'Email already registered' };
  }
  
  const hashedPassword = await hashPassword(password);
  const sessionToken = generateSessionToken();
  const now = new Date().toISOString();
  
  const newSession: SessionToken = {
    token: sessionToken,
    deviceInfo,
    createdAt: now,
  };
  
  const newUser: User = {
    id: generateId(),
    email: email.toLowerCase(),
    password: hashedPassword,
    name,
    activeSessions: [newSession], // Start with first session
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

// Login user (2-device limit: if 3rd device, revoke oldest session)
export async function loginUser(email: string, password: string, deviceInfo?: string): Promise<{ user: User; token: string; revokedSession?: boolean } | { error: string }> {
  const db = readDb();
  
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return { error: 'Invalid email or password' };
  }
  
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return { error: 'Invalid email or password' };
  }
  
  const now = new Date().toISOString();
  const newSessionToken = generateSessionToken();
  
  const newSession: SessionToken = {
    token: newSessionToken,
    deviceInfo,
    createdAt: now,
  };
  
  // Initialize activeSessions if it doesn't exist (migration from old schema)
  if (!user.activeSessions) {
    user.activeSessions = [];
  }
  
  let revokedSession = false;
  
  // 2-DEVICE LIMIT: If already at max, remove the oldest session
  if (user.activeSessions.length >= MAX_ACTIVE_SESSIONS) {
    // Sort by createdAt (oldest first) and remove the oldest
    user.activeSessions.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    user.activeSessions.shift(); // Remove oldest session
    revokedSession = true;
  }
  
  // Add new session
  user.activeSessions.push(newSession);
  user.updatedAt = now;
  
  writeDb(db);
  
  const token = createToken(user.id, user.email, newSessionToken);
  
  // Return user without password
  const { password: _, ...safeUser } = user;
  return { user: safeUser as User, token, revokedSession };
}

// Validate session (2-device limit check)
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
  
  // Initialize activeSessions if missing (migration support)
  if (!user.activeSessions) {
    user.activeSessions = [];
  }
  
  // THE KEY CHECK: Is this session token in the user's active sessions?
  const isValidSession = user.activeSessions.some(s => s.token === payload.sessionToken);
  if (!isValidSession) {
    return { valid: false, error: 'Session expired or revoked. You may have logged in on another device. Please log in again.' };
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

// Logout (remove specific session token, or all if no token provided)
export function logoutUser(userId: string, sessionToken?: string): boolean {
  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  
  if (!user) return false;
  
  if (!user.activeSessions) {
    user.activeSessions = [];
  }
  
  if (sessionToken) {
    // Remove specific session
    user.activeSessions = user.activeSessions.filter(s => s.token !== sessionToken);
  } else {
    // Clear all sessions (full logout from all devices)
    user.activeSessions = [];
  }
  
  user.updatedAt = new Date().toISOString();
  writeDb(db);
  
  return true;
}

// Get active session count for a user
export function getActiveSessionCount(userId: string): number {
  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  if (!user || !user.activeSessions) return 0;
  return user.activeSessions.length;
}
