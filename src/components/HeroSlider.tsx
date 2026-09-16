import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ArrowRight, Truck } from 'lucide-react';
import { HeroConfig, HeroSlide } from '../types';

interface HeroSliderProps {
  config: HeroConfig;
  greeting?: string;
  onShopNow: () => void;
  onSecondaryAction?: (actionName?: string) => void;
  brands?: string[];
  onSelectBrand?: (brand: string) => void;
}

export function HeroSlider({
  config,
  greeting,
  onShopNow,
  onSecondaryAction,
  brands = ['Apple', 'Dell', 'Samsung', 'Logitech', 'Keychron', 'Anker', 'Lenovo', 'HP', 'Sony', 'Asus', 'Razer'],
  onSelectBrand
}: HeroSliderProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slides = config.slides && config.slides.length > 0 ? config.slides : [];
  const autoplaySpeed = (config.autoplaySpeed || 5) * 1000;

  // Autoplay timer
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, autoplaySpeed);

    return () => clearInterval(interval);
  }, [slides.length, autoplaySpeed, isPaused]);

  if (slides.length === 0) return null;

  const currentSlide: HeroSlide = slides[currentSlideIndex] || slides[0];

  // Sanitize button texts to avoid double-arrow defects
  const cleanPrimaryText = (currentSlide.primaryButtonText || "Shop Products").replace(/[→\->\s]+$/, '');
  const cleanSecondaryText = (currentSlide.secondaryButtonText || "Pre-Launch 2026").replace(/[→\->\s]+$/, '');

  // Duplicate delivery areas for seamless marquee infinite loop
  const deliveryAreas = config.deliveryAreas && config.deliveryAreas.length > 0
    ? config.deliveryAreas
    : ['Victoria Island', 'Lekki', 'Ikeja', 'Surulere', 'Yaba', 'Ajah', 'Gbagada', 'Magodo', 'Ikoyi', 'Festac', 'Abuja FCT', 'Port Harcourt', 'Ibadan'];
  
  const duplicatedAreas = [...deliveryAreas, ...deliveryAreas, ...deliveryAreas];

  return (
    <div className="w-full flex flex-col bg-black border-b border-neutral-900 select-none">
      {/* HERO BANNER CONTAINER */}
      <div 
        className="relative w-full min-h-[540px] sm:min-h-[600px] lg:min-h-[660px] flex items-center overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* BACKGROUND SLIDESHOW WITH KEN BURNS & CROSSFADE */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
          <AnimatePresence mode="sync">
            <motion.div
              key={currentSlide.id || currentSlideIndex}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1.0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ 
                opacity: { duration: 1.2, ease: "easeInOut" },
                scale: { duration: 6.5, ease: "easeOut" }
              }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.title || "Tizzitech Hero Slide"}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter brightness-[0.72]"
              />
            </motion.div>
          </AnimatePresence>

          {/* SOPHISTICATED MULTI-STAGE GRADIENT OVERLAYS */}
          {/* Left-to-right deep dark vignette for razor-sharp typography */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-[1]" />
          
          {/* Bottom fade into black page background */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 z-[1]" />
          
          {/* Subtle blue atmospheric tint matching Tizzitech brand */}
          <div className="absolute inset-0 bg-radial-at-t from-blue-600/10 via-transparent to-transparent pointer-events-none z-[1]" />
        </div>

        {/* HERO CONTENT CONTAINER */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 flex flex-col justify-between h-full">
          
          {/* TOP SERVICE / DELIVERY MARQUEE BANNER */}
          <div className="w-full max-w-4xl mb-8">
            <div className="bg-neutral-950/85 backdrop-blur-md border border-neutral-800/80 hover:border-blue-500/30 transition-colors rounded-2xl p-2.5 sm:p-3 shadow-2xl overflow-hidden group">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
                {/* Header Tag */}
                <div className="flex items-center gap-2 shrink-0 px-2.5 py-1 bg-neutral-900/90 border border-neutral-800 rounded-lg">
                  <Truck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-200">
                    {config.deliveryHeader || 'WHERE WE DELIVER — 24+ AREAS NATIONWIDE'}
                  </span>
                </div>

                {/* Animated scrolling areas pill strip */}
                <div className="relative flex-1 overflow-hidden mask-gradient-x">
                  <div className="flex gap-2 animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]">
                    {duplicatedAreas.map((area, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-300 bg-neutral-900/90 border border-neutral-800 hover:border-blue-500/40 hover:text-white px-2.5 py-1 rounded-full transition-colors shrink-0 shadow-sm"
                      >
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span>{area}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN HEADLINE & ACTIONS */}
          <div className="max-w-3xl space-y-6">
            
            {/* Badge & Greeting */}
            <div className="flex flex-wrap items-center gap-2.5">
              {greeting && (
                <span className="text-blue-400 font-bold tracking-widest text-xs uppercase px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md">
                  {greeting}
                </span>
              )}
              {currentSlide.badge && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-blue-400 bg-blue-950/40 border border-blue-500/25 px-3 py-1 rounded-md">
                  {currentSlide.badge}
                </span>
              )}
            </div>

            {/* Dynamic Slide Title */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id || currentSlideIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight uppercase max-w-3xl drop-shadow-md">
                  {currentSlide.title || "TECH & ACCESSORIES."}
                </h1>
                <p className="mt-4 text-neutral-300 text-base sm:text-lg max-w-2xl leading-relaxed drop-shadow">
                  {currentSlide.subtitle || "Laptops, phones, keyboards & tech accessories — tested, certified, and delivered straight to your doorstep."}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onShopNow}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-8 text-xs sm:text-sm tracking-widest uppercase transition-all flex items-center gap-2.5 rounded-xl shadow-lg shadow-blue-600/25 hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>{cleanPrimaryText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onSecondaryAction && cleanSecondaryText && (
                <button
                  onClick={() => onSecondaryAction(cleanSecondaryText)}
                  className="bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-200 hover:text-white font-bold py-3.5 px-6 text-xs sm:text-sm tracking-widest uppercase transition-all rounded-xl backdrop-blur-sm"
                >
                  <span>{cleanSecondaryText}</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* CONTINUOUS BRAND LOGO STRIP */}
      <div className="w-full bg-neutral-950/95 border-t border-neutral-900 py-4 px-4 overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="shrink-0 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500">
            <span>Official Brands:</span>
          </div>

          <div className="relative flex-1 overflow-hidden mask-gradient-x w-full">
            <div className="flex items-center gap-8 sm:gap-12 animate-marquee whitespace-nowrap">
              {[...brands, ...brands, ...brands].map((brand, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectBrand && onSelectBrand(brand)}
                  className="text-neutral-400 hover:text-white transition-all font-serif font-bold text-base sm:text-lg tracking-wider uppercase hover:scale-105 shrink-0"
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
