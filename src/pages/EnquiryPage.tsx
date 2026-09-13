import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Camera, 
  Film, 
  Music, 
  GraduationCap, 
  Sliders, 
  Phone,
  HelpCircle
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

interface EnquiryPageProps {
  onOpenBooking: () => void;
  onNavigate: (page: string) => void;
}

export const EnquiryPage: React.FC<EnquiryPageProps> = ({ onOpenBooking, onNavigate }) => {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('Royal Wedding Cinematography');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('₹50,000 - ₹1,00,000');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const addonsList = [
    '4K Aerial Drone Coverage',
    'Same-Day Teaser Reel for Instagram',
    'Luxury Karizma Velvet Photobook',
    'Multi-Camera Live LED Wall Streaming',
    'Pre-Wedding Shoot at Telaiya Dam',
    'Custom Background Audio Score / Song Recording',
  ];

  const handleToggleAddon = (addon: string) => {
    if (selectedAddons.includes(addon)) {
      setSelectedAddons(selectedAddons.filter((a) => a !== addon));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone) {
      showToast('Please enter your name and phone number.', 'error');
      return;
    }

    setIsSubmitting(true);

    const fullMessage = `
Budget Range: ${budget}
Venue: ${location || 'Not specified'}
Selected Addons: ${selectedAddons.join(', ') || 'None'}
Client Requirements: ${message}
    `.trim();

    try {
      await api.submitEnquiry({
        name,
        email,
        phone,
        service,
        eventDate,
        message: fullMessage,
      });

      setIsSubmitted(true);
      setIsSubmitting(false);
      showToast('Custom quote inquiry received! Ashish Ji will contact you.', 'success');
    } catch (err: any) {
      setIsSubmitting(false);
      showToast(err.message || 'Failed to submit enquiry', 'error');
    }
  };

  return (
    <div id="enquiry-page" className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Custom Packages & Destination Weddings
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
            Request a Custom Quote
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
            Need multi-day coverage, destination wedding crew across Jharkhand / Bihar, or custom drone setups? Fill out this questionnaire for a customized quotation.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-12 rounded-3xl bg-neutral-900 border border-emerald-500/40 text-center space-y-6 animate-in fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold font-serif text-white">Quotation Request Received!</h2>
            <p className="text-sm text-neutral-300 max-w-md mx-auto">
              Thank you, <strong>{name}</strong>. Ashish Wedding Film Studio will review your date ({eventDate || 'Upcoming'}) and prepare a tailored package breakdown with crew allotment.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button
                onClick={() => onNavigate('home')}
                className="px-6 py-3 rounded-full bg-neutral-800 text-neutral-200 text-xs font-bold hover:bg-neutral-700"
              >
                Return to Home
              </button>
              <button
                onClick={onOpenBooking}
                className="px-6 py-3 rounded-full bg-amber-500 text-neutral-950 text-xs font-bold hover:bg-amber-400 shadow-lg"
              >
                Or Lock Date with 30% Advance
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                    Phone Number (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your mobile number"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                    Primary Service Requirement
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Royal Wedding Cinematography">Royal Wedding Cinematography (Multi-Day)</option>
                    <option value="Destination Wedding Production">Destination Wedding Production</option>
                    <option value="Pre-Wedding Film (Telaiya Dam / Hills)">Pre-Wedding Film (Telaiya Dam / Hills)</option>
                    <option value="New Vehicle Purchase Shoot">New Vehicle Delivery Shoot</option>
                    <option value="Music Recording & Sound Production">Music Recording & Sound Production</option>
                    <option value="Academy Media Masterclass">Academy Media Masterclass</option>
                    <option value="Commercial & Corporate Film">Commercial & Corporate Film</option>
                  </select>
                </div>
              </div>

              {/* Event Date & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                    Tentative Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                    Venue City / Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Jhumri Telaiya, Ranchi, Dhanbad, Hazaribagh..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Expected Budget */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                  Expected Investment Budget
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    'Under ₹35,000',
                    '₹35,000 - ₹60,000',
                    '₹60,000 - ₹1,20,000',
                    '₹1,20,000+ (Grand Luxury)',
                  ].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBudget(b)}
                      className={`p-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                        budget === b
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Addons Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">
                  Desired Optional Features / Addons
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {addonsList.map((addon) => {
                    const isSelected = selectedAddons.includes(addon);
                    return (
                      <button
                        key={addon}
                        type="button"
                        onClick={() => handleToggleAddon(addon)}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 text-left transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? 'text-amber-400' : 'text-neutral-600'
                          }`}
                        />
                        <span>{addon}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Details */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                  Detailed Event Outline & Vision
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your rituals (Haldi, Mehendi, Sangeet, Wedding, Reception), expected guest count, reference films you love..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Submit Quotation Request</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
