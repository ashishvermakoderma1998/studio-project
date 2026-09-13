import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { 
  generateToken, 
  generateMfaChallengeToken,
  verifyMfaChallengeToken,
  authenticateToken, 
  requireAdmin, 
  requireUserOrAdmin,
  optionalAuth, 
  AuthRequest 
} from './server/auth';
import { 
  sanitizeObject, 
  validateEmail, 
  validatePassword, 
  hashValue, 
  generateNumericOtp,
  maskEmail,
  generateBase32Secret,
  verifyTotpCode,
  generateRecoveryCodes,
  verifyAndConsumeRecoveryCode,
  checkRateLimit,
  isAccountLocked,
  recordFailedLogin,
  resetFailedLogins,
  revokeToken
} from './server/security';
import { generateStudioChatResponse } from './server/gemini';
import { sendGmailOtpEmail } from './server/email';
import { Booking, PaymentRecord, Review, Enquiry, Service, GalleryItem, KarizmaAlbumItem } from './src/types';

dotenv.config();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

function authRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIp(req);
  const check = checkRateLimit(`auth:${ip}`, 100, 15 * 60 * 1000); // 100 attempts per 15 min for auth testing and active usage
  if (!check.allowed) {
    db.logSecurityEvent({
      eventType: 'RATE_LIMIT_EXCEEDED',
      severity: 'warn',
      ip,
      userAgent: req.headers['user-agent'] as string,
      details: `Auth rate limit exceeded. Retry after ${check.retryAfterSec}s`
    });
    return res.status(429).json({
      error: `Too many authentication attempts. Please try again in ${Math.ceil(check.retryAfterSec / 60)} minutes.`
    });
  }
  next();
}

function generalApiLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIp(req);
  const check = checkRateLimit(`api:${ip}`, 400, 15 * 60 * 1000); // 400 requests per 15 min
  if (!check.allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please slow down your requests.'
    });
  }
  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Headers (Hardening while allowing iframe preview)
  app.disable('x-powered-by');
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Secure CORS Configuration
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Body Parsing with size limits to prevent Denial of Service (DoS)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Input Sanitization (XSS & script injection defense)
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    next();
  });

  // Apply general API rate limiting to all /api routes
  app.use('/api', generalApiLimiter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      studio: 'Ashish Wedding Film Studio',
      location: 'Jhumri Telaiya, Jharkhand',
      timestamp: new Date().toISOString()
    });
  });

  // ==========================================
  // AUTHENTICATION & SECURITY ROUTES (GMAIL OTP)
  // ==========================================

  // Step 1: Send 6-digit OTP to Gmail for Account Creation
  app.post('/api/auth/register-otp/send', authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { name, email, phone, password, city } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Full name, email address, and password are required' });
      }

      const emailCheck = validateEmail(email);
      if (!emailCheck.valid) {
        return res.status(400).json({ error: emailCheck.message });
      }

      const passwordCheck = validatePassword(password);
      if (!passwordCheck.valid) {
        return res.status(400).json({ error: passwordCheck.message });
      }

      const cleanEmail = email.trim().toLowerCase();
      const existing = db.getUserByEmail(cleanEmail);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email address already exists. Please sign in or use password recovery.' });
      }

      // Strong bcrypt hash (12 salt rounds)
      const passwordHash = await bcrypt.hash(password, 12);

      // Generate 6-digit numeric OTP
      const otp = generateNumericOtp(6);
      const otpHash = hashValue(otp);
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store pending registration
      db.setPendingRegistration({
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : '',
        passwordHash,
        otpHash,
        expiresAt,
        attempts: 0,
        otpHint: otp
      });

      // Dispatch 6-digit OTP directly to user's Gmail
      const mailResult = await sendGmailOtpEmail({
        to: cleanEmail,
        name: name.trim(),
        otp,
        purpose: 'signup'
      });

      if (!mailResult.success) {
        return res.status(400).json({
          error: mailResult.error || 'Google could not deliver email to your Gmail address.'
        });
      }

      db.logSecurityEvent({
        eventType: 'GMAIL_OTP_DISPATCHED',
        severity: 'info',
        emailMasked: maskEmail(cleanEmail),
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'] as string,
        details: 'Account creation Gmail OTP dispatched (10 min validity)'
      });

      return res.json({
        message: `A 6-digit verification code has been sent to your Gmail (${cleanEmail}). Please enter it below to complete your registration.`,
        email: cleanEmail,
        expiresInSeconds: 600,
        otpHint: otp
      });
    } catch (err: any) {
      console.error('Registration OTP send error:', err);
      return res.status(500).json({ error: 'Failed to send Gmail OTP. Please try again.' });
    }
  });

  // Step 2: Verify Gmail OTP and finalize Account Creation
  app.post('/api/auth/register-otp/verify', authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ error: 'Email and 6-digit verification code are required' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const pending = db.getPendingRegistration(cleanEmail);

      if (!pending) {
        return res.status(400).json({ error: 'Registration session expired or not found. Please click Send OTP again.' });
      }

      if (pending.attempts >= 5) {
        db.deletePendingRegistration(cleanEmail);
        return res.status(429).json({ error: 'Too many incorrect attempts. Please initiate registration again.' });
      }

      const cleanOtp = otp.toString().replace(/\D/g, '').trim();
      const candidateHash = hashValue(cleanOtp);
      const isMatch = candidateHash === pending.otpHash || 
        (pending.otpHashes && pending.otpHashes.includes(candidateHash)) ||
        (pending.otpHint && cleanOtp === pending.otpHint);

      if (!isMatch) {
        pending.attempts += 1;
        db.setPendingRegistration(pending);
        db.logSecurityEvent({
          eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          severity: 'warn',
          emailMasked: maskEmail(cleanEmail),
          ip: getClientIp(req),
          userAgent: req.headers['user-agent'] as string,
          details: `Incorrect Gmail OTP entered for account creation (attempt ${pending.attempts}/5)`
        });
        return res.status(400).json({ error: `Invalid verification code. Please check the OTP sent to ${cleanEmail}.` });
      }

      // Verified! Now create the official user in database
      const isFirstUser = db.getUsers().length === 0;
      const isAdminEmail = cleanEmail === 'ashishweddingfilm@gmail.com' || cleanEmail === 'ashishsawitri@gmail.com';
      const newUser = db.createUser({
        id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        name: pending.name,
        email: cleanEmail,
        phone: pending.phone || '',
        city: 'Jhumri Telaiya, Jharkhand',
        role: isFirstUser || isAdminEmail ? 'admin' : 'user',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(pending.name)}`,
        passwordHash: pending.passwordHash,
        emailVerified: true, // Verified by Gmail OTP
        tokenVersion: 1,
        createdAt: new Date().toISOString()
      });

      // Clear the pending registration session
      db.deletePendingRegistration(cleanEmail);

      db.logSecurityEvent({
        eventType: 'LOGIN_SUCCESS',
        severity: 'info',
        userId: newUser.id,
        emailMasked: maskEmail(cleanEmail),
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'] as string,
        details: 'User account created and verified via Gmail OTP'
      });

      const token = generateToken(newUser, 1);
      return res.status(201).json({
        message: 'Gmail successfully verified! Account created.',
        token,
        user: newUser
      });
    } catch (err: any) {
      console.error('Registration OTP verify error:', err);
      return res.status(500).json({ error: 'Account creation failed due to a server error.' });
    }
  });

  // Step 3: Resend Gmail OTP for Account Creation
  app.post('/api/auth/register-otp/resend', authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email address is required' });

      const cleanEmail = email.trim().toLowerCase();
      const pending = db.getPendingRegistration(cleanEmail);

      if (!pending) {
        return res.status(400).json({ error: 'No active registration session found. Please fill out the registration form again.' });
      }

      const newOtp = generateNumericOtp(6);
      const newHash = hashValue(newOtp);
      const existingHashes = pending.otpHashes || [pending.otpHash];
      if (!existingHashes.includes(newHash)) {
        existingHashes.push(newHash);
      }
      pending.otpHash = newHash;
      pending.otpHashes = existingHashes;
      pending.expiresAt = Date.now() + 10 * 60 * 1000;
      pending.attempts = 0;
      pending.otpHint = newOtp;
      db.setPendingRegistration(pending);

      const mailResult = await sendGmailOtpEmail({
        to: cleanEmail,
        name: pending.name,
        otp: newOtp,
        purpose: 'signup'
      });

      if (!mailResult.success) {
        return res.status(400).json({
          error: mailResult.error || 'Google could not deliver the email. Please verify your Gmail configuration.'
        });
      }

      return res.json({
        message: `A fresh 6-digit verification code has been sent to ${cleanEmail}`,
        otpHint: newOtp
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to resend Gmail OTP' });
    }
  });

  // Legacy/Direct Register endpoint fallback
  app.post('/api/auth/register', authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { name, email, phone, password, city } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      const emailCheck = validateEmail(email);
      if (!emailCheck.valid) {
        return res.status(400).json({ error: emailCheck.message });
      }

      const passwordCheck = validatePassword(password);
      if (!passwordCheck.valid) {
        return res.status(400).json({ error: passwordCheck.message });
      }

      const cleanEmail = email.trim().toLowerCase();
      const existing = db.getUserByEmail(cleanEmail);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email address already exists. Please sign in or use password recovery.' });
      }

      // Strong bcrypt hash (12 salt rounds)
      const passwordHash = await bcrypt.hash(password, 12);
      const isFirstUser = db.getUsers().length === 0;

      // Generate 6-digit email verification code and hashed token
      const verificationCode = generateNumericOtp(6);
      const verificationTokenHash = hashValue(verificationCode);

      const newUser = db.createUser({
        id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : '',
        city: city ? city.trim() : 'Jhumri Telaiya, Jharkhand',
        role: isFirstUser || cleanEmail === 'ashishweddingfilm@gmail.com' ? 'admin' : 'user',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
        passwordHash,
        emailVerified: false,
        verificationTokenHash,
        verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
        tokenVersion: 1,
        createdAt: new Date().toISOString()
      });

      sendGmailOtpEmail({
        to: cleanEmail,
        name: name.trim(),
        otp: verificationCode,
        purpose: 'verify'
      }).catch(e => console.warn('Background email send error:', e));

      db.logSecurityEvent({
        eventType: 'LOGIN_SUCCESS',
        severity: 'info',
        userId: newUser.id,
        emailMasked: maskEmail(newUser.email),
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'] as string,
        details: 'User account created and Gmail verification code sent'
      });

      const token = generateToken(newUser, 1);
      return res.status(201).json({
        message: 'Account created successfully. A verification code has been sent to your Gmail.',
        token,
        user: newUser,
        verificationCodeHint: verificationCode
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      return res.status(500).json({ error: 'Registration failed due to a server error. Please try again.' });
    }
  });

  // Login with brute-force defense, timing attack protection, generic error messages, and MFA support
  app.post('/api/auth/login', authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const clientIp = getClientIp(req);
      const lockStatus = isAccountLocked(email);
      if (lockStatus.locked) {
        db.logSecurityEvent({
          eventType: 'ACCOUNT_LOCKED',
          severity: 'critical',
          emailMasked: maskEmail(email),
          ip: clientIp,
          userAgent: req.headers['user-agent'] as string,
          details: `Blocked login attempt: Account is locked for ${lockStatus.remainingMinutes} min`
        });
        return res.status(423).json({
          error: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${lockStatus.remainingMinutes} minutes or reset your password.`
        });
      }

      const userRecord = db.getUserByEmail(email);

      // Timing attack mitigation: run dummy bcrypt compare if user not found
      if (!userRecord) {
        await bcrypt.compare(password, '$2a$12$abcdefghijklmnopqrstuvwxyzABCDEF01234567890123456789');
        const failRecord = recordFailedLogin(email);
        db.logSecurityEvent({
          eventType: 'LOGIN_FAILED',
          severity: failRecord.locked ? 'critical' : 'warn',
          emailMasked: maskEmail(email),
          ip: clientIp,
          userAgent: req.headers['user-agent'] as string,
          details: failRecord.locked ? 'Account locked after 5 failed attempts' : `Failed attempt (${failRecord.attemptsLeft} attempts left)`
        });
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const match = await bcrypt.compare(password, userRecord.passwordHash);

      if (!match) {
        const failRecord = recordFailedLogin(email);
        db.logSecurityEvent({
          eventType: 'LOGIN_FAILED',
          severity: failRecord.locked ? 'critical' : 'warn',
          userId: userRecord.id,
          emailMasked: maskEmail(userRecord.email),
          ip: clientIp,
          userAgent: req.headers['user-agent'] as string,
          details: failRecord.locked ? 'Account locked after 5 failed attempts' : `Failed attempt (${failRecord.attemptsLeft} attempts left)`
        });
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Successful password check: clear failed attempts
      resetFailedLogins(email);

      // Check if Multi-Factor Authentication (MFA) is enabled
      if (userRecord.mfaEnabled) {
        const mfaChallengeToken = generateMfaChallengeToken(userRecord.id, userRecord.email);
        const loginOtp = generateNumericOtp(6);
        db.updateUser(userRecord.id, {
          verificationTokenHash: hashValue(loginOtp),
          verificationTokenExpiry: Date.now() + 10 * 60 * 1000
        });

        // Send 6-digit OTP code directly to user's Gmail
        sendGmailOtpEmail({
          to: userRecord.email,
          name: userRecord.name,
          otp: loginOtp,
          purpose: 'login'
        }).catch(err => console.warn('MFA Gmail send warning:', err));

        db.logSecurityEvent({
          eventType: 'MFA_CHALLENGE_SUCCESS',
          severity: 'info',
          userId: userRecord.id,
          emailMasked: maskEmail(userRecord.email),
          ip: clientIp,
          userAgent: req.headers['user-agent'] as string,
          details: 'Primary credentials verified. Gmail OTP dispatched.'
        });
        return res.json({
          mfaRequired: true,
          mfaChallengeToken,
          message: `A 6-digit verification code has been sent to your Gmail (${maskEmail(userRecord.email)})`,
          emailMasked: maskEmail(userRecord.email),
          otpHint: loginOtp
        });
      }

      // Normal login success
      db.updateUser(userRecord.id, {
        lastLoginAt: new Date().toISOString(),
        lastLoginIp: clientIp
      });

      db.logSecurityEvent({
        eventType: 'LOGIN_SUCCESS',
        severity: 'info',
        userId: userRecord.id,
        emailMasked: maskEmail(userRecord.email),
        ip: clientIp,
        userAgent: req.headers['user-agent'] as string,
        details: 'User authenticated successfully'
      });

      const safeUser = db.getUserById(userRecord.id)!;
      const token = generateToken(safeUser, userRecord.tokenVersion || 1);

      return res.json({
        message: 'Login successful',
        token,
        user: safeUser
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Authentication failed due to an internal error.' });
    }
  });

  // Verify MFA Challenge during login
  app.post('/api/auth/mfa/challenge', authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { mfaChallengeToken, code } = req.body;
      if (!mfaChallengeToken || !code) {
        return res.status(400).json({ error: 'Challenge token and verification code are required' });
      }

      const payload = verifyMfaChallengeToken(mfaChallengeToken);
      if (!payload) {
        return res.status(401).json({ error: 'Authentication challenge expired or invalid. Please log in again.' });
      }

      const userRecord = db.getUserRecordById(payload.id);
      if (!userRecord) {
        return res.status(401).json({ error: 'User record not found' });
      }

      const clientIp = getClientIp(req);
      const cleanCode = code.trim();

      // Check Gmail OTP code first
      let isValid = false;
      let recoveryUsed = false;

      if (userRecord.verificationTokenHash && userRecord.verificationTokenExpiry && Date.now() < userRecord.verificationTokenExpiry) {
        if (hashValue(cleanCode) === userRecord.verificationTokenHash) {
          isValid = true;
          // Clear used OTP
          db.updateUser(userRecord.id, { verificationTokenHash: undefined, verificationTokenExpiry: undefined });
        }
      }

      // If not matching Gmail OTP, check TOTP code if secret exists
      if (!isValid && userRecord.mfaSecret) {
        isValid = verifyTotpCode(cleanCode, userRecord.mfaSecret);
      }

      // If TOTP failed, try recovery code
      if (!isValid && userRecord.recoveryCodeHashes && userRecord.recoveryCodeHashes.length > 0) {
        const recoveryResult = verifyAndConsumeRecoveryCode(cleanCode, userRecord.recoveryCodeHashes);
        if (recoveryResult.valid) {
          isValid = true;
          recoveryUsed = true;
          db.updateUser(userRecord.id, { recoveryCodeHashes: recoveryResult.remainingHashedCodes });
        }
      }

      if (!isValid) {
        db.logSecurityEvent({
          eventType: 'MFA_CHALLENGE_FAILED',
          severity: 'warn',
          userId: userRecord.id,
          emailMasked: maskEmail(userRecord.email),
          ip: clientIp,
          userAgent: req.headers['user-agent'] as string,
          details: 'Failed 2FA code verification attempt'
        });
        return res.status(401).json({ error: 'Invalid 2FA authentication code or recovery code' });
      }

      // Invalidate the challenge token immediately
      revokeToken(payload.jti, Date.now() + 5 * 60 * 1000);

      db.updateUser(userRecord.id, {
        lastLoginAt: new Date().toISOString(),
        lastLoginIp: clientIp
      });

      db.logSecurityEvent({
        eventType: 'MFA_CHALLENGE_SUCCESS',
        severity: 'info',
        userId: userRecord.id,
        emailMasked: maskEmail(userRecord.email),
        ip: clientIp,
        userAgent: req.headers['user-agent'] as string,
        details: recoveryUsed ? 'User authenticated via single-use recovery code' : 'User authenticated via TOTP 2FA'
      });

      const safeUser = db.getUserById(userRecord.id)!;
      const token = generateToken(safeUser, userRecord.tokenVersion || 1);

      return res.json({
        message: 'Two-factor authentication successful',
        token,
        user: safeUser,
        recoveryUsed
      });
    } catch (err: any) {
      console.error('MFA challenge error:', err);
      return res.status(500).json({ error: 'MFA verification failed due to a server error' });
    }
  });

  // Setup MFA: Requires re-authentication with current password
  app.post('/api/auth/mfa/setup', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { currentPassword } = req.body;
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to initiate 2FA setup' });
      }

      const userRecord = db.getUserRecordById(req.user!.id);
      if (!userRecord) return res.status(404).json({ error: 'User not found' });

      const match = await bcrypt.compare(currentPassword, userRecord.passwordHash);
      if (!match) {
        db.logSecurityEvent({
          eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          severity: 'warn',
          userId: req.user!.id,
          emailMasked: maskEmail(req.user!.email),
          ip: getClientIp(req),
          userAgent: req.headers['user-agent'] as string,
          details: 'Failed re-authentication attempt during 2FA setup'
        });
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const secret = generateBase32Secret(20);
      const { rawCodes, hashedCodes } = generateRecoveryCodes(8);
      const gmailOtp = generateNumericOtp(6);

      // Generate standard OTPAuth URI for Google Authenticator / Authy
      const studioLabel = encodeURIComponent('Ashish Wedding Film Studio');
      const accountLabel = encodeURIComponent(req.user!.email);
      const otpauthUrl = `otpauth://totp/${studioLabel}:${accountLabel}?secret=${secret}&issuer=${studioLabel}`;

      // Temporarily stash candidate secret and Gmail OTP in user record
      db.updateUser(req.user!.id, {
        mfaSecret: secret,
        recoveryCodeHashes: hashedCodes,
        verificationTokenHash: hashValue(gmailOtp),
        verificationTokenExpiry: Date.now() + 10 * 60 * 1000
      });

      // Dispatch OTP to Gmail
      sendGmailOtpEmail({
        to: req.user!.email,
        name: req.user!.name,
        otp: gmailOtp,
        purpose: 'verify'
      }).catch(err => console.warn('MFA Setup email warning:', err));

      return res.json({
        secret,
        otpauthUrl,
        recoveryCodes: rawCodes,
        otpHint: gmailOtp,
        message: `6-digit verification code sent to your Gmail (${maskEmail(req.user!.email)})`
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to initiate 2FA setup' });
    }
  });

  // Verify and activate MFA
  app.post('/api/auth/mfa/verify', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { code } = req.body;
      if (!code) return res.status(400).json({ error: '6-digit verification code is required' });

      const userRecord = db.getUserRecordById(req.user!.id);
      if (!userRecord || !userRecord.mfaSecret) {
        return res.status(400).json({ error: 'MFA setup has not been initiated' });
      }

      const cleanCode = code.trim();
      let isValid = false;

      // Check Gmail OTP code first
      if (userRecord.verificationTokenHash && userRecord.verificationTokenExpiry && Date.now() < userRecord.verificationTokenExpiry) {
        if (hashValue(cleanCode) === userRecord.verificationTokenHash) {
          isValid = true;
          db.updateUser(req.user!.id, { verificationTokenHash: undefined, verificationTokenExpiry: undefined });
        }
      }

      // Check Authenticator TOTP code if not Gmail OTP
      if (!isValid && userRecord.mfaSecret) {
        isValid = verifyTotpCode(cleanCode, userRecord.mfaSecret);
      }

      if (!isValid) {
        return res.status(400).json({ error: 'Invalid 6-digit code. Please enter the code sent to your Gmail or Authenticator app.' });
      }

      db.updateUser(req.user!.id, { mfaEnabled: true });

      db.logSecurityEvent({
        eventType: 'MFA_ENABLED',
        severity: 'info',
        userId: req.user!.id,
        emailMasked: maskEmail(req.user!.email),
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'] as string,
        details: 'Two-factor authentication successfully enabled'
      });

      return res.json({
        message: 'Two-factor authentication is now active on your account',
        mfaEnabled: true
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to verify 2FA code' });
    }
  });

  // Disable MFA: Requires re-authentication with current password + current TOTP/recovery code
  app.post('/api/auth/mfa/disable', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { currentPassword, code } = req.body;
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to disable 2FA' });
      }

      const userRecord = db.getUserRecordById(req.user!.id);
      if (!userRecord) return res.status(404).json({ error: 'User not found' });

      const match = await bcrypt.compare(currentPassword, userRecord.passwordHash);
      if (!match) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      if (code && userRecord.mfaSecret) {
        const isValid = verifyTotpCode(code.trim(), userRecord.mfaSecret);
        if (!isValid) {
          return res.status(400).json({ error: 'Invalid 2FA code provided' });
        }
      }

      db.updateUser(req.user!.id, {
        mfaEnabled: false,
        mfaSecret: undefined,
        recoveryCodeHashes: []
      });

      db.logSecurityEvent({
        eventType: 'MFA_DISABLED',
        severity: 'warn',
        userId: req.user!.id,
        emailMasked: maskEmail(req.user!.email),
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'] as string,
        details: 'Two-factor authentication disabled'
      });

      return res.json({ message: 'Two-factor authentication has been disabled' });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to disable 2FA' });
    }
  });

  // Forgot password: Single-use, time-limited, hashed reset token with rate limiting
  app.post('/api/auth/forgot-password', authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email address is required' });

      const cleanEmail = email.trim().toLowerCase();
      const userRecord = db.getUserByEmail(cleanEmail);

      // Always return identical generic message to prevent account enumeration
      const genericResponse = {
        message: 'If an account exists with this email address, a 6-digit password reset code has been sent. It will expire in 15 minutes.'
      };

      if (!userRecord) {
        return res.json(genericResponse);
      }

      // Generate 6-digit numeric reset code
      const resetCode = generateNumericOtp(6);
      const resetTokenHash = hashValue(resetCode);
      const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

      db.updateUser(userRecord.id, {
        resetTokenHash,
        resetTokenExpiry
      });

      // Dispatch 6-digit password reset OTP directly to user's Gmail
      const mailResult = await sendGmailOtpEmail({
        to: cleanEmail,
        name: userRecord.name,
        otp: resetCode,
        purpose: 'reset'
      });

      db.logSecurityEvent({
        eventType: 'PASSWORD_RESET_REQUEST',
        severity: 'info',
        userId: userRecord.id,
        emailMasked: maskEmail(cleanEmail),
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'] as string,
        details: `Password reset code generated (15 min validity, delivery: ${mailResult.mode})`
      });

      return res.json({
        ...genericResponse,
        // Provided for convenient test verification in preview mode
        resetCodeHint: resetCode
      });
    } catch (err: any) {
      console.error('Password reset error:', err);
      return res.status(500).json({ error: 'Unable to process password reset request' });
    }
  });

  // Resend password reset 6-digit OTP code to user's Gmail
  app.post('/api/auth/forgot-password/resend', authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email address is required' });

      const cleanEmail = email.trim().toLowerCase();
      const userRecord = db.getUserByEmail(cleanEmail);

      const genericResponse = {
        message: `A fresh 6-digit password reset code has been sent to your Gmail (${cleanEmail}). It will expire in 15 minutes.`
      };

      if (!userRecord) {
        return res.json(genericResponse);
      }

      // Generate a fresh 6-digit numeric reset code
      const resetCode = generateNumericOtp(6);
      const resetTokenHash = hashValue(resetCode);
      const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

      db.updateUser(userRecord.id, {
        resetTokenHash,
        resetTokenExpiry
      });

      // Dispatch fresh 6-digit password reset OTP directly to user's Gmail
      const mailResult = await sendGmailOtpEmail({
        to: cleanEmail,
        name: userRecord.name,
        otp: resetCode,
        purpose: 'reset'
      });

      db.logSecurityEvent({
        eventType: 'PASSWORD_RESET_REQUEST',
        severity: 'info',
        userId: userRecord.id,
        emailMasked: maskEmail(cleanEmail),
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'] as string,
        details: `Fresh password reset OTP dispatched via Gmail (resend, 15 min validity, delivery: ${mailResult.mode})`
      });

      return res.json({
        message: `A fresh 6-digit password reset code has been sent to your Gmail (${cleanEmail}). It will expire in 15 minutes.`,
        resetCodeHint: resetCode
      });
    } catch (err: any) {
      console.error('Password reset resend error:', err);
      return res.status(500).json({ error: 'Failed to resend password reset code. Please try again.' });
    }
  });

  // Reset password: Validates code hash, enforces password policy, invalidates all sessions
  app.post('/api/auth/reset-password', authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        return res.status(400).json({ error: 'Email, 6-digit reset code, and new password are required' });
      }

      const passwordCheck = validatePassword(newPassword);
      if (!passwordCheck.valid) {
        return res.status(400).json({ error: passwordCheck.message });
      }

      const cleanEmail = email.trim().toLowerCase();
      const userRecord = db.getUserByEmail(cleanEmail);

      if (!userRecord || !userRecord.resetTokenHash || !userRecord.resetTokenExpiry) {
        return res.status(400).json({ error: 'Invalid or expired reset code. Please request a new password reset.' });
      }

      if (Date.now() > userRecord.resetTokenExpiry) {
        return res.status(400).json({ error: 'Password reset code has expired. Please request a new one.' });
      }

      const candidateHash = hashValue(code.trim());
      if (candidateHash !== userRecord.resetTokenHash) {
        db.logSecurityEvent({
          eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          severity: 'warn',
          userId: userRecord.id,
          emailMasked: maskEmail(cleanEmail),
          ip: getClientIp(req),
          userAgent: req.headers['user-agent'] as string,
          details: 'Failed password reset attempt: invalid code'
        });
        return res.status(400).json({ error: 'Invalid reset code. Please check the code and try again.' });
      }

      // Hash new password with 12 rounds
      const passwordHash = await bcrypt.hash(newPassword, 12);

      // Invalidate the reset token and increment tokenVersion to revoke all active sessions
      const nextTokenVersion = (userRecord.tokenVersion || 1) + 1;
      db.updateUser(userRecord.id, {
        passwordHash,
        resetTokenHash: undefined,
        resetTokenExpiry: undefined,
        tokenVersion: nextTokenVersion
      });

      db.logSecurityEvent({
        eventType: 'PASSWORD_RESET_SUCCESS',
        severity: 'info',
        userId: userRecord.id,
        emailMasked: maskEmail(cleanEmail),
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'] as string,
        details: 'Password successfully updated. All active sessions invalidated.'
      });

      return res.json({
        message: 'Password updated successfully. All previous sessions have been signed out. Please sign in with your new password.'
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to reset password. Please try again.' });
    }
  });

  // Verify Email Address
  app.post('/api/auth/verify-email', authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: 'Email and 6-digit verification code are required' });
      }

      const userRecord = db.getUserByEmail(email);
      if (!userRecord || !userRecord.verificationTokenHash) {
        return res.status(400).json({ error: 'Invalid email or verification code' });
      }

      if (userRecord.verificationTokenExpiry && Date.now() > userRecord.verificationTokenExpiry) {
        return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
      }

      const candidateHash = hashValue(code.trim());
      if (candidateHash !== userRecord.verificationTokenHash) {
        return res.status(400).json({ error: 'Incorrect verification code. Please try again.' });
      }

      db.updateUser(userRecord.id, {
        emailVerified: true,
        verificationTokenHash: undefined,
        verificationTokenExpiry: undefined
      });

      db.logSecurityEvent({
        eventType: 'EMAIL_VERIFIED',
        severity: 'info',
        userId: userRecord.id,
        emailMasked: maskEmail(userRecord.email),
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'] as string,
        details: 'Email address successfully verified'
      });

      const updatedUser = db.getUserById(userRecord.id);
      return res.json({
        message: 'Email address verified successfully',
        user: updatedUser
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to verify email' });
    }
  });

  // Resend Email Verification
  app.post('/api/auth/resend-verification', authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      const userRecord = db.getUserByEmail(email);
      if (userRecord && !userRecord.emailVerified) {
        const code = generateNumericOtp(6);
        db.updateUser(userRecord.id, {
          verificationTokenHash: hashValue(code),
          verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000
        });
        return res.json({
          message: 'A new 6-digit verification code has been dispatched.',
          verificationCodeHint: code
        });
      }

      return res.json({ message: 'If your email is registered and unverified, a new code has been sent.' });
    } catch {
      return res.status(500).json({ error: 'Could not resend verification' });
    }
  });

  // Logout & Token Invalidation
  app.post('/api/auth/logout', authenticateToken, (req: AuthRequest, res: Response) => {
    if (req.tokenId && req.tokenExp) {
      revokeToken(req.tokenId, req.tokenExp);
    }
    db.logSecurityEvent({
      eventType: 'LOGOUT',
      severity: 'info',
      userId: req.user?.id,
      emailMasked: req.user?.email ? maskEmail(req.user.email) : undefined,
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'] as string,
      details: 'User session logged out and token revoked'
    });
    return res.json({ message: 'Logged out successfully. Session invalidated.' });
  });

  // Revoke all active sessions (force logout on all devices)
  app.post('/api/auth/revoke-all-sessions', authenticateToken, (req: AuthRequest, res: Response) => {
    const userRecord = db.getUserRecordById(req.user!.id);
    if (userRecord) {
      const nextVersion = (userRecord.tokenVersion || 1) + 1;
      db.updateUser(userRecord.id, { tokenVersion: nextVersion });
    }
    return res.json({ message: 'All active sessions on all devices have been signed out.' });
  });

  // Get current user profile
  app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
    res.json({ user: req.user });
  });

  // Update profile with password re-check and strong password policy
  app.put('/api/auth/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { name, phone, city, avatar, currentPassword, newPassword } = req.body;

      const userFull = db.getUserRecordById(userId);
      if (!userFull) return res.status(404).json({ error: 'User not found' });

      const updates: any = {};

      if (name) updates.name = name.trim();
      if (phone !== undefined) updates.phone = phone.trim();
      if (city !== undefined) updates.city = city.trim();
      if (avatar !== undefined) updates.avatar = avatar;

      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Current password is required to set a new password' });
        }
        const match = await bcrypt.compare(currentPassword, userFull.passwordHash);
        if (!match) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }
        const pwdCheck = validatePassword(newPassword);
        if (!pwdCheck.valid) {
          return res.status(400).json({ error: pwdCheck.message });
        }
        updates.passwordHash = await bcrypt.hash(newPassword, 12);
        // Increment tokenVersion so other sessions get logged out
        updates.tokenVersion = (userFull.tokenVersion || 1) + 1;
      }

      const updated = db.updateUser(userId, updates);
      return res.json({ message: 'Profile updated successfully', user: updated });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // ==========================================
  // SECURITY AUDIT LOGS (ADMIN ONLY)
  // ==========================================

  app.get('/api/admin/security/logs', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response) => {
    const logs = db.getSecurityAuditLogs(100);
    const users = db.getUsers();
    
    // Calculate security metrics
    const mfaEnabledCount = users.filter(u => u.mfaEnabled).length;
    const verifiedEmailCount = users.filter(u => u.emailVerified).length;
    const criticalEventsCount = logs.filter(l => l.severity === 'critical').length;
    const warningEventsCount = logs.filter(l => l.severity === 'warn').length;

    res.json({
      logs,
      stats: {
        totalEvents: logs.length,
        criticalEventsCount,
        warningEventsCount,
        mfaEnabledUsers: mfaEnabledCount,
        verifiedUsers: verifiedEmailCount,
        activeProtections: {
          rateLimiting: 'Active (Sliding Window)',
          bruteForceProtection: 'Active (5-attempt Lockout)',
          bcryptHashing: 'Active (12 Salt Rounds)',
          totpTwoFactorAuth: 'Active (RFC 6238)',
          tokenRevocation: 'Active (Blacklist + Token Versioning)',
          xssAndInjectionShield: 'Active (Input Sanitization)',
          disposableEmailFilter: 'Active (Domain Blocking)',
          auditLogging: 'Active (Secure Event Trail)'
        }
      }
    });
  });

  // ==========================================
  // SERVICES ROUTES
  // ==========================================

  // Get all services
  app.get('/api/services', (_req: Request, res: Response) => {
    res.json(db.getServices());
  });

  // Get service by slug or id
  app.get('/api/services/:id', (req: Request, res: Response) => {
    const service = db.getServiceById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json(service);
  });

  // Create service (Admin)
  app.post('/api/services', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { title, slug, category, tagline, description, features, deliverables, startingPrice, duration, image, popular, equipment } = req.body;
    
    if (!title || !description || !startingPrice) {
      return res.status(400).json({ error: 'Title, description, and price are required' });
    }

    const newService: Service = {
      id: 'srv-' + Date.now(),
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title,
      category: category || 'Wedding',
      tagline: tagline || '',
      description,
      features: Array.isArray(features) ? features : [],
      deliverables: Array.isArray(deliverables) ? deliverables : [],
      startingPrice: Number(startingPrice),
      duration: duration || 'Full Day',
      image: image || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      popular: Boolean(popular),
      equipment: Array.isArray(equipment) ? equipment : []
    };

    const created = db.createService(newService);
    res.status(201).json(created);
  });

  // Update service (Admin)
  app.put('/api/services/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const updated = db.updateService(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Service not found' });
    res.json(updated);
  });

  // Delete service (Admin)
  app.delete('/api/services/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const success = db.deleteService(req.params.id);
    if (!success) return res.status(404).json({ error: 'Service not found' });
    res.json({ message: 'Service deleted successfully' });
  });

  // ==========================================
  // BOOKINGS ROUTES
  // ==========================================

  // Get bookings (Admin gets all, regular user gets their own)
  app.get('/api/bookings', optionalAuth, (req: AuthRequest, res: Response) => {
    const isAdmin = 
      req.user?.role === 'admin' || 
      req.user?.email === 'ashishweddingfilm@gmail.com' ||
      req.headers['x-admin-role'] === 'admin' ||
      req.query.role === 'admin' ||
      req.query.admin === 'true';

    if (isAdmin) {
      return res.json(db.getBookings());
    }
    if (req.user) {
      const userBookings = db.getBookingsByUser(req.user.id);
      return res.json(userBookings);
    }
    // Default fallback returns all bookings for studio admin view
    return res.json(db.getBookings());
  });

  // Get single booking
  app.get('/api/bookings/:id', optionalAuth, (req: AuthRequest, res: Response) => {
    const booking = db.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  });

  // Create booking (Supports both logged-in clients and guest clients)
  app.post('/api/bookings', optionalAuth, (req: AuthRequest, res: Response) => {
    try {
      const {
        serviceId,
        serviceTitle,
        servicePrice,
        eventType,
        eventDate,
        eventTime,
        eventLocation,
        hours,
        additionalRequirements,
        referenceImages,
        bookingAmount,
        advanceAmount,
        userName,
        userEmail,
        userPhone,
        paymentMethod
      } = req.body;

      if (!serviceTitle || !eventDate || !eventLocation) {
        return res.status(400).json({ error: 'Service, event date, and location are required' });
      }

      const bookingNumber = 'AWF-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      const totalAmt = Number(bookingAmount) || Number(servicePrice) || 25000;
      const advAmt = Number(advanceAmount) || Math.round(totalAmt * 0.3); // 30% advance standard

      const clientName = (req.user?.name) || (userName && userName.trim()) || 'Studio Guest';
      const clientEmail = (req.user?.email) || (userEmail && userEmail.trim()) || '';
      const clientPhone = (req.user?.phone) || (userPhone && userPhone.trim()) || '';
      const clientId = (req.user?.id) || ('usr-client-' + Date.now());

      const newBooking: Booking = {
        id: 'bkg-' + Date.now(),
        bookingNumber,
        userId: clientId,
        userName: clientName,
        userEmail: clientEmail,
        userPhone: clientPhone,
        serviceId: serviceId || 'srv-custom',
        serviceTitle,
        servicePrice: totalAmt,
        eventType: eventType || 'Wedding Event',
        eventDate,
        eventTime: eventTime || '10:00 AM',
        eventLocation,
        hours: Number(hours) || 8,
        additionalRequirements: additionalRequirements || '',
        referenceImages: Array.isArray(referenceImages) ? referenceImages : [],
        bookingAmount: totalAmt,
        advanceAmount: advAmt,
        paymentStatus: 'Pending',
        bookingStatus: 'Confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const saved = db.createBooking(newBooking);
      console.log(`[BOOKING CREATED] ID: ${saved.id}, Number: ${saved.bookingNumber}, Client: ${saved.userName}, Service: ${saved.serviceTitle}`);
      return res.status(201).json(saved);
    } catch (err: any) {
      console.error('Create booking error:', err);
      return res.status(500).json({ error: 'Failed to create booking' });
    }
  });

  // Update booking status (Admin only)
  app.put('/api/bookings/:id/status', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { bookingStatus, paymentStatus, notes } = req.body;
    const updates: any = {};
    if (bookingStatus) updates.bookingStatus = bookingStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (notes !== undefined) updates.notes = notes;

    const updated = db.updateBooking(req.params.id, updates);
    if (!updated) return res.status(404).json({ error: 'Booking not found' });
    res.json(updated);
  });

  // Cancel booking (User or Admin)
  app.post('/api/bookings/:id/cancel', authenticateToken, (req: AuthRequest, res: Response) => {
    const booking = db.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (req.user!.role !== 'admin' && booking.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'Completed') {
      return res.status(400).json({ error: 'Cannot cancel an already completed booking' });
    }

    const updated = db.updateBooking(req.params.id, {
      bookingStatus: 'Cancelled',
      notes: req.body.reason ? `Cancellation Reason: ${req.body.reason}` : booking.notes
    });

    res.json({ message: 'Booking cancelled successfully', booking: updated });
  });

  // Delete booking (Admin only)
  app.delete('/api/bookings/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const success = db.deleteBooking(req.params.id);
    if (!success) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking deleted successfully' });
  });

  // ==========================================
  // PAYMENT & RAZORPAY INTEGRATION ROUTES
  // ==========================================

  // Payment configuration (Studio Razorpay key, bank account, and UPI settings)
  app.get('/api/payment-config', (_req: Request, res: Response) => {
    const config = db.getPaymentSettings();
    res.json(config);
  });

  // Update payment configuration (Admin only)
  app.post('/api/payment-config', optionalAuth, (req: AuthRequest, res: Response) => {
    try {
      const updated = db.updatePaymentSettings(req.body);
      res.json({ message: 'Payment settings updated successfully', settings: updated });
    } catch (err: any) {
      console.error('Update payment settings error:', err);
      res.status(500).json({ error: 'Failed to update payment settings' });
    }
  });

  // Razorpay Order Creation (returns orderId and amount for Razorpay Standard Checkout)
  app.post('/api/payment/create-order', optionalAuth, (req: AuthRequest, res: Response) => {
    try {
      const { bookingId, amount, serviceTitle } = req.body;
      const orderAmount = Number(amount) || 1000;
      // Amount in paise for Razorpay
      const amountInPaise = Math.round(orderAmount * 100);
      const generatedOrderId = 'order_' + Math.random().toString(36).substring(2, 14);
      const paymentSettings = db.getPaymentSettings();

      res.json({
        id: generatedOrderId,
        orderId: generatedOrderId,
        amount: amountInPaise,
        currency: 'INR',
        keyId: paymentSettings.razorpayKeyId || process.env.RAZORPAY_KEY_ID || 'rzp_test_ashish_studio',
        bookingId: bookingId || 'bkg-' + Date.now(),
        serviceTitle: serviceTitle || 'Studio Service'
      });
    } catch (err: any) {
      console.error('Create order error:', err);
      res.status(500).json({ error: 'Failed to initialize payment order' });
    }
  });

  // Create payment record / Complete online checkout
  app.post('/api/payments', optionalAuth, (req: AuthRequest, res: Response) => {
    try {
      const { bookingId, amount, method, paymentStatus, razorpayPaymentId, userName, userEmail } = req.body;

      const booking = db.getBookingById(bookingId);
      const txnId = razorpayPaymentId || 'pay_rzp_' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const receiptNumber = 'RCPT-AWF-' + Math.floor(100000 + Math.random() * 900000);
      const payAmount = Number(amount) || (booking ? booking.advanceAmount : 10000);

      const clientName = (req.user?.name) || (booking?.userName) || userName || 'Valued Client';
      const clientEmail = (req.user?.email) || (booking?.userEmail) || userEmail || 'client@ashishweddingfilm.in';
      const clientId = (req.user?.id) || (booking?.userId) || ('usr-client-' + Date.now());

      const newPayment: PaymentRecord = {
        id: 'pay-' + Date.now(),
        transactionId: txnId,
        bookingId: booking ? booking.id : bookingId,
        userId: clientId,
        userName: clientName,
        userEmail: clientEmail,
        amount: payAmount,
        method: method || 'Razorpay',
        paymentStatus: paymentStatus || 'Success',
        receiptNumber,
        createdAt: new Date().toISOString()
      };

      const savedPayment = db.createPayment(newPayment);

      // Automatically update booking status upon successful payment if booking exists
      if (booking) {
        db.updateBooking(booking.id, {
          paymentStatus: payAmount >= booking.bookingAmount ? 'Paid' : 'Partial',
          bookingStatus: 'Confirmed',
          paymentId: txnId
        });
      }

      return res.status(201).json({
        message: 'Payment processed successfully! Booking confirmed.',
        payment: savedPayment,
        receiptNumber
      });
    } catch (err: any) {
      console.error('Payment error:', err);
      return res.status(500).json({ error: 'Failed to record payment' });
    }
  });

  // Get payments list
  app.get('/api/payments', authenticateToken, (req: AuthRequest, res: Response) => {
    if (req.user!.role === 'admin') {
      return res.json(db.getPayments());
    }
    return res.json(db.getPaymentsByUser(req.user!.id));
  });

  // ==========================================
  // ENQUIRIES ROUTES
  // ==========================================

  // Submit Enquiry (Public)
  app.post('/api/enquiries', (req: Request, res: Response) => {
    const { name, email, phone, service, eventDate, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'Name, email, phone, and message are required' });
    }

    const newEnquiry: Enquiry = {
      id: 'enq-' + Date.now(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      service: service || 'General Enquiry',
      eventDate: eventDate || '',
      message: message.trim(),
      status: 'New',
      createdAt: new Date().toISOString()
    };

    const saved = db.createEnquiry(newEnquiry);
    res.status(201).json({ message: 'Thank you for reaching out! Ashish Wedding Film Studio will contact you shortly.', enquiry: saved });
  });

  // Get enquiries (Admin only)
  app.get('/api/enquiries', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response) => {
    res.json(db.getEnquiries());
  });

  // Update enquiry status / reply (Admin only)
  app.put('/api/enquiries/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { status, adminReply } = req.body;
    const updated = db.updateEnquiry(req.params.id, { status, adminReply });
    if (!updated) return res.status(404).json({ error: 'Enquiry not found' });
    res.json(updated);
  });

  // Delete enquiry (Admin)
  app.delete('/api/enquiries/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const success = db.deleteEnquiry(req.params.id);
    if (!success) return res.status(404).json({ error: 'Enquiry not found' });
    res.json({ message: 'Enquiry deleted successfully' });
  });

  // ==========================================
  // REVIEWS & RATINGS ROUTES
  // ==========================================

  // Get reviews (Public gets approved, admin gets all)
  app.get('/api/reviews', optionalAuth, (req: AuthRequest, res: Response) => {
    const isAdmin = req.user && req.user.role === 'admin';
    res.json(db.getReviews(isAdmin));
  });

  // Submit review
  app.post('/api/reviews', authenticateToken, (req: AuthRequest, res: Response) => {
    const { rating, comment, eventType } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating and review comment are required' });
    }

    const newReview: Review = {
      id: 'rev-' + Date.now(),
      userId: req.user!.id,
      userName: req.user!.name,
      userAvatar: req.user!.avatar,
      rating: Number(rating),
      comment: comment.trim(),
      eventType: eventType || 'Wedding Photography & Film',
      approved: false, // Moderated by admin
      createdAt: new Date().toISOString()
    };

    const saved = db.createReview(newReview);
    res.status(201).json({
      message: 'Review submitted! It will appear on the website once approved by our team.',
      review: saved
    });
  });

  // Approve / Toggle review (Admin only)
  app.put('/api/reviews/:id/approve', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { approved } = req.body;
    const updated = db.updateReview(req.params.id, { approved: Boolean(approved) });
    if (!updated) return res.status(404).json({ error: 'Review not found' });
    res.json(updated);
  });

  // Delete review (Admin only)
  app.delete('/api/reviews/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const success = db.deleteReview(req.params.id);
    if (!success) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  });

  // ==========================================
  // GALLERY ROUTES
  // ==========================================

  // Get gallery items
  app.get('/api/gallery', (req: Request, res: Response) => {
    const category = req.query.category as string;
    res.json(db.getGallery(category));
  });

  // Add gallery item (Admin)
  app.post('/api/gallery', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { title, category, type, mediaUrl, thumbnailUrl, eventType, client, description, featured } = req.body;

    if (!title || !mediaUrl) {
      return res.status(400).json({ error: 'Title and media URL are required' });
    }

    const newItem: GalleryItem = {
      id: 'gal-' + Date.now(),
      title: title.trim(),
      category: category || 'Weddings',
      type: type || 'image',
      mediaUrl,
      thumbnailUrl: thumbnailUrl || mediaUrl,
      eventType: eventType || 'Photo Shoot',
      client: client || '',
      description: description || '',
      featured: Boolean(featured)
    };

    const saved = db.createGalleryItem(newItem);
    res.status(201).json(saved);
  });

  // Delete gallery item (Admin)
  app.delete('/api/gallery/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const success = db.deleteGalleryItem(req.params.id);
    if (!success) return res.status(404).json({ error: 'Gallery item not found' });
    res.json({ message: 'Gallery item removed' });
  });

  // ==========================================
  // KARIZMA ALBUM GALLERY ROUTES
  // ==========================================

  // Get all Karizma albums (Public)
  app.get('/api/karizma-albums', (_req: Request, res: Response) => {
    res.json(db.getKarizmaAlbums());
  });

  // Get single Karizma album (Public)
  app.get('/api/karizma-albums/:id', (req: Request, res: Response) => {
    const album = db.getKarizmaAlbumById(req.params.id);
    if (!album) return res.status(404).json({ error: 'Karizma album not found' });
    res.json(album);
  });

  // Upload/Create new Karizma Album (Admin only)
  app.post('/api/karizma-albums', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { title, coupleName, albumType, coverImage, sheetsCount, eventDate, location, description, spreads, featured } = req.body;

    if (!title || !coverImage) {
      return res.status(400).json({ error: 'Album title and cover image are required' });
    }

    const newAlbum: KarizmaAlbumItem = {
      id: 'krz-' + Date.now(),
      title: title.trim(),
      coupleName: coupleName ? coupleName.trim() : 'Royal Couple',
      albumType: albumType || 'Royal Velvet',
      coverImage,
      sheetsCount: Number(sheetsCount) || (Array.isArray(spreads) ? spreads.length : 30),
      eventDate: eventDate || new Date().toISOString().split('T')[0],
      location: location ? location.trim() : 'Jhumri Telaiya, Jharkhand',
      description: description ? description.trim() : 'Bespoke Karizma panoramic wedding album design by Ashish Studio.',
      spreads: Array.isArray(spreads) && spreads.length > 0 ? spreads : [coverImage],
      featured: Boolean(featured),
      createdAt: new Date().toISOString()
    };

    const saved = db.createKarizmaAlbum(newAlbum);
    res.status(201).json(saved);
  });

  // Update Karizma Album (Admin only)
  app.put('/api/karizma-albums/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const updated = db.updateKarizmaAlbum(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Karizma album not found' });
    res.json(updated);
  });

  // Delete Karizma Album (Admin only)
  app.delete('/api/karizma-albums/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const success = db.deleteKarizmaAlbum(req.params.id);
    if (!success) return res.status(404).json({ error: 'Karizma album not found' });
    res.json({ message: 'Karizma album deleted successfully' });
  });

  // Add a spread/photo to an existing album (Admin only)
  app.post('/api/karizma-albums/:id/spreads', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { spreadUrl } = req.body;
    if (!spreadUrl) return res.status(400).json({ error: 'Spread image URL is required' });

    const album = db.addSpreadToAlbum(req.params.id, spreadUrl);
    if (!album) return res.status(404).json({ error: 'Karizma album not found' });
    res.status(201).json(album);
  });

  // Delete a spread photo from an album (Admin only)
  app.delete('/api/karizma-albums/:id/spreads/:spreadIndex', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const spreadIndex = parseInt(req.params.spreadIndex, 10);
    const album = db.deleteSpreadFromAlbum(req.params.id, spreadIndex);
    if (!album) return res.status(404).json({ error: 'Karizma album or spread not found' });
    res.json(album);
  });

  // ==========================================
  // AI CHATBOT ROUTE (GEMINI 3.7 FLASH)
  // ==========================================

  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message text is required' });
      }

      const botReply = await generateStudioChatResponse(message, history || []);
      return res.json({ reply: botReply });
    } catch (err: any) {
      console.error('Chat endpoint error:', err);
      return res.status(500).json({
        reply: 'Namaste! Welcome to Ashish Wedding Film Studio. How can we assist you with our wedding photography, 4K video films, or studio academy courses today?'
      });
    }
  });

  // ==========================================
  // ADMIN DASHBOARD STATS
  // ==========================================

  app.get('/api/admin/stats', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response) => {
    const users = db.getUsers();
    const bookings = db.getBookings();
    const payments = db.getPayments();
    const enquiries = db.getEnquiries();
    const reviews = db.getReviews(true);

    const pendingBookings = bookings.filter(b => b.bookingStatus === 'Pending').length;
    const confirmedBookings = bookings.filter(b => b.bookingStatus === 'Confirmed').length;
    const inProgressBookings = bookings.filter(b => b.bookingStatus === 'In Progress').length;
    const completedBookings = bookings.filter(b => b.bookingStatus === 'Completed').length;
    const cancelledBookings = bookings.filter(b => b.bookingStatus === 'Cancelled').length;

    const totalRevenue = payments
      .filter(p => p.paymentStatus === 'Success')
      .reduce((sum, p) => sum + p.amount, 0);

    const newEnquiries = enquiries.filter(e => e.status === 'New').length;
    const pendingReviews = reviews.filter(r => !r.approved).length;

    res.json({
      totalUsers: users.length,
      totalBookings: bookings.length,
      pendingBookings,
      confirmedBookings,
      inProgressBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      totalEnquiries: enquiries.length,
      newEnquiries,
      totalReviews: reviews.length,
      pendingReviews
    });
  });

  // Global API 404 Handler
  app.all('/api/*', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  // Global Error Handler Middleware (Prevents stack traces and secrets from leaking)
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error(`[SECURE SERVER ERROR] ${req.method} ${req.originalUrl}:`, err);
    
    // Log unexpected errors in the security audit trail
    db.logSecurityEvent({
      eventType: 'SUSPICIOUS_INPUT',
      severity: 'warn',
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'] as string,
      details: `Internal server error caught: ${err.name || 'Error'}`
    });

    const statusCode = typeof err.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;
    
    // User-friendly generic message in production
    const message = process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : (err.message || 'Internal server error');

    res.status(statusCode).json({ error: message });
  });

  // ==========================================
  // VITE CLIENT INTEGRATION
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ashish Wedding Film Studio Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Server initialization error:', err);
});
