import crypto from 'crypto';

// ==========================================
// 1. INPUT SANITIZATION & XSS / INJECTION FILTER
// ==========================================

const DANGEROUS_HTML_TAGS = /<\/?(script|iframe|object|embed|applet|form|input|button|style|link|meta)[^>]*>/gi;
const DANGEROUS_ATTRS = /\b(on\w+|javascript:|data:text\/html|vbscript:)/gi;

export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(DANGEROUS_HTML_TAGS, '')
    .replace(DANGEROUS_ATTRS, '')
    .replace(/\0/g, '') // remove null bytes
    .trim();
}

export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    return sanitizeString(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  return obj;
}

// ==========================================
// 2. EMAIL VALIDATION & DISPOSABLE DOMAINS
// ==========================================

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'trashmail.com',
  'yopmail.com',
  'sharklasers.com',
  'getairmail.com',
  'dispostable.com',
  'fakeinbox.com',
  'throwawaymail.com',
  'crazymailing.com',
  'temp-mail.org',
  'burnermail.io',
  'mytemp.email',
  'trashmail.net'
]);

export function validateEmail(email: string): { valid: boolean; message?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email address is required.' };
  }
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail.length > 254) {
    return { valid: false, message: 'Email address is too long.' };
  }
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { valid: false, message: 'Please provide a valid email address.' };
  }
  const domain = cleanEmail.split('@')[1];
  if (domain && DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, message: 'Disposable or temporary email addresses are not permitted.' };
  }
  return { valid: true };
}

// ==========================================
// 3. PASSWORD POLICY VALIDATION
// ==========================================

const WEAK_PASSWORDS = new Set([
  'password', 'password123', '12345678', 'qwerty123', 'admin123',
  'wedding123', 'studio123', 'pass1234', 'welcome123'
]);

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password exceeds maximum length limit (128 characters).' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special symbol (!@#$%^&*...).' };
  }
  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    return { valid: false, message: 'This password is too common. Please choose a stronger password.' };
  }
  return { valid: true };
}

// ==========================================
// 4. CRYPTOGRAPHIC TOKENS & HASHING
// ==========================================

export function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function generateRandomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function generateNumericOtp(digits = 6): string {
  const max = Math.pow(10, digits);
  const min = Math.pow(10, digits - 1);
  const num = crypto.randomInt(min, max);
  return num.toString();
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

// ==========================================
// 5. TOTP (RFC 6238) MULTI-FACTOR AUTHENTICATION
// ==========================================

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateBase32Secret(length = 20): string {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += BASE32_ALPHABET[bytes[i] % 32];
  }
  return result;
}

function base32ToBuffer(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/=+$/, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateTotpCode(secret: string, timeStepSec = 30, timeOffsetSec = 0): string {
  const key = base32ToBuffer(secret);
  const epoch = Math.floor((Date.now() / 1000 + timeOffsetSec) / timeStepSec);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(epoch));

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0xf;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

export function verifyTotpCode(token: string, secret: string, windowSteps = 1): boolean {
  if (!token || !secret) return false;
  const cleanToken = token.trim();
  if (cleanToken.length !== 6) return false;

  for (let step = -windowSteps; step <= windowSteps; step++) {
    const generated = generateTotpCode(secret, 30, step * 30);
    if (crypto.timingSafeEqual(Buffer.from(cleanToken), Buffer.from(generated))) {
      return true;
    }
  }
  return false;
}

export function generateRecoveryCodes(count = 8): { rawCodes: string[]; hashedCodes: string[] } {
  const rawCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 characters
    rawCodes.push(code);
    hashedCodes.push(hashValue(code));
  }
  return { rawCodes, hashedCodes };
}

export function verifyAndConsumeRecoveryCode(
  providedCode: string,
  storedHashedCodes: string[] = []
): { valid: boolean; remainingHashedCodes: string[] } {
  const cleanCode = providedCode.trim().toUpperCase();
  const candidateHash = hashValue(cleanCode);

  const index = storedHashedCodes.findIndex(h => h === candidateHash);
  if (index !== -1) {
    const remaining = [...storedHashedCodes];
    remaining.splice(index, 1);
    return { valid: true, remainingHashedCodes: remaining };
  }
  return { valid: false, remainingHashedCodes: storedHashedCodes };
}

// ==========================================
// 6. RATE LIMITING & BRUTE FORCE SHIELD
// ==========================================

interface RateBucket {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateBucket>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const bucket = rateLimitStore.get(key);

  if (!bucket || now >= bucket.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfterSec: 0 };
  }

  if (bucket.count >= maxRequests) {
    const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  bucket.count++;
  return { allowed: true, remaining: maxRequests - bucket.count, retryAfterSec: 0 };
}

// Account failed login tracker (Brute-force protection)
interface FailedAttemptRecord {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil: number;
}

const failedLoginStore = new Map<string, FailedAttemptRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 mins
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 mins

export function isAccountLocked(email: string): { locked: boolean; remainingMinutes: number } {
  const key = email.trim().toLowerCase();
  const record = failedLoginStore.get(key);
  if (!record) return { locked: false, remainingMinutes: 0 };

  const now = Date.now();
  if (record.lockedUntil > now) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / (60 * 1000));
    return { locked: true, remainingMinutes };
  }

  if (record.lockedUntil > 0 && now >= record.lockedUntil) {
    failedLoginStore.delete(key);
  }
  return { locked: false, remainingMinutes: 0 };
}

export function recordFailedLogin(email: string): {
  locked: boolean;
  attemptsLeft: number;
  remainingMinutes?: number;
} {
  const key = email.trim().toLowerCase();
  const now = Date.now();
  let record = failedLoginStore.get(key);

  if (!record || now - record.firstAttemptAt > ATTEMPT_WINDOW_MS) {
    record = { attempts: 1, firstAttemptAt: now, lockedUntil: 0 };
    failedLoginStore.set(key, record);
    return { locked: false, attemptsLeft: MAX_FAILED_ATTEMPTS - 1 };
  }

  record.attempts++;
  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    return {
      locked: true,
      attemptsLeft: 0,
      remainingMinutes: Math.ceil(LOCKOUT_DURATION_MS / (60 * 1000))
    };
  }

  return { locked: false, attemptsLeft: MAX_FAILED_ATTEMPTS - record.attempts };
}

export function resetFailedLogins(email: string): void {
  failedLoginStore.delete(email.trim().toLowerCase());
}

// ==========================================
// 7. SESSION & TOKEN REVOCATION / BLACKLIST
// ==========================================

const revokedTokens = new Map<string, number>(); // jti / signature -> expiresAt timestamp

export function revokeToken(tokenId: string, expiresAtTimestampMs: number): void {
  revokedTokens.set(tokenId, expiresAtTimestampMs);
  // Cleanup old expired revoked tokens periodically
  const now = Date.now();
  for (const [id, exp] of revokedTokens.entries()) {
    if (now >= exp) revokedTokens.delete(id);
  }
}

export function isTokenRevoked(tokenId: string): boolean {
  return revokedTokens.has(tokenId);
}
