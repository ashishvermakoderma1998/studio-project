import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Menu, 
  X, 
  ChevronDown, 
  Calendar, 
  User, 
  LogOut, 
  ShieldCheck, 
  Film, 
  Music, 
  GraduationCap, 
  Phone, 
  Sparkles,
  HeartHandshake,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, param?: string) => void;
  onOpenBooking: (serviceSlug?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onOpenBooking }) => {
  const { user, logout, isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const serviceCategories = [
    { name: 'Wedding Photography', slug: 'wedding-photography', icon: Camera, desc: 'Candid & traditional rituals' },
    { name: 'Cinematic Wedding Films', slug: 'cinematic-wedding-films', icon: Film, desc: '4K trailer & master films' },
    { name: 'Wedding Videography', slug: 'wedding-videography', icon: Film, desc: 'Full ceremony coverage' },
    { name: 'Vehicle Purchase Shoot', slug: 'vehicle-purchase-shoot', icon: Sparkles, desc: 'Car & bike delivery reels' },
    { name: 'Music Studio & Mixing', slug: 'music-recording', icon: Music, desc: 'Recording, remixing & mastering' },
    { name: 'Photo Album Design', slug: 'photo-album-editing', icon: Camera, desc: 'Karizma & Velvet luxury albums' },
    { name: 'Learning & Training Academy', slug: 'learning-training', icon: GraduationCap, desc: 'Photography & video courses' },
  ];

  const handleNavClick = (page: string, param?: string) => {
    onNavigate(page, param);
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-neutral-950/90 backdrop-blur-md border-b border-amber-500/20 py-3 shadow-xl shadow-black/50'
          : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <button
            id="brand-logo-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block font-serif group-hover:text-amber-300 transition-colors">
                Ashish Wedding Film
              </span>
              <span className="text-[10px] tracking-widest text-amber-400/90 uppercase block font-semibold">
                Studio • Jhumri Telaiya
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <button
              id="nav-home-btn"
              onClick={() => handleNavClick('home')}
              className={`transition-colors hover:text-amber-400 ${
                currentPage === 'home' ? 'text-amber-400 font-semibold' : 'text-neutral-200'
              }`}
            >
              Home
            </button>

            <button
              id="nav-about-btn"
              onClick={() => handleNavClick('about')}
              className={`transition-colors hover:text-amber-400 ${
                currentPage === 'about' ? 'text-amber-400 font-semibold' : 'text-neutral-200'
              }`}
            >
              About Us
            </button>

            {/* Services Dropdown */}
            <div className="relative">
              <button
                id="nav-services-dropdown-btn"
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                onMouseEnter={() => setServicesDropdownOpen(true)}
                className={`flex items-center gap-1 transition-colors hover:text-amber-400 ${
                  currentPage === 'services' || currentPage === 'service-detail'
                    ? 'text-amber-400 font-semibold'
                    : 'text-neutral-200'
                }`}
              >
                <span>Services</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-200" />
              </button>

              {servicesDropdownOpen && (
                <div
                  id="services-dropdown-menu"
                  onMouseLeave={() => setServicesDropdownOpen(false)}
                  className="absolute top-full left-0 mt-2 w-80 rounded-2xl bg-neutral-900/95 border border-amber-500/30 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 z-50"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 px-3 py-1.5 border-b border-neutral-800">
                    Studio Specializations
                  </div>
                  <div className="py-2 flex flex-col gap-1">
                    {serviceCategories.map((srv) => (
                      <button
                        key={srv.slug}
                        id={`nav-srv-${srv.slug}`}
                        onClick={() => handleNavClick('service-detail', srv.slug)}
                        className="flex items-center gap-3 p-2 rounded-xl text-left hover:bg-amber-500/10 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-neutral-950 transition-colors shrink-0">
                          <srv.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-100 group-hover:text-amber-300">
                            {srv.name}
                          </div>
                          <div className="text-[11px] text-neutral-400">{srv.desc}</div>
                        </div>
                      </button>
                    ))}
                    <div className="pt-2 border-t border-neutral-800 mt-1">
                      <button
                        id="nav-all-services-btn"
                        onClick={() => handleNavClick('services')}
                        className="w-full text-center py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors"
                      >
                        Explore All 14 Studio Services →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              id="nav-gallery-btn"
              onClick={() => handleNavClick('gallery')}
              className={`transition-colors hover:text-amber-400 ${
                currentPage === 'gallery' ? 'text-amber-400 font-semibold' : 'text-neutral-200'
              }`}
            >
              Gallery
            </button>

            <button
              id="nav-karizma-btn"
              onClick={() => handleNavClick('karizma-albums')}
              className={`flex items-center gap-1.5 transition-colors hover:text-amber-400 ${
                currentPage === 'karizma-albums' ? 'text-amber-400 font-semibold' : 'text-neutral-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Karizma Albums</span>
            </button>

            <button
              id="nav-pricing-btn"
              onClick={() => handleNavClick('pricing')}
              className={`transition-colors hover:text-amber-400 ${
                currentPage === 'pricing' ? 'text-amber-400 font-semibold' : 'text-neutral-200'
              }`}
            >
              Packages & Pricing
            </button>

            <button
              id="nav-academy-btn"
              onClick={() => handleNavClick('service-detail', 'learning-training')}
              className={`flex items-center gap-1.5 transition-colors hover:text-amber-400 ${
                currentPage === 'service-detail' ? 'text-amber-400' : 'text-neutral-200'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Academy</span>
            </button>

            <button
              id="nav-reviews-btn"
              onClick={() => handleNavClick('reviews')}
              className={`transition-colors hover:text-amber-400 ${
                currentPage === 'reviews' ? 'text-amber-400 font-semibold' : 'text-neutral-200'
              }`}
            >
              Reviews
            </button>

            <button
              id="nav-contact-btn"
              onClick={() => handleNavClick('contact')}
              className={`transition-colors hover:text-amber-400 ${
                currentPage === 'contact' ? 'text-amber-400 font-semibold' : 'text-neutral-200'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Action CTAs & Auth Controls */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              id="nav-whatsapp-header-btn"
              href="https://wa.me/918709017294?text=Hello%20Ashish%20Wedding%20Film%20Studio,%20I%20want%20to%20inquire%20about%20your%20photography%20and%20film%20packages."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-950/40 border border-emerald-400/30"
              title="Chat on WhatsApp (+91 87090 17294)"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-100" />
              <span>WhatsApp</span>
            </a>

            <button
              id="nav-book-now-header-btn"
              onClick={() => onOpenBooking()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Now</span>
            </button>

            {user ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-neutral-900 border border-neutral-700 hover:border-amber-500/50 transition-colors"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-amber-500/50"
                  />
                  <span className="text-xs font-semibold text-neutral-200 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    id="user-dropdown-menu"
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-neutral-900/95 border border-amber-500/30 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-2 border-b border-neutral-800 mb-1">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                        {user.role}
                      </span>
                    </div>

                    <button
                      id="user-menu-dashboard-btn"
                      onClick={() => handleNavClick('dashboard')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-200 hover:text-amber-300 hover:bg-neutral-800 rounded-lg transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-amber-400" />
                      <span>User Dashboard</span>
                    </button>

                    <button
                      id="user-menu-bookings-btn"
                      onClick={() => handleNavClick('dashboard')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-200 hover:text-amber-300 hover:bg-neutral-800 rounded-lg transition-colors text-left"
                    >
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span>My Bookings & Receipts</span>
                    </button>

                    {isAdmin && (
                      <button
                        id="user-menu-admin-btn"
                        onClick={() => handleNavClick('admin')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors text-left border border-amber-500/20 my-1"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Admin Studio Control</span>
                      </button>
                    )}

                    <div className="pt-1 border-t border-neutral-800 mt-1">
                      <button
                        id="user-menu-logout-btn"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          handleNavClick('home');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/30 rounded-lg transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-login-btn"
                  onClick={() => handleNavClick('login')}
                  className="px-4 py-2 rounded-full text-xs font-bold text-neutral-200 hover:text-amber-400 hover:bg-neutral-800/80 transition-colors"
                >
                  Sign In
                </button>
                <button
                  id="nav-signup-btn"
                  onClick={() => handleNavClick('signup')}
                  className="px-4 py-2 rounded-full text-xs font-bold text-amber-300 border border-amber-500/40 hover:bg-amber-500/10 transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              id="mobile-book-now-top-btn"
              onClick={() => onOpenBooking()}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 text-xs font-bold shadow-md shadow-amber-500/20"
            >
              Book Now
            </button>
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden bg-neutral-950/98 border-b border-amber-500/20 px-4 pt-3 pb-6 space-y-3 backdrop-blur-xl animate-in slide-in-from-top duration-200"
        >
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-neutral-800">
            <button
              onClick={() => handleNavClick('home')}
              className={`p-2.5 rounded-xl text-left text-sm font-semibold ${
                currentPage === 'home' ? 'bg-amber-500/15 text-amber-400' : 'text-neutral-300 bg-neutral-900/60'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`p-2.5 rounded-xl text-left text-sm font-semibold ${
                currentPage === 'about' ? 'bg-amber-500/15 text-amber-400' : 'text-neutral-300 bg-neutral-900/60'
              }`}
            >
              About Studio
            </button>
            <button
              onClick={() => handleNavClick('services')}
              className={`p-2.5 rounded-xl text-left text-sm font-semibold ${
                currentPage === 'services' ? 'bg-amber-500/15 text-amber-400' : 'text-neutral-300 bg-neutral-900/60'
              }`}
            >
              Services (14)
            </button>
            <button
              onClick={() => handleNavClick('gallery')}
              className={`p-2.5 rounded-xl text-left text-sm font-semibold ${
                currentPage === 'gallery' ? 'bg-amber-500/15 text-amber-400' : 'text-neutral-300 bg-neutral-900/60'
              }`}
            >
              Gallery & Films
            </button>
            <button
              onClick={() => handleNavClick('karizma-albums')}
              className={`p-2.5 rounded-xl text-left text-sm font-semibold flex items-center gap-1.5 ${
                currentPage === 'karizma-albums' ? 'bg-amber-500/15 text-amber-400' : 'text-neutral-300 bg-neutral-900/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Karizma Albums</span>
            </button>
            <button
              onClick={() => handleNavClick('pricing')}
              className={`p-2.5 rounded-xl text-left text-sm font-semibold ${
                currentPage === 'pricing' ? 'bg-amber-500/15 text-amber-400' : 'text-neutral-300 bg-neutral-900/60'
              }`}
            >
              Packages & Rates
            </button>
            <button
              onClick={() => handleNavClick('service-detail', 'learning-training')}
              className={`p-2.5 rounded-xl text-left text-sm font-semibold ${
                currentPage === 'service-detail' ? 'bg-amber-500/15 text-amber-400' : 'text-neutral-300 bg-neutral-900/60'
              }`}
            >
              Academy Courses
            </button>
            <button
              onClick={() => handleNavClick('reviews')}
              className={`p-2.5 rounded-xl text-left text-sm font-semibold ${
                currentPage === 'reviews' ? 'bg-amber-500/15 text-amber-400' : 'text-neutral-300 bg-neutral-900/60'
              }`}
            >
              Reviews
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`p-2.5 rounded-xl text-left text-sm font-semibold ${
                currentPage === 'contact' ? 'bg-amber-500/15 text-amber-400' : 'text-neutral-300 bg-neutral-900/60'
              }`}
            >
              Contact Us
            </button>
          </div>

          <a
            href="https://wa.me/918709017294?text=Hello%20Ashish%20Wedding%20Film%20Studio,%20I%20want%20to%20inquire%20about%20your%20photography%20and%20film%20packages."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40 border border-emerald-400/30 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-emerald-100" />
            <span>Chat on WhatsApp (+91 87090 17294)</span>
          </a>

          {/* User status in mobile */}
          {user ? (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-amber-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleNavClick('dashboard')}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 text-neutral-200 font-semibold text-sm flex items-center justify-center gap-2 border border-neutral-800"
              >
                <User className="w-4 h-4 text-amber-400" />
                <span>My Dashboard & Bookings</span>
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500/20 text-amber-300 font-semibold text-sm flex items-center justify-center gap-2 border border-amber-500/40"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
              )}
              <button
                onClick={() => {
                  logout();
                  handleNavClick('home');
                }}
                className="w-full py-2 rounded-xl text-red-400 font-semibold text-sm"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleNavClick('login')}
                className="py-2.5 rounded-xl bg-neutral-900 text-neutral-200 font-semibold text-sm border border-neutral-800 text-center"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNavClick('signup')}
                className="py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-sm text-center"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
