export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar?: string;
  city?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type ServiceCategory = 
  | 'Wedding'
  | 'Photography'
  | 'Videography'
  | 'Cinematic Films'
  | 'Events'
  | 'Editing & Design'
  | 'Music Production'
  | 'Training & Courses';

export interface Service {
  id: string;
  slug: string;
  title: string;
  category: ServiceCategory;
  tagline: string;
  description: string;
  features: string[];
  deliverables: string[];
  startingPrice: number;
  duration: string;
  image: string;
  popular?: boolean;
  equipment?: string[];
  faqs?: { q: string; a: string }[];
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'Partial' | 'Failed' | 'Refunded';

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  serviceId: string;
  serviceTitle: string;
  servicePrice: number;
  eventType: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  hours: number;
  additionalRequirements?: string;
  referenceImages?: string[];
  bookingAmount: number;
  advanceAmount: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  transactionId: string;
  bookingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  method: 'UPI' | 'Card' | 'NetBanking' | 'Wallet' | 'Razorpay' | 'Cash';
  paymentStatus: 'Success' | 'Pending' | 'Failed';
  receiptNumber: string;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  eventDate?: string;
  message: string;
  status: 'New' | 'In Touch' | 'Converted' | 'Closed';
  adminReply?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  eventType: string;
  approved: boolean;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Weddings' | 'Pre-Wedding' | 'Birthdays' | 'Anniversaries' | 'Vehicle Shoots' | 'Cinematic Videos' | 'Photography' | 'Videography' | 'Music Studio';
  type: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl: string;
  eventType: string;
  client?: string;
  description: string;
  featured?: boolean;
}

export type KarizmaFinish = 
  | 'Royal Velvet' 
  | 'Canvera HD' 
  | 'Acrylic Glass' 
  | 'Metallic Sheen' 
  | 'Leatherite Cameo' 
  | 'Silk Matte';

export interface KarizmaAlbumItem {
  id: string;
  title: string;
  coupleName: string;
  albumType: KarizmaFinish;
  coverImage: string;
  sheetsCount: number;
  eventDate?: string;
  location?: string;
  description: string;
  spreads: string[];
  featured?: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  quickReplies?: string[];
}

export interface AdminStats {
  totalUsers: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  inProgressBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalEnquiries: number;
  newEnquiries: number;
  totalReviews: number;
  pendingReviews: number;
}
