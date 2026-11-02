import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createAdminSessionToken,
  isValidAdminSessionToken,
  verifyAdminPortalPassword
} from './adminAuth.js';

test('admin portal password is checked server-side', () => {
  assert.equal(verifyAdminPortalPassword('Janshayak@Admin#2026'), true);
  assert.equal(verifyAdminPortalPassword('wrong-password'), false);
  assert.equal(verifyAdminPortalPassword(undefined), false);
});

test('admin session tokens expire and reject tampering', () => {
  const now = 1_800_000_000_000;
  const token = createAdminSessionToken(now);
  assert.equal(isValidAdminSessionToken(token, now), true);
  assert.equal(isValidAdminSessionToken(`${token}tampered`, now), false);
  assert.equal(isValidAdminSessionToken(token, now + 8 * 60 * 60 * 1000), false);
});
