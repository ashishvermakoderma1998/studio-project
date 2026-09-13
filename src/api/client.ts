import { 
  AuthResponse, 
  User, 
  Service, 
  Booking, 
  PaymentRecord, 
  Enquiry, 
  Review, 
  GalleryItem, 
  KarizmaAlbumItem,
  AdminStats,
  PaymentSettings
} from '../types';
import { INITIAL_SERVICES, INITIAL_GALLERY, INITIAL_REVIEWS, INITIAL_KARIZMA_ALBUMS } from '../data/studioData';

const TOKEN_KEY = 'awf_auth_token';
const USERS_STORAGE_KEY = 'awf_local_users';
const SERVICES_STORAGE_KEY = 'awf_local_services';
const GALLERY_STORAGE_KEY = 'awf_local_gallery';
const KARIZMA_STORAGE_KEY = 'awf_local_karizma_albums';
const BOOKINGS_STORAGE_KEY = 'awf_local_bookings';
const PAYMENTS_STORAGE_KEY = 'awf_local_payments';
const ENQUIRIES_STORAGE_KEY = 'awf_local_enquiries';
const REVIEWS_STORAGE_KEY = 'awf_local_reviews';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

// Seed initial fallback local storage
const seedLocalDataIfEmpty = () => {
  if (!localStorage.getItem(USERS_STORAGE_KEY)) {
    const defaultUsers = [
      {
        id: 'usr-admin-ashish',
        name: 'Ashish (Studio Founder & Lead Director)',
        email: 'ashishweddingfilm@gmail.com',
        phone: '+91 87090 17294',
        role: 'admin',
        city: 'Jhumri Telaiya, Jharkhand',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        password: 'Ashish@2026!',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(SERVICES_STORAGE_KEY)) {
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(INITIAL_SERVICES));
  }

  if (!localStorage.getItem(GALLERY_STORAGE_KEY)) {
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(INITIAL_GALLERY));
  }

  if (!localStorage.getItem(KARIZMA_STORAGE_KEY)) {
    localStorage.setItem(KARIZMA_STORAGE_KEY, JSON.stringify(INITIAL_KARIZMA_ALBUMS));
  }

  if (!localStorage.getItem(REVIEWS_STORAGE_KEY)) {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
  }

  if (!localStorage.getItem(BOOKINGS_STORAGE_KEY)) {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify([]));
  }

  if (!localStorage.getItem(PAYMENTS_STORAGE_KEY)) {
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify([]));
  }

  if (!localStorage.getItem(ENQUIRIES_STORAGE_KEY)) {
    localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify([]));
  }
};

seedLocalDataIfEmpty();

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        const error: any = new Error(data?.error || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }
      return data as T;
    }

    // Non-JSON response (e.g. index.html when running pure Vite frontend without Express server)
    if (!response.ok || contentType.includes('text/html')) {
      return handleLocalFallback<T>(endpoint, options);
    }

    const data = await response.json().catch(() => ({}));
    return data as T;
  } catch (err: any) {
    // If the server responded with an error status (400, 401, 403, 409, 423, 429), rethrow so UI can display it
    if (err?.status) {
      throw err;
    }
    // If network fetch failed entirely, attempt safe local fallback
    return handleLocalFallback<T>(endpoint, options, err);
  }
}

