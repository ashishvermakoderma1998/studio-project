import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Calendar, 
  MapPin, 
  Layers, 
  Sparkles, 
  MessageCircle, 
  Trash2, 
  Plus, 
  ZoomIn, 
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { KarizmaAlbumItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';

interface KarizmaSpreadViewerModalProps {
  album: KarizmaAlbumItem | null;
  onClose: () => void;
  onAlbumUpdated?: (updated: KarizmaAlbumItem) => void;
  onOpenBooking?: () => void;
}

export const KarizmaSpreadViewerModal: React.FC<KarizmaSpreadViewerModalProps> = ({
  album,
  onClose,
  onAlbumUpdated,
  onOpenBooking
}) => {
  const { isAdmin, loginWithDemoAdmin } = useAuth();
  const { showToast } = useToast();

  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isAddingSpread, setIsAddingSpread] = useState(false);
  const [newSpreadUrl, setNewSpreadUrl] = useState('');
  const [uploadingSpread, setUploadingSpread] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setCurrentSpreadIndex(0);
    setIsZoomed(false);
    setIsAddingSpread(false);
  }, [album]);

  // Touch Swipe Handlers for mobile & tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    // Minimum swipe threshold 50px
    if (diffX > 50) {
      handleNext(); // swipe left -> next page
    } else if (diffX < -50) {
      handlePrev(); // swipe right -> prev page
    }
    setTouchStartX(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!album) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      }
      if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [album, currentSpreadIndex]);

  if (!album) return null;

  const spreads = album.spreads && album.spreads.length > 0 ? album.spreads : [album.coverImage];
  const currentSpread = spreads[currentSpreadIndex] || album.coverImage;

  const handleNext = () => {
    if (currentSpreadIndex < spreads.length - 1) {
      setCurrentSpreadIndex(prev => prev + 1);
    } else {
      setCurrentSpreadIndex(0); // loop back to cover
    }
  };

  const handlePrev = () => {
    if (currentSpreadIndex > 0) {
      setCurrentSpreadIndex(prev => prev - 1);
    } else {
      setCurrentSpreadIndex(spreads.length - 1);
    }
  };

  // Add spread photo via URL or file
  const handleSpreadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('Image size should be less than 8MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setNewSpreadUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSpreadSubmit = async () => {
    if (!newSpreadUrl) {
      showToast('Please select a photo file or enter an image URL', 'error');
      return;
    }
    setUploadingSpread(true);
    try {
      const updated = await api.addSpreadToAlbum(album.id, newSpreadUrl);
      showToast('New spread photo added successfully!', 'success');
      setNewSpreadUrl('');
      setIsAddingSpread(false);
      setUploadingSpread(false);
      if (onAlbumUpdated) onAlbumUpdated(updated);
      setCurrentSpreadIndex(updated.spreads.length - 1);
    } catch (err: any) {
      setUploadingSpread(false);
      showToast(err.message || 'Failed to add spread photo', 'error');
    }
  };

  // Delete current spread
  const handleDeleteCurrentSpread = async () => {
    if (spreads.length <= 1) {
      showToast('An album must have at least one photo or cover spread.', 'error');
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to delete Spread #${currentSpreadIndex + 1} from this album?`);
    if (!confirmed) return;

    try {
      const updated = await api.deleteSpreadFromAlbum(album.id, currentSpreadIndex);
      showToast('Spread deleted from album', 'info');
      if (onAlbumUpdated) onAlbumUpdated(updated);
      setCurrentSpreadIndex(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete spread', 'error');
    }
  };

  return (
    <div 
      id="karizma-spread-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-6xl h-full max-h-[96vh] flex flex-col bg-neutral-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-black">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-neutral-950 border-b border-neutral-800 shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-base font-bold text-white font-serif truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs md:max-w-md">
                  {album.title}
                </h3>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                  {album.albumType}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 truncate">
                Couple: <span className="text-white font-medium">{album.coupleName}</span> • 12x36 Layflat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Zoom Toggle */}
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              title={isZoomed ? 'Standard View' : 'Zoom In Details'}
              className="p-1.5 sm:p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              aria-label="Toggle Zoom"
            >
              {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            </button>

            {/* Admin Controls */}
            {isAdmin ? (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  id="spread-add-sheet-btn"
                  onClick={() => setIsAddingSpread(!isAddingSpread)}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] sm:text-xs font-bold transition-colors"
                  title="Upload New Spread Image to this Album"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">+ Add Sheet</span>
                </button>

                {spreads.length > 1 && (
                  <button
                    id="spread-delete-sheet-btn"
                    onClick={handleDeleteCurrentSpread}
                    className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800/50 text-red-300 text-[11px] sm:text-xs font-bold transition-colors"
                    title="Delete Current Sheet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delete Sheet</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={async () => {
                  try {
                    await loginWithDemoAdmin();
                    showToast('Admin mode enabled! You can now Add & Delete sheets.', 'success');
                  } catch (e: any) {
                    showToast(e.message || 'Login failed', 'error');
                  }
                }}
                className="text-[10px] sm:text-[11px] text-amber-300 hover:text-white px-2 py-1 rounded-lg border border-neutral-800 bg-neutral-900 hover:border-amber-500/40 transition-colors hidden xs:inline-block"
                title="Admin 1-Click Login"
              >
                Owner Login
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors ml-1 sm:ml-2"
              aria-label="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Admin Quick Add Spread Drawer (if open) */}
        {isAdmin && isAddingSpread && (
          <div className="bg-neutral-950/90 border-b border-amber-500/30 p-3 sm:p-4 px-6 flex flex-col sm:flex-row items-center gap-3 text-xs shrink-0 animate-in slide-in-from-top-2">
            <span className="text-amber-400 font-bold whitespace-nowrap flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add 12x36 Spread Sheet Photo:
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleSpreadFileChange}
              className="text-[11px] text-neutral-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-amber-400 hover:file:bg-neutral-700 cursor-pointer"
            />
            <div className="flex-1 flex items-center gap-2 w-full">
              <span className="text-neutral-500">OR</span>
              <input
                type="text"
                value={newSpreadUrl}
                onChange={(e) => setNewSpreadUrl(e.target.value)}
                placeholder="Paste Image URL (https://...)"
                className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={uploadingSpread || !newSpreadUrl}
                onClick={handleAddSpreadSubmit}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold transition-colors whitespace-nowrap"
              >
                {uploadingSpread ? 'Uploading...' : 'Save Sheet'}
              </button>
              <button
                onClick={() => { setIsAddingSpread(false); setNewSpreadUrl(''); }}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Main Spread Center Display (Layflat 12x36 Book Feel) */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative flex-1 bg-neutral-950/80 flex items-center justify-center p-2 sm:p-6 overflow-hidden select-none min-h-[260px] sm:min-h-[380px]"
        >
          
          {/* Previous Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-1.5 sm:left-4 z-20 w-9 sm:w-12 h-9 sm:h-12 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 shadow-xl flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
            aria-label="Previous Sheet"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-1.5 sm:right-4 z-20 w-9 sm:w-12 h-9 sm:h-12 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 shadow-xl flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
            aria-label="Next Sheet"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Book Canvas Container */}
          <div className="relative w-full max-w-5xl h-full flex items-center justify-center px-6 sm:px-12">
            
            {/* The 12x36 Panoramic Layflat Spread */}
            <div 
              className={`relative max-w-full max-h-[50vh] sm:max-h-[62vh] md:max-h-[68vh] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 sm:border-2 transition-all duration-300 ${
                isZoomed ? 'scale-110 sm:scale-125 cursor-grab active:cursor-grabbing' : 'scale-100'
              }`}
              style={{
                aspectRatio: '16/9',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 40px rgba(245, 158, 11, 0.08)'
              }}
            >
              {/* Spread Image */}
              <img
                src={currentSpread}
                alt={`${album.title} - Sheet ${currentSpreadIndex + 1}`}
                className="w-full h-full object-cover select-none pointer-events-none"
              />

              {/* Realistic Layflat Center Fold Shadow Line */}
              <div 
                className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 sm:w-8 pointer-events-none opacity-40 bg-gradient-to-r from-transparent via-black to-transparent"
                title="180 Degree Layflat Center Crease"
              />

              {/* Page Number Overlay Badges */}
              <div className="absolute bottom-2 sm:bottom-3 left-2.5 sm:left-4 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-black/70 backdrop-blur-md text-[9px] sm:text-[10px] text-neutral-300 font-mono border border-white/10 pointer-events-none">
                {currentSpreadIndex === 0 ? 'Cover Sheet' : `Sheet ${currentSpreadIndex} (L)`}
              </div>

              <div className="absolute bottom-2 sm:bottom-3 right-2.5 sm:right-4 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-black/70 backdrop-blur-md text-[9px] sm:text-[10px] text-neutral-300 font-mono border border-white/10 pointer-events-none">
                {currentSpreadIndex === 0 ? 'Back' : `Sheet ${currentSpreadIndex} (R)`}
              </div>
            </div>

          </div>

          {/* Spread Index Counter Banner */}
          <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 z-10 px-2.5 sm:px-3.5 py-1 rounded-full bg-neutral-900/90 border border-neutral-700 text-[10px] sm:text-xs font-semibold text-amber-400 backdrop-blur-md shadow-lg flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
            <span>Sheet {currentSpreadIndex + 1} of {spreads.length}</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-300">12x36 Layflat</span>
          </div>

          {/* Mobile Swipe Hint */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 sm:hidden text-[9px] text-neutral-400 bg-black/60 px-2 py-0.5 rounded-full border border-white/5 pointer-events-none">
            ← Swipe to flip sheets →
          </div>

        </div>

        {/* Bottom Thumbnail Strip & Album Information */}
        <div className="bg-neutral-950 border-t border-neutral-800 p-2.5 sm:p-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* Thumbnails Carousel */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full sm:max-w-xl pb-1 sm:pb-0 no-scrollbar">
            {spreads.map((spr, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentSpreadIndex(idx); setIsZoomed(false); }}
                className={`relative w-14 sm:w-20 h-9 sm:h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                  currentSpreadIndex === idx
                    ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/20'
                    : 'border-neutral-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={spr}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0.5 right-1 text-[8px] sm:text-[9px] font-bold text-white bg-black/70 px-1 rounded">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>

          {/* Action CTAs: WhatsApp & Book */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-stretch sm:justify-end">
            <a
              href={`https://wa.me/918709017294?text=Hello%20Ashish%20Wedding%20Film%20Studio,%20I%20saw%20the%20${encodeURIComponent(album.title)}%20(${encodeURIComponent(album.albumType)})%20Karizma%20Album%20on%20your%20website%20and%20would%20like%20to%20order/inquire%20for%20our%20wedding.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] sm:text-xs shadow-lg shadow-emerald-900/30 transition-all text-center"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
              <span>WhatsApp</span>
            </a>

            {onOpenBooking && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[11px] sm:text-xs shadow-lg shadow-amber-500/20 transition-all text-center whitespace-nowrap"
              >
                Book Album Design
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
