import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Upload, 
  FileText, 
  Printer, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import { Service, Booking } from '../types';
import { RazorpayModal } from './RazorpayModal';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceSlug?: string;
  onBookingComplete?: (booking: Booking) => void;
  onNavigateToDashboard?: () => void;
  onNavigateToLogin?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialServiceSlug,
  onBookingComplete,
  onNavigateToDashboard,
  onNavigateToLogin,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [eventType, setEventType] = useState('Traditional Wedding');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('10:00 AM');
  const [eventLocation, setEventLocation] = useState('Jhumri Telaiya, Jharkhand');
  const [hours, setHours] = useState(10);
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [step, setStep] = useState<'form' | 'receipt'>('form');
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);

  // Guest details if not logged in
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  useEffect(() => {
    api.getServices().then((res) => {
      setServices(res);
      if (initialServiceSlug) {
        const found = res.find((s) => s.slug === initialServiceSlug || s.id === initialServiceSlug);
        if (found) setSelectedServiceId(found.id);
      } else if (res.length > 0) {
        setSelectedServiceId(res[0].id);
      }
    }).catch(console.error);

    // Default date to next week
    const nextWeek = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    setEventDate(nextWeek.toISOString().split('T')[0]);
  }, [initialServiceSlug]);

  if (!isOpen) return null;

  const currentSelectedService = services.find((s) => s.id === selectedServiceId) || services[0];
  const calculatedPrice = currentSelectedService ? currentSelectedService.startingPrice : 25000;
  const advanceAmount = Math.round(calculatedPrice * 0.3);

  const handleAddReferenceImage = () => {
    if (!referenceImageUrl.trim()) return;
    setReferenceImages((prev) => [...prev, referenceImageUrl.trim()]);
    setReferenceImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast('Please sign in or register to complete your studio booking.', 'info');
      if (onNavigateToLogin) onNavigateToLogin();
      return;
    }

    if (!eventDate || !eventLocation) {
      showToast('Please fill in the event date and location.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        serviceId: currentSelectedService?.id,
        serviceTitle: currentSelectedService?.title || 'Studio Service',
        servicePrice: calculatedPrice,
        eventType,
        eventDate,
        eventTime,
        eventLocation,
        hours,
        additionalRequirements,
        referenceImages,
        bookingAmount: calculatedPrice,
        advanceAmount,
      };

      const booking = await api.createBooking(payload);
      setCreatedBooking(booking);
      setIsSubmitting(false);

      // Open Razorpay online payment dialog for instant advance
      setShowRazorpay(true);
    } catch (err: any) {
      setIsSubmitting(false);
      showToast(err.message || 'Failed to submit booking', 'error');
    }
  };

  const handlePaymentSuccess = async (paymentData: { transactionId: string; method: string; amount: number }) => {
    setShowRazorpay(false);

    try {
      if (createdBooking) {
        await api.createPayment({
          bookingId: createdBooking.id,
          amount: paymentData.amount,
          method: paymentData.method,
          paymentStatus: 'Success',
          razorpayPaymentId: paymentData.transactionId,
        });

        // Update local state to show receipt
        const updatedBooking: Booking = {
          ...createdBooking,
          paymentStatus: 'Paid',
          bookingStatus: 'Confirmed',
          paymentId: paymentData.transactionId,
        };

        setCreatedBooking(updatedBooking);
        setStep('receipt');
        showToast('Payment successful! Your wedding / studio date is confirmed.', 'success');

        if (onBookingComplete) {
          onBookingComplete(updatedBooking);
        }
      }
    } catch (err) {
      console.error('Payment callback error:', err);
      setStep('receipt');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl rounded-3xl bg-neutral-950 border border-amber-500/30 shadow-2xl overflow-hidden text-neutral-200 my-8"
        >
          {/* Modal Header */}
          <div className="p-6 bg-gradient-to-r from-neutral-900 via-amber-950/40 to-neutral-900 border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 shadow-lg shadow-amber-500/20 font-bold">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-serif tracking-tight">
                  {step === 'form' ? 'Reserve Studio Service' : 'Booking Confirmation & Receipt'}
                </h3>
                <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase">
                  Ashish Wedding Film Studio • Jhumri Telaiya
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          {step === 'form' ? (
            <form onSubmit={handleSubmitBooking} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Not Logged In Notice */}
              {!user && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-xs text-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>Please sign in to securely link your booking and receive instant receipts.</span>
                  </div>
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-neutral-950 font-bold text-xs shrink-0"
                  >
                    Sign In Now
                  </button>
                </div>
              )}

              {/* Service Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">
                  Select Studio Service
                </label>
                <select
                  id="booking-service-select"
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id} className="bg-neutral-900 py-2">
                      {s.title} — (From ₹{s.startingPrice.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Type & Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">
                    Event Type
                  </label>
                  <select
                    id="booking-event-type-select"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Traditional Wedding">Traditional Wedding & Rituals</option>
                    <option value="Pre-Wedding Shoot">Pre-Wedding Shoot (Telaiya Dam / Outdoor)</option>
                    <option value="Wedding Reception">Wedding Reception & Sangeet</option>
                    <option value="New Vehicle Shoot">New Car / Bike Purchase Shoot</option>
                    <option value="Birthday Celebration">Birthday Celebration</option>
                    <option value="Anniversary Shoot">Anniversary Shoot</option>
                    <option value="Music Studio Session">Music Studio Recording / Remixing</option>
                    <option value="Academy Training Course">Academy Training & Course</option>
                    <option value="Commercial Video Shoot">Commercial Video Shoot</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">
                    Coverage Duration (Hours)
                  </label>
                  <input
                    id="booking-hours-input"
                    type="number"
                    min="1"
                    max="72"
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Event Date</span>
                  </label>
                  <input
                    id="booking-date-input"
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Preferred Time</span>
                  </label>
                  <input
                    id="booking-time-input"
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="e.g. 10:00 AM or 6:00 PM (Baraat)"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Event Venue / Location</span>
                </label>
                <input
                  id="booking-location-input"
                  type="text"
                  required
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="e.g. Grand Utsav Palace, Gumo, Jhumri Telaiya or Ranchi, Jharkhand"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Additional Requirements */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">
                  Special Requirements or Notes
                </label>
                <textarea
                  id="booking-notes-input"
                  rows={2}
                  value={additionalRequirements}
                  onChange={(e) => setAdditionalRequirements(e.target.value)}
                  placeholder="e.g. Need 4K Drone entry shot, groom teaser reel on same night, Karizma album upgrade..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Reference Images URL uploader */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reference Image / Moodboard Links (Optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={referenceImageUrl}
                    onChange={(e) => setReferenceImageUrl(e.target.value)}
                    placeholder="Paste reference photo URL (Pinterest, Unsplash, Instagram)..."
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddReferenceImage}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-amber-300"
                  >
                    Add
                  </button>
                </div>

                {referenceImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {referenceImages.map((img, idx) => (
                      <div key={idx} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-amber-500/40">
                        <img src={img} alt="Ref" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing Breakdown Summary */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-amber-500/30 space-y-2 text-sm">
                <div className="flex justify-between text-neutral-400">
                  <span>Package Base Price:</span>
                  <span className="font-semibold text-white">₹{calculatedPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Advance Deposit Required (30%):</span>
                  <span className="font-bold text-amber-400">₹{advanceAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-800">
                  <span>Balance Payable at event conclusion:</span>
                  <span>₹{(calculatedPrice - advanceAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2">
                <button
                  id="booking-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 font-extrabold text-base shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Proceed to Online Advance Payment (₹{advanceAmount.toLocaleString('en-IN')})</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          ) : (
            /* Receipt Step */
            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold font-serif text-white">Booking Confirmed!</h4>
                <p className="text-sm text-neutral-400">
                  Your event slot is officially locked with Ashish Wedding Film Studio.
                </p>
              </div>

              {/* Printable Receipt Card */}
              {createdBooking && (
                <div id="booking-printable-receipt" className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs sm:text-sm font-mono">
                  <div className="flex justify-between border-b border-neutral-800 pb-3">
                    <div>
                      <span className="text-amber-400 font-bold block text-sm">Ashish Wedding Film Studio</span>
                      <span className="text-neutral-400 text-[11px]">Gumo, Kharitand, Jhumri Telaiya, Jharkhand</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-400 block text-[11px]">Booking ID</span>
                      <span className="font-bold text-white text-sm">{createdBooking.bookingNumber}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase">Client Name</span>
                      <span className="text-white font-bold">{createdBooking.userName}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase">Contact Phone</span>
                      <span className="text-white">{createdBooking.userPhone || user?.phone || 'On Record'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase">Service Selected</span>
                      <span className="text-amber-300 font-semibold">{createdBooking.serviceTitle}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase">Event Date</span>
                      <span className="text-white font-semibold">{createdBooking.eventDate} ({createdBooking.eventTime})</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-neutral-500 block text-[10px] uppercase">Venue Location</span>
                      <span className="text-white">{createdBooking.eventLocation}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-800 flex justify-between items-center text-sm">
                    <div>
                      <span className="text-emerald-400 font-bold block">Advance Paid via Razorpay</span>
                      <span className="text-[10px] text-neutral-400">Txn: {createdBooking.paymentId || 'RZP-VERIFIED'}</span>
                    </div>
                    <span className="text-lg font-bold text-amber-400">
                      ₹{createdBooking.advanceAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-xl bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-200 font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    if (onNavigateToDashboard) onNavigateToDashboard();
                  }}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>View in My Dashboard</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Razorpay Online Payment Checkout Modal */}
      {createdBooking && (
        <RazorpayModal
          isOpen={showRazorpay}
          onClose={() => setShowRazorpay(false)}
          bookingDetails={{
            bookingId: createdBooking.id,
            serviceTitle: createdBooking.serviceTitle,
            userName: createdBooking.userName,
            userEmail: createdBooking.userEmail,
            userPhone: createdBooking.userPhone,
            eventDate: createdBooking.eventDate,
            amount: createdBooking.advanceAmount,
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};
