import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ArrowLeft, ArrowRight, Calendar, User, Check, 
  ExternalLink, ChevronRight, Layers, Smartphone, Eye, Share2, 
  Zap, Shield, Cpu, RefreshCw
} from 'lucide-react';
import { TechOfTheDayConfig, TechArticle } from '../types';
import { DEFAULT_TECH_CONFIG } from './AdminTechOfTheDay';

interface TechOfTheDayProps {
  config?: TechOfTheDayConfig;
  onGoToStore?: () => void;
  onGoToLaunch?: () => void;
}

export function TechOfTheDay({ config: propConfig, onGoToStore, onGoToLaunch }: TechOfTheDayProps) {
  const [techConfig, setTechConfig] = useState<TechOfTheDayConfig>(() => {
    if (propConfig && propConfig.articles && propConfig.articles.length > 0) {
      return propConfig;
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

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedSecondaryArticle, setSelectedSecondaryArticle] = useState<TechArticle | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  // Sync if propConfig changes
  useEffect(() => {
    if (propConfig && propConfig.articles && propConfig.articles.length > 0) {
      setTechConfig(propConfig);
    }
  }, [propConfig]);

  // Fetch live settings if not provided
  useEffect(() => {
    if (!propConfig) {
      fetch('/api/tech-of-the-day')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.techOfTheDay && data.techOfTheDay.articles) {
            setTechConfig(data.techOfTheDay);
            localStorage.setItem('tizzitech_tech_of_the_day', JSON.stringify(data.techOfTheDay));
          }
        })
        .catch(err => console.warn('Could not fetch latest tech of the day:', err));
    }
  }, [propConfig]);

  const articles = techConfig.articles || [];
  // Featured article is either the one flagged featured, or the first article
  const featuredArticle = articles.find(a => a.featured) || articles[0] || DEFAULT_TECH_CONFIG.articles[0];
  const secondaryArticles = articles.filter(a => a.id !== featuredArticle?.id);

  // Images for featured article gallery
  const galleryImages = [
    featuredArticle.imageUrl,
    ...(featuredArticle.images || []).filter(img => img !== featuredArticle.imageUrl)
  ].filter(Boolean);

  const activeMainImage = galleryImages[activeImageIndex] || featuredArticle.imageUrl;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: featuredArticle.title,
        text: featuredArticle.summary || featuredArticle.subtitle || 'Check out Tech of the Day on Tizzitech',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="w-full bg-black text-white relative animate-in fade-in duration-500 pb-24">
      
      {/* Top Banner Navigation & Editorial Title */}
      <div className="w-full bg-neutral-950 py-12 sm:py-16 border-b border-neutral-900 border-x-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 z-0" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <button
              onClick={onGoToStore}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </button>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Curated Hardware Keynotes
              </span>
              <button
                onClick={handleShare}
                className="text-xs text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Share Story"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedShare ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <p className="text-blue-500 font-bold tracking-widest text-xs uppercase mb-3">
              Editorial Tech Dispatch
            </p>
            <h1 className="font-serif text-4xl sm:text-6xl font-black text-white leading-none uppercase tracking-tighter mb-5">
              {techConfig.headline || 'Tech of the'}{' '}
              <span className="text-blue-500">Day</span>
            </h1>
            <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              {techConfig.subheadline || 'A deep dive into the latest product launches, innovations, and breaking tech events.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-12 space-y-16">
        
        {/* PRIMARY FLAGSHIP ARTICLE (e.g. iPhone 18 & iPhone Duo) */}
        {featuredArticle && (
          <article className="border border-neutral-800/80 bg-neutral-950/70 rounded-3xl overflow-hidden shadow-2xl transition-all">
            
            {/* Main Interactive Showcase Image with Gallery switcher */}
            <div className="relative w-full aspect-video sm:aspect-[16/9] bg-neutral-950 overflow-hidden group">
              <img 
                src={activeMainImage} 
                alt={featuredArticle.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              
              {/* Event Badge */}
              <div className="absolute top-5 left-5 z-10 flex flex-wrap items-center gap-2">
                <span className="bg-blue-600 text-white text-xs font-extrabold px-3.5 py-1.5 uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  {featuredArticle.badge || 'Apple Keynote 2026'}
                </span>
                <span className="bg-black/60 backdrop-blur border border-white/20 text-neutral-300 text-xs font-semibold px-3 py-1 rounded-full">
                  {featuredArticle.date || 'September 2026'}
                </span>
              </div>

              {/* Byline overlay in corner */}
              <div className="absolute bottom-4 right-4 z-10 hidden sm:flex items-center gap-2 bg-black/75 backdrop-blur border border-neutral-800 px-3 py-1.5 rounded-full text-xs text-neutral-300">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>{featuredArticle.author || 'Tizzitech Editorial Desk'}</span>
              </div>
            </div>

            {/* Gallery Thumbnails Strip (if multiple photos available) */}
            {galleryImages.length > 1 && (
              <div className="bg-neutral-900/60 border-b border-neutral-900 px-4 py-3 flex items-center gap-3 overflow-x-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1 pl-2">
                  <Eye className="w-3.5 h-3.5 text-blue-400" /> Event Photos:
                </span>
                {galleryImages.map((imgUrl, gIdx) => (
                  <button
                    key={gIdx}
                    onClick={() => setActiveImageIndex(gIdx)}
                    className={`h-12 w-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                      activeImageIndex === gIdx 
                        ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/30' 
                        : 'border-neutral-800 opacity-60 hover:opacity-100 hover:border-neutral-700'
                    }`}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`Thumb ${gIdx}`} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Article Editorial Body */}
            <div className="p-6 sm:p-12 space-y-8">
              
              {/* Headline & Subtitle */}
              <div>
                <h2 className="text-3xl sm:text-5xl font-serif font-black uppercase tracking-tight text-white leading-tight">
                  {featuredArticle.title}
                </h2>
                {featuredArticle.subtitle && (
                  <p className="text-neutral-400 text-lg sm:text-xl font-light mt-3 leading-relaxed">
                    {featuredArticle.subtitle}
                  </p>
                )}
              </div>

              {/* Lead Summary Callout */}
              {featuredArticle.summary && (
                <div className="bg-gradient-to-r from-blue-950/40 via-neutral-900/60 to-transparent p-6 rounded-2xl border-l-4 border-blue-500 shadow-inner">
                  <p className="text-neutral-200 text-base sm:text-lg leading-relaxed font-normal italic">
                    "{featuredArticle.summary}"
                  </p>
                </div>
              )}

              {/* Full Event Narrative Paragraphs */}
              <div className="space-y-6 text-neutral-300 leading-relaxed font-light text-base sm:text-lg">
                {(featuredArticle.paragraphs || []).map((paragraph, pIdx) => (
                  <p key={pIdx}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* High-Contrast Highlights / Key Upgrades Box */}
              {featuredArticle.keyUpgrades && featuredArticle.keyUpgrades.length > 0 && (
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm sm:text-base">
                      Hardware Breakthroughs & Key Upgrades
                    </h3>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {featuredArticle.keyUpgrades.map((upgrade, uIdx) => (
                      <li key={uIdx} className="flex items-start gap-2.5 text-neutral-300 text-sm sm:text-base">
                        <Check className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                        <span>{upgrade}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technical Specifications Grid */}
              {featuredArticle.specs && Object.keys(featuredArticle.specs).length > 0 && (
                <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-black/60">
                  <div className="bg-neutral-900 px-6 py-3.5 border-b border-neutral-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-400" /> Hardware Specifications
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">Official Spec Matrix</span>
                  </div>
                  <div className="divide-y divide-neutral-900">
                    {Object.entries(featuredArticle.specs).map(([specKey, specVal]) => (
                      <div key={specKey} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-3.5 hover:bg-neutral-900/40 transition-colors">
                        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1 sm:mb-0">
                          {specKey}
                        </span>
                        <span className="text-sm font-medium text-white sm:text-right font-mono">
                          {specVal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Call-to-action button */}
              <div className="pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-white font-bold text-base">Want early access to this device?</p>
                  <p className="text-neutral-400 text-xs mt-0.5">
                    Tizzitech guarantees verified genuine units with fast delivery in Lagos and nationwide.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      if (onGoToLaunch) {
                        onGoToLaunch();
                      } else if (onGoToStore) {
                        onGoToStore();
                      }
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <span>{featuredArticle.ctaText || 'Join Priority Waitlist'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </article>
        )}

        {/* SECONDARY TECH STORIES (If any more articles exist in catalog) */}
        {secondaryArticles.length > 0 && (
          <div className="space-y-8 pt-8 border-t border-neutral-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-500">Archive</p>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  More Recent Keynotes & Innovations
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {secondaryArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden hover:border-neutral-800 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="aspect-video w-full bg-neutral-900 relative overflow-hidden">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-neutral-900/90 backdrop-blur border border-neutral-800 text-white text-[11px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-md">
                        {article.badge || 'Tech Review'}
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <p className="text-xs text-neutral-500 uppercase tracking-wider font-mono">
                        {article.date} • {article.author}
                      </p>
                      <h4 className="text-xl font-bold text-white leading-snug group-hover:text-blue-400 transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-neutral-400 text-sm line-clamp-3 leading-relaxed">
                        {article.summary || article.paragraphs?.[0] || article.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <button
                      onClick={() => setSelectedSecondaryArticle(article)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 bg-neutral-900 text-neutral-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <span>Read Full Story</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Reader Modal for Secondary Story */}
      {selectedSecondaryArticle && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="sticky top-0 bg-neutral-950/95 backdrop-blur border-b border-neutral-800 px-6 py-4 flex justify-between items-center z-20">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded">
                {selectedSecondaryArticle.badge || 'Article'}
              </span>
              <button
                onClick={() => setSelectedSecondaryArticle(null)}
                className="text-neutral-400 hover:text-white px-3 py-1 rounded-lg text-xs font-bold bg-neutral-900 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-6 sm:p-10 space-y-6">
              <div className="aspect-video w-full rounded-2xl overflow-hidden">
                <img 
                  src={selectedSecondaryArticle.imageUrl} 
                  alt={selectedSecondaryArticle.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <p className="text-neutral-400 text-xs uppercase tracking-widest mb-1">
                  {selectedSecondaryArticle.date} • {selectedSecondaryArticle.author}
                </p>
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  {selectedSecondaryArticle.title}
                </h2>
              </div>

              <div className="space-y-4 text-neutral-300 leading-relaxed">
                {(selectedSecondaryArticle.paragraphs || []).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {selectedSecondaryArticle.keyUpgrades && selectedSecondaryArticle.keyUpgrades.length > 0 && (
                <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-2">Key Highlights</h4>
                  {selectedSecondaryArticle.keyUpgrades.map((u, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-neutral-300">
                      <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>{u}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
