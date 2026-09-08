import React from 'react';
import { 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Facebook, 
  Youtube, 
  Clock, 
  Heart, 
  ShieldCheck, 
  Calendar,
  Sparkles,
  MessageSquare
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, param?: string) => void;
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenBooking }) => {
  const handleNav = (page: string, param?: string) => {
    onNavigate(page, param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-neutral-950 border-t border-neutral-800 text-neutral-400 text-sm">
      {/* Top Pre-Footer Call to Action */}
      <div className="bg-gradient-to-r from-neutral-900 via-amber-950/40 to-neutral-900 border-b border-amber-500/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Dates Filling Fast For 2026-2027 Wedding Season
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
              Ready to create your cinematic story with Ashish Studio?
            </h3>
            <p className="text-neutral-400 text-sm mt-1 max-w-xl">
              From royal wedding mandaps to high-speed vehicle delivery reels, secure your date with our award-winning studio.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="footer-book-cta-btn"
              onClick={onOpenBooking}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Your Event Now</span>
            </button>
            <button
              id="footer-enquiry-cta-btn"
              onClick={() => handleNav('enquiry')}
              className="px-6 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-semibold text-sm transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Submit Custom Enquiry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Studio Identity & Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-neutral-950">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white font-serif tracking-tight">
                  Ashish Wedding Film Studio
                </h4>
                <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase">
                  Capturing Moments • Creating Memories
                </p>
              </div>
            </div>

            <p className="text-neutral-400 text-sm leading-relaxed pr-4">
              Premier wedding cinematography, candid photography, 4K multi-camera productions, vehicle purchase shoots, sound recording suite, and hands-on media training academy based in Jhumri Telaiya, Jharkhand.
            </p>

            {/* Social Media Links */}
            <div className="pt-2">
              <p className="text-xs uppercase font-bold text-neutral-300 tracking-wider mb-3">
                Connect on Social Media
              </p>
              <div className="flex items-center gap-3">
                <a
                  id="footer-instagram-link"
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-pink-500/50 hover:bg-pink-500/10 text-pink-400 flex items-center justify-center transition-all hover:scale-110"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  id="footer-facebook-link"
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-400 flex items-center justify-center transition-all hover:scale-110"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  id="footer-youtube-link"
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-500/50 hover:bg-red-500/10 text-red-400 flex items-center justify-center transition-all hover:scale-110"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Quick Links
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-amber-400 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-amber-400 transition-colors">
                  About Studio
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('gallery')} className="hover:text-amber-400 transition-colors">
                  Gallery & Films
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('karizma-albums')} className="hover:text-amber-400 transition-colors text-amber-400/90 font-medium">
                  Karizma Wedding Albums
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('pricing')} className="hover:text-amber-400 transition-colors">
                  Pricing & Packages
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('service-detail', 'learning-training')} className="hover:text-amber-400 transition-colors">
                  Academy & Training
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('reviews')} className="hover:text-amber-400 transition-colors">
                  Client Reviews
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('enquiry')} className="hover:text-amber-400 transition-colors">
                  Enquiry Form
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-amber-400 transition-colors">
                  Contact Studio
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Studio Services */}
          <div>
            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Our Services
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleNav('service-detail', 'wedding-photography')} className="hover:text-amber-400 transition-colors text-left">
                  Wedding Photography
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('service-detail', 'cinematic-wedding-films')} className="hover:text-amber-400 transition-colors text-left">
                  Cinematic Wedding Films
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('service-detail', 'wedding-videography')} className="hover:text-amber-400 transition-colors text-left">
                  Wedding Videography
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('service-detail', 'vehicle-purchase-shoot')} className="hover:text-amber-400 transition-colors text-left">
                  Vehicle Purchase Shoot
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('service-detail', 'birthday-shoot')} className="hover:text-amber-400 transition-colors text-left">
                  Birthday & Anniversary
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('service-detail', 'photo-album-editing')} className="hover:text-amber-400 transition-colors text-left">
                  Karizma & Velvet Albums
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('service-detail', 'music-recording')} className="hover:text-amber-400 transition-colors text-left">
                  Music Studio & Remixing
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="text-amber-400 font-semibold hover:underline">
                  View All 14 Services →
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Address */}
          <div>
            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
              Studio Location
            </h5>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-neutral-200 block">Ashish Wedding Film Studio</strong>
                  Gumo, Kharitand, Jhumri Telaiya, Koderma, Jharkhand, India - 825409
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="tel:+918709017294" className="hover:text-amber-400 transition-colors">
                  +91 87090 17294
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:ashishweddingfilm@gmail.com" className="hover:text-amber-400 transition-colors truncate">
                  ashishweddingfilm@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-neutral-400 pt-1">
                <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>Open Everyday: 9:00 AM – 9:00 PM</span>
              </div>

              {/* Admin login helper link in footer */}
              <div className="pt-3">
                <button
                  id="footer-admin-link"
                  onClick={() => handleNav('admin-login')}
                  className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-amber-400 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Studio Portal</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* SEO Tag Cloud for Search Indexing */}
        <div className="mt-12 pt-6 border-t border-neutral-900/80 text-[11px] text-neutral-400 space-y-2">
          <div className="font-bold text-neutral-300 uppercase tracking-wider text-[10px]">
            Popular Searches &amp; Regional Hubs:
          </div>
          <p className="leading-relaxed">
            <span className="text-amber-400/80 font-medium">Koderma &amp; Jhumri Telaiya:</span> Wedding Photographer in Koderma • Best Videographer in Jhumri Telaiya • Pre-Wedding Shoot Tilaiya Dam • 12x36 Karizma Album Maker Koderma • Canvera Photo Album Jhumri Telaiya • Vehicle Delivery Shoot Koderma • Music Recording Studio Koderma • Drone Videography Koderma.
          </p>
          <p className="leading-relaxed">
            <span className="text-amber-400/80 font-medium">Jharkhand &amp; Bihar:</span> Top Wedding Photographer in Jharkhand • Cinematic Wedding Film Ranchi • Wedding Cinematographer Hazaribagh • Event Photographer Dhanbad • Candid Photography Giridih • Wedding Studio Bokaro • Destination Wedding Crew Bihar &amp; Jharkhand.
          </p>
          <p className="leading-relaxed">
            <span className="text-amber-400/80 font-medium">All India:</span> Luxury Wedding Photography India • 4K Sony FX Multi-Camera Crew • Pan-India Pre-Wedding Films • Certified Photography &amp; Video Editing Academy.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} Ashish Wedding Film Studio. All rights reserved. Registered in Jhumri Telaiya, Jharkhand.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => handleNav('privacy')} className="hover:text-neutral-400 transition-colors">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => handleNav('terms')} className="hover:text-neutral-400 transition-colors">
              Terms of Booking
            </button>
            <span>•</span>
            <span className="flex items-center gap-1 text-neutral-400">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" /> for memories that last forever
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
