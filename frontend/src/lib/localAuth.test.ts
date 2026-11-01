import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import {
  createLocalAccount,
  linkLocalAccountWithGoogle,
  resetLocalAccountPassword,
  restoreLocalAccount,
  signInLocalAccount,
  signInOrCreateGoogleLocalAccount,
  signOutLocalAccount,
  unlinkLocalAccountGoogle,
  updateLocalAccountPassword
} from './localAuth';

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalCrypto = Object.getOwnPropertyDescriptor(globalThis, 'crypto');

function resetBrowserStorage(): void {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: new MemoryStorage() });
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: webcrypto });
}

afterEach(() => {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else Reflect.deleteProperty(globalThis, 'localStorage');
  if (originalCrypto) Object.defineProperty(globalThis, 'crypto', originalCrypto);
  else Reflect.deleteProperty(globalThis, 'crypto');
});

describe('local device accounts', () => {
  it('creates an account and restores its session without storing the password', async () => {
    resetBrowserStorage();
    const account = await createLocalAccount('Citizen@Example.com', 'correct horse battery');
    assert.equal(account.email, 'citizen@example.com');
    assert.deepEqual(restoreLocalAccount(), account);
    assert.equal(localStorage.getItem('janshayak_local_accounts')?.includes('correct horse battery'), false);
  });

  it('rejects duplicate accounts and incorrect passwords', async () => {
    resetBrowserStorage();
    await createLocalAccount('citizen@example.com', 'correct horse battery');
    await assert.rejects(
      createLocalAccount('CITIZEN@example.com', 'another correct password'),
      /already exists/
    );
    await assert.rejects(signInLocalAccount('citizen@example.com', 'incorrect password'), /Incorrect password/);
  });

  it('requires an existing account to sign in and clears sessions on sign out', async () => {
    resetBrowserStorage();
    await assert.rejects(signInLocalAccount('citizen@example.com', 'correct horse battery'), /No local account/);
    const account = await createLocalAccount('citizen@example.com', 'correct horse battery');
    signOutLocalAccount();
    assert.equal(restoreLocalAccount(), null);
    assert.deepEqual(await signInLocalAccount('citizen@example.com', 'correct horse battery'), account);
  });

  it('updates a local account password and verifies sign in with the new password', async () => {
    resetBrowserStorage();
    const account = await createLocalAccount('citizen@example.com', 'old-password-123');
    await updateLocalAccountPassword(account.id, 'new-password-456');
    signOutLocalAccount();
    await assert.rejects(signInLocalAccount('citizen@example.com', 'old-password-123'), /Incorrect password/);
    assert.deepEqual(await signInLocalAccount('citizen@example.com', 'new-password-456'), account);
  });

  it('resets a forgotten password by email for an existing local account', async () => {
    resetBrowserStorage();
    const account = await createLocalAccount('student@example.com', 'initial-secret-123');
    signOutLocalAccount();
    const resetAccount = await resetLocalAccountPassword('Student@Example.com', 'recovered-secret-789');
    assert.deepEqual(resetAccount, account);
    assert.deepEqual(restoreLocalAccount(), account);
    signOutLocalAccount();
    assert.deepEqual(await signInLocalAccount('student@example.com', 'recovered-secret-789'), account);
  });

  it('supports direct Google sign-in and linking/unlinking an existing account with Google', async () => {
    resetBrowserStorage();
    const googleAccount = await signInOrCreateGoogleLocalAccount('Yuvraj.Student@Gmail.com');
    assert.equal(googleAccount.email, 'yuvraj.student@gmail.com');
    assert.equal(googleAccount.googleLinkedEmail, 'yuvraj.student@gmail.com');
    assert.deepEqual(restoreLocalAccount(), googleAccount);

    const unlinked = unlinkLocalAccountGoogle(googleAccount.id);
    assert.equal(unlinked.googleLinkedEmail, undefined);

    const relinked = linkLocalAccountWithGoogle(googleAccount.id, 'yuvraj2505032@gmail.com');
    assert.equal(relinked.googleLinkedEmail, 'yuvraj2505032@gmail.com');
    assert.equal(restoreLocalAccount()?.googleLinkedEmail, 'yuvraj2505032@gmail.com');
  });
});



