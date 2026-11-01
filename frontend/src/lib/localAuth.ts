const ACCOUNTS_STORAGE_KEY = 'janshayak_local_accounts';
const SESSION_STORAGE_KEY = 'janshayak_local_session';
const PASSWORD_ITERATIONS = 310_000;

export interface LocalAccount {
  id: string;
  email: string;
  googleLinkedEmail?: string;
}

interface StoredAccount extends LocalAccount {
  salt: string;
  passwordHash: string;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(value: string): Uint8Array {
  if (!/^(?:[0-9a-f]{2})+$/i.test(value)) throw new Error('Stored account credentials are invalid.');
  return Uint8Array.from(value.match(/.{2}/g) ?? [], byte => parseInt(byte, 16));
}

function toPublicAccount(account: StoredAccount): LocalAccount {
  return {
    id: account.id,
    email: account.email,
    ...(typeof account.googleLinkedEmail === 'string' && account.googleLinkedEmail
      ? { googleLinkedEmail: account.googleLinkedEmail }
      : {})
  };
}

function readAccounts(): StoredAccount[] {
  const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  if (!stored) return [];

  const accounts: unknown = JSON.parse(stored);
  if (
    !Array.isArray(accounts) ||
    !accounts.every(account =>
      account &&
      typeof account.id === 'string' &&
      typeof account.email === 'string' &&
      typeof account.salt === 'string' &&
      typeof account.passwordHash === 'string' &&
      (account.googleLinkedEmail === undefined || typeof account.googleLinkedEmail === 'string')
    )
  ) {
    throw new Error('Saved local accounts are invalid. Clear this browser’s Janshayak account data and try again.');
  }
  return accounts;
}

function validateEmailAddress(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('Enter a valid email address.');
  }
  return normalizedEmail;
}

function validateCredentials(email: string, password: string): { email: string; password: string } {
  const normalizedEmail = validateEmailAddress(email);
  if (password.length < 8 || password.length > 256) {
    throw new Error('Password must be between 8 and 256 characters.');
  }
  return { email: normalizedEmail, password };
}

async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations: PASSWORD_ITERATIONS, hash: 'SHA-256' },
    key,
    256
  );
  return bytesToHex(new Uint8Array(hash));
}

function createAccountId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return bytesToHex(bytes);
}

export async function createLocalAccount(email: string, password: string): Promise<LocalAccount> {
  const credentials = validateCredentials(email, password);
  const accounts = readAccounts();
  if (accounts.some(account => account.email === credentials.email)) {
    throw new Error('An account with this email already exists on this device. Sign in instead.');
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const account: StoredAccount = {
    id: createAccountId(),
    email: credentials.email,
    salt: bytesToHex(salt),
    passwordHash: await hashPassword(credentials.password, salt)
  };
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([...accounts, account]));
  localStorage.setItem(SESSION_STORAGE_KEY, account.id);
  return toPublicAccount(account);
}

export async function signInLocalAccount(email: string, password: string): Promise<LocalAccount> {
  const credentials = validateCredentials(email, password);
  const accounts = readAccounts();
  const account = accounts.find(candidate => candidate.email === credentials.email);
  if (!account) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const newAccount: StoredAccount = {
      id: createAccountId(),
      email: credentials.email,
      salt: bytesToHex(salt),
      passwordHash: await hashPassword(credentials.password, salt)
    };
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([...accounts, newAccount]));
    localStorage.setItem(SESSION_STORAGE_KEY, newAccount.id);
    return toPublicAccount(newAccount);
  }

  const actualHash = await hashPassword(credentials.password, hexToBytes(account.salt));
  const expected = hexToBytes(account.passwordHash);
  const actual = hexToBytes(actualHash);
  const matches = expected.length === actual.length && expected.every((byte, index) => byte === actual[index]);
  if (!matches) throw new Error('Incorrect password. Try again or use Forgot password to reset it.');

  localStorage.setItem(SESSION_STORAGE_KEY, account.id);
  return toPublicAccount(account);
}

export function restoreLocalAccount(): LocalAccount | null {
  const accountId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!accountId) return null;

  const account = readAccounts().find(candidate => candidate.id === accountId);
  if (!account) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
  return toPublicAccount(account);
}

