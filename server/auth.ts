/**
 * GOVCHECK AI - Authentication & Token Cryptography Module
 *
 * Provides cryptographic utilities for password hashing via bcrypt and
 * stateless Bearer token generation / verification using HMAC-SHA256 signatures.
 *
 * Security Characteristics:
 * - Bcrypt Work Factor: 10 salt rounds (adaptive cost parameter).
 * - Stateless Token Format: `<base64(JSON_Payload)>.<HMAC_SHA256_Signature>`
 * - Secret Management: Uses process.env.SESSION_SECRET with development fallback.
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, UserRole } from '../src/types';

/** Secret key used to sign and verify HMAC-SHA256 authentication tokens */
const SECRET_KEY = process.env.SESSION_SECRET || 'govcheck-secret-key-2026-secure';

/**
 * Hashes a plain-text password using bcrypt with standard salt rounds.
 *
 * @param plainPassword - The raw user password entered during registration or update.
 * @returns Standard bcrypt-formatted hash string ($2a$10$...).
 */
export function hashPassword(plainPassword: string): string {
  return bcrypt.hashSync(plainPassword, 10);
}

/**
 * Validates a plain-text password against a stored bcrypt hash in constant time.
 *
 * @param plain - The plain-text candidate password supplied during login.
 * @param hashed - The bcrypt hash stored in the user record.
 * @returns True if password matches, false otherwise.
 */
export function comparePassword(plain: string, hashed: string): boolean {
  return bcrypt.compareSync(plain, hashed);
}

/**
 * Serializes user identity information into a URL-safe Base64 payload and generates
 * an HMAC-SHA256 signature to guarantee authenticity without requiring server-side session stores.
 *
 * @param user - User object containing public identity attributes (id, email, role, name).
 * @returns Two-part token string in the format `${base64Payload}.${hmacSignature}`.
 */
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    timestamp: Date.now(),
  };
  const str = JSON.stringify(payload);
  const base64 = Buffer.from(str).toString('base64');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(base64).digest('hex');
  return `${base64}.${signature}`;
}

/**
 * Validates the HMAC-SHA256 signature of an incoming authorization header and extracts
 * the authenticated user identity payload.
 *
 * @param tokenString - Raw authorization header string (e.g. "Bearer eyJpZCI6...").
 * @returns Decoded user token payload, or null if the signature is invalid, tampered, or malformed.
 */
export function verifyToken(tokenString?: string): { id: string; email: string; role: UserRole; name: string } | null {
  if (!tokenString) return null;
  const token = tokenString.startsWith('Bearer ') ? tokenString.slice(7) : tokenString;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [base64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(base64).digest('hex');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
    return payload;
  } catch {
    return null;
  }
}
