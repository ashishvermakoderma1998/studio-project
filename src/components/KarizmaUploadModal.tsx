import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  BookOpen, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2,
  Calendar,
  MapPin,
  Layers
} from 'lucide-react';
import { KarizmaAlbumItem, KarizmaFinish } from '../types';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';

interface KarizmaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlbumCreated: (album: KarizmaAlbumItem) => void;
}

export const KarizmaUploadModal: React.FC<KarizmaUploadModalProps> = ({
  isOpen,
  onClose,
  onAlbumCreated
}) => {
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [coupleName, setCoupleName] = useState('');
  const [albumType, setAlbumType] = useState<KarizmaFinish>('Royal Velvet');
  const [sheetsCount, setSheetsCount] = useState<number>(35);
  const [location, setLocation] = useState('Jhumri Telaiya, Jharkhand');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('12x36 Seamless panoramic layflat wedding album in waterproof Non-Tearable Velvet sheet with embossed golden monogram.');
  const [featured, setFeatured] = useState(true);

  // Cover Image
  const [coverImage, setCoverImage] = useState('');
  const [coverUrlInput, setCoverUrlInput] = useState('');

  // Additional Spreads
  const [spreads, setSpreads] = useState<string[]>([]);
  const [spreadUrlInput, setSpreadUrlInput] = useState('');

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // Handle Cover File Upload (FileReader to Base64)
  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('Image size should be less than 8MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCoverImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Spread Files Upload (Multi-file support)
  const handleSpreadFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File) => {
        if (file.size > 8 * 1024 * 1024) {
          showToast(`File ${file.name} is larger than 8MB and was skipped`, 'error');
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setSpreads(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
      showToast(`${files.length} spread photos loaded`, 'info');
    }
  };

  const handleAddSpreadUrl = () => {
    if (!spreadUrlInput.trim()) return;
    setSpreads(prev => [...prev, spreadUrlInput.trim()]);
    setSpreadUrlInput('');
  };

  const handleRemoveSpread = (index: number) => {
    setSpreads(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalCover = coverImage || coverUrlInput.trim();
    if (!title.trim()) {
      showToast('Please enter an album title', 'error');
      return;
    }
    if (!coupleName.trim()) {
      showToast('Please enter the couple name', 'error');
      return;
    }
    if (!finalCover) {
      showToast('Please choose a cover image file or provide an image URL', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const allSpreads = spreads.length > 0 ? [finalCover, ...spreads] : [finalCover];

      const newAlbumPayload: Partial<KarizmaAlbumItem> = {
        title: title.trim(),
        coupleName: coupleName.trim(),
        albumType,
        coverImage: finalCover,
        sheetsCount: Number(sheetsCount) || allSpreads.length,
        location: location.trim(),
        eventDate,
        description: description.trim(),
        spreads: allSpreads,
        featured
      };

      const created = await api.createKarizmaAlbum(newAlbumPayload);
      showToast('Karizma Wedding Album uploaded successfully!', 'success');
      onAlbumCreated(created);
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to create album', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      id="karizma-upload-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block">
              Admin Studio Control
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
              Upload New Karizma Wedding Album
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Album Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Album Title / Book Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Royal Marwari Vivah - Velvet Layflat Edition"
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          {/* Couple Name & Album Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Couple Name *
              </label>
              <input
                type="text"
                required
                value={coupleName}
                onChange={(e) => setCoupleName(e.target.value)}
                placeholder="e.g. Rahul & Priya"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Album Paper Finish / Cover Type *
              </label>
              <select
                value={albumType}
                onChange={(e) => setAlbumType(e.target.value as KarizmaFinish)}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 text-sm"
              >
                <option value="Royal Velvet">Royal Velvet (मखमली वेलवेट)</option>
                <option value="Canvera HD">Canvera HD Silk (कैनवेरा सिल्क)</option>
                <option value="Acrylic Glass">Acrylic Glass Cover (ग्लास फिनिश)</option>
                <option value="Metallic Sheen">Metallic Sheen (मेटैलिक शीन)</option>
                <option value="Leatherite Cameo">Leatherite Cameo (लेदराइट)</option>
                <option value="Silk Matte">Silk Matte (सिल्क मैट)</option>
              </select>
            </div>
          </div>

          {/* Sheet Count, Location & Event Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Number of Sheets (12x36)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={sheetsCount}
                onChange={(e) => setSheetsCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Event Location / Hall
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Jhumri Telaiya, Jharkhand"
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Wedding Date
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
          </div>

          {/* Cover Photo Upload & Selection */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <label className="block text-xs font-bold text-amber-400">
              Album Cover Photo *
            </label>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer transition-colors shrink-0">
                <Upload className="w-4 h-4" />
                Choose Photo from Device
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFileSelect}
                  className="hidden"
                />
              </label>

              <span className="text-xs text-neutral-500">OR</span>

              <input
                type="text"
                value={coverUrlInput}
                onChange={(e) => setCoverUrlInput(e.target.value)}
                placeholder="Paste Cover Image URL (https://...)"
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Cover Preview */}
            {(coverImage || coverUrlInput) && (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-amber-500/40 mt-2">
                <img
                  src={coverImage || coverUrlInput}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-amber-400 font-bold">
                  Cover Photo Preview
                </span>
                <button
                  type="button"
                  onClick={() => { setCoverImage(''); setCoverUrlInput(''); }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Spread Photos / Sheets Upload (Multi-page) */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-neutral-200">
                Album Sheets / Panoramic Spreads ({spreads.length} added)
              </label>
              <span className="text-[11px] text-neutral-400">
                Upload 12x36 page photos
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-semibold text-xs cursor-pointer border border-neutral-700 transition-colors shrink-0">
                <Plus className="w-4 h-4" />
                Add Sheets from Device (Multiple)
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleSpreadFilesSelect}
                  className="hidden"
                />
              </label>

              <div className="w-full flex items-center gap-2">
                <input
                  type="text"
                  value={spreadUrlInput}
                  onChange={(e) => setSpreadUrlInput(e.target.value)}
                  placeholder="Or paste spread URL..."
                  className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddSpreadUrl}
                  disabled={!spreadUrlInput.trim()}
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-xs font-semibold text-white"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Spreads Preview Grid */}
            {spreads.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2 max-h-36 overflow-y-auto no-scrollbar">
                {spreads.map((spr, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-neutral-800 group">
                    <img src={spr} alt={`Spread ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpread(idx)}
                      className="absolute top-1 right-1 p-1 rounded bg-black/80 hover:bg-red-900 text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 px-1 rounded bg-black/70 text-[9px] text-white">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Album Description / Specifications
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="album-featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-neutral-900 border-neutral-700"
            />
            <label htmlFor="album-featured" className="text-xs text-neutral-300 select-none cursor-pointer">
              Feature on Homepage & Top of Album Showcase
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Publishing...' : 'Upload & Publish Album'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
