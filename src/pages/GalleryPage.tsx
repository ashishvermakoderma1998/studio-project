import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Film, 
  Play, 
  Sparkles, 
  SlidersHorizontal, 
  Heart, 
  User, 
  Calendar,
  Grid,
  Layers,
  Plus,
  Trash2,
  ShieldCheck,
  Upload
} from 'lucide-react';
import { api } from '../api/client';
import { GalleryItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GalleryUploadModal } from '../components/GalleryUploadModal';

interface GalleryPageProps {
  onOpenLightbox: (item: GalleryItem) => void;
  onOpenBooking: () => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onOpenLightbox, onOpenBooking }) => {
  const { isAdmin, loginWithDemoAdmin } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [mediaType, setMediaType] = useState<'all' | 'image' | 'video'>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    api.getGallery().then(setItems).catch(console.error);
  }, []);

  const handleDeletePhoto = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Are you sure you want to delete "${title}" from the gallery?`);
    if (!confirmed) return;

    try {
      await api.deleteGalleryItem(id);
      showToast(`"${title}" deleted from gallery`, 'info');
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete gallery item', 'error');
    }
  };

  const categories = [
    { id: 'all', label: 'All Media' },
    { id: 'Wedding', label: 'Royal Weddings' },
    { id: 'Pre-Wedding', label: 'Pre-Wedding (Telaiya Dam)' },
    { id: 'Vehicle Shoot', label: 'Vehicle Shoots' },
    { id: 'Music Studio', label: 'Music & Recording' },
    { id: 'Academy', label: 'Academy & Training' },
  ];

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedFilter === 'all' || item.category.toLowerCase().includes(selectedFilter.toLowerCase());
    const matchesType = mediaType === 'all' || item.type === mediaType;
    return matchesCategory && matchesType;
  });

  return (
    <div id="gallery-page" className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Film className="w-3.5 h-3.5" />
            4K Cinematography & Fine-Art Photography
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
            Our Studio Portfolio
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base">
            Every celebration has a heartbeat. Explore our real weddings, couple shoots at Tilaiya reservoir, car delivery reels, and sound sessions.
          </p>
        </div>

        {/* Admin Bar */}
        {isAdmin ? (
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-transparent border border-amber-500/30 rounded-3xl p-4 sm:p-5 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">
                    Studio Admin Control Active
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-neutral-950 font-bold uppercase">
                    Admin
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  You can upload new photos or click the delete button on any photo to remove it immediately.
                </p>
              </div>
            </div>

            <button
              id="gallery-admin-upload-btn"
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 shrink-0 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>+ Upload Photo / Video (फोटो जोड़ें)</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end">
            <button
              onClick={async () => {
                try {
                  await loginWithDemoAdmin();
                  showToast('Admin mode enabled! You can now Add & Delete photos.', 'success');
                } catch (e: any) {
                  showToast(e.message || 'Login failed', 'error');
                }
              }}
              className="text-xs text-neutral-400 hover:text-amber-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-amber-500/40 bg-neutral-900/60 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Studio Owner? 1-Click Admin Access (Add/Delete Photos)</span>
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900/80 p-4 rounded-3xl border border-neutral-800 backdrop-blur-md">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedFilter === cat.id
                    ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Media Type Toggle */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setMediaType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                mediaType === 'all' ? 'bg-neutral-800 text-amber-300' : 'text-neutral-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setMediaType('image')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                mediaType === 'image' ? 'bg-neutral-800 text-amber-300' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Photos
            </button>
            <button
              onClick={() => setMediaType('video')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                mediaType === 'video' ? 'bg-neutral-800 text-amber-300' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Films & Reels
            </button>
          </div>
        </div>

        {/* Gallery Grid with Masonry Look */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenLightbox(item)}
              className="group relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 cursor-pointer shadow-xl transition-all duration-300 aspect-4/3 flex flex-col justify-end"
            >
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              {/* Admin Direct Delete Button */}
              {isAdmin && (
                <button
                  id={`gallery-delete-${item.id}`}
                  onClick={(e) => handleDeletePhoto(item.id, item.title, e)}
                  className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-xl bg-red-950/90 hover:bg-red-850 border border-red-700/60 text-red-200 text-xs font-bold flex items-center gap-1.5 shadow-xl transition-transform hover:scale-105"
                  title="Delete Photo from website"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}

              {item.type === 'video' && (
                <div className="absolute top-4 right-4 w-11 h-11 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-neutral-950 ml-0.5" />
                </div>
              )}

              <div className="relative z-10 p-6 space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block">
                  {item.category} • {item.eventType}
                </span>
                <h3 className="text-lg font-bold font-serif text-white group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
                {item.client && (
                  <p className="text-xs text-neutral-400">Client: {item.client}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800 text-center space-y-4">
          <h3 className="text-2xl font-bold font-serif text-white">
            Like what you see? Let's create your wedding story.
          </h3>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto">
            Book our cinematic team in advance to guarantee date availability for your auspicious day in Jharkhand.
          </p>
          <button
            onClick={onOpenBooking}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/25 hover:scale-105 transition-all"
          >
            Check Date & Book Studio
          </button>
        </div>

        {/* Upload Modal */}
        {isUploadModalOpen && (
          <GalleryUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onItemCreated={(newItem) => {
              setItems(prev => [newItem, ...prev]);
            }}
          />
        )}

      </div>
    </div>
  );
};

