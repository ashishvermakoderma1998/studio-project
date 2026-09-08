import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Camera, Tag, User, MapPin } from 'lucide-react';
import { GalleryItem } from '../types';

interface LightboxModalProps {
  item: GalleryItem | null;
  onClose: () => void;
  onOpenBooking: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ item, onClose, onOpenBooking }) => {
  if (!item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          className="relative max-w-5xl w-full max-h-[90vh] bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-neutral-800 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Media View */}
          <div className="flex-1 bg-black flex items-center justify-center min-h-[300px] lg:min-h-[500px] relative overflow-hidden">
            {item.type === 'video' ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <video
                  src={item.mediaUrl}
                  controls
                  autoPlay
                  className="max-h-[60vh] w-full rounded-2xl shadow-2xl object-contain"
                />
              </div>
            ) : (
              <img
                src={item.mediaUrl}
                alt={item.title}
                className="w-full h-full max-h-[70vh] object-contain"
              />
            )}
          </div>

          {/* Info Sidebar */}
          <div className="w-full lg:w-96 p-6 sm:p-8 bg-neutral-900/90 border-t lg:border-t-0 lg:border-l border-neutral-800 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/30">
                  {item.category}
                </span>
                <h3 className="text-xl font-bold font-serif text-white">{item.title}</h3>
                <p className="text-xs text-neutral-400 mt-1">Event: {item.eventType}</p>
              </div>

              {item.client && (
                <div className="flex items-center gap-2 text-xs text-neutral-300">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>Featured Client: <strong>{item.client}</strong></span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Captured by Ashish Wedding Film Studio, Jhumri Telaiya</span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800 pt-4">
                {item.description}
              </p>
            </div>

            <div className="pt-6 border-t border-neutral-800 mt-6 space-y-3">
              <button
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Book Similar Shoot Now
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
