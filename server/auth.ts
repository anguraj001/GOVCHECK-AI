import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, UserRole } from '../src/types';

const SECRET_KEY = process.env.SESSION_SECRET || 'govcheck-secret-key-2026-secure';

export function hashPassword(plainPassword: string): string {
  return bcrypt.hashSync(plainPassword, 10);
}

export function comparePassword(plain: string, hashed: string): boolean {
  return bcrypt.compareSync(plain, hashed);
}

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
