import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, Plus, Trash2, ArrowUp, ArrowDown, Edit3, 
  RotateCcw, Save, MapPin, X, Check, Upload, Sparkles, Sliders, Eye
} from 'lucide-react';
import { HeroConfig, HeroSlide } from '../types';
import { defaultHeroConfig } from '../data';

interface HeroBannersManagerProps {
  initialConfig?: HeroConfig;
  onSaveConfig: (newConfig: HeroConfig) => Promise<void>;
  isSaving?: boolean;
}

export function HeroBannersManager({
  initialConfig,
  onSaveConfig,
  isSaving = false
}: HeroBannersManagerProps) {
  const [config, setConfig] = useState<HeroConfig>(() => {
    if (initialConfig && initialConfig.slides && initialConfig.slides.length > 0) {
      return initialConfig;
    }
    const saved = localStorage.getItem('tizzitech_hero_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return defaultHeroConfig;
  });

  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAreaInput, setNewAreaInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // New slide form state
  const [newSlideForm, setNewSlideForm] = useState<Omit<HeroSlide, 'id'>>({
    imageUrl: '',
    title: '',
    subtitle: '',
    badge: 'NEW ARRIVAL • CERTIFIED TECH',
    primaryButtonText: 'Shop Products',
    secondaryButtonText: 'Pre-Launch 2026'
  });

  // Compress and convert image to web-optimized data URL
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1600;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const dataUrl = await processImageFile(file);
      if (isEditing && editingSlide) {
        setEditingSlide({ ...editingSlide, imageUrl: dataUrl });
      } else {
        setNewSlideForm((prev) => ({ ...prev, imageUrl: dataUrl }));
      }
    } catch (err) {
      console.error("Error processing banner image:", err);
      alert("Failed to process image file. Please try another image.");
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...config.slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    setConfig({ ...config, slides: newSlides });
  };

  const handleDeleteSlide = (slideId: string) => {
    if (config.slides.length <= 1) {
      alert("You need at least one slide in the hero section.");
      return;
    }
    if (confirm("Are you sure you want to remove this hero slide?")) {
      setConfig({
        ...config,
        slides: config.slides.filter((s) => s.id !== slideId)
      });
    }
  };

  const handleAddSlide = () => {
    if (!newSlideForm.imageUrl.trim()) {
      alert("Please provide an image URL or upload an image file.");
      return;
    }
    if (!newSlideForm.title.trim()) {
      alert("Please enter a title for the slide.");
      return;
    }

    const newSlide: HeroSlide = {
      ...newSlideForm,
      id: `slide_${Date.now()}`
    };

    setConfig({
      ...config,
      slides: [...config.slides, newSlide]
    });

    setNewSlideForm({
      imageUrl: '',
      title: '',
      subtitle: '',
      badge: 'NEW ARRIVAL • CERTIFIED TECH',
      primaryButtonText: 'Shop Products',
      secondaryButtonText: 'Pre-Launch 2026'
    });
    setShowAddModal(false);
  };

  const handleUpdateSlide = () => {
    if (!editingSlide) return;
    setConfig({
      ...config,
      slides: config.slides.map((s) => (s.id === editingSlide.id ? editingSlide : s))
    });
    setEditingSlide(null);
  };

  const handleAddArea = () => {
    const trimmed = newAreaInput.trim();
    if (!trimmed) return;
    if (config.deliveryAreas.includes(trimmed)) {
      alert("This delivery location is already in the list.");
      return;
    }

    setConfig({
      ...config,
      deliveryAreas: [...config.deliveryAreas, trimmed]
    });
    setNewAreaInput('');
  };

  const handleRemoveArea = (areaToRemove: string) => {
    setConfig({
      ...config,
      deliveryAreas: config.deliveryAreas.filter((a) => a !== areaToRemove)
    });
  };

  const handleResetToPresets = () => {
    if (confirm("Reset hero slides and delivery ticker back to curated default presets?")) {
      setConfig(defaultHeroConfig);
    }
  };

  const handleSaveAll = async () => {
    try {
      localStorage.setItem('tizzitech_hero_config', JSON.stringify(config));
      await onSaveConfig(config);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error("Failed to save hero config:", err);
      alert("Failed to save hero settings. Please check your connection.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white">Hero Slides & Delivery Ticker</h1>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-2.5 py-0.5 rounded-full font-mono">
              {config.slides.length} active slides
            </span>
          </div>
          <p className="text-neutral-400 text-sm mt-1">
            Customize the changing background photo slides, headlines, and scrolling delivery areas ticker shown on the storefront.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToPresets}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-bold transition-colors"
            title="Restore default curated tech setups"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Curated Presets</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
              savedSuccess 
                ? 'bg-emerald-600 text-white' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 hover:scale-[1.02]'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved & Live!</span>
              </>
            ) : isSaving ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 1: HERO SLIDES LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Background Slideshow Photos</h2>
            <p className="text-xs text-neutral-400">
              The storefront cross-fades through these photos with a smooth cinematic zoom effect.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-neutral-400">Speed:</span>
              <select
                value={config.autoplaySpeed || 5}
                onChange={(e) => setConfig({ ...config, autoplaySpeed: Number(e.target.value) })}
                className="bg-transparent text-white font-mono font-bold focus:outline-none cursor-pointer"
              >
                <option value={3} className="bg-neutral-900">3 seconds</option>
                <option value={4} className="bg-neutral-900">4 seconds</option>
                <option value={5} className="bg-neutral-900">5 seconds (Recommended)</option>
                <option value={7} className="bg-neutral-900">7 seconds</option>
                <option value={10} className="bg-neutral-900">10 seconds</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 hover:border-blue-500 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Add New Slide</span>
            </button>
          </div>
        </div>

        {/* Slides Grid / List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.slides.map((slide, index) => (
            <div
              key={slide.id}
              className="bg-neutral-950 border border-neutral-900 hover:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Image Preview & Order Controls */}
                <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Left: Slide Number Badge */}
                  <span className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2 py-1 rounded-md border border-neutral-700">
                    Slide #{index + 1} {index === 0 && '• Primary Cover'}
                  </span>

                  {/* Top Right: Reordering Buttons */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 backdrop-blur-md p-1 rounded-lg border border-neutral-700">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveSlide(index, 'up')}
                      className="p-1 text-neutral-400 hover:text-white disabled:opacity-20 hover:bg-neutral-800 rounded transition-colors"
                      title="Move up / earlier"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === config.slides.length - 1}
                      onClick={() => handleMoveSlide(index, 'down')}
                      className="p-1 text-neutral-400 hover:text-white disabled:opacity-20 hover:bg-neutral-800 rounded transition-colors"
                      title="Move down / later"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Text in Preview */}
                  <div className="absolute bottom-2 left-2 right-2">
                    {slide.badge && (
                      <span className="text-[9px] font-semibold text-blue-400 bg-blue-950/70 border border-blue-500/30 px-2 py-0.5 rounded-md inline-block mb-1">
                        {slide.badge}
                      </span>
                    )}
                    <h4 className="text-xs font-bold text-white line-clamp-1">{slide.title}</h4>
                  </div>
                </div>

                {/* Subtitle details */}
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-neutral-400 line-clamp-2">{slide.subtitle}</p>
                  <p className="text-[10px] font-mono text-neutral-500 truncate pt-1">
                    Image: {slide.imageUrl}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-900">
                <span className="text-[11px] text-neutral-500">
                  CTA: <strong className="text-neutral-300">{slide.primaryButtonText || 'Shop Now'}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSlide(slide)}
                    className="p-1.5 text-neutral-400 hover:text-blue-400 hover:bg-neutral-900 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    title="Edit Slide Content"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-xs transition-colors"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: "WHERE WE DELIVER" TICKER MANAGER */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            <span>"Where We Deliver" Scrolling Ticker</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            This marquee scrolls continuously across the hero banner just like the service area strip in your reference screenshot.
          </p>
        </div>

        {/* Ticker Header Text */}
        <div className="max-w-md">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
            Marquee Header Tag
          </label>
          <input
            type="text"
            value={config.deliveryHeader}
            onChange={(e) => setConfig({ ...config, deliveryHeader: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
            placeholder="WHERE WE DELIVER — 24+ AREAS NATIONWIDE"
          />
        </div>

        {/* Add New Area Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
            Add Delivery Location Pill
          </label>
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newAreaInput}
              onChange={(e) => setNewAreaInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddArea(); } }}
              placeholder="e.g. Lekki Phase 2, Ikorodu, Asaba..."
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddArea}
              className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs px-4 py-2 rounded-xl border border-neutral-700 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Areas List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Current Active Locations ({config.deliveryAreas.length}):
            </span>
            <span className="text-[11px] text-neutral-500">Click × on any pill to remove</span>
          </div>

          <div className="flex flex-wrap gap-2 p-3 bg-neutral-900/60 rounded-xl border border-neutral-800/80 max-h-52 overflow-y-auto">
            {config.deliveryAreas.map((area, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-200 bg-neutral-950 border border-neutral-800 px-3 py-1 rounded-full shadow-sm"
              >
                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                <span>{area}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveArea(area)}
                  className="p-0.5 text-neutral-500 hover:text-red-400 rounded-full hover:bg-neutral-800 ml-1 transition-colors"
                  title={`Remove ${area}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: ADD NEW SLIDE */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-400" />
                <span>Add New Hero Slide</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Upload Area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Background Photo
              </label>

              <div
                className={`w-full border-2 border-dashed ${uploadingImage ? 'border-blue-500 bg-blue-500/10' : 'border-neutral-800 hover:border-neutral-600 bg-neutral-900/50'} rounded-xl p-5 text-center cursor-pointer flex flex-col items-center justify-center min-h-[120px] transition-colors`}
                onClick={() => !uploadingImage && fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, false)}
                />

                {uploadingImage ? (
                  <div className="flex flex-col items-center text-blue-400 animate-pulse">
                    <Upload className="w-6 h-6 mb-2 animate-bounce" />
                    <span className="text-xs font-bold">Optimizing & Uploading Photo...</span>
                  </div>
                ) : newSlideForm.imageUrl ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={newSlideForm.imageUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="h-24 max-w-full object-cover rounded-lg border border-neutral-700 mb-2 shadow"
                    />
                    <span className="text-xs text-blue-400 font-bold">Click or drag to replace image</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-neutral-400">
                    <Upload className="w-6 h-6 mb-2 text-neutral-500" />
                    <span className="text-xs font-bold text-neutral-200">Click to upload photo or drag & drop</span>
                    <span className="text-[10px] text-neutral-500 mt-1">Auto-optimized for crisp web performance</span>
                  </div>
                )}
              </div>

              {/* Or manual URL */}
              <div className="mt-2 flex gap-2 items-center">
                <span className="text-[10px] text-neutral-500 uppercase font-bold shrink-0">Or paste URL:</span>
                <input
                  type="text"
                  value={newSlideForm.imageUrl}
                  onChange={(e) => setNewSlideForm({ ...newSlideForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Badge */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Badge Text (e.g. CERTIFIED TECH • LAGOS SAME-DAY)
              </label>
              <input
                type="text"
                value={newSlideForm.badge}
                onChange={(e) => setNewSlideForm({ ...newSlideForm, badge: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Headline Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Main Headline Title
              </label>
              <input
                type="text"
                value={newSlideForm.title}
                onChange={(e) => setNewSlideForm({ ...newSlideForm, title: e.target.value })}
                placeholder="e.g. ENGINEERED FOR HIGH PERFORMANCE."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Subtitle Description
              </label>
              <textarea
                value={newSlideForm.subtitle}
                onChange={(e) => setNewSlideForm({ ...newSlideForm, subtitle: e.target.value })}
                placeholder="Briefly describe the collection or service benefit..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 h-20 resize-none"
              />
            </div>

            {/* Button Texts */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={newSlideForm.primaryButtonText}
                  onChange={(e) => setNewSlideForm({ ...newSlideForm, primaryButtonText: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Secondary Button Text
                </label>
                <input
                  type="text"
                  value={newSlideForm.secondaryButtonText}
                  onChange={(e) => setNewSlideForm({ ...newSlideForm, secondaryButtonText: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSlide}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Add Slide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SLIDE */}
      {editingSlide && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <span>Edit Slide</span>
              </h3>
              <button onClick={() => setEditingSlide(null)} className="text-neutral-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Upload Area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Background Photo
              </label>

              <div
                className={`w-full border-2 border-dashed ${uploadingImage ? 'border-blue-500 bg-blue-500/10' : 'border-neutral-800 hover:border-neutral-600 bg-neutral-900/50'} rounded-xl p-5 text-center cursor-pointer flex flex-col items-center justify-center min-h-[120px] transition-colors`}
                onClick={() => !uploadingImage && editFileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={editFileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, true)}
                />

                {uploadingImage ? (
                  <div className="flex flex-col items-center text-blue-400 animate-pulse">
                    <Upload className="w-6 h-6 mb-2 animate-bounce" />
                    <span className="text-xs font-bold">Uploading new image...</span>
                  </div>
                ) : editingSlide.imageUrl ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={editingSlide.imageUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="h-24 max-w-full object-cover rounded-lg border border-neutral-700 mb-2 shadow"
                    />
                    <span className="text-xs text-blue-400 font-bold">Click to replace photo</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-neutral-400">
                    <Upload className="w-6 h-6 mb-2 text-neutral-500" />
                    <span className="text-xs font-bold text-neutral-200">Click to upload photo</span>
                  </div>
                )}
              </div>

              {/* URL */}
              <div className="mt-2 flex gap-2 items-center">
                <span className="text-[10px] text-neutral-500 uppercase font-bold shrink-0">Or edit URL:</span>
                <input
                  type="text"
                  value={editingSlide.imageUrl}
                  onChange={(e) => setEditingSlide({ ...editingSlide, imageUrl: e.target.value })}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Badge */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Badge
              </label>
              <input
                type="text"
                value={editingSlide.badge || ''}
                onChange={(e) => setEditingSlide({ ...editingSlide, badge: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs"
              />
            </div>

            {/* Headline Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Headline Title
              </label>
              <input
                type="text"
                value={editingSlide.title}
                onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-sm font-bold"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Subtitle Description
              </label>
              <textarea
                value={editingSlide.subtitle}
                onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs h-20 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Primary Button
                </label>
                <input
                  type="text"
                  value={editingSlide.primaryButtonText || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, primaryButtonText: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Secondary Button
                </label>
                <input
                  type="text"
                  value={editingSlide.secondaryButtonText || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, secondaryButtonText: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setEditingSlide(null)}
                className="flex-1 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateSlide}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                Update Slide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
