import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Upload, 
  Trash2, 
  Sparkles, 
  Layers, 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  MapPin, 
  MessageCircle, 
  CheckCircle2, 
  ShieldCheck,
  Plus,
  ArrowRight
} from 'lucide-react';
import { KarizmaAlbumItem, KarizmaFinish } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { KarizmaSpreadViewerModal } from '../components/KarizmaSpreadViewerModal';
import { KarizmaUploadModal } from '../components/KarizmaUploadModal';

interface KarizmaAlbumPageProps {
  onOpenBooking: (serviceSlug?: string) => void;
  onNavigate?: (page: string) => void;
}

export const KarizmaAlbumPage: React.FC<KarizmaAlbumPageProps> = ({ 
  onOpenBooking,
  onNavigate 
}) => {
  const { isAdmin, loginWithDemoAdmin } = useAuth();
  const { showToast } = useToast();

  const [albums, setAlbums] = useState<KarizmaAlbumItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [selectedFinish, setSelectedFinish] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedAlbumForViewer, setSelectedAlbumForViewer] = useState<KarizmaAlbumItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Load albums from API / local fallback
  const loadAlbums = async () => {
    try {
      setLoading(true);
      const data = await api.getKarizmaAlbums();
      setAlbums(data);
    } catch (err: any) {
      console.error('Failed to load Karizma albums:', err);
      showToast('Could not load Karizma albums from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, []);

  // Admin delete album
  const handleDeleteAlbum = async (albumId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening viewer

    const confirmed = window.confirm(`Are you sure you want to delete the album "${title}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await api.deleteKarizmaAlbum(albumId);
      showToast(`Album "${title}" has been deleted`, 'info');
      setAlbums(prev => prev.filter(a => a.id !== albumId));
      if (selectedAlbumForViewer?.id === albumId) {
        setSelectedAlbumForViewer(null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete album', 'error');
    }
  };

  const finishes = [
    { id: 'all', label: 'All Karizma Albums' },
    { id: 'Royal Velvet', label: 'Royal Velvet (मखमली)' },
    { id: 'Canvera HD', label: 'Canvera HD (कैनवेरा)' },
    { id: 'Acrylic Glass', label: 'Acrylic Glass (3D ग्लास)' },
    { id: 'Metallic Sheen', label: 'Metallic Sheen (मेटैलिक)' },
    { id: 'Leatherite Cameo', label: 'Leatherite (लेदराइट)' },
  ];

  const filteredAlbums = albums.filter((album) => {
    const matchesFinish = selectedFinish === 'all' || album.albumType.toLowerCase() === selectedFinish.toLowerCase();
    const matchesSearch = 
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.coupleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (album.location && album.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFinish && matchesSearch;
  });

  return (
    <div id="karizma-album-page" className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            12x36 Seamless Layflat Photobooks
          </span>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
            Karizma Wedding Album Gallery
          </h1>
          
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Experience our handcrafted luxury wedding albums. Printed on waterproof non-tearable velvet & Canvera silk sheets with 180° seamless layflat spreads and custom acrylic cameo covers.
          </p>
        </div>

        {/* Admin Exclusive Top Banner */}
        {isAdmin ? (
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-transparent border border-amber-500/30 rounded-3xl p-4 sm:p-6 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-white">
                    Studio Admin Control Panel
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-neutral-950 font-bold uppercase">
                    Admin Active
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  You have full admin control: Upload new albums, add sheets/spreads, or delete albums.
                </p>
              </div>
            </div>

            <button
              id="admin-upload-album-btn"
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 shrink-0 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>+ Upload New Album (नया एल्बम जोड़ें)</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end">
            <button
              onClick={async () => {
                try {
                  await loginWithDemoAdmin();
                  showToast('Admin mode enabled! You can now Add & Delete albums.', 'success');
                } catch (e: any) {
                  showToast(e.message || 'Login failed', 'error');
                }
              }}
              className="text-xs text-neutral-400 hover:text-amber-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-amber-500/40 bg-neutral-900/60 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Studio Owner? 1-Click Admin Access (Add/Delete Albums)</span>
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-900/80 p-4 rounded-3xl border border-neutral-800 backdrop-blur-md">
          
          {/* Finish Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {finishes.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFinish(f.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedFinish === f.id
                    ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by couple or venue..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

        </div>

        {/* Albums Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-neutral-400">Loading Karizma Wedding Albums...</p>
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-neutral-900/50 border border-neutral-800 space-y-4">
            <BookOpen className="w-12 h-12 text-neutral-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Albums Found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              No Karizma albums match your current filter or search criteria.
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Upload First Album
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAlbums.map((album) => (
              <div
                key={album.id}
                onClick={() => setSelectedAlbumForViewer(album)}
                className="group relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between"
              >
                {/* 3D Album Spine Line on the left edge */}
                <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700/40 z-20 pointer-events-none" />

                {/* Album Cover Media */}
                <div className="relative aspect-4/3 overflow-hidden bg-neutral-950">
                  <img
                    src={album.coverImage}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent opacity-70 group-hover:opacity-60 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-6 right-3 flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-500/30">
                      {album.albumType}
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-neutral-900/80 backdrop-blur-md text-[10px] font-semibold text-neutral-300 border border-neutral-700">
                      {album.sheetsCount} Sheets (12x36)
                    </span>
                  </div>

                  {/* Admin Delete Action Button */}
                  {isAdmin && (
                    <button
                      id={`karizma-delete-${album.id}`}
                      onClick={(e) => handleDeleteAlbum(album.id, album.title, e)}
                      title="Delete Album from Website"
                      className="absolute bottom-3 right-3 z-30 px-3 py-1.5 rounded-xl bg-red-950/90 hover:bg-red-800 text-red-200 border border-red-750/70 shadow-xl flex items-center gap-1.5 text-xs font-bold transition-transform hover:scale-105"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Album</span>
                    </button>
                  )}
                </div>

                {/* Card Details */}
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between pl-8">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{album.coupleName}</span>
                    </div>

                    <h3 className="text-lg font-bold font-serif text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {album.title}
                    </h3>

                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {album.description}
                    </p>
                  </div>

                  {/* Meta & Button */}
                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="truncate max-w-[130px]">{album.location || 'Jhumri Telaiya'}</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                      <span>शीट देखें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Feature Specs Banner */}
        <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800 p-8 sm:p-10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Craftsmanship & Archival Quality
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              Why Couples Choose Ashish Studio Karizma Albums
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">180° Layflat Binding</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Seamless panoramic printing without gutter cuts. Full double-spread couple portraits open completely flat on any table.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Waterproof Velvet Paper</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Non-tearable imported photographic paper with anti-scratch matte lamination that repels moisture, spills, and fingerprints.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">3D Acrylic Glass & Box</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                6mm beveled crystal acrylic cover option with padded leatherite presentation briefcase to preserve your wedding memories.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Color Longevity Guarantee</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Calibrated archival pigments tested for 50+ years of vibrant color retention without fading or yellowing.
              </p>
            </div>
          </div>

          {/* Bottom Consultation CTA */}
          <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-serif text-white">
                Want to Design Your Wedding Album with Us?
              </h3>
              <p className="text-xs text-neutral-400">
                Already have photos from another photographer? We design and print luxury Karizma albums from your existing raw photos too!
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href="https://wa.me/918709017294?text=Hello%20Ashish%20Studio,%20I%20want%20to%20get%20a%20custom%20Karizma/Canvera%20Album%20designed%20and%20printed%20for%20my%20wedding."
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Us
              </a>

              <button
                onClick={() => onOpenBooking('photo-album-editing')}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20"
              >
                Book Album Design
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Realistic 12x36 Spread Viewer Modal */}
      {selectedAlbumForViewer && (
        <KarizmaSpreadViewerModal
          album={selectedAlbumForViewer}
          onClose={() => setSelectedAlbumForViewer(null)}
          onAlbumUpdated={(updated) => {
            setSelectedAlbumForViewer(updated);
            setAlbums(prev => prev.map(a => a.id === updated.id ? updated : a));
          }}
          onOpenBooking={() => onOpenBooking('photo-album-editing')}
        />
      )}

      {/* Admin Upload Modal */}
      {isUploadModalOpen && (
        <KarizmaUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onAlbumCreated={(newAlbum) => {
            setAlbums(prev => [newAlbum, ...prev]);
            setSelectedAlbumForViewer(newAlbum); // automatically preview
          }}
        />
      )}

    </div>
  );
};
