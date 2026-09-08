import React, { useState } from 'react';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { GalleryItem } from '../types';

interface GalleryUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: (item: GalleryItem) => void;
}

export const GalleryUploadModal: React.FC<GalleryUploadModalProps> = ({
  isOpen,
  onClose,
  onItemCreated,
}) => {
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GalleryItem['category']>('Weddings');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [eventType, setEventType] = useState('Royal Wedding');
  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  if (!isOpen) return null;

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 12 * 1024 * 1024) {
        showToast('Photo file must be under 12MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setMediaUrl(reader.result);
          setThumbnailUrl(reader.result);
          setPreviewError(false);
          showToast('Photo loaded successfully from device', 'info');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Please enter a photo title', 'error');
      return;
    }

    if (!mediaUrl.trim()) {
      showToast('Please upload a file or provide a valid image/video URL', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<GalleryItem> = {
        title: title.trim(),
        category,
        type: mediaType,
        mediaUrl: mediaUrl.trim(),
        thumbnailUrl: (thumbnailUrl.trim() || mediaUrl.trim()),
        eventType: eventType.trim() || 'Photography Session',
        client: client.trim() || 'Studio Client',
        description: description.trim() || `${title} captured by Ashish Wedding Film Studio.`,
        featured: Boolean(featured)
      };

      const newItem = await api.createGalleryItem(payload);
      showToast('New media item added to studio gallery!', 'success');
      onItemCreated(newItem);
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to upload gallery media', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-neutral-950 border border-amber-500/40 p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif text-white">
                Upload to Gallery (गैलरी में फोटो जोड़ें)
              </h3>
              <p className="text-xs text-neutral-400">
                Add 4K photos or video reels to the studio's main website portfolio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* Media Type & Upload Source Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-300 font-semibold block mb-1.5">
                Media Format (प्रकार)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMediaType('image')}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold ${
                    mediaType === 'image'
                      ? 'bg-amber-500 text-neutral-950 border-amber-500'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Photo (फोटो)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMediaType('video')}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold ${
                    mediaType === 'video'
                      ? 'bg-amber-500 text-neutral-950 border-amber-500'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <VideoIcon className="w-4 h-4" />
                  <span>Video / Reel</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-neutral-300 font-semibold block mb-1.5">
                Input Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMethod('file')}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold ${
                    uploadMethod === 'file'
                      ? 'bg-neutral-800 text-amber-300 border-amber-500/50'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Device Upload</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadMethod('url')}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold ${
                    uploadMethod === 'url'
                      ? 'bg-neutral-800 text-amber-300 border-amber-500/50'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Image URL</span>
                </button>
              </div>
            </div>
          </div>

          {/* Media Input Component */}
          {uploadMethod === 'file' ? (
            <div className="p-4 rounded-2xl bg-neutral-900/90 border-2 border-dashed border-neutral-700 hover:border-amber-500/50 transition-colors text-center space-y-3">
              <input
                type="file"
                id="gallery-file-input"
                accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="gallery-file-input"
                className="cursor-pointer block space-y-2"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-amber-400 font-bold hover:underline">
                    Click to browse device
                  </span>{' '}
                  or drag and drop photo
                </div>
                <p className="text-[11px] text-neutral-500">
                  Supports JPG, PNG, WEBP high-resolution captures (up to 12MB)
                </p>
              </label>

              {mediaUrl && (
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-center gap-3">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Ready for upload
                  </span>
                  <button
                    type="button"
                    onClick={() => { setMediaUrl(''); setThumbnailUrl(''); }}
                    className="text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-neutral-300 font-semibold block mb-1">
                  Media Direct URL *
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => { setMediaUrl(e.target.value); setThumbnailUrl(e.target.value); setPreviewError(false); }}
                  placeholder="https://images.unsplash.com/... or https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Media Preview Box */}
          {mediaUrl && !previewError && (
            <div className="relative aspect-video max-h-48 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">
              <img
                src={mediaUrl}
                alt="Preview"
                onError={() => setPreviewError(true)}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-amber-300 font-semibold">
                Live Preview
              </div>
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Photo Title (शीर्षक) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Royal Tilaiya Dam Sunset Candid"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Category (श्रेणी) *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Weddings">Royal Weddings</option>
                <option value="Pre-Wedding">Pre-Wedding (Telaiya Dam)</option>
                <option value="Vehicle Shoots">Vehicle Shoots (Thar, Scorpio, Bike)</option>
                <option value="Music Studio">Music & Sound Studio</option>
                <option value="Photography">Candid Photography</option>
                <option value="Videography">Cinematic Videography</option>
                <option value="Cinematic Videos">4K Cinematic Films</option>
                <option value="Birthdays">Birthdays & Anniversaries</option>
              </select>
            </div>
          </div>

          {/* Client & Event Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Couple / Client Name (क्लाइंट का नाम)
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="e.g. Rahul & Priya"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Event Type (इवेंट प्रकार)
              </label>
              <input
                type="text"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                placeholder="e.g. Sangeet, Haldi, Varmala, Pre-Wedding"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">
              Short Description / Gear Note (विवरण)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Shot on Sony FX3 with 85mm f/1.4 GM lens at Tilaiya Dam reservoir..."
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Feature on Homepage Checkbox */}
          <label className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 cursor-pointer hover:border-amber-500/40">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <div>
              <span className="text-white font-semibold block">
                Feature on Website Homepage
              </span>
              <span className="text-neutral-400 text-[11px]">
                Highlights this photo in the "Moments Captured in Jharkhand" section on the front page.
              </span>
            </div>
          </label>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isSubmitting ? 'Uploading...' : 'Save & Publish Photo'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
