import React from 'react';
import { 
  Camera, 
  Film, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  Heart, 
  CheckCircle2, 
  Sparkles, 
  Music, 
  GraduationCap, 
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string, param?: string) => void;
  onOpenBooking: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenBooking }) => {
  const team = [
    {
      name: 'Ashish Kumar',
      role: 'Founder & Chief Director of Photography',
      experience: '12+ Years Experience',
      bio: 'Pioneered cinematic wedding filming in Jhumri Telaiya. Sony certified cinematography specialist and academy mentor.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Rahul Verma',
      role: 'Lead Cinematographer & Drone Pilot',
      experience: '8+ Years Experience',
      bio: 'Specialist in 4K aerial gimbal maneuvers, baraat drone coverage, and high-speed automotive reels.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Priya Sharma',
      role: 'Senior Album Designer & Colorist',
      experience: '7+ Years Experience',
      bio: 'Master of DaVinci Resolve color pipelines and custom handmade Karizma Velvet photobook layout design.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Amit Pandey',
      role: 'Music Producer & Audio Engineer',
      experience: '9+ Years Experience',
      bio: 'Studio head for vocal dubbing, song remixing, live acoustic wedding soundtrack creation, and master audio mixing.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div id="about-page" className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* About Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5" />
              Crafting Timeless Heirlooms Since 2012
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-white tracking-tight leading-tight">
              About Ashish Wedding Film Studio
            </h1>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              Located in <strong>Gumo, Kharitand, Jhumri Telaiya, Jharkhand</strong>, Ashish Wedding Film Studio is the region's leading full-service visual and acoustic production powerhouse.
            </p>
            <p className="text-neutral-400 text-sm leading-relaxed">
              We specialize in immortalizing emotion. Whether it’s the quiet sacred tears during a Kanyadaan, the high-octane energy of a grand Baraat, a dreamy pre-wedding at Telaiya Dam, the thrill of receiving keys to a brand-new car, or training the next generation of filmmakers at our academy.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-2xl font-bold text-amber-400 font-serif">500+</span>
                <p className="text-xs text-neutral-400 mt-1">Weddings & Shoots</p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-2xl font-bold text-amber-400 font-serif">100%</span>
                <p className="text-xs text-neutral-400 mt-1">Client Satisfaction</p>
              </div>
            </div>
          </div>

          {/* Hero Studio Showcase Image */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80"
                alt="Ashish Studio Camera Crew"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Studio Vision & Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Film className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-serif text-white">Cinematic Storytelling</h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              We treat wedding footage not as continuous CCTV video, but as a narrative film scored with bespoke background audio and color harmony.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Music className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-serif text-white">In-House Music Suite</h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Equipped with soundproof vocal booths, Pro Tools / FL Studio suites for original song recording, remixing, and mastering for videos.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-serif text-white">Creative Academy</h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Empowering youth across Koderma and Jharkhand with career-ready skills in camera operation, editing, and commercial videography.
            </p>
          </div>
        </div>

        {/* The Creative Crew */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
              The Creators
            </span>
            <h2 className="text-3xl font-bold font-serif text-white">
              Meet Our Studio Core Team
            </h2>
            <p className="text-neutral-400 text-sm">
              Passionate visual artists, editors, and sound designers dedicated to perfection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-neutral-900/70 border border-neutral-800 hover:border-amber-500/40 transition-all space-y-4 text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-2xl object-cover mx-auto border-2 border-amber-500/40 shadow-lg"
                />
                <div>
                  <h4 className="text-base font-bold text-white font-serif">{member.name}</h4>
                  <p className="text-xs text-amber-400 font-medium mt-0.5">{member.role}</p>
                  <span className="inline-block mt-1 text-[10px] text-neutral-400 bg-neutral-950 px-2.5 py-0.5 rounded-full border border-neutral-800">
                    {member.experience}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Location & Studio Facility CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-neutral-900 via-amber-950/30 to-neutral-900 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-serif text-white">
              Visit Our Studio in Jhumri Telaiya
            </h3>
            <p className="text-sm text-neutral-400">
              Gumo, Kharitand, Jhumri Telaiya, Jharkhand • Open daily 9:00 AM – 9:00 PM
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenBooking}
              className="px-6 py-3 rounded-full bg-amber-500 text-neutral-950 font-bold text-sm shadow-lg hover:bg-amber-400 transition-all"
            >
              Book Studio Session
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-3 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-200 font-semibold text-sm hover:bg-neutral-800 transition-all"
            >
              Get Directions & Contact
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
