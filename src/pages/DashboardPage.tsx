import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CreditCard, 
  Clock, 
  MapPin, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Sparkles, 
  Camera, 
  Download, 
  Plus, 
  Phone,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { Booking } from '../types';

interface DashboardPageProps {
  onOpenBooking: () => void;
  onNavigateToLogin: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenBooking, onNavigateToLogin }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForReceipt, setSelectedBookingForReceipt] = useState<Booking | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    api.getBookings()
      .then((res) => {
        setBookings(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div id="dashboard-unauth" className="min-h-screen bg-neutral-950 text-neutral-100 pt-32 pb-20 px-4 text-center">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-2xl font-bold font-serif text-white">Client Portal Access</h2>
          <p className="text-xs text-neutral-400">
            Please sign in to view your wedding film bookings, download receipts, and track cinematic deliverables.
          </p>
          <button
            onClick={onNavigateToLogin}
            className="w-full py-3 rounded-xl bg-amber-500 text-neutral-950 font-bold text-sm hover:bg-amber-400 transition-colors"
          >
            Sign In to Client Portal
          </button>
        </div>
      </div>
    );
  }

  const handleCancelBooking = async (id: string) => {
    if (window.confirm('Are you sure you wish to cancel this booking? Please contact studio for refund policies.')) {
      try {
        await api.cancelBooking(id, 'Client requested cancellation');
        showToast('Booking cancelled.', 'info');
        fetchBookings();
      } catch (err: any) {
        showToast(err.message || 'Failed to cancel booking', 'error');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Date Confirmed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            In Production / Editing
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Delivered & Closed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            Advance Pending
          </span>
        );
    }
  };

  return (
    <div id="dashboard-page" className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Profile Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-neutral-900 via-amber-950/20 to-neutral-900 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-lg shadow-amber-500/20"
            />
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px] uppercase">
                Client Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white">{user.name}</h1>
              <p className="text-xs text-neutral-400 flex items-center gap-3">
                <span>{user.email}</span>
                <span>•</span>
                <span>{user.phone || '+91 Client Contact'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenBooking}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/25 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Book New Studio Event</span>
            </button>
          </div>
        </div>

        {/* Bookings List Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>My Event Bookings ({bookings.length})</span>
            </h2>
            <button
              onClick={fetchBookings}
              className="text-xs text-neutral-400 hover:text-amber-400 transition-colors"
            >
              ↻ Refresh Status
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-neutral-500 text-sm">
              Loading your studio bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 rounded-3xl bg-neutral-900/60 border border-neutral-800 text-center space-y-4">
              <Camera className="w-12 h-12 text-neutral-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No active bookings yet</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Ready to plan your wedding film, Telaiya Dam pre-wedding shoot, or vehicle delivery reel? Lock your dates today!
              </p>
              <button
                onClick={onOpenBooking}
                className="px-6 py-3 rounded-full bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition-colors"
              >
                Browse & Book Services
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-6 sm:p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 space-y-6 hover:border-amber-500/30 transition-all shadow-xl"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-amber-400 font-bold">{b.bookingNumber}</span>
                        {getStatusBadge(b.bookingStatus)}
                        <span className="text-xs font-semibold text-neutral-400">
                          Payment: {b.paymentStatus}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">{b.serviceTitle}</h3>
                      <p className="text-xs text-neutral-400">Event Category: {b.eventType}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedBookingForReceipt(b)}
                        className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View / Print Receipt</span>
                      </button>
                      {b.bookingStatus !== 'Cancelled' && b.bookingStatus !== 'Completed' && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-xs font-semibold text-red-400 border border-red-500/30 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                      <span className="text-neutral-500 block uppercase font-bold text-[10px]">Date & Time</span>
                      <p className="text-white font-semibold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{b.eventDate}</span>
                      </p>
                      <p className="text-neutral-400">{b.eventTime} ({b.hours} hrs coverage)</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                      <span className="text-neutral-500 block uppercase font-bold text-[10px]">Venue Location</span>
                      <p className="text-white font-semibold flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{b.eventLocation}</span>
                      </p>
                      <p className="text-neutral-400 text-[11px]">Jhumri Telaiya & Region</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                      <span className="text-neutral-500 block uppercase font-bold text-[10px]">Total Investment</span>
                      <p className="text-amber-400 font-bold text-base font-serif">
                        ₹{b.bookingAmount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-emerald-400 font-medium text-[11px]">
                        ₹{b.advanceAmount.toLocaleString('en-IN')} (Advance Settled)
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                      <span className="text-neutral-500 block uppercase font-bold text-[10px]">Razorpay Transaction</span>
                      <p className="text-neutral-200 font-mono text-[11px] truncate">
                        {b.paymentId || 'PAY-VERIFIED-RZP'}
                      </p>
                      <p className="text-[10px] text-neutral-500">Locked on {b.createdAt.split('T')[0]}</p>
                    </div>
                  </div>

                  {b.additionalRequirements && (
                    <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
                      <strong className="text-amber-400 block mb-1">Custom Notes / Deliverables:</strong>
                      {b.additionalRequirements}
                    </div>
                  )}

                  {b.referenceImages && b.referenceImages.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-neutral-400 block">Reference Photos:</span>
                      <div className="flex flex-wrap gap-2">
                        {b.referenceImages.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt="Ref"
                            className="w-16 h-16 rounded-xl object-cover border border-neutral-700"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Receipt Modal */}
        {selectedBookingForReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-xl rounded-3xl bg-neutral-950 border border-amber-500/40 p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-serif text-white">Official Tax Invoice & Receipt</h3>
                  <p className="text-xs text-amber-400 font-semibold">Ashish Wedding Film Studio</p>
                </div>
                <button
                  onClick={() => setSelectedBookingForReceipt(null)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  ✕
                </button>
              </div>

              <div id="receipt-printable-area" className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs font-mono">
                <div className="flex justify-between border-b border-neutral-800 pb-3">
                  <div>
                    <strong className="text-amber-400 block text-sm">Ashish Wedding Film Studio</strong>
                    <span className="text-neutral-400 text-[11px]">Gumo, Kharitand, Jhumri Telaiya, Jharkhand - 825409</span>
                    <span className="text-neutral-500 block text-[10px]">GSTIN: 20AABCA1234F1Z8</span>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-500 block text-[10px]">Invoice Ref</span>
                    <span className="font-bold text-white text-sm">{selectedBookingForReceipt.bookingNumber}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">Client Name</span>
                    <span className="text-white font-bold">{selectedBookingForReceipt.userName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">Phone</span>
                    <span className="text-white">{selectedBookingForReceipt.userPhone || user.phone}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">Service Name</span>
                    <span className="text-amber-300 font-semibold">{selectedBookingForReceipt.serviceTitle}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px] uppercase">Event Date</span>
                    <span className="text-white font-semibold">{selectedBookingForReceipt.eventDate}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-neutral-500 block text-[10px] uppercase">Venue Location</span>
                    <span className="text-white">{selectedBookingForReceipt.eventLocation}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800 flex justify-between items-center text-sm">
                  <div>
                    <span className="text-emerald-400 font-bold block">Advance Amount Paid</span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      Txn: {selectedBookingForReceipt.paymentId || 'RZP-PAID'}
                    </span>
                  </div>
                  <span className="text-xl font-bold text-amber-400 font-serif">
                    ₹{selectedBookingForReceipt.advanceAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-xl bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-xs font-bold text-neutral-200 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedBookingForReceipt(null)}
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
