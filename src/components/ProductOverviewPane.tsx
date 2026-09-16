import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Check, Shield, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { Product } from '../types';

interface ProductOverviewPaneProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export function ProductOverviewPane({ product, onClose, onAddToCart }: ProductOverviewPaneProps) {
  const images = product?.images && product.images.length > 0 
    ? product.images 
    : (product?.imageUrl ? [product.imageUrl] : []);
  
  const [activeIdx, setActiveIdx] = useState<number>(0);

  useEffect(() => {
    setActiveIdx(0);
  }, [product]);

  const handlePrev = () => {
    if (images.length <= 1) return;
    setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    if (images.length <= 1) return;
    setActiveIdx((prev) => (prev + 1) % images.length);
  };

  const activeImage = images[activeIdx] || product?.imageUrl || '';

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-neutral-700/50 flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Image Section with Slider */}
              <div className="relative w-full md:w-1/2 bg-neutral-800/50 z-10 p-6 sm:p-8 flex flex-col items-center justify-center min-h-[250px] md:min-h-0 group select-none">
                <button 
                  onClick={onClose}
                  className="absolute top-4 left-4 p-2 bg-neutral-900/50 hover:bg-neutral-800 rounded-full text-neutral-300 md:hidden z-20 backdrop-blur-md"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {images.length > 1 && (
                  <div className="absolute top-4 left-4 hidden md:flex items-center gap-1.5 bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 px-2.5 py-1 rounded-full text-xs font-mono text-neutral-300 z-20">
                    <Camera className="w-3 h-3 text-blue-400" />
                    <span>{activeIdx + 1}/{images.length}</span>
                  </div>
                )}

                <div className="flex-1 flex items-center justify-center w-full relative">
                  <motion.img 
                    key={activeImage}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={activeImage || undefined} 
                    alt={product.name} 
                    referrerPolicy="no-referrer"
                    className="w-full max-h-[200px] md:max-h-[380px] object-contain drop-shadow-2xl"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrev}
                        aria-label="Previous image"
                        className="absolute left-1 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-blue-600 text-white border border-white/10 shadow-lg backdrop-blur-sm transition-all z-20 active:scale-95"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleNext}
                        aria-label="Next image"
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-blue-600 text-white border border-white/10 shadow-lg backdrop-blur-sm transition-all z-20 active:scale-95"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
                
                {images.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2 w-full justify-center scrollbar-thin">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveIdx(idx)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${activeIdx === idx ? 'border-blue-500 scale-105' : 'border-neutral-700 opacity-60 hover:opacity-100'}`}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                   <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md uppercase tracking-wider">
                      {product.condition}
                   </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col overflow-y-auto scrollbar-hide">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-blue-400 font-semibold tracking-wide text-sm uppercase">{product.brand}</div>
                  <button 
                    onClick={onClose}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-full text-neutral-400 hidden md:flex transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">{product.name}</h2>
                <div className="text-3xl font-bold text-white mb-6">₦{product.price.toLocaleString()}</div>

                {product.description && (
                  <div className="mb-6">
                     <p className="text-neutral-400 text-sm leading-relaxed">{product.description}</p>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xs text-neutral-500 uppercase tracking-widest font-bold mb-3 border-b border-neutral-800 pb-2">Specifications</h3>
                  {product.specs && Object.keys(product.specs).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {Object.entries(product.specs).map(([key, value]) => (
                        <div key={key} className="bg-neutral-900 border border-neutral-800 rounded-lg p-2.5">
                           <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">{key}</div>
                           <div className="text-xs text-neutral-300 font-medium">{value}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-500 text-sm italic">No specific details available.</p>
                  )}
                </div>

                <div className="mt-auto space-y-4 pt-4 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-emerald-500">
                        <Check className="w-4 h-4" /> 
                        <span>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                     </div>
                  </div>
                  <button
                    onClick={() => {
                       onAddToCart(product);
                       onClose();
                    }}
                    disabled={product.stock === 0}
                    className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest text-neutral-500 pt-2">
                    <Shield className="w-3 h-3" />
                    <span>Secure tech checkout • 30-Day Returns</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