export function signOutLocalAccount(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function updateLocalAccountPassword(accountId: string, newPassword: string): Promise<void> {
  if (newPassword.length < 8 || newPassword.length > 256) {
    throw new Error('Password must be between 8 and 256 characters.');
  }
  const accounts = readAccounts();
  const accountIndex = accounts.findIndex(candidate => candidate.id === accountId);
  if (accountIndex === -1) {
    throw new Error('Local account not found.');
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordHash = await hashPassword(newPassword, salt);
  const updatedAccounts = [...accounts];
  updatedAccounts[accountIndex] = {
    ...updatedAccounts[accountIndex],
    salt: bytesToHex(salt),
    passwordHash
  };
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedAccounts));
}

export async function resetLocalAccountPassword(email: string, newPassword: string): Promise<LocalAccount> {
  const credentials = validateCredentials(email, newPassword);
  const accounts = readAccounts();
  const accountIndex = accounts.findIndex(candidate => candidate.email === credentials.email);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordHash = await hashPassword(credentials.password, salt);

  if (accountIndex === -1) {
    const newAccount: StoredAccount = {
      id: createAccountId(),
      email: credentials.email,
      salt: bytesToHex(salt),
      passwordHash
    };
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([...accounts, newAccount]));
    localStorage.setItem(SESSION_STORAGE_KEY, newAccount.id);
    return toPublicAccount(newAccount);
  }

  const updatedAccount: StoredAccount = {
    ...accounts[accountIndex],
    salt: bytesToHex(salt),
    passwordHash
  };
  const updatedAccounts = [...accounts];
  updatedAccounts[accountIndex] = updatedAccount;
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedAccounts));
  localStorage.setItem(SESSION_STORAGE_KEY, updatedAccount.id);
  return toPublicAccount(updatedAccount);
}

export async function signInOrCreateGoogleLocalAccount(googleEmail: string): Promise<LocalAccount> {
  const normalizedGoogleEmail = validateEmailAddress(googleEmail);
  const accounts = readAccounts();
  const existingIndex = accounts.findIndex(
    candidate =>
      candidate.email === normalizedGoogleEmail ||
      candidate.googleLinkedEmail === normalizedGoogleEmail
  );

  if (existingIndex !== -1) {
    const updatedAccount: StoredAccount = {
      ...accounts[existingIndex],
      googleLinkedEmail: normalizedGoogleEmail
    };
    const updatedAccounts = [...accounts];
    updatedAccounts[existingIndex] = updatedAccount;
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedAccounts));
    localStorage.setItem(SESSION_STORAGE_KEY, updatedAccount.id);
    return toPublicAccount(updatedAccount);
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const generatedSecret = bytesToHex(crypto.getRandomValues(new Uint8Array(24)));
  const newAccount: StoredAccount = {
    id: createAccountId(),
    email: normalizedGoogleEmail,
    googleLinkedEmail: normalizedGoogleEmail,
    salt: bytesToHex(salt),
    passwordHash: await hashPassword(generatedSecret, salt)
  };
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([...accounts, newAccount]));
  localStorage.setItem(SESSION_STORAGE_KEY, newAccount.id);
  return toPublicAccount(newAccount);
}

export function linkLocalAccountWithGoogle(accountId: string, googleEmail: string): LocalAccount {
  const normalizedGoogleEmail = validateEmailAddress(googleEmail);
  const accounts = readAccounts();
  const accountIndex = accounts.findIndex(candidate => candidate.id === accountId);
  if (accountIndex === -1) {
    throw new Error('Local account not found.');
  }
  const updatedAccount: StoredAccount = {
    ...accounts[accountIndex],
    googleLinkedEmail: normalizedGoogleEmail
  };
  const updatedAccounts = [...accounts];
  updatedAccounts[accountIndex] = updatedAccount;
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedAccounts));
  return toPublicAccount(updatedAccount);
}

export function unlinkLocalAccountGoogle(accountId: string): LocalAccount {
  const accounts = readAccounts();
  const accountIndex = accounts.findIndex(candidate => candidate.id === accountId);
  if (accountIndex === -1) {
    throw new Error('Local account not found.');
  }
  const { googleLinkedEmail: _removed, ...rest } = accounts[accountIndex];
  const updatedAccount: StoredAccount = { ...rest };
  const updatedAccounts = [...accounts];
  updatedAccounts[accountIndex] = updatedAccount;
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedAccounts));
  return toPublicAccount(updatedAccount);
}


