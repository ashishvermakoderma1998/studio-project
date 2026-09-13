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

// Studio default data is imported from src/data/studioData.ts (INITIAL_SERVICES, INITIAL_GALLERY, INITIAL_REVIEWS, INITIAL_KARIZMA_ALBUMS)

class Database {
  private data: DatabaseSchema;
  private pendingRegistrations: Map<string, PendingRegistration> = new Map();

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed: DatabaseSchema = JSON.parse(raw);
        if (!parsed.karizmaAlbums || parsed.karizmaAlbums.length === 0) {
          parsed.karizmaAlbums = INITIAL_KARIZMA_ALBUMS;
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read existing db file, seeding fresh database:', e);
    }

    // Default Seed Data
    const adminPasswordHash = bcrypt.hashSync('Ashish@2026!', 10);
    const demoUserPasswordHash = bcrypt.hashSync('User@1234', 10);

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
      },
      {
        id: 'usr-demo-client',
        name: 'Rohan Sharma',
        email: 'rohan.client@gmail.com',
        phone: '+91 87090 17294',
        role: 'user',
        city: 'Ranchi, Jharkhand',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        passwordHash: demoUserPasswordHash,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString()
      }
    ];

    const initialBookings: Booking[] = [
      {
        id: 'bkg-1001',
        bookingNumber: 'AWF-2026-8801',
        userId: 'usr-demo-client',
        userName: 'Rohan Sharma',
        userEmail: 'rohan.client@gmail.com',
        userPhone: '+91 87090 17294',
        serviceId: 'srv-cinematic-film',
        serviceTitle: 'Cinematic Wedding Films',
        servicePrice: 45000,
        eventType: 'Wedding & Sangeet',
        eventDate: '2026-11-20',
        eventTime: '18:00',
        eventLocation: 'Grand Utsav Marriage Hall, Jhumri Telaiya',
        hours: 12,
        additionalRequirements: 'Drone shots during bride arrival and live Sangeet mixer recording.',
        referenceImages: ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'],
        bookingAmount: 45000,
        advanceAmount: 15000,
        paymentStatus: 'Paid',
        bookingStatus: 'Confirmed',
        paymentId: 'pay-txn-88991',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
      }
    ];

    const initialPayments: PaymentRecord[] = [
      {
        id: 'pay-1',
        transactionId: 'pay-txn-88991',
        bookingId: 'bkg-1001',
        userId: 'usr-demo-client',
        userName: 'Rohan Sharma',
        userEmail: 'rohan.client@gmail.com',
        amount: 15000,
        method: 'Razorpay',
        paymentStatus: 'Success',
        receiptNumber: 'RCPT-AWF-9901',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
      }
    ];

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
    this.pendingRegistrations.set(clean, { ...reg, email: clean });
  }

  getPendingRegistration(email: string): PendingRegistration | null {
    const clean = email.trim().toLowerCase();
    const reg = this.pendingRegistrations.get(clean);
    if (!reg) return null;
    if (Date.now() > reg.expiresAt) {
      this.pendingRegistrations.delete(clean);
      return null;
    }
    return reg;
  }

  deletePendingRegistration(email: string): void {
    const clean = email.trim().toLowerCase();
    this.pendingRegistrations.delete(clean);
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
  getEnquiries() {
    return this.data.enquiries;
  }

  createEnquiry(enquiry: Enquiry) {
    this.data.enquiries.unshift(enquiry);
    this.persist();
    return enquiry;
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
        currency: 'INR'
      };
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
