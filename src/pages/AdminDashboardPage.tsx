import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  MessageSquare, 
  Star, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Search, 
  Filter, 
  Edit3, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  Download, 
  FileText,
  Sparkles,
  Camera,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { Booking, Enquiry, Review, AdminStats, BookingStatus, PaymentStatus, KarizmaAlbumItem, GalleryItem } from '../types';
import { KarizmaSpreadViewerModal } from '../components/KarizmaSpreadViewerModal';
import { KarizmaUploadModal } from '../components/KarizmaUploadModal';
import { GalleryUploadModal } from '../components/GalleryUploadModal';
import { UploadNewAlbumComponent } from '../components/UploadNewAlbumComponent';

interface AdminDashboardPageProps {
  onNavigateToLogin: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateToLogin }) => {
  const { user, isAdmin, loginWithDemoAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'karizma' | 'gallery' | 'bookings' | 'enquiries' | 'reviews'>('karizma');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [karizmaAlbums, setKarizmaAlbums] = useState<KarizmaAlbumItem[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedAlbumForViewer, setSelectedAlbumForViewer] = useState<KarizmaAlbumItem | null>(null);
  const [isUploadAlbumOpen, setIsUploadAlbumOpen] = useState(false);
  const [isUploadGalleryOpen, setIsUploadGalleryOpen] = useState(false);
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('all');
  const [gallerySearch, setGallerySearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Search & Filter for Bookings
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, bookingsData, enquiriesData, reviewsData, albumsData, galleryData] = await Promise.all([
        api.getAdminStats(),
        api.getBookings(),
        api.getEnquiries(),
        api.getReviews(),
        api.getKarizmaAlbums(),
        api.getGallery(),
      ]);

      setStats(statsData);
      setBookings(bookingsData);
      setEnquiries(enquiriesData);
      setReviews(reviewsData);
      setKarizmaAlbums(albumsData);
      setGalleryItems(galleryData);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      showToast('Failed to load studio admin dashboard data', 'error');
    }
  };

  const handleDeleteKarizmaAlbum = async (id: string, title: string) => {
    const confirmed = window.confirm(`Delete Karizma Album "${title}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      await api.deleteKarizmaAlbum(id);
      showToast(`Karizma album "${title}" deleted`, 'info');
      setKarizmaAlbums(prev => prev.filter(a => a.id !== id));
      if (selectedAlbumForViewer?.id === id) {
        setSelectedAlbumForViewer(null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete album', 'error');
    }
  };

  const handleDeleteGalleryItem = async (id: string, title: string) => {
    const confirmed = window.confirm(`Delete photo "${title}" from website gallery?`);
    if (!confirmed) return;
    try {
      await api.deleteGalleryItem(id);
      showToast(`Photo "${title}" deleted from gallery`, 'info');
      setGalleryItems(prev => prev.filter(g => g.id !== id));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete photo', 'error');
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div id="admin-unauth" className="min-h-screen bg-neutral-950 text-neutral-100 pt-32 pb-20 px-4 text-center">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-neutral-900 border border-amber-500/30 space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-serif text-white">Studio Admin Clearance Required</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Log in as administrator (<strong className="text-amber-300">ashishweddingfilm@gmail.com</strong>) to access Add/Delete controls for albums, photos, bookings, and CRM.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              id="admin-one-click-login-btn"
              onClick={async () => {
                try {
                  await loginWithDemoAdmin();
                  showToast('Welcome Ashish! Admin mode activated.', 'success');
                } catch (e: any) {
                  showToast(e.message || 'Login failed', 'error');
                }
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>⚡ 1-Click Login as Ashish Studio Admin</span>
            </button>

            <button
              onClick={onNavigateToLogin}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors"
            >
              Sign In with Custom Password
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateBookingStatus = async (id: string, status: BookingStatus) => {
    try {
      await api.updateBookingStatus(id, { bookingStatus: status });
      showToast(`Booking status updated to ${status}`, 'success');
      loadAdminData();
      if (selectedBookingDetails && selectedBookingDetails.id === id) {
        setSelectedBookingDetails({ ...selectedBookingDetails, bookingStatus: status });
      }
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleUpdatePaymentStatus = async (id: string, status: PaymentStatus) => {
    try {
      await api.updateBookingStatus(id, { paymentStatus: status });
      showToast(`Payment status updated to ${status}`, 'success');
      loadAdminData();
      if (selectedBookingDetails && selectedBookingDetails.id === id) {
        setSelectedBookingDetails({ ...selectedBookingDetails, paymentStatus: status });
      }
    } catch (err: any) {
      showToast(err.message || 'Payment status update failed', 'error');
    }
  };

  const handleToggleReviewApproval = async (id: string, currentApproved?: boolean) => {
    try {
      await api.approveReview(id, !currentApproved);
      showToast('Review visibility updated', 'info');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Review update failed', 'error');
    }
  };

  const handleUpdateEnquiryStatus = async (id: string, status: Enquiry['status']) => {
    try {
      await api.updateEnquiry(id, { status });
      showToast(`Enquiry marked as ${status}`, 'info');
      loadAdminData();
    } catch (err: any) {
      showToast(err.message || 'Enquiry update failed', 'error');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = 
      b.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.eventLocation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || b.bookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="admin-dashboard-page" className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header */}
        <div className="p-8 rounded-3xl bg-neutral-900 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-neutral-950 font-extrabold text-[10px] uppercase">
                  Studio Admin Control
                </span>
                <span className="text-xs text-neutral-400">Ashish Wedding Film Studio Desk</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white">
                Studio Management & Client CRM
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="admin-quick-add-karizma"
              onClick={() => {
                setActiveTab('karizma');
                setTimeout(() => {
                  const el = document.getElementById('upload-new-album-card');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Karizma Album</span>
            </button>
            <button
              id="admin-quick-upload-gallery"
              onClick={() => setIsUploadGalleryOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>+ Upload Gallery Photo</span>
            </button>
            <button
              onClick={loadAdminData}
              className="px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition-colors"
              title="Refresh Data"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Total Bookings</span>
                <Calendar className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-extrabold font-serif text-white">{stats.totalBookings}</p>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-emerald-400 font-bold">{stats.confirmedBookings} Confirmed</span>
                <span className="text-neutral-500">•</span>
                <span className="text-amber-400">{stats.inProgressBookings} In Progress</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Total Studio Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-extrabold font-serif text-emerald-400">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-neutral-400">Advance deposits collected online</p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Enquiries & Leads</span>
                <MessageSquare className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-3xl font-extrabold font-serif text-white">{stats.totalEnquiries}</p>
              <p className="text-[11px] text-blue-400 font-semibold">{stats.newEnquiries} New Inquiries</p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Client Reviews</span>
                <Star className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-extrabold font-serif text-white">{stats.totalReviews}</p>
              <p className="text-[11px] text-amber-400 font-semibold">100% 5-Star Studio Rating</p>
            </div>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto">
          <button
            id="tab-karizma"
            onClick={() => setActiveTab('karizma')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'karizma'
                ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Karizma Albums ({karizmaAlbums.length})</span>
          </button>
          <button
            id="tab-gallery"
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'gallery'
                ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Gallery Photos ({galleryItems.length})</span>
          </button>
          <button
            id="tab-bookings"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors shrink-0 ${
              activeTab === 'bookings'
                ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            id="tab-enquiries"
            onClick={() => setActiveTab('enquiries')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors shrink-0 ${
              activeTab === 'enquiries'
                ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            Client Enquiries ({enquiries.length})
          </button>
          <button
            id="tab-reviews"
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors shrink-0 ${
              activeTab === 'reviews'
                ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            Testimonial Moderation ({reviews.length})
          </button>
        </div>

        {/* TAB 1: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by client, ID, city..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Booking Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="rounded-3xl bg-neutral-900/90 border border-neutral-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-4">Ref #</th>
                      <th className="p-4">Client</th>
                      <th className="p-4">Service & Date</th>
                      <th className="p-4">Venue Location</th>
                      <th className="p-4">Advance</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-neutral-800/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-amber-400">{b.bookingNumber}</td>
                        <td className="p-4">
                          <div className="font-bold text-white">{b.userName}</div>
                          <div className="text-[11px] text-neutral-400">{b.userPhone}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-neutral-200">{b.serviceTitle}</div>
                          <div className="text-[11px] text-amber-400">{b.eventDate} ({b.eventTime})</div>
                        </td>
                        <td className="p-4 max-w-[180px] truncate text-neutral-300">
                          {b.eventLocation}
                        </td>
                        <td className="p-4 font-bold text-emerald-400">
                          ₹{b.advanceAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4">
                          <select
                            value={b.bookingStatus}
                            onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value as BookingStatus)}
                            className="bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white focus:outline-none focus:border-amber-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedBookingDetails(b)}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400"
                            title="View Full Booking Info"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`https://wa.me/${(b.userPhone || '8709017294').replace(/\D/g, '').replace(/^91/, '') ? '91' + (b.userPhone || '8709017294').replace(/\D/g, '').replace(/^91/, '') : '918709017294'}?text=Hello%20${encodeURIComponent(b.userName)},%20this%20is%20Ashish%20Wedding%20Film%20Studio%20regarding%20your%20booking%20${b.bookingNumber}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 hover:bg-emerald-900 inline-block align-middle"
                            title="Contact via WhatsApp"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                        {enq.service}
                      </span>
                      <span className="text-[11px] text-neutral-500">{enq.createdAt}</span>
                    </div>

                    <h4 className="text-base font-bold text-white">{enq.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                      <span>Phone: {enq.phone}</span>
                      <span>•</span>
                      <span>Email: {enq.email || 'None'}</span>
                    </div>

                    <p className="text-xs text-neutral-300 bg-neutral-950 p-3 rounded-xl border border-neutral-800 italic">
                      “{enq.message}”
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                    <span className="text-xs text-neutral-400 font-semibold">Status:</span>
                    <select
                      value={enq.status}
                      onChange={(e) => handleUpdateEnquiryStatus(enq.id, e.target.value as Enquiry['status'])}
                      className="bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white"
                    >
                      <option value="New">New</option>
                      <option value="In Touch">In Touch</option>
                      <option value="Converted">Converted</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    r.approved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {r.approved ? 'Live on Website' : 'Hidden'}
                  </span>
                </div>

                <p className="text-xs text-neutral-200 italic">“{r.comment}”</p>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-xs">
                  <div>
                    <strong className="text-white block">{r.userName}</strong>
                    <span className="text-neutral-500 text-[10px]">{r.eventType}</span>
                  </div>

                  <button
                    onClick={() => handleToggleReviewApproval(r.id, r.approved)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-amber-300"
                  >
                    {r.approved ? 'Hide Review' : 'Approve Review'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: KARIZMA ALBUMS MANAGEMENT */}
        {activeTab === 'karizma' && (
          <div className="space-y-8">
            {/* IN-PAGE COMPONENT: UPLOAD NEW ALBUM (COVER & PHOTOS FILE INPUTS + DB API) */}
            <UploadNewAlbumComponent
              onAlbumUploaded={(newAlbum) => {
                setKarizmaAlbums(prev => [newAlbum, ...prev]);
              }}
              defaultExpanded={true}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span>Karizma & Canvera Album Library ({karizmaAlbums.length})</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Manage published 12x36 panoramic layflat wedding albums stored in the database.
                </p>
              </div>

              <button
                id="admin-new-album-btn"
                onClick={() => {
                  const el = document.getElementById('upload-new-album-card');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs border border-amber-500/30 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Scroll to Upload Panel</span>
              </button>
            </div>

            {karizmaAlbums.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
                <BookOpen className="w-10 h-10 text-neutral-600 mx-auto" />
                <p className="text-sm font-semibold text-neutral-300">No Karizma albums found in database.</p>
                <button
                  onClick={() => setIsUploadAlbumOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs"
                >
                  Upload First Album
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {karizmaAlbums.map((album) => (
                  <div
                    key={album.id}
                    className="rounded-2xl bg-neutral-900/80 border border-neutral-800 overflow-hidden flex flex-col justify-between group hover:border-amber-500/40 transition-colors"
                  >
                    <div className="relative aspect-video bg-neutral-950">
                      <img
                        src={album.coverImage}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded bg-black/75 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                        {album.albumType}
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-semibold text-neutral-300">
                        {album.sheetsCount} Sheets
                      </div>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-amber-400">
                          {album.coupleName}
                        </div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">
                          {album.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">
                          {album.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelectedAlbumForViewer(album)}
                          className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View & Edit Spreads ({album.spreads?.length || 1})</span>
                        </button>

                        <button
                          id={`admin-delete-album-${album.id}`}
                          onClick={() => handleDeleteKarizmaAlbum(album.id, album.title)}
                          className="px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800/60 text-red-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                          title="Delete Album"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: GALLERY PHOTOS & REELS MANAGEMENT */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900/60 p-5 rounded-2xl border border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  <span>Website Gallery Photos & Videos ({galleryItems.length})</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Manage portfolio media displayed on the public gallery and homepage. Add new shots or delete photos with 1 click.
                </p>
              </div>

              <button
                id="admin-upload-gallery-item-btn"
                onClick={() => setIsUploadGalleryOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Upload New Photo / Video
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-900/40 p-3 rounded-2xl border border-neutral-800">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
                {['all', 'Weddings', 'Pre-Wedding', 'Vehicle Shoots', 'Music Studio', 'Photography', 'Videography'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGalleryCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      galleryCategoryFilter === cat
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="text"
                  value={gallerySearch}
                  onChange={(e) => setGallerySearch(e.target.value)}
                  placeholder="Search photos or clients..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Gallery Cards Grid */}
            {galleryItems.filter(item => {
              const matchesCat = galleryCategoryFilter === 'all' || item.category.toLowerCase() === galleryCategoryFilter.toLowerCase();
              const matchesSearch = item.title.toLowerCase().includes(gallerySearch.toLowerCase()) || (item.client && item.client.toLowerCase().includes(gallerySearch.toLowerCase()));
              return matchesCat && matchesSearch;
            }).length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
                <ImageIcon className="w-10 h-10 text-neutral-600 mx-auto" />
                <p className="text-sm font-semibold text-neutral-300">No gallery photos matching this filter.</p>
                <button
                  onClick={() => setIsUploadGalleryOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs"
                >
                  Upload First Photo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryItems.filter(item => {
                  const matchesCat = galleryCategoryFilter === 'all' || item.category.toLowerCase() === galleryCategoryFilter.toLowerCase();
                  const matchesSearch = item.title.toLowerCase().includes(gallerySearch.toLowerCase()) || (item.client && item.client.toLowerCase().includes(gallerySearch.toLowerCase()));
                  return matchesCat && matchesSearch;
                }).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-neutral-900/90 border border-neutral-800 overflow-hidden flex flex-col justify-between group hover:border-amber-500/40 transition-all shadow-md"
                  >
                    <div className="relative aspect-4/3 bg-neutral-950">
                      <img
                        src={item.thumbnailUrl || item.mediaUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                        {item.category}
                      </div>
                      {item.type === 'video' && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-amber-500 text-[10px] font-extrabold text-neutral-950">
                          VIDEO
                        </div>
                      )}
                      {item.featured && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-amber-500/90 text-[10px] font-bold text-neutral-950">
                          ★ Featured
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">
                          {item.title}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1">
                          <span>{item.eventType || 'Event'}</span>
                          <span>{item.client ? `Client: ${item.client}` : ''}</span>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-neutral-800 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-neutral-500 truncate">{item.type === 'video' ? 'Reel' : '4K Photo'}</span>
                        <button
                          id={`admin-delete-photo-${item.id}`}
                          onClick={() => handleDeleteGalleryItem(item.id, item.title)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-800 border border-red-800/50 text-red-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Delete photo from website"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Karizma Album Viewer Modal */}
        {selectedAlbumForViewer && (
          <KarizmaSpreadViewerModal
            album={selectedAlbumForViewer}
            onClose={() => setSelectedAlbumForViewer(null)}
            onAlbumUpdated={(updated) => {
              setSelectedAlbumForViewer(updated);
              setKarizmaAlbums(prev => prev.map(a => a.id === updated.id ? updated : a));
            }}
          />
        )}

        {/* Karizma Upload Modal */}
        {isUploadAlbumOpen && (
          <KarizmaUploadModal
            isOpen={isUploadAlbumOpen}
            onClose={() => setIsUploadAlbumOpen(false)}
            onAlbumCreated={(newAlbum) => {
              setKarizmaAlbums(prev => [newAlbum, ...prev]);
              setSelectedAlbumForViewer(newAlbum);
            }}
          />
        )}

        {/* Gallery Upload Modal */}
        {isUploadGalleryOpen && (
          <GalleryUploadModal
            isOpen={isUploadGalleryOpen}
            onClose={() => setIsUploadGalleryOpen(false)}
            onItemCreated={(newItem) => {
              setGalleryItems(prev => [newItem, ...prev]);
            }}
          />
        )}

        {/* Booking Details Modal */}
        {selectedBookingDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-xl rounded-3xl bg-neutral-950 border border-amber-500/40 p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-serif text-white">Full Client Booking Details</h3>
                  <p className="text-xs text-amber-400 font-semibold">{selectedBookingDetails.bookingNumber}</p>
                </div>
                <button
                  onClick={() => setSelectedBookingDetails(null)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                  <div>
                    <span className="text-neutral-500 block uppercase text-[10px]">Client</span>
                    <strong className="text-white text-sm">{selectedBookingDetails.userName}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block uppercase text-[10px]">Phone</span>
                    <span className="text-white text-sm">{selectedBookingDetails.userPhone}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block uppercase text-[10px]">Event Date</span>
                    <span className="text-white">{selectedBookingDetails.eventDate} ({selectedBookingDetails.eventTime})</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block uppercase text-[10px]">Location</span>
                    <span className="text-white">{selectedBookingDetails.eventLocation}</span>
                  </div>
                </div>

                {selectedBookingDetails.additionalRequirements && (
                  <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                    <strong className="text-amber-400 block mb-1">Custom Notes:</strong>
                    <p className="text-neutral-300">{selectedBookingDetails.additionalRequirements}</p>
                  </div>
                )}

                {selectedBookingDetails.referenceImages && selectedBookingDetails.referenceImages.length > 0 && (
                  <div>
                    <strong className="text-neutral-400 block mb-2">Reference Photos:</strong>
                    <div className="flex flex-wrap gap-2">
                      {selectedBookingDetails.referenceImages.map((img, idx) => (
                        <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                          <img src={img} alt="Ref" className="w-16 h-16 rounded-xl object-cover border border-amber-500/40" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <a
                  href={`tel:${selectedBookingDetails.userPhone}`}
                  className="flex-1 py-3 rounded-xl bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-xs font-bold text-white flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Call Client</span>
                </a>
                <button
                  onClick={() => setSelectedBookingDetails(null)}
                  className="flex-1 py-3 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
