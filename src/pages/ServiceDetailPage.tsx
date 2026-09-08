import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Film, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  Award, 
  Clock, 
  Layers, 
  HelpCircle,
  GraduationCap,
  Music,
  Share2
} from 'lucide-react';
import { api } from '../api/client';
import { Service } from '../types';
import { useToast } from '../context/ToastContext';

interface ServiceDetailPageProps {
  serviceSlug: string;
  onNavigate: (page: string, param?: string) => void;
  onOpenBooking: (serviceSlug?: string) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  serviceSlug,
  onNavigate,
  onOpenBooking,
}) => {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    api.getServices().then((list) => {
      const found = list.find((s) => s.slug === serviceSlug || s.id === serviceSlug) || list[0];
      setService(found || null);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [serviceSlug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service?.title || 'Ashish Wedding Film Studio',
        text: `Check out ${service?.title} at Ashish Wedding Film Studio!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-amber-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold font-serif mb-4">Service Not Found</h2>
        <button
          onClick={() => onNavigate('services')}
          className="px-6 py-2.5 rounded-full bg-amber-500 text-neutral-950 font-bold text-sm"
        >
          Back to All Services
        </button>
      </div>
    );
  }

  return (
    <div id="service-detail-page" className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('services')}
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Studio Services</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Service</span>
          </button>
        </div>

        {/* Hero Header Card */}
        <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-neutral-900/80 shadow-2xl min-h-[380px] flex flex-col justify-end p-6 sm:p-10">
          <img
            src={service.image}
            alt={service.title}
            className="absolute inset-0 w-full h-full object-cover object-center brightness-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />

          <div className="relative z-10 space-y-3 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/40 backdrop-blur-md">
              {service.category}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
              {service.title}
            </h1>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              {service.description}
            </p>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Details (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Features & Deliverables */}
            <div className="p-8 rounded-3xl bg-neutral-900/70 border border-neutral-800 space-y-6">
              <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>What's Included In This Package</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-neutral-200">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment & Quality Standards */}
            <div className="p-8 rounded-3xl bg-neutral-900/70 border border-neutral-800 space-y-4">
              <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Studio Hardware & Production Standard</span>
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                We utilize Sony Alpha Cinema systems with 4K 120fps recording, DJI Ronin stabilized gimbals, Sennheiser wireless audio lavaliers, Godox studio strobes, and certified drone operators for breathtaking aerial angles.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs font-semibold text-neutral-300">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  Sony FX3 / A7R V
                </div>
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  4K 60/120p Master
                </div>
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  DJI Mavic Air 4K
                </div>
              </div>
            </div>

            {/* Special Section for Academy if Slug is learning-training */}
            {service.slug === 'learning-training' && (
              <div className="p-8 rounded-3xl bg-gradient-to-r from-neutral-900 via-amber-950/20 to-neutral-900 border border-amber-500/40 space-y-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <GraduationCap className="w-5 h-5" />
                  <span>Academy Syllabus Breakdown</span>
                </div>
                <h4 className="text-xl font-bold text-white font-serif">
                  Comprehensive 3-Month Studio Certification
                </h4>
                <div className="space-y-3 text-xs text-neutral-300">
                  <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
                    <strong className="text-amber-300 block mb-1">Module 1: Camera Optics & Composition</strong>
                    Shutter speed, aperture, ISO triangle, framing, gimbal balance, and studio lighting setup.
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
                    <strong className="text-amber-300 block mb-1">Module 2: Video Editing & Color Grading</strong>
                    Premiere Pro timeline workflows, DaVinci Resolve color wheels, and cinematic sound design.
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
                    <strong className="text-amber-300 block mb-1">Module 3: Live Wedding Internship</strong>
                    Accompany our senior crew to 5 live royal weddings in Jharkhand to shoot real client footage.
                  </div>
                </div>
              </div>
            )}

            {/* FAQ */}
            <div className="p-8 rounded-3xl bg-neutral-900/70 border border-neutral-800 space-y-4">
              <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>Frequently Asked Questions</span>
              </h3>
              
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
                  <h5 className="font-bold text-white mb-1">How soon do we receive the edited videos and album?</h5>
                  <p className="text-neutral-400">
                    Same-day / next-day teaser reels are delivered within 48 hours. Master 4K video films and Karizma Velvet albums are delivered within 15–20 days after photo selection.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
                  <h5 className="font-bold text-white mb-1">Do you travel outside Jhumri Telaiya for weddings?</h5>
                  <p className="text-neutral-400">
                    Yes! Our team frequently covers weddings across Ranchi, Dhanbad, Hazaribagh, Patna, Gaya, Kolkata, and all over India.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Sticky Booking Action Card (1 col) */}
          <div className="space-y-6">
            <div className="sticky top-28 p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-amber-500/40 shadow-2xl space-y-6 text-neutral-200">
              <div className="space-y-1 border-b border-neutral-800 pb-4">
                <span className="text-xs text-neutral-400 block uppercase font-bold tracking-wider">
                  Starting Investment
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-serif">
                  ₹{service.startingPrice.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-neutral-400 block">
                  Includes advance reservation & full equipment crew
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Advance Deposit (30%):</span>
                  <span className="font-bold text-white">
                    ₹{Math.round(service.startingPrice * 0.3).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Delivery Format:</span>
                  <span className="font-bold text-white">Pen Drive & Online Cloud</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span>Location Coverage:</span>
                  <span className="font-bold text-white">Jharkhand & Pan-India</span>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  id="service-detail-book-btn"
                  onClick={() => onOpenBooking(service.slug)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reserve This Date Online</span>
                </button>

                <button
                  onClick={() => onNavigate('enquiry')}
                  className="w-full py-3 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-semibold text-xs transition-colors"
                >
                  Request Custom Quote
                </button>
              </div>

              <div className="pt-4 border-t border-neutral-800 text-[11px] text-neutral-400 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Date Guarantee with official invoice</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>24/7 Support via Call & WhatsApp</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