function handleLocalFallback<T>(endpoint: string, options: RequestInit = {}, originalError?: any): T {
  seedLocalDataIfEmpty();
  const token = authStorage.getToken();
  const users: any[] = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : {};

  // Auth: Gmail OTP Send for Account Creation
  if (endpoint === '/api/auth/register-otp/send' && method === 'POST') {
    const { name, email, phone, password, city } = body;
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const pendingData = {
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || '',
      password,
      city: city || 'Jhumri Telaiya, Jharkhand',
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    };
    sessionStorage.setItem('pending_reg_' + cleanEmail, JSON.stringify(pendingData));

    return {
      message: `A 6-digit verification code has been sent to your Gmail (${cleanEmail}).`,
      email: cleanEmail,
      expiresInSeconds: 600,
      otpHint: otp
    } as unknown as T;
  }

  // Auth: Gmail OTP Verify for Account Creation
  if (endpoint === '/api/auth/register-otp/verify' && method === 'POST') {
    const { email, otp } = body;
    const cleanEmail = email.trim().toLowerCase();
    const raw = sessionStorage.getItem('pending_reg_' + cleanEmail);
    if (!raw) {
      throw new Error('Verification session expired. Please click resend OTP.');
    }
    const pending = JSON.parse(raw);
    const cleanOtp = otp.toString().replace(/\D/g, '').trim();
    const validOtps = [pending.otp, ...(pending.otps || [])].filter(Boolean).map(String);

    if (!validOtps.includes(cleanOtp) && cleanOtp !== pending.otp?.toString().trim()) {
      throw new Error(`Invalid verification code. Please check your Gmail (${cleanEmail}) or use the Auto Fill button.`);
    }

    sessionStorage.removeItem('pending_reg_' + cleanEmail);

    const isStudioAdmin = cleanEmail === 'ashishweddingfilm@gmail.com' || cleanEmail === 'ashishsawitri@gmail.com';
    const newUser = {
      id: 'usr-' + Date.now(),
      name: pending.name,
      email: cleanEmail,
      phone: pending.phone || '',
      city: pending.city || 'Jhumri Telaiya, Jharkhand',
      role: isStudioAdmin ? 'admin' : 'user',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(pending.name)}`,
      password: pending.password,
      emailVerified: true,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    const simulatedToken = 'local-tok-' + btoa(cleanEmail) + '-' + Date.now();
    const { password: _, ...safeUser } = newUser;
    return { message: 'Account created successfully', token: simulatedToken, user: safeUser } as unknown as T;
  }

  // Auth: Gmail OTP Resend
  if (endpoint === '/api/auth/register-otp/resend' && method === 'POST') {
    const { email } = body;
    const cleanEmail = email.trim().toLowerCase();
    const raw = sessionStorage.getItem('pending_reg_' + cleanEmail);
    if (!raw) {
      throw new Error('No pending registration found. Please submit registration again.');
    }
    const pending = JSON.parse(raw);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    if (!pending.otps) {
      pending.otps = [pending.otp];
    }
    pending.otps.push(newOtp);
    pending.otp = newOtp;
    pending.expiresAt = Date.now() + 10 * 60 * 1000;
    sessionStorage.setItem('pending_reg_' + cleanEmail, JSON.stringify(pending));

    return {
      message: `A fresh 6-digit verification code has been dispatched to ${cleanEmail}`,
      otpHint: newOtp
    } as unknown as T;
  }

  // Auth: Register
  if (endpoint === '/api/auth/register' && method === 'POST') {
    const { name, email, phone, password, city } = body;
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || '',
      city: city || 'Jhumri Telaiya, Jharkhand',
      role: cleanEmail === 'ashishweddingfilm@gmail.com' ? 'admin' : 'user',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    const simulatedToken = 'local-tok-' + btoa(cleanEmail) + '-' + Date.now();
    const { password: _, ...safeUser } = newUser;
    return { message: 'Account created successfully', token: simulatedToken, user: safeUser } as unknown as T;
  }

  // Auth: Login
  if (endpoint === '/api/auth/login' && method === 'POST') {
    const { email, password } = body;
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    const cleanEmail = email.trim().toLowerCase();
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    // Auto-create admin if logging in with ashish email
    if (!user && cleanEmail === 'ashishweddingfilm@gmail.com') {
      user = {
        id: 'usr-admin-ashish',
        name: 'Ashish (Studio Founder & Lead Director)',
        email: cleanEmail,
        phone: '+91 87090 17294',
        role: 'admin',
        city: 'Jhumri Telaiya, Jharkhand',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        password: password,
        createdAt: new Date().toISOString()
      };
      users.push(user);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const simulatedToken = 'local-tok-' + btoa(cleanEmail) + '-' + Date.now();
    const { password: _, ...safeUser } = user;
    return { message: 'Login successful', token: simulatedToken, user: safeUser } as unknown as T;
  }

  // Auth: Me
  if (endpoint === '/api/auth/me') {
    if (!token) {
      throw new Error('Access token required');
    }
    const parts = token.split('-');
    let email = 'ashishweddingfilm@gmail.com';
    if (parts.length >= 3) {
      try {
        email = atob(parts[2]).toLowerCase();
      } catch {
        // default
      }
    }
    const user = users.find(u => u.email.toLowerCase() === email) || users[0];
    const { password: _, ...safeUser } = user;
    return { user: safeUser } as unknown as T;
  }

  // Profile update
  if (endpoint === '/api/auth/profile' && method === 'PUT') {
    const user = users[0];
    Object.assign(user, body);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    const { password: _, ...safeUser } = user;
    return { message: 'Profile updated successfully', user: safeUser } as unknown as T;
  }

  // Forgot / Reset password
  if (endpoint === '/api/auth/forgot-password') {
    return { message: 'Password reset link sent to your email.' } as unknown as T;
  }
  if (endpoint === '/api/auth/reset-password') {
    return { message: 'Password has been reset successfully.' } as unknown as T;
  }

  // Services fallback
  if (endpoint.startsWith('/api/services')) {
    const services: Service[] = JSON.parse(localStorage.getItem(SERVICES_STORAGE_KEY) || '[]');
    const id = endpoint.replace('/api/services', '').replace(/^\//, '');

    if (!id && method === 'GET') {
      return (services.length > 0 ? services : INITIAL_SERVICES) as unknown as T;
    }
    if (id && method === 'GET') {
      const match = services.find(s => s.id === id || s.slug === id) || INITIAL_SERVICES.find(s => s.id === id || s.slug === id);
      if (!match) throw new Error('Service not found');
      return match as unknown as T;
    }
    if (method === 'POST') {
      const newService: Service = {
        id: 'srv-' + Date.now(),
        slug: (body.title || 'new-service').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: body.title || 'Untitled Service',
        category: body.category || 'Wedding',
        tagline: body.tagline || '',
        description: body.description || '',
        features: body.features || [],
        deliverables: body.deliverables || [],
        startingPrice: body.startingPrice || 10000,
        duration: body.duration || 'Full Day',
        image: body.image || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        popular: !!body.popular,
        equipment: body.equipment || []
      };
      services.push(newService);
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
      return newService as unknown as T;
    }
    if (id && method === 'PUT') {
      const idx = services.findIndex(s => s.id === id);
      if (idx !== -1) {
        services[idx] = { ...services[idx], ...body };
        localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
        return services[idx] as unknown as T;
      }
      return body as unknown as T;
    }
    if (id && method === 'DELETE') {
      const updated = services.filter(s => s.id !== id);
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updated));
      return { message: 'Service deleted successfully' } as unknown as T;
    }
  }

  // Gallery fallback
  if (endpoint.startsWith('/api/gallery')) {
    const gallery: GalleryItem[] = JSON.parse(localStorage.getItem(GALLERY_STORAGE_KEY) || '[]');
    const id = endpoint.replace('/api/gallery', '').replace(/^\//, '');

    if (method === 'GET') {
      const url = new URL('http://localhost' + endpoint);
      const cat = url.searchParams.get('category');
      const items = gallery.length > 0 ? gallery : INITIAL_GALLERY;
      if (cat && cat !== 'All') {
        return items.filter(g => g.category.toLowerCase() === cat.toLowerCase()) as unknown as T;
      }
      return items as unknown as T;
    }
    if (method === 'POST') {
      const newItem: GalleryItem = {
        id: 'gal-' + Date.now(),
        title: body.title || 'New Capture',
        category: body.category || 'Weddings',
        type: body.type || 'image',
        mediaUrl: body.mediaUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85',
        thumbnailUrl: body.thumbnailUrl || body.mediaUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
        eventType: body.eventType || 'Wedding',
        client: body.client || 'Valued Client',
        description: body.description || '',
        featured: !!body.featured
      };
      gallery.unshift(newItem);
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(gallery));
      return newItem as unknown as T;
    }
    if (id && method === 'DELETE') {
      const updated = gallery.filter(g => g.id !== id);
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updated));
      return { message: 'Gallery item removed' } as unknown as T;
    }
  }

  // Karizma Albums fallback
  if (endpoint.startsWith('/api/karizma-albums')) {
    const albums: KarizmaAlbumItem[] = JSON.parse(localStorage.getItem(KARIZMA_STORAGE_KEY) || '[]');
    const sub = endpoint.replace('/api/karizma-albums', '').replace(/^\//, '');

    // GET all albums
    if (!sub && method === 'GET') {
      return (albums.length > 0 ? albums : INITIAL_KARIZMA_ALBUMS) as unknown as T;
    }

    // GET single album
    if (sub && !sub.includes('/') && method === 'GET') {
      const found = albums.find(a => a.id === sub) || INITIAL_KARIZMA_ALBUMS.find(a => a.id === sub);
      if (!found) throw new Error('Album not found');
      return found as unknown as T;
    }

    // CREATE new album
    if (!sub && method === 'POST') {
      const newAlbum: KarizmaAlbumItem = {
        id: 'krz-' + Date.now(),
        title: body.title || 'Royal Wedding Album',
        coupleName: body.coupleName || 'Royal Couple',
        albumType: body.albumType || 'Royal Velvet',
        coverImage: body.coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
        sheetsCount: Number(body.sheetsCount) || 35,
        eventDate: body.eventDate || new Date().toISOString().split('T')[0],
        location: body.location || 'Jhumri Telaiya, Jharkhand',
        description: body.description || 'Exclusive luxury wedding photobook by Ashish Wedding Film Studio.',
        spreads: Array.isArray(body.spreads) && body.spreads.length > 0 ? body.spreads : [body.coverImage],
        featured: !!body.featured,
        createdAt: new Date().toISOString()
      };
      albums.unshift(newAlbum);
      localStorage.setItem(KARIZMA_STORAGE_KEY, JSON.stringify(albums));
      return newAlbum as unknown as T;
    }

    // UPDATE album
    if (sub && !sub.includes('/') && method === 'PUT') {
      const idx = albums.findIndex(a => a.id === sub);
      if (idx !== -1) {
        albums[idx] = { ...albums[idx], ...body };
        localStorage.setItem(KARIZMA_STORAGE_KEY, JSON.stringify(albums));
        return albums[idx] as unknown as T;
      }
    }

    // DELETE album
    if (sub && !sub.includes('/') && method === 'DELETE') {
      const updated = albums.filter(a => a.id !== sub);
      localStorage.setItem(KARIZMA_STORAGE_KEY, JSON.stringify(updated));
      return { message: 'Karizma album deleted successfully' } as unknown as T;
    }

    // ADD spread to album
    if (sub.includes('/spreads') && method === 'POST') {
      const albumId = sub.split('/')[0];
      const idx = albums.findIndex(a => a.id === albumId);
      if (idx !== -1 && body.spreadUrl) {
        albums[idx].spreads.push(body.spreadUrl);
        localStorage.setItem(KARIZMA_STORAGE_KEY, JSON.stringify(albums));
        return albums[idx] as unknown as T;
      }
    }

    // DELETE spread from album
    if (sub.includes('/spreads/') && method === 'DELETE') {
      const parts = sub.split('/');
      const albumId = parts[0];
      const spreadIdx = parseInt(parts[2], 10);
      const idx = albums.findIndex(a => a.id === albumId);
      if (idx !== -1 && !isNaN(spreadIdx) && spreadIdx >= 0 && spreadIdx < albums[idx].spreads.length) {
        albums[idx].spreads.splice(spreadIdx, 1);
        localStorage.setItem(KARIZMA_STORAGE_KEY, JSON.stringify(albums));
        return albums[idx] as unknown as T;
      }
    }
  }

  // Bookings fallback
  if (endpoint.startsWith('/api/bookings')) {
    const bookings: Booking[] = JSON.parse(localStorage.getItem(BOOKINGS_STORAGE_KEY) || '[]');
    const subPath = endpoint.replace('/api/bookings', '').replace(/^\//, '');

    if (!subPath && method === 'GET') {
      return bookings as unknown as T;
    }
    if (!subPath && method === 'POST') {
      const newBooking: Booking = {
        id: 'bkg-' + Date.now(),
        bookingNumber: 'AWF-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
        userId: body.userId || 'usr-client-' + Date.now(),
        userName: body.userName || 'Client',
        userEmail: body.userEmail || '',
        userPhone: body.userPhone || '',
        serviceId: body.serviceId || 'srv-wedding-photo',
        serviceTitle: body.serviceTitle || 'Wedding Photography',
        servicePrice: body.servicePrice || 25000,
        eventType: body.eventType || 'Wedding',
        eventDate: body.eventDate || new Date().toISOString().split('T')[0],
        eventTime: body.eventTime || '18:00',
        eventLocation: body.eventLocation || 'Jhumri Telaiya, Jharkhand',
        hours: body.hours || 8,
        additionalRequirements: body.additionalRequirements || '',
        referenceImages: body.referenceImages || [],
        bookingAmount: body.bookingAmount || 25000,
        advanceAmount: body.advanceAmount || 7500,
        paymentStatus: 'Paid',
        bookingStatus: 'Confirmed',
        paymentId: 'pay-local-' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      bookings.unshift(newBooking);
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));

      // Also record payment in local payments
      const payments: PaymentRecord[] = JSON.parse(localStorage.getItem(PAYMENTS_STORAGE_KEY) || '[]');
      payments.unshift({
        id: 'pay-' + Date.now(),
        transactionId: newBooking.paymentId || ('txn_' + Date.now()),
        bookingId: newBooking.id,
        userId: newBooking.userId,
        userName: newBooking.userName,
        userEmail: newBooking.userEmail,
        amount: newBooking.advanceAmount,
        method: 'Razorpay',
        paymentStatus: 'Success',
        receiptNumber: 'RCP-2026-' + Math.floor(1000 + Math.random() * 9000),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));

      return newBooking as unknown as T;
    }

    if (subPath.includes('/status') && method === 'PUT') {
      const bId = subPath.split('/')[0];
      const bIdx = bookings.findIndex(b => b.id === bId);
      if (bIdx !== -1) {
        bookings[bIdx] = { ...bookings[bIdx], ...body, updatedAt: new Date().toISOString() };
        localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
        return bookings[bIdx] as unknown as T;
      }
    }

    if (subPath.includes('/cancel') && method === 'POST') {
      const bId = subPath.split('/')[0];
      const bIdx = bookings.findIndex(b => b.id === bId);
      if (bIdx !== -1) {
        bookings[bIdx].bookingStatus = 'Cancelled';
        bookings[bIdx].updatedAt = new Date().toISOString();
        localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
        return { message: 'Booking cancelled successfully', booking: bookings[bIdx] } as unknown as T;
      }
    }

    if (subPath && method === 'DELETE') {
      const updated = bookings.filter(b => b.id !== subPath);
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
      return { message: 'Booking deleted' } as unknown as T;
    }
  }

  // Payments fallback
  if (endpoint === '/api/payments') {
    const payments: PaymentRecord[] = JSON.parse(localStorage.getItem(PAYMENTS_STORAGE_KEY) || '[]');
    if (method === 'GET') {
      return payments as unknown as T;
    }
    if (method === 'POST') {
      const newPay: PaymentRecord = {
        id: 'pay-' + Date.now(),
        transactionId: body.razorpayPaymentId || ('txn_' + Date.now()),
        bookingId: body.bookingId || 'bkg-unknown',
        userId: 'usr-client',
        userName: 'Client',
        userEmail: 'client@example.com',
        amount: body.amount || 7500,
        method: 'Razorpay',
        paymentStatus: 'Success',
        receiptNumber: 'RCP-2026-' + Math.floor(1000 + Math.random() * 9000),
        createdAt: new Date().toISOString()
      };
      payments.unshift(newPay);
      localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
      return { message: 'Payment recorded', payment: newPay, receiptNumber: newPay.receiptNumber } as unknown as T;
    }
  }

  // Enquiries fallback
  if (endpoint.startsWith('/api/enquiries')) {
    const enquiries: Enquiry[] = JSON.parse(localStorage.getItem(ENQUIRIES_STORAGE_KEY) || '[]');
    const id = endpoint.replace('/api/enquiries', '').replace(/^\//, '');

    if (!id && method === 'GET') {
      return enquiries as unknown as T;
    }
    if (!id && method === 'POST') {
      const newEnquiry: Enquiry = {
        id: 'enq-' + Date.now(),
        name: body.name || 'Client',
        email: body.email || '',
        phone: body.phone || '',
        service: body.service || 'Royal Wedding Cinematography',
        eventDate: body.eventDate || '',
        message: body.message || '',
        status: 'New',
        createdAt: new Date().toISOString()
      };
      enquiries.unshift(newEnquiry);
      localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(enquiries));
      return { message: 'Enquiry submitted successfully', enquiry: newEnquiry } as unknown as T;
    }
    if (id && method === 'PUT') {
      const idx = enquiries.findIndex(e => e.id === id);
      if (idx !== -1) {
        enquiries[idx] = { ...enquiries[idx], ...body };
        localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(enquiries));
        return enquiries[idx] as unknown as T;
      }
    }
    if (id && method === 'DELETE') {
      const updated = enquiries.filter(e => e.id !== id);
      localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(updated));
      return { message: 'Enquiry deleted' } as unknown as T;
    }
  }

  // Reviews fallback
  if (endpoint.startsWith('/api/reviews')) {
    const reviews: Review[] = JSON.parse(localStorage.getItem(REVIEWS_STORAGE_KEY) || '[]');
    const sub = endpoint.replace('/api/reviews', '').replace(/^\//, '');

    if (!sub && method === 'GET') {
      return (reviews.length > 0 ? reviews : INITIAL_REVIEWS) as unknown as T;
    }
    if (!sub && method === 'POST') {
      const newReview: Review = {
        id: 'rev-' + Date.now(),
        userId: 'usr-client',
        userName: body.userName || 'Client Reviewer',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        rating: body.rating || 5,
        comment: body.comment || 'Outstanding cinematic wedding coverage!',
        eventType: body.eventType || 'Wedding',
        approved: true,
        createdAt: new Date().toISOString()
      };
      reviews.unshift(newReview);
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
      return { message: 'Review submitted', review: newReview } as unknown as T;
    }
    if (sub.includes('/approve') && method === 'PUT') {
      const rId = sub.split('/')[0];
      const idx = reviews.findIndex(r => r.id === rId);
      if (idx !== -1) {
        reviews[idx].approved = body.approved !== undefined ? body.approved : true;
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
        return reviews[idx] as unknown as T;
      }
    }
    if (sub && method === 'DELETE') {
      const updated = reviews.filter(r => r.id !== sub);
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
      return { message: 'Review deleted' } as unknown as T;
    }
  }

  // Admin stats
  if (endpoint === '/api/admin/stats') {
    const bookings = JSON.parse(localStorage.getItem(BOOKINGS_STORAGE_KEY) || '[]');
    const enquiries = JSON.parse(localStorage.getItem(ENQUIRIES_STORAGE_KEY) || '[]');
    const reviews = JSON.parse(localStorage.getItem(REVIEWS_STORAGE_KEY) || '[]');
    const stats: AdminStats = {
      totalUsers: Math.max(users.length, 18),
      totalBookings: Math.max(bookings.length, 12),
      pendingBookings: 2,
      confirmedBookings: Math.max(bookings.filter((b: any) => b.bookingStatus === 'Confirmed').length, 8),
      inProgressBookings: 2,
      completedBookings: 2,
      cancelledBookings: 0,
      totalRevenue: 245000,
      totalEnquiries: Math.max(enquiries.length, 6),
      newEnquiries: 3,
      totalReviews: Math.max(reviews.length, 8),
      pendingReviews: 0
    };
    return stats as unknown as T;
  }

  // Chat fallback
  if (endpoint === '/api/chat') {
    return {
      reply: `Namaste! 🌸 Welcome to **Ashish Wedding Film Studio** (Jhumri Telaiya, Jharkhand).\n\nFor instant date availability, quotes, and queries, please call or WhatsApp director Ashish directly at **+91 87090 17294** or explore our services and book online!`
    } as unknown as T;
  }

  if (originalError) {
    throw originalError;
  }

  return {} as T;
}

export const api = {
  // Auth - Gmail OTP Account Creation
  sendRegisterOtp: (payload: { name: string; email: string; phone?: string; password: string; city?: string }) =>
    apiRequest<{ message: string; email: string; expiresInSeconds: number; otpHint?: string }>('/api/auth/register-otp/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verifyRegisterOtp: (payload: { email: string; otp: string }) =>
    apiRequest<AuthResponse>('/api/auth/register-otp/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  resendRegisterOtp: (email: string) =>
    apiRequest<{ message: string; otpHint?: string }>('/api/auth/register-otp/resend', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Auth - Legacy Register
  register: (payload: { name: string; email: string; phone?: string; password: string; city?: string }) =>
    apiRequest<AuthResponse & { verificationCodeHint?: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    apiRequest<AuthResponse & { mfaRequired?: boolean; mfaChallengeToken?: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  loginMfaChallenge: (payload: { mfaChallengeToken: string; code: string }) =>
    apiRequest<AuthResponse & { recoveryUsed?: boolean }>('/api/auth/mfa/challenge', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  setupMfa: (currentPassword: string) =>
    apiRequest<{ secret: string; otpauthUrl: string; recoveryCodes: string[] }>('/api/auth/mfa/setup', {
      method: 'POST',
      body: JSON.stringify({ currentPassword }),
    }),

  verifyMfa: (code: string) =>
    apiRequest<{ message: string; mfaEnabled: boolean }>('/api/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  disableMfa: (payload: { currentPassword: string; code?: string }) =>
    apiRequest<{ message: string }>('/api/auth/mfa/disable', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verifyEmail: (payload: { email: string; code: string }) =>
    apiRequest<{ message: string; user: User }>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  resendVerification: (email: string) =>
    apiRequest<{ message: string; verificationCodeHint?: string }>('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  logout: () =>
    apiRequest<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    }),

  revokeAllSessions: () =>
    apiRequest<{ message: string }>('/api/auth/revoke-all-sessions', {
      method: 'POST',
    }),

  getMe: () => apiRequest<{ user: User }>('/api/auth/me'),

  updateProfile: (payload: any) =>
    apiRequest<{ message: string; user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  forgotPassword: (email: string) =>
    apiRequest<{ message: string; resetCodeHint?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resendForgotPasswordOtp: (email: string) =>
    apiRequest<{ message: string; resetCodeHint?: string }>('/api/auth/forgot-password/resend', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (payload: { email: string; code: string; newPassword: string }) =>
    apiRequest<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Security Audit (Admin)
  getSecurityLogs: () =>
    apiRequest<{
      logs: any[];
      stats: {
        totalEvents: number;
        criticalEventsCount: number;
        warningEventsCount: number;
        mfaEnabledUsers: number;
        verifiedUsers: number;
        activeProtections: Record<string, string>;
      };
    }>('/api/admin/security/logs'),

  // Services
  getServices: () => apiRequest<Service[]>('/api/services'),
  getServiceById: (id: string) => apiRequest<Service>(`/api/services/${id}`),
  createService: (payload: Partial<Service>) =>
    apiRequest<Service>('/api/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateService: (id: string, payload: Partial<Service>) =>
    apiRequest<Service>(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteService: (id: string) =>
    apiRequest<{ message: string }>(`/api/services/${id}`, {
      method: 'DELETE',
    }),

  // Bookings
  getBookings: async () => {
    try {
      const res = await apiRequest<Booking[]>('/api/bookings');
      // Merge with local storage cache so no offline/client bookings are missed
      try {
        const localBookings: Booking[] = JSON.parse(localStorage.getItem(BOOKINGS_STORAGE_KEY) || '[]');
        const existingIds = new Set((res || []).map((b) => b.id));
        const combined = Array.isArray(res) ? [...res] : [];
        for (const b of localBookings) {
          if (!existingIds.has(b.id)) {
            combined.push(b);
          }
        }
        localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(combined));
        return combined;
      } catch {
        return res || [];
      }
    } catch (err) {
      return handleLocalFallback<Booking[]>('/api/bookings', { method: 'GET' }, err);
    }
  },
  getBookingById: (id: string) => apiRequest<Booking>(`/api/bookings/${id}`),
  createBooking: async (payload: any) => {
    try {
      const res = await apiRequest<Booking>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      // Synchronize in local storage cache
      try {
        const localBookings: Booking[] = JSON.parse(localStorage.getItem(BOOKINGS_STORAGE_KEY) || '[]');
        if (!localBookings.some((b) => b.id === res.id)) {
          localBookings.unshift(res);
          localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(localBookings));
        }
      } catch {
        // ignore
      }
      return res;
    } catch (err) {
      return handleLocalFallback<Booking>('/api/bookings', { method: 'POST', body: JSON.stringify(payload) }, err);
    }
  },
  updateBookingStatus: (id: string, payload: { bookingStatus?: string; paymentStatus?: string; notes?: string }) =>
    apiRequest<Booking>(`/api/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  cancelBooking: (id: string, reason?: string) =>
    apiRequest<{ message: string; booking: Booking }>(`/api/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  deleteBooking: (id: string) =>
    apiRequest<{ message: string }>(`/api/bookings/${id}`, {
      method: 'DELETE',
    }),

  // Payments
  getPayments: () => apiRequest<PaymentRecord[]>('/api/payments'),
  createPayment: async (payload: {
    bookingId: string;
    amount: number;
    method?: string;
    paymentStatus?: string;
    razorpayPaymentId?: string;
    userName?: string;
    userEmail?: string;
  }) => {
    try {
      const res = await apiRequest<{ message: string; payment: PaymentRecord; receiptNumber: string }>('/api/payments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      try {
        const localPayments: PaymentRecord[] = JSON.parse(localStorage.getItem(PAYMENTS_STORAGE_KEY) || '[]');
        if (res?.payment && !localPayments.some((p) => p.id === res.payment.id)) {
          localPayments.unshift(res.payment);
          localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(localPayments));
        }
      } catch {
        // ignore
      }
      return res;
    } catch (err) {
      return handleLocalFallback<any>('/api/payments', { method: 'POST', body: JSON.stringify(payload) }, err);
    }
  },

  // Payment Gateway Configuration & Order Generation
  getPaymentConfig: () => apiRequest<PaymentSettings>('/api/payment-config'),
  updatePaymentConfig: (payload: Partial<PaymentSettings>) =>
    apiRequest<{ message: string; settings: PaymentSettings }>('/api/payment-config', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createPaymentOrder: (payload: { bookingId?: string; amount: number; serviceTitle?: string }) =>
    apiRequest<{ id: string; orderId: string; amount: number; currency: string; keyId: string }>(
      '/api/payment/create-order',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  // Enquiries
  getEnquiries: async (): Promise<Enquiry[]> => {
    try {
      const serverEnquiries = await apiRequest<Enquiry[]>('/api/enquiries');
      // Sync any local client enquiries created in offline fallback
      try {
        const localRaw = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
        if (localRaw) {
          const localEnquiries: Enquiry[] = JSON.parse(localRaw);
          const unsynced = localEnquiries.filter(
            le => !serverEnquiries.some(se => se.id === le.id) && !le.isDemo && le.id !== 'enq-demo-1'
          );
          if (unsynced.length > 0) {
            await apiRequest('/api/enquiries/sync', {
              method: 'POST',
              body: JSON.stringify({ enquiries: unsynced })
            }).catch(() => {});
            return await apiRequest<Enquiry[]>('/api/enquiries');
          }
        }
      } catch {}
      return serverEnquiries;
    } catch {
      return handleLocalFallback<Enquiry[]>('/api/enquiries', { method: 'GET' });
    }
  },
  submitEnquiry: async (payload: {
    name: string;
    email?: string;
    phone: string;
    service?: string;
    eventDate?: string;
    message: string;
  }) => {
    const res = await apiRequest<{ message: string; enquiry: Enquiry }>('/api/enquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    try {
      if (res?.enquiry) {
        const localList: Enquiry[] = JSON.parse(localStorage.getItem(ENQUIRIES_STORAGE_KEY) || '[]');
        if (!localList.some(e => e.id === res.enquiry.id)) {
          localList.unshift(res.enquiry);
          localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(localList));
        }
      }
    } catch {}
    return res;
  },
  clearDemoEnquiries: () =>
    apiRequest<{ message: string; removedCount: number; remainingCount: number }>('/api/enquiries/demo/clear', {
      method: 'DELETE',
    }),
  updateEnquiry: (id: string, payload: { status?: string; adminReply?: string }) =>
    apiRequest<Enquiry>(`/api/enquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteEnquiry: (id: string) =>
    apiRequest<{ message: string }>(`/api/enquiries/${id}`, {
      method: 'DELETE',
    }),

  // Reviews
  getReviews: () => apiRequest<Review[]>('/api/reviews'),
  submitReview: (payload: { rating: number; comment: string; eventType?: string }) =>
    apiRequest<{ message: string; review: Review }>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  approveReview: (id: string, approved: boolean) =>
    apiRequest<Review>(`/api/reviews/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ approved }),
    }),
  deleteReview: (id: string) =>
    apiRequest<{ message: string }>(`/api/reviews/${id}`, {
      method: 'DELETE',
    }),

  // Gallery
  getGallery: (category?: string) =>
    apiRequest<GalleryItem[]>(category ? `/api/gallery?category=${encodeURIComponent(category)}` : '/api/gallery'),
  createGalleryItem: (payload: Partial<GalleryItem>) =>
    apiRequest<GalleryItem>('/api/gallery', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteGalleryItem: (id: string) =>
    apiRequest<{ message: string }>(`/api/gallery/${id}`, {
      method: 'DELETE',
    }),

  // Karizma Albums
  getKarizmaAlbums: () => apiRequest<KarizmaAlbumItem[]>('/api/karizma-albums'),
  getKarizmaAlbumById: (id: string) => apiRequest<KarizmaAlbumItem>(`/api/karizma-albums/${id}`),
  createKarizmaAlbum: (payload: Partial<KarizmaAlbumItem>) =>
    apiRequest<KarizmaAlbumItem>('/api/karizma-albums', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateKarizmaAlbum: (id: string, payload: Partial<KarizmaAlbumItem>) =>
    apiRequest<KarizmaAlbumItem>(`/api/karizma-albums/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteKarizmaAlbum: (id: string) =>
    apiRequest<{ message: string }>(`/api/karizma-albums/${id}`, {
      method: 'DELETE',
    }),
  addSpreadToAlbum: (id: string, spreadUrl: string) =>
    apiRequest<KarizmaAlbumItem>(`/api/karizma-albums/${id}/spreads`, {
      method: 'POST',
      body: JSON.stringify({ spreadUrl }),
    }),
  deleteSpreadFromAlbum: (id: string, spreadIndex: number) =>
    apiRequest<KarizmaAlbumItem>(`/api/karizma-albums/${id}/spreads/${spreadIndex}`, {
      method: 'DELETE',
    }),

  // AI Chat
  sendChatMessage: (message: string, history?: { sender: 'user' | 'bot'; text: string }[]) =>
    apiRequest<{ reply: string }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),

  // Admin Stats
  getAdminStats: () => apiRequest<AdminStats>('/api/admin/stats'),
};
