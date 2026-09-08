import React, { useState, useRef } from 'react';
import { 
  Upload, 
  BookOpen, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Calendar, 
  MapPin, 
  X,
  FileImage,
  RefreshCw,
  Eye
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { KarizmaAlbumItem, KarizmaFinish } from '../types';

interface UploadNewAlbumComponentProps {
  onAlbumUploaded: (album: KarizmaAlbumItem) => void;
  className?: string;
  defaultExpanded?: boolean;
}

// Client-side image optimizer to ensure smooth uploads of multiple high-res photos
function compressImage(file: File, maxDimension = 1920, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    // If it's a small file or not an image, fallback to normal read
    if (!file.type.startsWith('image/') || file.size < 400 * 1024) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export const UploadNewAlbumComponent: React.FC<UploadNewAlbumComponentProps> = ({
  onAlbumUploaded,
  className = '',
  defaultExpanded = true,
}) => {
  const { showToast } = useToast();

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [title, setTitle] = useState('');
  const [coupleName, setCoupleName] = useState('');
  const [albumType, setAlbumType] = useState<KarizmaFinish>('Royal Velvet');
  const [sheetsCount, setSheetsCount] = useState<number>(30);
  const [location, setLocation] = useState('Jhumri Telaiya, Jharkhand');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(
    '12x36 Seamless panoramic layflat wedding album in waterproof Non-Tearable sheet with embossed golden monogram.'
  );
  const [featured, setFeatured] = useState(true);

  // Cover image file state
  const [coverImage, setCoverImage] = useState<string>('');
  const [coverFileName, setCoverFileName] = useState<string>('');
  const [coverInputMode, setCoverInputMode] = useState<'file' | 'url'>('file');
  const [coverUrl, setCoverUrl] = useState<string>('');

  // Additional spread photos state
  const [spreadImages, setSpreadImages] = useState<{ id: string; url: string; name: string }[]>([]);
  const [spreadUrlInput, setSpreadUrlInput] = useState<string>('');

  // Processing & Loading states
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Ref inputs
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const photosInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Cover File selection
  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file for the album cover', 'error');
      return;
    }

    try {
      setIsProcessingFiles(true);
      const dataUrl = await compressImage(file, 1920, 0.85);
      if (dataUrl) {
        setCoverImage(dataUrl);
        setCoverFileName(file.name);
        showToast(`Cover selected: ${file.name}`, 'info');
      }
    } catch {
      showToast('Could not load cover image', 'error');
    } finally {
      setIsProcessingFiles(false);
      // Reset input value so same file can be re-selected if needed
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  // Handle Multi-Photos / Spreads File selection
  const handlePhotosSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingFiles(true);
    const newItems: { id: string; url: string; name: string }[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const dataUrl = await compressImage(file, 1920, 0.82);
          if (dataUrl) {
            newItems.push({
              id: 'sp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
              url: dataUrl,
              name: file.name
            });
          }
        }
      }

      if (newItems.length > 0) {
        setSpreadImages(prev => {
          const updated = [...prev, ...newItems];
          // Auto update sheets count if default
          if (sheetsCount <= 30 || sheetsCount < updated.length) {
            setSheetsCount(Math.max(updated.length, 30));
          }
          return updated;
        });
        showToast(`${newItems.length} album spread photos loaded`, 'info');
      }
    } catch {
      showToast('Error reading selected photo files', 'error');
    } finally {
      setIsProcessingFiles(false);
      if (photosInputRef.current) photosInputRef.current.value = '';
    }
  };

  // Add photo via manual URL
  const handleAddPhotoUrl = () => {
    if (!spreadUrlInput.trim()) return;
    setSpreadImages(prev => [
      ...prev,
      {
        id: 'sp-' + Date.now(),
        url: spreadUrlInput.trim(),
        name: `Sheet ${prev.length + 1}`
      }
    ]);
    setSpreadUrlInput('');
    showToast('Photo URL added to spreads', 'info');
  };

  // Remove spread photo
  const handleRemoveSpread = (id: string) => {
    setSpreadImages(prev => prev.filter(item => item.id !== id));
  };

  // Form Reset
  const handleResetForm = () => {
    setTitle('');
    setCoupleName('');
    setCoverImage('');
    setCoverFileName('');
    setCoverUrl('');
    setSpreadImages([]);
    setSpreadUrlInput('');
    setSheetsCount(30);
    setDescription('12x36 Seamless panoramic layflat wedding album in waterproof Non-Tearable sheet with embossed golden monogram.');
  };

  // Handle Form Submission -> API call to store in DB
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalCover = coverInputMode === 'file' ? coverImage : coverUrl.trim();

    if (!title.trim()) {
      showToast('Please enter an album title', 'error');
      return;
    }

    if (!coupleName.trim()) {
      showToast('Please enter the couple name (e.g. Rahul & Pooja)', 'error');
      return;
    }

    if (!finalCover) {
      showToast('Please select a Cover Photo file or enter a valid Cover URL', 'error');
      return;
    }

    setIsUploading(true);

    try {
      // Assemble all spreads: cover is spread #1, followed by all selected photo sheets
      const photoUrls = spreadImages.map(s => s.url);
      const allSpreads = photoUrls.length > 0 ? [finalCover, ...photoUrls] : [finalCover];

      const payload: Partial<KarizmaAlbumItem> = {
        title: title.trim(),
        coupleName: coupleName.trim(),
        albumType,
        coverImage: finalCover,
        sheetsCount: Number(sheetsCount) || allSpreads.length,
        location: location.trim() || 'Jhumri Telaiya, Jharkhand',
        eventDate: eventDate || new Date().toISOString().split('T')[0],
        description: description.trim(),
        spreads: allSpreads,
        featured: Boolean(featured)
      };

      // Call the server API endpoint POST /api/karizma-albums
      const createdAlbum = await api.createKarizmaAlbum(payload);

      showToast(`Album "${createdAlbum.title}" successfully saved to database!`, 'success');
      onAlbumUploaded(createdAlbum);

      // Reset form after successful upload
      handleResetForm();
    } catch (err: any) {
      console.error('Failed to upload album:', err);
      showToast(err.message || 'Failed to upload album to database', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      id="upload-new-album-card"
      className={`rounded-3xl bg-neutral-900/90 border border-amber-500/40 p-5 sm:p-7 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all ${className}`}
    >
      {/* Top ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold font-serif text-white">
                Upload New Album (नया एल्बम जोड़ें)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Database API
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Select album cover & 12x36 panoramic photos to store in the studio library
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-neutral-400 hover:text-amber-300 px-3 py-1.5 rounded-xl border border-neutral-800 hover:border-amber-500/30 bg-neutral-950/60 transition-colors"
        >
          {isExpanded ? 'Collapse Form ▲' : 'Expand Form ▼'}
        </button>
      </div>

      {isExpanded && (
        <form onSubmit={handleUploadSubmit} className="space-y-6 text-xs">
          
          {/* Section 1: Files Selection (Cover + Spreads) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-4 sm:p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800">
            
            {/* 1A: Album Cover Selection Input */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-neutral-200 font-bold flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-amber-400" />
                  <span>Album Cover Photo (कवर फोटो) *</span>
                </label>
                <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setCoverInputMode('file')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      coverInputMode === 'file' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400'
                    }`}
                  >
                    File Input
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverInputMode('url')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      coverInputMode === 'url' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-400'
                    }`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {coverInputMode === 'file' ? (
                <div className="space-y-2">
                  <input
                    ref={coverInputRef}
                    type="file"
                    id="album-cover-file-input"
                    accept="image/*"
                    onChange={handleCoverSelect}
                    className="hidden"
                  />
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    className={`p-5 rounded-2xl border-2 border-dashed cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-2 ${
                      coverImage
                        ? 'border-emerald-500/50 bg-emerald-950/10'
                        : 'border-neutral-700 hover:border-amber-500/60 bg-neutral-900/50 hover:bg-neutral-900'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-amber-400 font-bold hover:underline">
                        Choose Cover Image File
                      </span>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Supports JPG, PNG, WEBP (12x36 cover or high-res couple portrait)
                      </p>
                    </div>
                  </div>

                  {coverImage && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-black shrink-0 border border-neutral-700">
                        <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Cover Selected</span>
                        </div>
                        <p className="text-neutral-400 text-[10px] truncate">{coverFileName || 'Custom File'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setCoverImage(''); setCoverFileName(''); }}
                        className="text-red-400 hover:text-red-300 p-1 text-xs"
                        title="Remove cover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or cloud image URL"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
                  />
                  {coverUrl && (
                    <div className="relative aspect-video max-h-32 rounded-xl overflow-hidden border border-neutral-800 bg-black">
                      <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 1B: Album Photos & Spread Selection Input (Multi-File) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-neutral-200 font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Album Photos & Spreads (शीट्स फ़ोटोज़)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                    {spreadImages.length} selected
                  </span>
                </label>
              </div>

              <input
                ref={photosInputRef}
                type="file"
                id="album-photos-file-input"
                accept="image/*"
                multiple
                onChange={handlePhotosSelect}
                className="hidden"
              />

              <div
                onClick={() => photosInputRef.current?.click()}
                className="p-5 rounded-2xl border-2 border-dashed border-neutral-700 hover:border-amber-500/60 bg-neutral-900/50 hover:bg-neutral-900 cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-amber-400 font-bold hover:underline">
                    Select Multiple Photos / Spreads
                  </span>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Select 5 to 40 panoramic sheet designs from your device at once
                  </p>
                </div>
              </div>

              {/* URL fallback adder */}
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={spreadUrlInput}
                  onChange={(e) => setSpreadUrlInput(e.target.value)}
                  placeholder="Or paste direct spread photo URL..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-[11px] focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddPhotoUrl}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs"
                >
                  + Add URL
                </button>
              </div>

              {/* Thumbnails of selected photos */}
              {spreadImages.length > 0 && (
                <div className="pt-2 border-t border-neutral-800">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2">
                    <span>Preview of Selected Sheets ({spreadImages.length})</span>
                    <button
                      type="button"
                      onClick={() => setSpreadImages([])}
                      className="text-red-400 hover:underline"
                    >
                      Clear All Photos
                    </button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto pr-1">
                    {spreadImages.map((sheet, index) => (
                      <div
                        key={sheet.id}
                        className="relative aspect-video rounded-lg overflow-hidden bg-black border border-neutral-800 group"
                      >
                        <img src={sheet.url} alt={`Sheet ${index + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0.5 left-0.5 px-1 rounded bg-black/80 text-[9px] text-amber-300 font-bold">
                          #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpread(sheet.id)}
                          className="absolute top-0.5 right-0.5 p-0.5 rounded bg-red-900/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove sheet"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Section 2: Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Album Title (एल्बम का शीर्षक) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Royal Rajputana Heritage Karizma"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Couple / Client Name (दूल्हा-दुल्हन का नाम) *
              </label>
              <input
                type="text"
                value={coupleName}
                onChange={(e) => setCoupleName(e.target.value)}
                placeholder="e.g. Aman & Priya Singh"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Album Finish & Material (एल्बम प्रकार) *
              </label>
              <select
                value={albumType}
                onChange={(e) => setAlbumType(e.target.value as KarizmaFinish)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Royal Velvet">Royal Velvet (वाटरप्रूफ नॉन-टीयरेबल)</option>
                <option value="Matt Canvera">Matt Canvera (कैनवेरा मैट फिनिश)</option>
                <option value="Glossy Metallic">Glossy Metallic (मेटालिक ग्लॉसी)</option>
                <option value="Embossed Leather">Embossed Leather (लेदर बॉक्स)</option>
                <option value="Acrylic Glass">Acrylic Glass (ऐक्रेलिक ग्लास कवर)</option>
                <option value="HD Seamless">HD Seamless (सीमलेस लेफ्लैट)</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Number of Sheets / Spreads (शीट्स की संख्या)
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={sheetsCount}
                onChange={(e) => setSheetsCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Shoot Location (स्थान)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Jhumri Telaiya, Jharkhand"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Event Date (तारीख)
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

          </div>

          {/* Description */}
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">
              Album Description / Print Specifications (विवरण)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 12x36 Seamless panoramic layflat wedding album in waterproof Non-Tearable sheet..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Feature toggle */}
          <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 cursor-pointer hover:border-amber-500/40">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded"
            />
            <div>
              <span className="text-white font-semibold block">
                Feature on Public Website & Studio Highlights
              </span>
              <span className="text-neutral-400 text-[11px]">
                Clients will see this in the featured Karizma section on both the Karizma page and homepage.
              </span>
            </div>
          </label>

          {/* Submit / Upload Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-800">
            <div className="text-neutral-400 text-[11px]">
              {isProcessingFiles ? (
                <span className="text-amber-400 flex items-center gap-1.5 font-semibold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Optimizing photo sheets...
                </span>
              ) : (
                <span>
                  Ready: 1 Cover + {spreadImages.length} Spread Sheet Photos ({sheetsCount} total sheets in print)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleResetForm}
                disabled={isUploading}
                className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold transition-colors disabled:opacity-50"
              >
                Reset
              </button>

              <button
                id="upload-album-submit-btn"
                type="submit"
                disabled={isUploading || isProcessingFiles}
                className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading to Database...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Album to Database</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      )}
    </div>
  );
};
