import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight,
  Camera,
  Film,
  Music,
  GraduationCap
} from 'lucide-react';

interface PricingPageProps {
  onOpenBooking: (serviceSlug?: string) => void;
  onNavigate: (page: string, param?: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onOpenBooking, onNavigate }) => {
  const [billingPeriod, setBillingPeriod] = useState<'standard' | 'custom'>('standard');

  const packages = [
    {
      id: 'pkg-silver',
      name: 'Classic Wedding',
      price: 45000,
      badge: 'Popular for Single-Day Rituals',
      description: 'Ideal for 1-day wedding coverage with candid photography and traditional full-length HD video.',
      features: [
        '1 Senior Traditional Photographer',
        '1 Full HD Traditional Videographer',
        'Traditional Ceremony Video (1.5 - 2 Hours)',
        '300+ Color Graded High-Res Photos',
        '1 Regular Hardcover Photo Album (30 Pages)',
        'Pen Drive Delivery + Cloud Storage',
      ],
      slug: 'wedding-photography',
      recommended: false,
    },
    {
      id: 'pkg-gold',
      name: 'Royal Cinematic Grand Wedding',
      price: 85000,
      badge: 'Most Loved by Brides & Grooms',
      description: 'Complete multi-day wedding production with cinema line cameras, aerial drone, teaser reels, and Karizma Velvet Album.',
      features: [
        '2 Candid & Portrait Master Photographers',
        '2 Sony FX Cinema 4K Film Operators',
        '1 Licensed 4K Aerial Drone Operator',
        '3-5 Min Cinematic 4K Wedding Trailer Film',
        '30 Min Master Ceremony Documentary Film',
        '1 Luxury Karizma Velvet Layflat Album (40 Pages)',
        'Next-Day Instagram Teaser Reels for Socials',
        'Audio Lavs on Groom & Panditji for crisp sound',
      ],
      slug: 'cinematic-wedding-films',
      recommended: true,
    },
    {
      id: 'pkg-vehicle',
      name: 'New Vehicle Delivery Shoot',
      price: 9999,
      badge: 'Trending Automobile Reel',
      description: 'Unveil your new car or bike with high-energy 4K gimbal & drone rolls, exhaust audio, and viral delivery reels.',
      features: [
        'Showroom Key Handover Cinematic Coverage',
        '4K Drone Rolling Highway Motion Shots',
        '2 Instagram Reels with Licensed Trending Audio',
        '25 Color Graded High-Resolution Stills',
        '24-Hour Express Reel Delivery',
      ],
      slug: 'vehicle-purchase-shoot',
      recommended: false,
    },
    {
      id: 'pkg-prewed',
      name: 'Telaiya Dam Pre-Wedding Special',
      price: 25000,
      badge: 'Scenic Romantic Film',
      description: 'Romantic sunset shoots at Tilaiya Dam reservoir, hills, and curated Jharkhand heritage landscapes.',
      features: [
        'Full Day Shoot (Up to 3 Outfit Changes)',
        '1 Master Portrait Photographer + 1 Cinematographer',
        '4K Aerial Drone Over Reservoir Waters',
        '1 Romantic Music Video Story (3-4 Mins)',
        '50 Retouched High-Fashion Magazine Stills',
      ],
      slug: 'cinematic-wedding-films',
      recommended: false,
    },
    {
      id: 'pkg-music',
      name: 'Studio Vocal & Remix Suite',
      price: 15000,
      badge: 'Professional Sound Studio',
      description: 'Professional vocal tracking, custom song arrangement, mixing, and background score for video films.',
      features: [
        'Up to 8 Hours Soundproof Studio Vocal Session',
        'Pro Tools & FL Studio Track Arrangement',
        'Professional Auto-Tune & Pitch Correction',
        'Remixing with Custom Cinematic Instruments',
        'Mastering for YouTube, Spotify & Stage PA Systems',
      ],
      slug: 'music-recording',
      recommended: false,
    },
    {
      id: 'pkg-academy',
      name: '3-Month Media Academy Masterclass',
      price: 35000,
      badge: 'Career Certification',
      description: 'Complete hands-on curriculum in photography, videography, Premiere / DaVinci editing, and live wedding shooting.',
      features: [
        '3 Months Studio & Classroom Practical Training',
        'Sony FX Cinema Rigs & Drone Hands-On Usage',
        'DaVinci Resolve Color Grading & Audio Mixing',
        'Guaranteed Live Wedding Shoots with Senior Crew',
        'Recognized Studio Diploma & Career Placement Support',
      ],
      slug: 'learning-training',
      recommended: false,
    },
  ];

  return (
    <div id="pricing-page" className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <CreditCard className="w-3.5 h-3.5" />
            Transparent Investment & Easy 30% Advance
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
            Packages & Pricing
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            All packages include professional crews, high-end cinema equipment, and official invoices. Secure your date online with a 30% advance deposit.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-3xl bg-neutral-900/80 border p-8 flex flex-col justify-between space-y-6 transition-all duration-300 relative ${
                pkg.recommended
                  ? 'border-amber-500 shadow-2xl shadow-amber-500/15 bg-gradient-to-b from-neutral-900 via-amber-950/20 to-neutral-900 scale-[1.02]'
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {pkg.recommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg">
                  ★ Most Recommended
                </div>
              )}

              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  {pkg.badge}
                </span>

                <div>
                  <h3 className="text-2xl font-bold font-serif text-white">{pkg.name}</h3>
                  <p className="text-xs text-neutral-400 mt-1">{pkg.description}</p>
                </div>

                <div className="pt-2 border-t border-neutral-800">
                  <span className="text-xs text-neutral-400 block uppercase tracking-wider font-semibold">Total Package Price</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-serif">
                      ₹{pkg.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-neutral-400">/ event</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium block mt-1">
                    Book online with ₹{Math.round(pkg.price * 0.3).toLocaleString('en-IN')} (30% advance)
                  </span>
                </div>

                <div className="pt-4 border-t border-neutral-800 space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-2">
                    Package Inclusions:
                  </span>
                  {pkg.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  id={`pricing-book-btn-${pkg.id}`}
                  onClick={() => onOpenBooking(pkg.slug)}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    pkg.recommended
                      ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-neutral-950 shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book This Package Now</span>
                </button>

                <button
                  onClick={() => onNavigate('enquiry')}
                  className="w-full py-2.5 rounded-xl text-xs text-neutral-400 hover:text-amber-300 transition-colors text-center"
                >
                  Customize Features & Inclusions →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Advance Guarantee & Payment Policies */}
        <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-neutral-400">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-1">Official Written Agreement</strong>
              Every booking receives a signed GST contract specifying team size, deliverables, and date locking.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-1">Flexible Razorpay Payment</strong>
              Pay 30% advance online via UPI, Credit/Debit Cards or NetBanking. Remaining balance due on shoot day.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-1">Satisfaction Guarantee</strong>
              We offer revision rounds on cinematic teaser cuts and album photobook layouts prior to final printing.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
