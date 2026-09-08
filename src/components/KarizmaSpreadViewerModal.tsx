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

  useEffect(() => {
    setCurrentSpreadIndex(0);
    setIsZoomed(false);
    setIsAddingSpread(false);
  }, [album]);

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
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-neutral-950 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white font-serif truncate max-w-[200px] sm:max-w-md">
                  {album.title}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden sm:inline-block">
                  {album.albumType}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Couple: <span className="text-white font-medium">{album.coupleName}</span> • 12x36 Seamless Layflat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Toggle */}
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              title={isZoomed ? 'Standard View' : 'Zoom In Details'}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            >
              {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            </button>

            {/* Admin Controls */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <button
                  id="spread-add-sheet-btn"
                  onClick={() => setIsAddingSpread(!isAddingSpread)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors"
                  title="Upload New Spread Image to this Album"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Sheet</span>
                </button>

                {spreads.length > 1 && (
                  <button
                    id="spread-delete-sheet-btn"
                    onClick={handleDeleteCurrentSpread}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800/50 text-red-300 text-xs font-bold transition-colors"
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
                className="text-[11px] text-amber-300 hover:text-white px-2.5 py-1 rounded-lg border border-neutral-800 bg-neutral-900 hover:border-amber-500/40 transition-colors"
                title="Admin 1-Click Login"
              >
                Owner Login
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors ml-2"
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
        <div className="relative flex-1 bg-neutral-950/80 flex items-center justify-center p-2 sm:p-6 overflow-hidden select-none">
          
          {/* Previous Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-20 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 shadow-xl flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-105"
            aria-label="Previous Sheet"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-20 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 shadow-xl flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-105"
            aria-label="Next Sheet"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Book Canvas Container */}
          <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
            
            {/* The 12x36 Panoramic Layflat Spread */}
            <div 
              className={`relative max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-neutral-800 transition-all duration-300 ${
                isZoomed ? 'scale-125 cursor-grab active:cursor-grabbing' : 'scale-100'
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
                className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none opacity-40 bg-gradient-to-r from-transparent via-black to-transparent"
                title="180 Degree Layflat Center Crease"
              />

              {/* Page Number Overlay Badges */}
              <div className="absolute bottom-3 left-4 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] text-neutral-300 font-mono border border-white/10 pointer-events-none">
                {currentSpreadIndex === 0 ? 'Cover Sheet' : `Sheet ${currentSpreadIndex} (L)`}
              </div>

              <div className="absolute bottom-3 right-4 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] text-neutral-300 font-mono border border-white/10 pointer-events-none">
                {currentSpreadIndex === 0 ? 'Back' : `Sheet ${currentSpreadIndex} (R)`}
              </div>
            </div>

          </div>

          {/* Spread Index Counter Banner */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3.5 py-1 rounded-full bg-neutral-900/90 border border-neutral-700 text-xs font-semibold text-amber-400 backdrop-blur-md shadow-lg flex items-center gap-2">
            <span>Sheet {currentSpreadIndex + 1} of {spreads.length}</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-300">12x36 Layflat Spread</span>
          </div>

        </div>

        {/* Bottom Thumbnail Strip & Album Information */}
        <div className="bg-neutral-950 border-t border-neutral-800 p-3 sm:p-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Thumbnails Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full sm:max-w-xl pb-1 sm:pb-0 no-scrollbar">
            {spreads.map((spr, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentSpreadIndex(idx); setIsZoomed(false); }}
                className={`relative w-16 sm:w-20 h-10 sm:h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
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
                <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-white bg-black/70 px-1 rounded">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>

          {/* Action CTAs: WhatsApp & Book */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <a
              href={`https://wa.me/918709017294?text=Hello%20Ashish%20Wedding%20Film%20Studio,%20I%20saw%20the%20${encodeURIComponent(album.title)}%20(${encodeURIComponent(album.albumType)})%20Karizma%20Album%20on%20your%20website%20and%20would%20like%20to%20order/inquire%20for%20our%20wedding.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Inquire on WhatsApp</span>
            </a>

            {onOpenBooking && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
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
