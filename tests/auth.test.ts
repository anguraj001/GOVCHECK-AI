import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../server/auth';
import { User } from '../src/types';

describe('GOVCHECK AI - Authentication & Token Cryptography Unit Tests', () => {
  const mockUser: User = {
    id: 'usr-unit-test-1',
    name: 'Test Citizen User',
    email: 'testuser@govcheck.ai',
    mobile: '+91 99999 88888',
    role: 'citizen',
    preferredLanguage: 'en',
    createdAt: '2026-03-01T10:00:00.000Z',
  };

  describe('hashPassword() & comparePassword()', () => {
    it('should hash a plain-text password using salt rounds and return valid bcrypt hash', () => {
      const plain = 'StrongGovPassword@2026';
      const hash = hashPassword(plain);

      assert.notEqual(hash, plain);
      assert.ok(hash.startsWith('$2'), 'Bcrypt hash should start with $2a or $2b identifier');
      assert.ok(hash.length >= 50, 'Hash string should be standard bcrypt length');
    });

    it('should return true when comparing valid plain password with its hash', () => {
      const plain = 'MySecretPass123';
      const hash = hashPassword(plain);
      assert.equal(comparePassword(plain, hash), true);
    });

    it('should return false when comparing incorrect password', () => {
      const plain = 'CorrectPassword123';
      const hash = hashPassword(plain);
      assert.equal(comparePassword('WrongPassword999', hash), false);
      assert.equal(comparePassword('', hash), false);
    });
  });

  describe('generateToken() & verifyToken()', () => {
    it('should generate an HMAC-SHA256 authenticated token containing user payload', () => {
      const token = generateToken(mockUser);
      assert.ok(token);
      assert.equal(token.split('.').length, 2, 'Token should contain encoded payload and signature');
    });

    it('should correctly verify and decode valid Bearer token header', () => {
      const token = generateToken(mockUser);
      const bearerHeader = `Bearer ${token}`;

      const decoded = verifyToken(bearerHeader);
      assert.ok(decoded);
      assert.equal(decoded?.id, mockUser.id);
      assert.equal(decoded?.email, mockUser.email);
      assert.equal(decoded?.role, mockUser.role);
    });

    it('should reject tampered or modified token signatures', () => {
      const token = generateToken(mockUser);
      const parts = token.split('.');
      // Tamper signature
      const tamperedToken = `${parts[0]}.invalid_signature_xyz`;

      const result = verifyToken(`Bearer ${tamperedToken}`);
      assert.equal(result, null, 'Tampered token must fail verification');
    });

    it('should reject malformed headers or missing tokens', () => {
      assert.equal(verifyToken(undefined), null);
      assert.equal(verifyToken(''), null);
      assert.equal(verifyToken('Basic xyz123'), null);
      assert.equal(verifyToken('Bearer malformed-token-string-without-dots'), null);
    });
  });
});
