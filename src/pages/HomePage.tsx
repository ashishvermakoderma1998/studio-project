import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Camera, 
  Film, 
  Sparkles, 
  Calendar, 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  MapPin, 
  Award, 
  Users, 
  Video, 
  ShieldCheck,
  Music,
  GraduationCap,
  Heart,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Search,
  Globe
} from 'lucide-react';
import { api } from '../api/client';
import { Service, Review, GalleryItem } from '../types';

interface HomePageProps {
  onNavigate: (page: string, param?: string) => void;
  onOpenBooking: (serviceSlug?: string) => void;
  onOpenLightbox: (item: GalleryItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenBooking,
  onOpenLightbox,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    api.getServices().then(setServices).catch(console.error);
    api.getReviews().then(setReviews).catch(console.error);
    api.getGallery().then(setGallery).catch(console.error);
  }, []);

  const stats = [
    { label: 'Weddings Captured', value: '500+', icon: Heart },
    { label: '4K Cinematic Films', value: '250+', icon: Film },
    { label: 'Vehicle Delivery Shoots', value: '120+', icon: Sparkles },
    { label: 'Academy Graduates', value: '350+', icon: GraduationCap },
  ];

  const featuredWorks = gallery.slice(0, 6);

  return (
    <div id="home-page" className="min-h-screen bg-neutral-950 text-neutral-100">
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-16">
        {/* Background Image with Dark Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85"
            alt="Wedding Cinematography Hero"
            className="w-full h-full object-cover object-center brightness-40 scale-105 animate-in fade-in zoom-in-105 duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/40" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-neutral-950/70 to-neutral-950" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/80 border border-amber-500/40 backdrop-blur-md shadow-xl text-amber-300 text-xs sm:text-sm font-semibold"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Jharkhand's Premier Wedding Cinematography & Music Studio</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-serif text-white tracking-tight leading-[1.1]">
              Ashish Wedding Film Studio
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl text-gold-gradient font-serif italic max-w-3xl mx-auto font-medium">
              “Capturing Your Moments, Creating Your Memories”
            </p>
            <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed pt-2">
              From grand royal wedding rituals to cinematic 4K drone films, new vehicle delivery reels, Karizma albums, and professional audio production in Jhumri Telaiya, Jharkhand.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <button
              id="hero-book-now-btn"
              onClick={() => onOpenBooking()}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 font-extrabold text-sm sm:text-base shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-5 h-5" />
              <span>Book Your Event Now</span>
            </button>

            <button
              id="hero-view-services-btn"
              onClick={() => onNavigate('services')}
              className="px-7 py-4 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-sm sm:text-base backdrop-blur-md hover:border-amber-500/50 transition-all flex items-center gap-2"
            >
              <Camera className="w-5 h-5 text-amber-400" />
              <span>Explore 14 Services</span>
            </button>

            <button
              id="hero-view-gallery-btn"
              onClick={() => onNavigate('gallery')}
              className="px-6 py-4 rounded-full bg-neutral-900/40 hover:bg-neutral-900 text-neutral-300 hover:text-white font-medium text-sm sm:text-base border border-neutral-800 transition-colors"
            >
              View 4K Gallery
            </button>
          </motion.div>

          {/* Location Badge */}
          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-neutral-400">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Studio Location: Gumo, Kharitand, Jhumri Telaiya, Koderma, Jharkhand</span>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="border-y border-neutral-800 bg-neutral-900/70 backdrop-blur-md py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((st, i) => (
            <div key={i} className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 hover:border-amber-500/30 transition-colors">
              <st.icon className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
                {st.value}
              </div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold mt-1">
                {st.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services Showcase Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block mb-2">
              Our Professional Craft
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white tracking-tight">
              Featured Studio Services
            </h2>
            <p className="text-neutral-400 text-sm mt-2 max-w-xl">
              Equipped with cinema line Sony FX series, Ronin gimbals, 4K aerial drones, and studio mastering suites.
            </p>
          </div>

          <button
            onClick={() => onNavigate('services')}
            className="text-sm font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 self-start md:self-auto group"
          >
            <span>View All 14 Studio Services</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.slice(0, 6).map((service) => (
            <div
              key={service.id}
              className="group relative rounded-3xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/50 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className="relative h-60 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-neutral-950/80 backdrop-blur-md border border-neutral-700 text-amber-300 text-xs font-bold uppercase">
                  {service.category}
                </span>
                <span className="absolute bottom-3 right-4 text-xs font-bold px-3 py-1 rounded-lg bg-amber-500 text-neutral-950 shadow">
                  From ₹{service.startingPrice.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold font-serif text-white group-hover:text-amber-300 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>

                  <ul className="mt-4 space-y-1.5">
                    {service.features.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-5 border-t border-neutral-800/80 flex items-center gap-2">
                  <button
                    onClick={() => onOpenBooking(service.slug)}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 font-bold text-xs shadow hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
                  >
                    Book Now
                  </button>
                  <button
                    onClick={() => onNavigate('service-detail', service.slug)}
                    className="px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Works & Cinematic Portfolio */}
      <section className="py-20 bg-neutral-900/40 border-t border-neutral-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
              Masterpieces in 4K
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">
              Moments Captured in Jharkhand
            </h2>
            <p className="text-neutral-400 text-sm">
              Explore authentic glimpses of weddings, vehicle shoots, pre-weddings at Telaiya dam, and studio sessions.
            </p>
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWorks.map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenLightbox(item)}
                className="group relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 cursor-pointer shadow-lg aspect-4/3"
              >
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                {item.type === 'video' && (
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-amber-500/90 text-neutral-950 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-neutral-950 ml-0.5" />
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    {item.category} • {item.eventType}
                  </span>
                  <h4 className="text-lg font-bold font-serif text-white group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h4>
                  {item.client && (
                    <p className="text-xs text-neutral-400">Client: {item.client}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('gallery')}
              className="px-6 py-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold text-sm transition-all hover:border-amber-500/50"
            >
              Open Full Media Gallery & Films →
            </button>

            <button
              onClick={() => onNavigate('karizma-albums')}
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Karizma Albums Gallery (शीट गैलरी) →</span>
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Ashish Wedding Film Studio */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
              Uncompromising Standards
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white leading-tight">
              Why Families & Couples Trust Ashish Studio
            </h2>
            <p className="text-neutral-300 text-sm leading-relaxed">
              We do not just document weddings; we compose timeless visual heirlooms. Led by Ashish and our crew of certified cinematographers, sound engineers, and post-production artists in Jhumri Telaiya.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white font-serif">Hollywood-Grade Sony Cinema Rigs</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Sony FX3, A7R V, Cooke & G-Master Prime Lenses for exquisite background separation and 10-bit rich dynamic range.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white font-serif">4K Aerial Drone Cinematography</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Licensed drone pilots capturing majestic venue entries, mandap grandeur, and landscape pre-wedding shots.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white font-serif">Karizma Velvet Waterproof Albums</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Custom layflat luxury albums crafted on non-tearable velvet paper sheets with lifetime UV protection.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Banner */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80"
                alt="Ashish Wedding Cinematography Rig"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-neutral-950/80 backdrop-blur-md border border-neutral-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
                    AWF
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">Ashish Wedding Film Studio</h5>
                    <p className="text-xs text-amber-400">Gumo, Kharitand, Jhumri Telaiya, Jharkhand</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Customer Reviews & Testimonials Section */}
      <section className="py-20 bg-neutral-900/50 border-t border-neutral-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
              Real Client Experiences
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">
              What Our Couples Say
            </h2>
            <p className="text-neutral-400 text-sm">
              Proudly celebrating 100% 5-Star feedback across Jharkhand and neighboring districts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.slice(0, 4).map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed italic">
                    “{rev.comment}”
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-neutral-900">
                  <img
                    src={rev.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.userName)}`}
                    alt={rev.userName}
                    className="w-9 h-9 rounded-full object-cover border border-amber-500/40"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-white">{rev.userName}</h5>
                    <p className="text-[10px] text-amber-400">{rev.eventType}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => onNavigate('reviews')}
              className="px-6 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-200 transition-colors"
            >
              Read All Customer Reviews & Submit Feedback →
            </button>
          </div>
        </div>
      </section>

      {/* Academy & Training Spotlight */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-neutral-900 via-amber-950/30 to-neutral-900 border border-amber-500/40 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 uppercase">
              <GraduationCap className="w-4 h-4" />
              <span>Ashish Studio Media Academy</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              Want to Learn Photography, Videography & Video Editing?
            </h3>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Join our certified practical batch in Jhumri Telaiya. Learn camera operations on Sony FX cinema rigs, DaVinci Resolve color grading, FL Studio audio production, and live wedding shooting mentorship.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-amber-300">
              <span>✓ 100% Practical Studio Work</span>
              <span>✓ Live Wedding Internship</span>
              <span>✓ Recognized Certificate</span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('service-detail', 'learning-training')}
              className="px-6 py-3.5 rounded-full bg-amber-500 text-neutral-950 font-bold text-sm shadow-lg hover:bg-amber-400 transition-colors text-center"
            >
              Explore Course Syllabus
            </button>
            <button
              onClick={() => onNavigate('enquiry')}
              className="px-6 py-3.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-200 font-semibold text-sm hover:bg-neutral-800 transition-colors text-center"
            >
              Enquire for Next Batch
            </button>
          </div>
        </div>
      </section>

      {/* REGIONAL SEO & LOCAL SEARCH HUB (Koderma, Jharkhand & India) */}
      <section id="local-seo-hub" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-900">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>Serving Koderma, Jharkhand & Across India</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-serif text-white">
            Best Wedding Photography & Videography in Jharkhand
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
            Ashish Wedding Film Studio is Jhumri Telaiya's premier photography powerhouse. We travel throughout Jharkhand, Bihar, and across India for destination weddings, royal ceremonies, pre-wedding shoots, and cinematic storytelling.
          </p>
        </div>

        {/* Region & Coverage Pills for Search Discovery */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-12 text-center">
          {[
            { city: 'Koderma & Telaiya', desc: 'Main Studio & Academy', highlight: true },
            { city: 'Hazaribagh', desc: 'Frequent Wedding Shoots', highlight: false },
            { city: 'Ranchi', desc: 'Luxury Hotel Weddings', highlight: false },
            { city: 'Dhanbad & Bokaro', desc: 'Candid & Drone Films', highlight: false },
            { city: 'Giridih & Deoghar', desc: 'Temple & Destination Shoots', highlight: false },
            { city: 'All India & Bihar', desc: 'Destination Wedding Tours', highlight: true },
          ].map((loc, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-2xl border transition-all ${
                loc.highlight
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-300'
              }`}
            >
              <MapPin className="w-4 h-4 mx-auto mb-1 text-amber-400" />
              <div className="font-bold text-xs text-white">{loc.city}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">{loc.desc}</div>
            </div>
          ))}
        </div>

        {/* SEO FAQs Accordion matching Schema.org FAQPage */}
        <div className="max-w-4xl mx-auto space-y-3">
          <h3 className="text-lg font-bold text-white font-serif mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-amber-400" />
            <span>Frequently Asked Questions — Ashish Studio Koderma</span>
          </h3>

          {[
            {
              q: 'Who is the best wedding photographer and videographer in Koderma, Jharkhand?',
              a: 'Ashish Wedding Film Studio is widely recognized as the top wedding photographer in Koderma and Jhumri Telaiya, Jharkhand. With over 500+ successful royal weddings, Sony FX cinema gear, drone videography, and waterproof 12x36 Karizma albums, we deliver unmatched cinematic quality.'
            },
            {
              q: 'Do you provide 4K drone cinematography and live crane setups across Jharkhand?',
              a: 'Yes! We have licensed cinematic drone pilots and heavy-duty camera cranes with live LED streaming setups. We cover weddings, corporate inaugurations, and vehicle shoots in Koderma, Hazaribagh, Ranchi, Dhanbad, Giridih, and surrounding areas.'
            },
            {
              q: 'What finishes are available for 12x36 Karizma and Canvera albums?',
              a: 'We offer non-tearable waterproof Royal Velvet, Matt Canvera, Glossy Metallic, Embossed Leather cases, and Acrylic Glass covers. Every album is digitally designed with panoramic seamless layflat printing.'
            },
            {
              q: 'Can we book Ashish Wedding Film Studio for destination weddings outside Jharkhand?',
              a: 'Absolutely. Our full cinematic crew travels across all states of India, including Bihar, Uttar Pradesh, West Bengal, Rajasthan, and Goa for luxury destination weddings and creative pre-wedding shoots.'
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-neutral-900/80 border border-neutral-800 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-neutral-800/40 transition-colors"
              >
                <span className="font-semibold text-xs sm:text-sm text-white">{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-xs text-neutral-300 leading-relaxed border-t border-neutral-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
