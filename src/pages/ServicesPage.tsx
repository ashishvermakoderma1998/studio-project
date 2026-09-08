import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Film, 
  Sparkles, 
  Music, 
  GraduationCap, 
  Sliders, 
  Image as ImageIcon, 
  CheckCircle2, 
  Search, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import { api } from '../api/client';
import { Service } from '../types';

interface ServicesPageProps {
  onNavigate: (page: string, param?: string) => void;
  onOpenBooking: (serviceSlug?: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate, onOpenBooking }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    api.getServices().then(setServices).catch(console.error);
  }, []);

  const categories = [
    { id: 'all', label: 'All Services (14)' },
    { id: 'Photography', label: 'Photography' },
    { id: 'Cinematography', label: 'Cinematography & Video' },
    { id: 'Vehicle Shoot', label: 'Vehicle Shoots' },
    { id: 'Editing & Design', label: 'Editing & Albums' },
    { id: 'Music Production', label: 'Music & Audio' },
    { id: 'Training Academy', label: 'Academy Courses' },
  ];

  const filteredServices = services.filter((srv) => {
    const matchesCat = selectedCategory === 'all' || srv.category.toLowerCase().includes(selectedCategory.toLowerCase()) || (selectedCategory === 'Vehicle Shoot' && srv.slug.includes('vehicle'));
    const matchesQuery = srv.title.toLowerCase().includes(searchQuery.toLowerCase()) || srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div id="services-page" className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Complete Studio Production Suite
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
            Our Professional Services
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            From royal multi-day Indian weddings to fast cinematic automobile delivery reels, studio sound engineering, and creative media academy courses in Jhumri Telaiya, Jharkhand.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-900/80 p-4 rounded-3xl border border-neutral-800 backdrop-blur-md">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wedding, drone, music..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="group rounded-3xl bg-neutral-900/70 border border-neutral-800 hover:border-amber-500/50 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all flex flex-col justify-between"
            >
              <div className="relative h-64 overflow-hidden">
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

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-serif text-white group-hover:text-amber-300 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 line-clamp-3 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="pt-3">
                    <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block mb-2">
                      Package Highlights:
                    </span>
                    <ul className="space-y-1.5">
                      {service.features.slice(0, 4).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-5 border-t border-neutral-800 flex items-center gap-2">
                  <button
                    onClick={() => onOpenBooking(service.slug)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 font-bold text-xs shadow hover:scale-[1.02] active:scale-[0.98] transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Service</span>
                  </button>
                  <button
                    onClick={() => onNavigate('service-detail', service.slug)}
                    className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Service Enquiry Banner */}
        <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 text-center space-y-4">
          <h3 className="text-2xl font-bold font-serif text-white">
            Looking for a Customized Multi-Day Wedding or Multi-Camera Setup?
          </h3>
          <p className="text-neutral-400 text-sm max-w-2xl mx-auto">
            We curate bespoke production packages tailored for destination weddings, live LED wall broadcasting, and custom musical albums across Jharkhand and Bihar.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('enquiry')}
              className="px-8 py-3.5 rounded-full bg-amber-500 text-neutral-950 font-bold text-sm shadow-lg hover:bg-amber-400 transition-all"
            >
              Request Custom Package Quote →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
