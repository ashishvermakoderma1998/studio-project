import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  QrCode, 
  Smartphone, 
  Building2, 
  Lock, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: {
    bookingId?: string;
    serviceTitle: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    eventDate: string;
    amount: number;
  };
  onSuccess: (paymentData: {
    transactionId: string;
    method: 'UPI' | 'Card' | 'NetBanking' | 'Wallet' | 'Razorpay';
    amount: number;
  }) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  bookingDetails,
  onSuccess,
}) => {
  const [tab, setTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiId, setUpiId] = useState('ashish.studio@upi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('890');

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const generatedTxnId = 'pay_rzp_' + Math.random().toString(36).substring(2, 10).toUpperCase();

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#ffffff', '#10b981']
      });

      onSuccess({
        transactionId: generatedTxnId,
        method: tab === 'upi' ? 'UPI' : tab === 'card' ? 'Card' : 'NetBanking',
        amount: bookingDetails.amount,
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg rounded-3xl bg-neutral-950 border border-amber-500/40 shadow-2xl overflow-hidden text-neutral-100 flex flex-col"
      >
        {/* Razorpay Top Header Branding */}
        <div className="bg-gradient-to-r from-blue-900 via-neutral-900 to-blue-950 p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg text-lg">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-wide">Razorpay Checkout</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  Verified Secure
                </span>
              </div>
              <p className="text-xs text-neutral-400">Merchant: Ashish Wedding Film Studio</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary banner */}
        <div className="bg-neutral-900/90 px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 block">Service Selected</span>
            <span className="text-sm font-bold text-white">{bookingDetails.serviceTitle}</span>
            <span className="text-xs text-neutral-400 block mt-0.5">Date: {bookingDetails.eventDate}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-neutral-400 block">Advance Payable</span>
            <span className="text-xl font-extrabold text-amber-400">
              ₹{bookingDetails.amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Payment Methods Selection */}
        <div className="p-6 space-y-5">
          <div className="flex rounded-xl bg-neutral-900 p-1 border border-neutral-800">
            <button
              onClick={() => setTab('upi')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'upi'
                  ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>UPI / QR</span>
            </button>
            <button
              onClick={() => setTab('card')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'card'
                  ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setTab('netbanking')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'netbanking'
                  ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>NetBanking</span>
            </button>
          </div>

          {/* UPI Method Tab */}
          {tab === 'upi' && (
            <div className="space-y-4 bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                  <QrCode className="w-24 h-24 text-neutral-900" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Instant Scan & Pay
                  </span>
                  <p className="text-xs text-neutral-300">
                    Scan using Google Pay, PhonePe, Paytm, BHIM, or any banking UPI app.
                  </p>
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 text-[11px] text-neutral-300 border border-neutral-700 font-mono">
                    VPA: ashishweddingfilm@icici
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800">
                <label className="text-xs text-neutral-400 block mb-1">Or Enter UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. yourname@okhdfcbank"
                />
              </div>
            </div>
          )}

          {/* Card Method Tab */}
          {tab === 'card' && (
            <div className="space-y-3 bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="•••"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Netbanking Tab */}
          {tab === 'netbanking' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800">
              {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'PNB', 'Kotak', 'Bank of Baroda', 'Other Banks'].map((bank) => (
                <button
                  key={bank}
                  type="button"
                  className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 text-xs font-semibold text-neutral-300 hover:text-white transition-all text-center"
                >
                  {bank}
                </button>
              ))}
            </div>
          )}

          {/* Pay Button */}
          <button
            id="razorpay-submit-pay-btn"
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 font-extrabold text-base shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authorizing Payment via Bank Gateway...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ₹{bookingDetails.amount.toLocaleString('en-IN')} & Confirm Booking</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              256-Bit SSL Encrypted
            </span>
            <span>•</span>
            <span>Instant Booking Confirmation</span>
            <span>•</span>
            <span>GST Invoice</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
