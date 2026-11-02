import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const DEFAULT_ADMIN_PORTAL_PASSWORD = 'Janshayak@Admin#2026';

export function getAdminPortalPassword(): string {
  return process.env.ADMIN_PORTAL_PASSWORD?.trim() || DEFAULT_ADMIN_PORTAL_PASSWORD;
}

function safeEqual(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

export function verifyAdminPortalPassword(password: unknown): boolean {
  return typeof password === 'string' && safeEqual(password, getAdminPortalPassword());
}

export function createAdminSessionToken(now = Date.now()): string {
  const expiresAt = now + SESSION_TTL_MS;
  const signature = createHmac('sha256', getAdminPortalPassword())
    .update(`admin-session:${expiresAt}`)
    .digest('base64url');
  return `${expiresAt}.${signature}`;
}

export function isValidAdminSessionToken(token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const separator = token.indexOf('.');
  if (separator <= 0) return false;

  const expiresAtText = token.slice(0, separator);
  const expiresAt = Number(expiresAtText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now || expiresAt > now + SESSION_TTL_MS) return false;

  const expectedToken = createAdminSessionToken(expiresAt - SESSION_TTL_MS);
  return safeEqual(token, expectedToken);
}
