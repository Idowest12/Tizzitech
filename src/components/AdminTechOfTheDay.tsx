import React, { useState, useRef } from 'react';
import { 
  Sparkles, Plus, Trash2, Edit3, Save, Check, Upload, Eye, 
  ExternalLink, Layers, Smartphone, Star, Image as ImageIcon,
  ArrowUp, ArrowDown, X, Info, Calendar, User, Tag
} from 'lucide-react';
import { TechOfTheDayConfig, TechArticle } from '../types';

interface AdminTechOfTheDayProps {
  initialConfig?: TechOfTheDayConfig;
  onSaveConfig: (updated: TechOfTheDayConfig) => Promise<void>;
  isSaving?: boolean;
}

export const DEFAULT_TECH_CONFIG: TechOfTheDayConfig = {
  headline: 'Tech of the Day',
  subheadline: 'A deep dive into the latest product launches, innovations, and breaking tech events.',
  articles: [
    {
      id: 'iphone-18-duo-reveal-2026',
      title: 'Apple Keynote: iPhone 18 & The First Ever iPhone Duo Unveiled',
      subtitle: 'Apple makes history with its first dual-screen foldable alongside the powerhouse iPhone 18 Pro series.',
      badge: 'Apple Keynote 2026',
      date: 'September 2026',
      author: 'Tizzitech Editorial Desk',
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=2670&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=2670&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=2670&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2670&auto=format&fit=crop'
      ],
      summary: 'Tim Cook and the Apple engineering team have introduced the revolutionary iPhone Duo — Apple\'s first dual-folding smartphone featuring dual Ultra Retina XDR displays — alongside the boundary-pushing iPhone 18 and iPhone 18 Pro.',
      paragraphs: [
        'Apple has officially rewritten the smartphone playbook with the momentous debut of the all-new iPhone Duo alongside the flagship iPhone 18 series. Billed as the most ambitious hardware breakthrough since the original iPhone in 2007, the iPhone Duo merges a compact outer phone with a book-style unfolding 7.9-inch seamless Ultra Retina display.',
        'At the core of both machines is the 2nm Apple A20 Pro Bionic silicon, delivering a 45% uplift in machine learning compute dedicated entirely to on-device Apple Intelligence 2.0. The iPhone Duo introduces an aerospace-grade titanium fluid-gear hinge with zero creasing, allowing users to run macOS-inspired split multitasking, drag-and-drop between dual app screens, and capture spatial photography effortlessly.',
        'Meanwhile, the standard iPhone 18 and 18 Pro introduce Under-Display Face ID, an invisible camera notch, a 200MP fusion optical sensor with 10x periscope zoom, and a revolutionary Solid-State battery architecture extending screen-on battery life up to 36 hours on a single charge.',
        'Pre-orders for the iPhone 18 and iPhone Duo are slated to open shortly, with guaranteed priority allocation and express doorstep delivery across Lagos and nationwide through Tizzitech.'
      ],
      keyUpgrades: [
        'A20 Pro Bionic (2nm) with Apple Intelligence 2.0 Engine',
        'First Ever "iPhone Duo" with 7.9-inch Creaseless Dual Super Retina XDR Display',
        'Aerospace Titanium Liquid Hinge with 360-degree Flex Positioning',
        '200MP Fusion Sensor with 10x Optical Periscope Zoom & 8K ProRes Video',
        'Next-Gen Solid-State Battery with 36-hour real world uptime',
        'Sub-Display Face ID and Ultra-Thin Borderless Ceramic Shield'
      ],
      specs: {
        'Processor': 'Apple A20 Pro (2nm) 6-core CPU / 8-core GPU',
        'Display (Duo)': '6.3" Outer OLED + 7.9" Foldable Ultra Retina XDR 1-144Hz',
        'Camera Matrix': '200MP Main + 48MP Ultra-Wide + 48MP 10x Periscope Telephoto',
        'Hinge & Build': 'Grade 5 Titanium Armor + Ceramic Shield Glass 3',
        'Connectivity': '5G Advanced, Wi-Fi 7, Satellite Messaging & SOS'
      },
      ctaText: 'Join Priority Waitlist',
      ctaLink: '/?view=launch',
      featured: true
    },
    {
      id: 'galaxy-s26-ultra',
      title: 'The Next Frontier: Samsung Galaxy S26 Ultra',
      subtitle: 'Proactive AI, 200MP zero-delay shutter, and titanium armor redefine Android excellence.',
      badge: 'New Release',
      date: '2026',
      author: 'Tizzitech Tech Lab',
      imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=2671&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=2671&auto=format&fit=crop'
      ],
      summary: 'Samsung officially unveiled the Galaxy S26 Ultra featuring Proactive AI that anticipates daily workflows before you even touch the screen.',
      paragraphs: [
        'Samsung has officially unveiled the highly anticipated Galaxy S26 series, promising a massive leap forward in both AI integration and physical durability. With the new "Titanium Armor" chassis, the S26 is built to survive the harshest conditions while remaining incredibly lightweight.',
        'According to Samsung\'s keynote, the true focus this year is on Proactive AI. The device actively manages battery optimization based on your schedule, pre-loads apps before you even swipe, and features a completely revamped camera matrix that utilizes neural processing to balance exposure in real-time.'
      ],
      keyUpgrades: [
        'Snapdragon 8 Gen 5 (Custom for Galaxy)',
        'New 200MP ISOCELL sensor with 0 delay shutter',
        '144Hz Dynamic AMOLED display that peaks at 3200 nits',
        '7 years of guaranteed OS and security updates'
      ],
      specs: {
        'Processor': 'Snapdragon 8 Gen 5 Extreme Edition',
        'Screen': '6.8-inch Dynamic AMOLED 2X 144Hz',
        'Battery': '5,500 mAh with 65W HyperCharge'
      },
      ctaText: 'Explore Collection',
      ctaLink: '/#product-grid',
      featured: false
    }
  ]
};

