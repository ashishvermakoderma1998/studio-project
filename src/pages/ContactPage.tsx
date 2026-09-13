import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Instagram, 
  Facebook, 
  Youtube, 
  Send, 
  MessageSquare, 
  Calendar, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { STUDIO_SOCIAL_LINKS } from '../data/studioData';

interface ContactPageProps {
  onOpenBooking: () => void;
  onNavigate?: (page: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onOpenBooking, onNavigate }) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('Wedding Photography & Film');
  const [eventDate, setEventDate] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) {
      showToast('Please fill out the required contact fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitEnquiry({
        name,
        email,
        phone,
        service,
        eventDate,
        message,
      });

      setIsSent(true);
      setIsSubmitting(false);
      showToast('Message sent! Ashish Ji will get back to you shortly.', 'success');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      setIsSubmitting(false);
      showToast(err.message || 'Failed to submit enquiry', 'error');
    }
  };

  return (
    <div id="contact-page" className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Phone className="w-3.5 h-3.5" />
            Direct Studio Desk
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
            Contact & Studio Location
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Planning an upcoming wedding, cinematic car reveal, or academy training? Visit our studio in Jhumri Telaiya or reach out directly.
          </p>
        </div>

        {/* 2-Column: Contact Details & Map vs Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Column: Studio Details */}
          <div className="space-y-6">
            
            {/* Info Cards */}
            <div className="p-8 rounded-3xl bg-neutral-900 border border-amber-500/30 space-y-6">
              <h3 className="text-xl font-bold font-serif text-white">Studio Headquarters</h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-white block text-base font-serif">Ashish Wedding Film Studio</strong>
                    <p className="text-neutral-300">Gumo, Kharitand, Jhumri Telaiya</p>
                    <p className="text-neutral-400 text-xs">District Koderma, Jharkhand, India - 825409</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-400 block">Phone & WhatsApp Hotline</span>
                    <a href="tel:+918709017294" className="text-white font-bold hover:text-amber-400 transition-colors">
                      +91 87090 17294
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-400 block">Official Studio Email</span>
                    <a href="mailto:ashishweddingfilm@gmail.com" className="text-white font-bold hover:text-amber-400 transition-colors">
                      ashishweddingfilm@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-400 block">Operating Hours</span>
                    <span className="text-white font-semibold">Monday – Sunday: 9:00 AM – 9:00 PM (IST)</span>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-4 border-t border-neutral-800">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                  Follow Our Live Stories & Reels
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    id="contact-facebook-link"
                    href={STUDIO_SOCIAL_LINKS.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-400 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                    title="Visit Ashish Wedding Film Facebook Page"
                  >
                    <Facebook className="w-4 h-4" />
                    <span>Facebook Page</span>
                  </a>
                  <a
                    id="contact-instagram-link"
                    href={STUDIO_SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-pink-500/50 hover:bg-pink-500/10 text-pink-400 text-xs font-bold flex items-center gap-2 transition-all"
                    title="Follow Ashish Wedding Film on Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Instagram</span>
                  </a>
                  <a
                    id="contact-youtube-link"
                    href={STUDIO_SOCIAL_LINKS.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-red-500/50 hover:bg-red-500/10 text-red-400 text-xs font-bold flex items-center gap-2 transition-all"
                    title="Watch Ashish Wedding Film 4K Cinema on YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>YouTube 4K</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Map Visual Landmark Card */}
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Locality & Landmark Guide</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Located near Gumo Kharitand Chowk, just 10 minutes from Jhumri Telaiya Railway Station (Koderma Junction). Prominent shooting spots nearby include Telaiya Dam Reservoir, Urwan Tourist Complex, and Dhwajadhari Dham.
              </p>
            </div>

          </div>

          {/* Right Column: Interactive Send Message Form */}
          <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Get in Touch
              </span>
              <h3 className="text-2xl font-bold font-serif text-white">Send Us a Direct Message</h3>
              <p className="text-xs text-neutral-400">
                Fill out the form below and we will contact you within 2 hours.
              </p>
            </div>

            {isSent ? (
              <div className="p-8 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3 animate-in fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Enquiry Received!</h4>
                <p className="text-xs text-neutral-300">
                  Thank you for reaching out to Ashish Wedding Film Studio. We will contact you at your phone number shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="px-5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-bold text-amber-400 hover:bg-neutral-800"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                      Phone Number *
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                      Service Interested In
                    </label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Wedding Photography & Film">Wedding Photography & Film</option>
                      <option value="Cinematic Wedding Films">Cinematic 4K Films</option>
                      <option value="New Vehicle Purchase Shoot">New Vehicle Delivery Shoot</option>
                      <option value="Pre-Wedding Shoot">Pre-Wedding at Telaiya Dam</option>
                      <option value="Music Recording & Remixing">Music Recording & Remixing</option>
                      <option value="Academy Media Course">Academy Training Course</option>
                      <option value="Karizma Album Design">Karizma Album Design</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                      Target Event Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                    Your Message / Requirements *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about the venue, number of guests, multi-camera needs, drone preference..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Studio Message</span>
                </button>
              </form>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onOpenBooking}
                className="text-xs text-amber-400 hover:underline font-semibold"
              >
                Or Skip to Instant Online Booking →
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
