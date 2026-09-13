import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { 
  User, 
  Service, 
  Booking, 
  PaymentRecord, 
  Enquiry, 
  Review, 
  GalleryItem,
  KarizmaAlbumItem,
  PaymentSettings,
  SecurityAuditLog
} from '../src/types';
import { INITIAL_SERVICES, INITIAL_GALLERY, INITIAL_REVIEWS, INITIAL_KARIZMA_ALBUMS } from '../src/data/studioData';

export interface UserRecord extends User {
  passwordHash: string;
  tokenVersion?: number;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  phoneVerificationOtpHash?: string;
  phoneVerificationExpiry?: number;
  verificationTokenHash?: string;
  verificationTokenExpiry?: number;
  resetTokenHash?: string;
  resetTokenExpiry?: number;
  mfaEnabled?: boolean;
  mfaSecret?: string;
  recoveryCodeHashes?: string[];
  lastLoginAt?: string;
  lastLoginIp?: string;
}

export interface PendingRegistration {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  otpHash: string;
  otpHashes?: string[];
  phoneOtpHash?: string;
  phoneOtpHashes?: string[];
  phoneOtpHint?: string;
  phoneVerified?: boolean;
  maskedPhone?: string;
  expiresAt: number;
  attempts: number;
  otpHint?: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  services: Service[];
  bookings: Booking[];
  payments: PaymentRecord[];
  enquiries: Enquiry[];
  reviews: Review[];
  gallery: GalleryItem[];
  karizmaAlbums: KarizmaAlbumItem[];
  paymentSettings?: PaymentSettings;
  securityAuditLogs?: SecurityAuditLog[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const PENDING_REGS_FILE = path.join(DATA_DIR, 'pending_registrations.json');

// Studio default data is imported from src/data/studioData.ts (INITIAL_SERVICES, INITIAL_GALLERY, INITIAL_REVIEWS, INITIAL_KARIZMA_ALBUMS)

class Database {
  private data: DatabaseSchema;
  private pendingRegistrations: Map<string, PendingRegistration> = new Map();

  constructor() {
    this.data = this.loadData();
    this.loadPendingRegistrations();
  }

  private loadPendingRegistrations(): void {
    try {
      if (fs.existsSync(PENDING_REGS_FILE)) {
        const raw = fs.readFileSync(PENDING_REGS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const now = Date.now();
        for (const [key, val] of Object.entries(parsed)) {
          const item = val as PendingRegistration;
          if (item && item.expiresAt > now) {
            this.pendingRegistrations.set(key, item);
          }
        }
      }
    } catch (e) {
      console.warn('Could not load pending registrations file:', e);
    }
  }

  private persistPendingRegistrations(): void {
    try {
      const obj: Record<string, PendingRegistration> = {};
      const now = Date.now();
      for (const [key, val] of this.pendingRegistrations.entries()) {
        if (val.expiresAt > now) {
          obj[key] = val;
        }
      }
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(PENDING_REGS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Could not persist pending registrations file:', e);
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed: DatabaseSchema = JSON.parse(raw);
        if (!parsed.karizmaAlbums || parsed.karizmaAlbums.length === 0) {
          parsed.karizmaAlbums = INITIAL_KARIZMA_ALBUMS;
        }

        // Always ensure designated admin accounts exist, have admin role and verified password
        const adminHash = bcrypt.hashSync('Ashish@2026!', 10);
        const adminEmails = ['ashishweddingfilm@gmail.com', 'ashishsawitri@gmail.com'];
        if (!parsed.users) parsed.users = [];

        for (const adminEmail of adminEmails) {
          const cleanEmail = adminEmail.toLowerCase();
          const existing = parsed.users.find(u => u.email.toLowerCase() === cleanEmail);
          if (existing) {
            existing.role = 'admin';
            existing.passwordHash = adminHash;
            existing.emailVerified = true;
            existing.mfaEnabled = false;
          } else {
            parsed.users.push({
              id: 'usr-admin-' + (cleanEmail.includes('sawitri') ? 'sawitri' : 'ashish'),
              name: cleanEmail.includes('sawitri') ? 'Ashish Sawitri' : 'Ashish (Studio Founder & Lead Director)',
              email: cleanEmail,
              phone: '+91 87090 17294',
              role: 'admin',
              city: 'Jhumri Telaiya, Jharkhand',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
              passwordHash: adminHash,
              emailVerified: true,
              mfaEnabled: false,
              createdAt: new Date().toISOString()
            });
          }
        }

        // Normalize enquiries: tag demo enquiries so they can be identified or cleared
        if (!parsed.enquiries) parsed.enquiries = [];
        parsed.enquiries.forEach(enq => {
          if (enq.id === 'enq-1' || enq.id === 'enq-2' || enq.id === 'enq-demo-1') {
            enq.isDemo = true;
          } else if (enq.isDemo === undefined) {
            enq.isDemo = false;
          }
        });

        return parsed;
      }
    } catch (e) {
      console.warn('Could not read existing db file, seeding fresh database:', e);
    }

    // Default Seed Data
    const adminPasswordHash = bcrypt.hashSync('Ashish@2026!', 10);

    const initialUsers: (User & { passwordHash: string })[] = [
      {
        id: 'usr-admin-ashish',
        name: 'Ashish (Studio Founder & Lead Director)',
        email: 'ashishweddingfilm@gmail.com',
        phone: '+91 87090 17294',
        role: 'admin',
        city: 'Jhumri Telaiya, Jharkhand',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        passwordHash: adminPasswordHash,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString()
      }
    ];

    const initialBookings: Booking[] = [];
    const initialPayments: PaymentRecord[] = [];

    const initialEnquiries: Enquiry[] = [
      {
        id: 'enq-1',
        name: 'Priyanka Sen',
        email: 'priyanka.sen@gmail.com',
        phone: '+91 87090 17294',
        service: 'Cinematic Wedding Films',
        eventDate: '2026-12-15',
        message: 'Looking for a complete 3-day wedding photography + cinematic film package in Koderma / Telaiya.',
        status: 'New',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
      },
      {
        id: 'enq-2',
        name: 'Aditya Verma',
        email: 'aditya.v@yahoo.com',
        phone: '+91 87090 17294',
        service: 'Learning & Training Academy',
        message: 'Interested in the upcoming Photography & DaVinci Resolve Editing Batch starting next month.',
        status: 'In Touch',
        adminReply: 'Batch starts on the 1st of next month with 8 weekend practical sessions. Brochure sent!',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString()
      }
    ];

    const seed: DatabaseSchema = {
      users: initialUsers,
      services: INITIAL_SERVICES,
      bookings: initialBookings,
      payments: initialPayments,
      enquiries: initialEnquiries,
      reviews: INITIAL_REVIEWS,
      gallery: INITIAL_GALLERY,
      karizmaAlbums: INITIAL_KARIZMA_ALBUMS
    };

    this.saveData(seed);
    return seed;
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db file:', e);
    }
  }

  private persist() {
    this.saveData(this.data);
  }

  // Safe user projection (strips password hashes, MFA secrets, recovery codes, tokens)
  private toSafeUser(user: UserRecord): User {
    const { 
      passwordHash: _ph, 
      mfaSecret: _ms, 
      recoveryCodeHashes: _rc, 
      verificationTokenHash: _vth, 
      verificationTokenExpiry: _vte, 
      resetTokenHash: _rth, 
      resetTokenExpiry: _rte,
      ...safe 
    } = user;
    return safe;
  }

  // User methods
  getUsers(): User[] {
    return this.data.users.map(u => this.toSafeUser(u));
  }

  getUserById(id: string): User | null {
    const u = this.data.users.find(x => x.id === id);
    if (!u) return null;
    return this.toSafeUser(u);
  }

  getUserRecordById(id: string): UserRecord | null {
    const u = this.data.users.find(x => x.id === id);
    return u || null;
  }

  getUserByEmail(email: string): UserRecord | null {
    const clean = email.trim().toLowerCase();
    return this.data.users.find(x => x.email.toLowerCase() === clean) || null;
  }

  createUser(user: UserRecord): User {
    this.data.users.push(user);
    this.persist();
    return this.toSafeUser(user);
  }

  updateUser(id: string, updates: Partial<UserRecord>): User | null {
    const index = this.data.users.findIndex(x => x.id === id);
    if (index === -1) return null;
    this.data.users[index] = { ...this.data.users[index], ...updates };
    this.persist();
    return this.toSafeUser(this.data.users[index]);
  }

  // Pending Registration with Gmail OTP
  setPendingRegistration(reg: PendingRegistration): void {
    const clean = reg.email.trim().toLowerCase();
    const existing = this.pendingRegistrations.get(clean);
    const hashes = new Set<string>();
    if (existing?.otpHash) hashes.add(existing.otpHash);
    if (existing?.otpHashes) existing.otpHashes.forEach(h => hashes.add(h));
    if (reg.otpHash) hashes.add(reg.otpHash);
    if (reg.otpHashes) reg.otpHashes.forEach(h => hashes.add(h));

    this.pendingRegistrations.set(clean, {
      ...reg,
      email: clean,
      otpHashes: Array.from(hashes)
    });
    this.persistPendingRegistrations();
  }

  getPendingRegistration(email: string): PendingRegistration | null {
    const clean = email.trim().toLowerCase();
    const reg = this.pendingRegistrations.get(clean);
    if (!reg) return null;
    if (Date.now() > reg.expiresAt) {
      this.pendingRegistrations.delete(clean);
      this.persistPendingRegistrations();
      return null;
    }
    return reg;
  }

  deletePendingRegistration(email: string): void {
    const clean = email.trim().toLowerCase();
    this.pendingRegistrations.delete(clean);
    this.persistPendingRegistrations();
  }

  // Security Audit Logging
  logSecurityEvent(event: Omit<SecurityAuditLog, 'id' | 'timestamp'>): SecurityAuditLog {
    if (!this.data.securityAuditLogs) {
      this.data.securityAuditLogs = [];
    }
    const log: SecurityAuditLog = {
      id: 'sec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      ...event
    };
    this.data.securityAuditLogs.unshift(log);
    if (this.data.securityAuditLogs.length > 500) {
      this.data.securityAuditLogs = this.data.securityAuditLogs.slice(0, 500);
    }
    this.persist();
    return log;
  }

  getSecurityAuditLogs(limit = 100): SecurityAuditLog[] {
    if (!this.data.securityAuditLogs) return [];
    return this.data.securityAuditLogs.slice(0, limit);
  }

  // Services
  getServices() {
    return this.data.services;
  }

  getServiceById(id: string) {
    return this.data.services.find(s => s.id === id || s.slug === id);
  }

  createService(service: Service) {
    this.data.services.push(service);
    this.persist();
    return service;
  }

  updateService(id: string, updates: Partial<Service>) {
    const idx = this.data.services.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.services[idx] = { ...this.data.services[idx], ...updates };
    this.persist();
    return this.data.services[idx];
  }

  deleteService(id: string) {
    const idx = this.data.services.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.data.services.splice(idx, 1);
    this.persist();
    return true;
  }

  // Bookings
  getBookings() {
    return this.data.bookings;
  }

  getBookingsByUser(userId: string) {
    return this.data.bookings.filter(b => b.userId === userId);
  }

  getBookingById(id: string) {
    return this.data.bookings.find(b => b.id === id || b.bookingNumber === id);
  }

  createBooking(booking: Booking) {
    this.data.bookings.unshift(booking);
    this.persist();
    return booking;
  }

  updateBooking(id: string, updates: Partial<Booking>) {
    const idx = this.data.bookings.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.data.bookings[idx] = { 
      ...this.data.bookings[idx], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.persist();
    return this.data.bookings[idx];
  }

  deleteBooking(id: string) {
    const idx = this.data.bookings.findIndex(b => b.id === id);
    if (idx === -1) return false;
    this.data.bookings.splice(idx, 1);
    this.persist();
    return true;
  }

  // Payments
  getPayments() {
    return this.data.payments;
  }

  getPaymentsByUser(userId: string) {
    return this.data.payments.filter(p => p.userId === userId);
  }

  createPayment(payment: PaymentRecord) {
    this.data.payments.unshift(payment);
    this.persist();
    return payment;
  }

  // Enquiries
  getEnquiries(): Enquiry[] {
    if (!this.data.enquiries) this.data.enquiries = [];
    return [...this.data.enquiries].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeB - timeA;
    });
  }

  createEnquiry(enquiry: Enquiry) {
    if (!this.data.enquiries) this.data.enquiries = [];
    if (!enquiry.id) {
      enquiry.id = 'enq-' + Date.now();
    }
    if (!enquiry.createdAt) {
      enquiry.createdAt = new Date().toISOString();
    }
    if (enquiry.isDemo === undefined) {
      enquiry.isDemo = false;
    }

    const existingIdx = this.data.enquiries.findIndex(e => e.id === enquiry.id);
    if (existingIdx !== -1) {
      this.data.enquiries[existingIdx] = { ...this.data.enquiries[existingIdx], ...enquiry };
    } else {
      this.data.enquiries.unshift(enquiry);
    }
    this.persist();
    return enquiry;
  }

  clearDemoEnquiries(): { removedCount: number; remainingCount: number } {
    if (!this.data.enquiries) this.data.enquiries = [];
    const beforeCount = this.data.enquiries.length;
    this.data.enquiries = this.data.enquiries.filter(e => {
      const isDemo = e.isDemo || e.id === 'enq-1' || e.id === 'enq-2' || e.id === 'enq-demo-1' || e.name.toLowerCase().includes('demo');
      return !isDemo;
    });
    this.persist();
    return {
      removedCount: beforeCount - this.data.enquiries.length,
      remainingCount: this.data.enquiries.length
    };
  }

  updateEnquiry(id: string, updates: Partial<Enquiry>) {
    const idx = this.data.enquiries.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.enquiries[idx] = { ...this.data.enquiries[idx], ...updates };
    this.persist();
    return this.data.enquiries[idx];
  }

  deleteEnquiry(id: string) {
    const idx = this.data.enquiries.findIndex(e => e.id === id);
    if (idx === -1) return false;
    this.data.enquiries.splice(idx, 1);
    this.persist();
    return true;
  }

  // Reviews
  getReviews(includeUnapproved = false) {
    if (includeUnapproved) return this.data.reviews;
    return this.data.reviews.filter(r => r.approved);
  }

  createReview(review: Review) {
    this.data.reviews.unshift(review);
    this.persist();
    return review;
  }

  updateReview(id: string, updates: Partial<Review>) {
    const idx = this.data.reviews.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.reviews[idx] = { ...this.data.reviews[idx], ...updates };
    this.persist();
    return this.data.reviews[idx];
  }

  deleteReview(id: string) {
    const idx = this.data.reviews.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.data.reviews.splice(idx, 1);
    this.persist();
    return true;
  }

  // Gallery
  getGallery(category?: string) {
    if (!category || category === 'All') return this.data.gallery;
    return this.data.gallery.filter(g => g.category.toLowerCase() === category.toLowerCase());
  }

  createGalleryItem(item: GalleryItem) {
    this.data.gallery.unshift(item);
    this.persist();
    return item;
  }

  deleteGalleryItem(id: string) {
    const idx = this.data.gallery.findIndex(g => g.id === id);
    if (idx === -1) return false;
    this.data.gallery.splice(idx, 1);
    this.persist();
    return true;
  }

  // Karizma Albums
  getKarizmaAlbums() {
    return this.data.karizmaAlbums || [];
  }

  getKarizmaAlbumById(id: string) {
    return (this.data.karizmaAlbums || []).find(a => a.id === id);
  }

  createKarizmaAlbum(album: KarizmaAlbumItem) {
    if (!this.data.karizmaAlbums) this.data.karizmaAlbums = [];
    this.data.karizmaAlbums.unshift(album);
    this.persist();
    return album;
  }

  deleteKarizmaAlbum(id: string) {
    if (!this.data.karizmaAlbums) return false;
    const idx = this.data.karizmaAlbums.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.data.karizmaAlbums.splice(idx, 1);
    this.persist();
    return true;
  }

  updateKarizmaAlbum(id: string, updates: Partial<KarizmaAlbumItem>) {
    if (!this.data.karizmaAlbums) return null;
    const idx = this.data.karizmaAlbums.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.data.karizmaAlbums[idx] = { ...this.data.karizmaAlbums[idx], ...updates };
    this.persist();
    return this.data.karizmaAlbums[idx];
  }

  addSpreadToAlbum(id: string, spreadUrl: string) {
    if (!this.data.karizmaAlbums) return null;
    const album = this.data.karizmaAlbums.find(a => a.id === id);
    if (!album) return null;
    album.spreads.push(spreadUrl);
    this.persist();
    return album;
  }

  deleteSpreadFromAlbum(id: string, spreadIndex: number) {
    if (!this.data.karizmaAlbums) return null;
    const album = this.data.karizmaAlbums.find(a => a.id === id);
    if (!album || spreadIndex < 0 || spreadIndex >= album.spreads.length) return null;
    album.spreads.splice(spreadIndex, 1);
    this.persist();
    return album;
  }

  getPaymentSettings(): PaymentSettings {
    if (!this.data.paymentSettings) {
      this.data.paymentSettings = {
        upiId: '8709017294@ybl',
        phone: '+91 87090 17294',
        merchantName: 'Ashish Wedding Film Studio',
        bankName: 'State Bank of India',
        accountNumber: '',
        ifscCode: '',
        accountHolder: 'Ashish Kumar',
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_ashish_studio',
        studioLocation: 'Gumo, Kharitand, Jhumri Telaiya, Koderma, Jharkhand',
        currency: 'INR',
        facebookUrl: 'https://www.facebook.com/ashishweddingfilm',
        instagramUrl: 'https://www.instagram.com/ashishweddingfilm',
        youtubeUrl: 'https://www.youtube.com/@ashishweddingfilm'
      };
    }
    if (!this.data.paymentSettings.facebookUrl) {
      this.data.paymentSettings.facebookUrl = 'https://www.facebook.com/ashishweddingfilm';
    }
    if (!this.data.paymentSettings.instagramUrl) {
      this.data.paymentSettings.instagramUrl = 'https://www.instagram.com/ashishweddingfilm';
    }
    if (!this.data.paymentSettings.youtubeUrl) {
      this.data.paymentSettings.youtubeUrl = 'https://www.youtube.com/@ashishweddingfilm';
    }
    return this.data.paymentSettings;
  }

  updatePaymentSettings(updates: Partial<PaymentSettings>): PaymentSettings {
    const current = this.getPaymentSettings();
    this.data.paymentSettings = { ...current, ...updates };
    this.persist();
    return this.data.paymentSettings;
  }
}

export const db = new Database();