export function AdminTechOfTheDay({
  initialConfig,
  onSaveConfig,
  isSaving = false
}: AdminTechOfTheDayProps) {
  const [config, setConfig] = useState<TechOfTheDayConfig>(() => {
    if (initialConfig && initialConfig.articles && initialConfig.articles.length > 0) {
      return initialConfig;
    }
    const saved = localStorage.getItem('tizzitech_tech_of_the_day');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_TECH_CONFIG;
  });

  const [selectedArticleId, setSelectedArticleId] = useState<string>(() => {
    return (config.articles && config.articles[0]?.id) || 'iphone-18-duo-reveal-2026';
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'hero' | 'gallery'>('hero');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get active article
  const activeArticle = config.articles.find(a => a.id === selectedArticleId) || config.articles[0];

  // Helper to compress images client side
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
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => reject(new Error('Failed to load image file'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeArticle) return;

    try {
      setUploadingImage(true);
      const dataUrl = await processImageFile(file);

      // Try uploading to backend /api/admin/upload-image if available, otherwise use optimized base64
      let finalUrl = dataUrl;
      const adminToken = localStorage.getItem('tizzitech_admin_token') || sessionStorage.getItem('adminToken') || '';
      try {
        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
          },
          body: JSON.stringify({ image: dataUrl })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) finalUrl = data.url;
        }
      } catch (err) {
        console.warn('Backend upload skipped, using web data URL:', err);
      }

      if (uploadTarget === 'hero') {
        updateActiveArticle({ imageUrl: finalUrl });
      } else {
        const existing = activeArticle.images || [];
        updateActiveArticle({ images: [...existing, finalUrl] });
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to process image. Please try a different photo.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = (target: 'hero' | 'gallery') => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  // Update fields of the currently selected article
  const updateActiveArticle = (updates: Partial<TechArticle>) => {
    if (!activeArticle) return;
    const updatedArticles = config.articles.map(art => {
      if (art.id === activeArticle.id) {
        return { ...art, ...updates };
      }
      return art;
    });
    setConfig(prev => ({ ...prev, articles: updatedArticles }));
  };

  // Set featured article
  const setFeaturedArticle = (id: string) => {
    const updated = config.articles.map(art => ({
      ...art,
      featured: art.id === id
    }));
    setConfig(prev => ({ ...prev, articles: updated }));
  };

  // Add new blank article
  const handleAddNewArticle = () => {
    const newId = `tech-article-${Date.now()}`;
    const newArt: TechArticle = {
      id: newId,
      title: 'New Technology Breakthrough',
      subtitle: 'Write a compelling teaser summary for this newly announced tech innovation.',
      badge: 'Breaking News',
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      author: 'Tizzitech Editorial Desk',
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2670&auto=format&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2670&auto=format&fit=crop'
      ],
      summary: 'Provide an engaging overview of the announcement, who presented it, and why it matters to consumers and professionals.',
      paragraphs: [
        'The unveiling showcased major advancements in hardware architecture, machine intelligence, and refined industrial design.',
        'Engineers highlighted dramatic gains in power efficiency, battery longevity, and seamless ecosystem connectivity.'
      ],
      keyUpgrades: [
        'Next-generation processor silicon',
        'All-new industrial chassis and display architecture',
        'Extended battery life and enhanced thermal dissipation'
      ],
      specs: {
        'Category': 'Next-Gen Hardware',
        'Availability': 'Global Rollout'
      },
      ctaText: 'Explore More',
      ctaLink: '/#product-grid',
      featured: false
    };

    setConfig(prev => ({
      ...prev,
      articles: [newArt, ...prev.articles]
    }));
    setSelectedArticleId(newId);
  };

  // Delete article
  const handleDeleteArticle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (config.articles.length <= 1) {
      alert('You must keep at least one Tech of the Day story in your catalog.');
      return;
    }
    if (!confirm('Are you sure you want to delete this Tech of the Day article?')) {
      return;
    }
    const filtered = config.articles.filter(a => a.id !== id);
    // If deleted was featured, make first one featured
    if (activeArticle?.id === id && filtered.length > 0) {
      filtered[0].featured = true;
      setSelectedArticleId(filtered[0].id);
    }
    setConfig(prev => ({ ...prev, articles: filtered }));
  };

  // Reorder articles
  const moveArticle = (idx: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= config.articles.length) return;
    const cloned = [...config.articles];
    const temp = cloned[idx];
    cloned[idx] = cloned[newIdx];
    cloned[newIdx] = temp;
    setConfig(prev => ({ ...prev, articles: cloned }));
  };

  // Paragraph management
  const handleAddParagraph = () => {
    if (!activeArticle) return;
    const current = activeArticle.paragraphs || [];
    updateActiveArticle({ paragraphs: [...current, ''] });
  };

  const handleUpdateParagraph = (idx: number, text: string) => {
    if (!activeArticle) return;
    const updated = [...(activeArticle.paragraphs || [])];
    updated[idx] = text;
    updateActiveArticle({ paragraphs: updated });
  };

  const handleRemoveParagraph = (idx: number) => {
    if (!activeArticle) return;
    const updated = (activeArticle.paragraphs || []).filter((_, i) => i !== idx);
    updateActiveArticle({ paragraphs: updated });
  };

  // Key upgrades management
  const handleAddUpgrade = () => {
    if (!activeArticle) return;
    const current = activeArticle.keyUpgrades || [];
    updateActiveArticle({ keyUpgrades: [...current, ''] });
  };

  const handleUpdateUpgrade = (idx: number, text: string) => {
    if (!activeArticle) return;
    const updated = [...(activeArticle.keyUpgrades || [])];
    updated[idx] = text;
    updateActiveArticle({ keyUpgrades: updated });
  };

  const handleRemoveUpgrade = (idx: number) => {
    if (!activeArticle) return;
    const updated = (activeArticle.keyUpgrades || []).filter((_, i) => i !== idx);
    updateActiveArticle({ keyUpgrades: updated });
  };

  // Gallery image management
  const handleAddGalleryUrl = () => {
    const url = prompt('Enter the image URL:');
    if (url && url.trim() && activeArticle) {
      const current = activeArticle.images || [];
      updateActiveArticle({ images: [...current, url.trim()] });
    }
  };

  const handleRemoveGalleryImage = (idx: number) => {
    if (!activeArticle) return;
    const current = (activeArticle.images || []).filter((_, i) => i !== idx);
    updateActiveArticle({ images: current });
  };

  // Specs management
  const handleAddSpec = () => {
    if (!activeArticle) return;
    const current = activeArticle.specs || {};
    const key = prompt('Enter spec label (e.g. "Processor", "Display", "Battery"):');
    if (key && key.trim()) {
      updateActiveArticle({
        specs: { ...current, [key.trim()]: '' }
      });
    }
  };

  const handleUpdateSpecValue = (key: string, value: string) => {
    if (!activeArticle) return;
    const current = { ...(activeArticle.specs || {}) };
    current[key] = value;
    updateActiveArticle({ specs: current });
  };

  const handleRemoveSpec = (key: string) => {
    if (!activeArticle) return;
    const current = { ...(activeArticle.specs || {}) };
    delete current[key];
    updateActiveArticle({ specs: current });
  };

  // One-click presets
  const handleLoadIPhoneDuoPreset = () => {
    if (!confirm('This will load the Apple Keynote iPhone 18 & iPhone Duo article template into your editor. Continue?')) {
      return;
    }
    const iphonePreset = DEFAULT_TECH_CONFIG.articles[0];
    const exists = config.articles.some(a => a.id === iphonePreset.id);
    if (exists) {
      const updated = config.articles.map(a => a.id === iphonePreset.id ? iphonePreset : a);
      setConfig(prev => ({ ...prev, articles: updated }));
    } else {
      setConfig(prev => ({ ...prev, articles: [iphonePreset, ...prev.articles] }));
    }
    setSelectedArticleId(iphonePreset.id);
    setFeaturedArticle(iphonePreset.id);
  };

  // Save handler
  const handleSave = async () => {
    try {
      localStorage.setItem('tizzitech_tech_of_the_day', JSON.stringify(config));
      await onSaveConfig(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to save Tech of the Day:', err);
      alert('Failed to save changes: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-950 border border-neutral-900 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-600/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Editorial & Tech Event Manager
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tech of the Day Stories</h1>
          <p className="text-neutral-400 text-sm mt-0.5">
            Publish, update photos, and write breaking event coverage for new hardware like the iPhone 18 & iPhone Duo.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-sm font-bold transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-neutral-400" /> Live Preview
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg cursor-pointer ${
              saveSuccess 
                ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:scale-[1.02]'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved Live!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main workspace layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Article Directory */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                Published Stories ({config.articles.length})
              </h2>
              <button
                type="button"
                onClick={handleAddNewArticle}
                className="text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Story
              </button>
            </div>

            {/* Quick Presets Section */}
            <div className="mb-4 p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                Quick Event Presets
              </span>
              <button
                type="button"
                onClick={handleLoadIPhoneDuoPreset}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-950/40 border border-blue-800/40 hover:bg-blue-900/40 text-blue-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="truncate">Insert iPhone 18 & Duo Keynote</span>
              </button>
            </div>

            {/* Article Cards List */}
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {config.articles.map((art, idx) => {
                const isSelected = art.id === selectedArticleId;
                return (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArticleId(art.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-blue-950/30 border-blue-500/60 shadow-md ring-1 ring-blue-500/40'
                        : 'bg-black/40 border-neutral-900 hover:border-neutral-800 hover:bg-neutral-900/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-14 rounded-lg bg-neutral-900 overflow-hidden flex-shrink-0 border border-neutral-800 relative">
                        <img 
                          src={art.imageUrl} 
                          alt={art.title} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        {art.featured && (
                          <div className="absolute top-1 left-1 bg-amber-500 text-black rounded p-0.5 shadow">
                            <Star className="w-2.5 h-2.5 fill-black" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded truncate max-w-[140px]">
                            {art.badge || 'Story'}
                          </span>
                          {art.featured && (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                              Main Featured
                            </span>
                          )}
                        </div>
                        <h3 className="text-white text-xs font-bold truncate leading-snug">
                          {art.title}
                        </h3>
                        <p className="text-neutral-500 text-[11px] truncate mt-0.5">
                          {art.date} • {art.paragraphs?.length || 0} paragraphs
                        </p>
                      </div>

                      {/* Controls */}
                      <div className="flex flex-col gap-1 items-end">
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            title="Move up"
                            disabled={idx === 0}
                            onClick={(e) => { e.stopPropagation(); moveArticle(idx, 'up'); }}
                            className="p-1 text-neutral-500 hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Move down"
                            disabled={idx === config.articles.length - 1}
                            onClick={(e) => { e.stopPropagation(); moveArticle(idx, 'down'); }}
                            className="p-1 text-neutral-500 hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete Story"
                            onClick={(e) => handleDeleteArticle(art.id, e)}
                            className="p-1 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section Heading Settings */}
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-white font-bold text-sm uppercase tracking-wider">
              Storefront Section Header
            </h2>
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1">Section Title</label>
              <input
                type="text"
                value={config.headline || ''}
                onChange={e => setConfig(prev => ({ ...prev, headline: e.target.value }))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="Tech of the Day"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1">Section Subheading</label>
              <textarea
                value={config.subheadline || ''}
                onChange={e => setConfig(prev => ({ ...prev, subheadline: e.target.value }))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 h-20 resize-none"
                placeholder="A deep dive into the latest product launches..."
              />
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Story Editor */}
        <div className="lg:col-span-8 space-y-6">
          {activeArticle ? (
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Top Bar of Active Article */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-900 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-neutral-500 font-mono">ID: {activeArticle.id}</span>
                  </div>
                  <h2 className="text-xl font-black text-white">Editing Story Details</h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFeaturedArticle(activeArticle.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeArticle.featured
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${activeArticle.featured ? 'fill-amber-400' : ''}`} />
                    {activeArticle.featured ? 'Primary Featured Story' : 'Set as Primary Story'}
                  </button>
                </div>
              </div>

              {/* Title & Badge */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Headline / Title *
                  </label>
                  <input
                    type="text"
                    value={activeArticle.title}
                    onChange={e => updateActiveArticle({ title: e.target.value })}
                    placeholder="e.g. Apple Keynote: iPhone 18 & iPhone Duo Unveiled"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-white font-bold text-base focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-400" /> Event Badge / Pill
                  </label>
                  <input
                    type="text"
                    value={activeArticle.badge || ''}
                    onChange={e => updateActiveArticle({ badge: e.target.value })}
                    placeholder="e.g. Apple Keynote 2026"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-1.5 mt-1.5 overflow-x-auto">
                    {['Apple Keynote 2026', 'New Release', 'World First', 'Editor Pick'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => updateActiveArticle({ badge: tag })}
                        className="text-[10px] text-neutral-400 hover:text-blue-400 bg-neutral-900 px-2 py-0.5 rounded cursor-pointer border border-neutral-800"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subtitle / Teaser */}
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                  Subtitle / Teaser
                </label>
                <input
                  type="text"
                  value={activeArticle.subtitle || ''}
                  onChange={e => updateActiveArticle({ subtitle: e.target.value })}
                  placeholder="e.g. Apple makes history with its first dual-screen foldable alongside the powerhouse iPhone 18 Pro series."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Date & Author */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" /> Event Date / Period
                  </label>
                  <input
                    type="text"
                    value={activeArticle.date || ''}
                    onChange={e => updateActiveArticle({ date: e.target.value })}
                    placeholder="e.g. September 2026"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" /> Byline / Editorial Desk
                  </label>
                  <input
                    type="text"
                    value={activeArticle.author || ''}
                    onChange={e => updateActiveArticle({ author: e.target.value })}
                    placeholder="e.g. Tizzitech Editorial Desk"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Main Banner / Hero Image */}
              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-400" /> Primary Story Image / Cover
                  </label>
                  <button
                    type="button"
                    onClick={() => triggerUpload('hero')}
                    disabled={uploadingImage}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingImage && uploadTarget === 'hero' ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-full sm:w-48 aspect-video rounded-lg overflow-hidden border border-neutral-800 bg-black flex-shrink-0 relative">
                    <img 
                      src={activeArticle.imageUrl} 
                      alt="Cover Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="url"
                      value={activeArticle.imageUrl}
                      onChange={e => updateActiveArticle({ imageUrl: e.target.value })}
                      placeholder="Paste image URL (https://...)"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-[11px] text-neutral-400">
                      Supports direct photo URLs from Unsplash, Apple Press Kit, Cloudinary, or uploaded files. Recommended aspect ratio: 16:9 widescreen.
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Gallery / Multiple Images */}
              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-xs font-bold text-white uppercase tracking-widest block">
                      Event Photo Gallery ({activeArticle.images?.length || 0})
                    </label>
                    <span className="text-[11px] text-neutral-400">
                      Add multiple live event photos, device angles, or teardown screenshots.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddGalleryUrl}
                      className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-2.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                    >
                      + Add URL
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerUpload('gallery')}
                      disabled={uploadingImage}
                      className="text-xs bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3 h-3" /> Upload Photo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(activeArticle.images || []).map((imgUrl, imgIdx) => (
                    <div key={imgIdx} className="aspect-video rounded-lg overflow-hidden border border-neutral-800 bg-black relative group">
                      <img 
                        src={imgUrl} 
                        alt={`Gallery ${imgIdx}`} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(imgIdx)}
                        className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-rose-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {(activeArticle.images || []).length === 0 && (
                    <div className="col-span-full py-6 text-center text-neutral-500 text-xs border border-dashed border-neutral-800 rounded-lg">
                      No additional event photos yet. Click "Upload Photo" or "+ Add URL" to add live keynote photos.
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Summary */}
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                  Executive Summary / Lead Paragraph
                </label>
                <textarea
                  value={activeArticle.summary || ''}
                  onChange={e => updateActiveArticle({ summary: e.target.value })}
                  placeholder="Summarize the core announcement in 2-3 engaging sentences..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 h-24 resize-none leading-relaxed"
                />
              </div>

              {/* Full Event Coverage Paragraphs */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-xs font-bold text-white uppercase tracking-widest block">
                      Write About the Event (Full Story Paragraphs)
                    </label>
                    <span className="text-[11px] text-neutral-400">
                      Add detailed journalistic coverage of keynotes, CEO quotes, technical breakthroughs, and pricing.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddParagraph}
                    className="text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Paragraph
                  </button>
                </div>

                <div className="space-y-3">
                  {(activeArticle.paragraphs || []).map((para, pIdx) => (
                    <div key={pIdx} className="flex gap-2 items-start bg-neutral-900/40 p-3 rounded-xl border border-neutral-800/80">
                      <span className="text-neutral-500 font-mono text-xs pt-2 w-6 text-center flex-shrink-0">
                        P{pIdx + 1}
                      </span>
                      <textarea
                        value={para}
                        onChange={e => handleUpdateParagraph(pIdx, e.target.value)}
                        placeholder={`Paragraph ${pIdx + 1} text...`}
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 min-h-[85px] leading-relaxed"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveParagraph(pIdx)}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer mt-1"
                        title="Remove paragraph"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(activeArticle.paragraphs || []).length === 0 && (
                    <p className="text-neutral-500 text-xs py-4 text-center border border-dashed border-neutral-800 rounded-lg">
                      No paragraphs yet. Click "+ Add Paragraph" to start writing your event coverage.
                    </p>
                  )}
                </div>
              </div>

              {/* Key Upgrades & Highlights */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-xs font-bold text-white uppercase tracking-widest block">
                      Key Upgrades & Breakthroughs (Bullet Points)
                    </label>
                    <span className="text-[11px] text-neutral-400">
                      Shown prominently in the high-contrast highlight box on the storefront.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUpgrade}
                    className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Upgrade
                  </button>
                </div>

                <div className="space-y-2">
                  {(activeArticle.keyUpgrades || []).map((upg, uIdx) => (
                    <div key={uIdx} className="flex gap-2 items-center">
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      <input
                        type="text"
                        value={upg}
                        onChange={e => handleUpdateUpgrade(uIdx, e.target.value)}
                        placeholder="e.g. A20 Pro Bionic (2nm) with on-device Apple Intelligence 2.0"
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveUpgrade(uIdx)}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove upgrade"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-xs font-bold text-white uppercase tracking-widest block">
                      Technical Specifications & Hardware Metrics
                    </label>
                    <span className="text-[11px] text-neutral-400">
                      Key-value breakdown (Processor, Display, Camera Matrix, Battery, Hinge).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Spec
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(activeArticle.specs || {}).map(([key, val]) => (
                    <div key={key} className="flex gap-2 items-center bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
                      <div className="w-1/3">
                        <span className="text-xs font-bold text-neutral-400 truncate block">
                          {key}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={val}
                        onChange={e => handleUpdateSpecValue(key, e.target.value)}
                        placeholder="Spec value..."
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(key)}
                        className="text-neutral-500 hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {Object.keys(activeArticle.specs || {}).length === 0 && (
                    <div className="col-span-full py-4 text-center text-neutral-500 text-xs border border-dashed border-neutral-800 rounded-lg">
                      No technical specs defined. Click "+ Add Spec" to add hardware metrics.
                    </div>
                  )}
                </div>
              </div>

              {/* Call to Action Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-900">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Action Button Label
                  </label>
                  <input
                    type="text"
                    value={activeArticle.ctaText || ''}
                    onChange={e => updateActiveArticle({ ctaText: e.target.value })}
                    placeholder="e.g. Join Priority Waitlist"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Button Destination URL / Route
                  </label>
                  <input
                    type="text"
                    value={activeArticle.ctaLink || ''}
                    onChange={e => updateActiveArticle({ ctaLink: e.target.value })}
                    placeholder="e.g. /?view=launch or /#product-grid"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-12 text-center text-neutral-400">
              <Layers className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
              <p>Select an article from the left directory or create a new one to begin editing.</p>
            </div>
          )}
        </div>

      </div>

      {/* Live Preview Modal */}
      {showPreviewModal && activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="sticky top-0 bg-neutral-950/90 backdrop-blur border-b border-neutral-800 px-6 py-4 flex justify-between items-center z-20">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-600 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Storefront View
                </span>
                <span className="text-white font-bold text-sm truncate max-w-md">
                  {activeArticle.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Cover */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden relative shadow-2xl">
                <img 
                  src={activeArticle.imageUrl} 
                  alt={activeArticle.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-full shadow">
                  {activeArticle.badge || 'New Release'}
                </div>
              </div>

              {/* Title & Metadata */}
              <div>
                <p className="text-neutral-400 text-xs uppercase tracking-widest mb-1">
                  {activeArticle.date} • {activeArticle.author}
                </p>
                <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                  {activeArticle.title}
                </h1>
                {activeArticle.subtitle && (
                  <p className="text-neutral-300 text-base mt-2 font-medium">
                    {activeArticle.subtitle}
                  </p>
                )}
              </div>

              {/* Summary */}
              {activeArticle.summary && (
                <div className="p-4 bg-neutral-900/80 border-l-4 border-blue-600 rounded-r-xl">
                  <p className="text-neutral-200 text-base leading-relaxed italic">
                    "{activeArticle.summary}"
                  </p>
                </div>
              )}

              {/* Paragraphs */}
              <div className="space-y-4 text-neutral-300 leading-relaxed text-base">
                {(activeArticle.paragraphs || []).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {/* Key upgrades */}
              {activeArticle.keyUpgrades && activeArticle.keyUpgrades.length > 0 && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3 text-blue-400">
                    Key Upgrades & Event Highlights
                  </h4>
                  <ul className="space-y-2 text-neutral-300 text-sm">
                    {activeArticle.keyUpgrades.map((u, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{u}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specs */}
              {activeArticle.specs && Object.keys(activeArticle.specs).length > 0 && (
                <div className="border border-neutral-800 rounded-xl overflow-hidden">
                  <div className="bg-neutral-900 px-4 py-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    Hardware Specifications
                  </div>
                  <div className="divide-y divide-neutral-800/80 bg-black">
                    {Object.entries(activeArticle.specs).map(([k, v]) => (
                      <div key={k} className="flex justify-between px-4 py-2.5 text-xs">
                        <span className="text-neutral-400 font-medium">{k}</span>
                        <span className="text-white font-mono text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-neutral-950 border-t border-neutral-900 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
