import React, { useState } from 'react';
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, Camera, Laptop, Smartphone, Headphones, Mouse, Watch, Package } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  onViewProduct: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onViewProduct,
  isWishlisted,
  onToggleWishlist
}) => {
  const images = product.images && product.images.length > 0 ? product.images : (product.imageUrl ? [product.imageUrl] : []);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [imgError, setImgError] = useState(false);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length <= 1) return;
    setImgError(false);
    setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length <= 1) return;
    setImgError(false);
    setCurrentImgIdx((prev) => (prev + 1) % images.length);
  };

  const activeSrc = images[currentImgIdx] || product.imageUrl;

  // Clean brand deduplication: avoid "Dell Dell Alienware"
  const rawBrand = (product.brand || '').trim();
  const rawName = (product.name || '').trim();
  const displayName = rawBrand && rawName.toLowerCase().startsWith(rawBrand.toLowerCase())
    ? rawName.slice(rawBrand.length).trim()
    : rawName;

  // Render category icon for fallback
  const renderFallbackIcon = () => {
    const cat = (product.category || '').toLowerCase();
    if (cat.includes('laptop') || cat.includes('computer')) return <Laptop className="w-10 h-10 text-neutral-600" />;
    if (cat.includes('phone')) return <Smartphone className="w-10 h-10 text-neutral-600" />;
    if (cat.includes('audio') || cat.includes('headphone')) return <Headphones className="w-10 h-10 text-neutral-600" />;
    if (cat.includes('mouse') || cat.includes('accessory')) return <Mouse className="w-10 h-10 text-neutral-600" />;
    if (cat.includes('watch')) return <Watch className="w-10 h-10 text-neutral-600" />;
    return <Package className="w-10 h-10 text-neutral-600" />;
  };

  // Consistent 2-line description or spec preview to prevent unequal card heights
  const displayDescription = product.description && product.description.trim().length > 0
    ? product.description
    : (product.specs 
        ? Object.values(product.specs).filter(Boolean).slice(0, 3).join(' • ') 
        : 'Official Warranty · Certified Tech · Fast Dispatch');

  return (
    <div 
      onClick={() => onViewProduct(product)}
      className="group relative flex flex-col h-full bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-900 hover:border-neutral-700/80 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer select-none"
    >
      {/* 4:3 Image Aspect Container */}
      <div className="aspect-[4/3] w-full bg-neutral-900 overflow-hidden relative border-b border-neutral-900/90 flex items-center justify-center shrink-0 rounded-t-2xl">
        {activeSrc && !imgError ? (
          <img
            key={activeSrc}
            src={activeSrc}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover object-center rounded-t-2xl transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-4 text-center bg-gradient-to-b from-neutral-900 to-neutral-950 w-full h-full">
            {renderFallbackIcon()}
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{product.brand || 'Tizzitech'}</span>
            <span className="text-[9px] text-neutral-600 font-medium">{product.category || 'Official Product'}</span>
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20 flex-wrap max-w-[80%]">
          <span className="inline-flex items-center bg-white px-2 py-0.5 text-[9px] font-bold text-black uppercase tracking-widest rounded shadow-sm shrink-0">
            FEATURED
          </span>
          <span className="inline-flex items-center bg-neutral-950/90 backdrop-blur-sm border border-neutral-800 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-widest rounded shadow-sm shrink-0">
            {product.condition}
          </span>
          {product.stock > 0 && product.stock <= 5 && (
            <span className="inline-flex items-center bg-amber-500 text-black px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded shadow-sm shrink-0 animate-pulse">
              ONLY {product.stock} LEFT
            </span>
          )}
          {product.stock === 0 && (
            <span className="inline-flex items-center bg-rose-600/90 text-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded shadow-sm shrink-0">
              SOLD OUT
            </span>
          )}
          {images.length > 1 && (
            <span className="inline-flex items-center gap-1 bg-black/75 backdrop-blur-sm border border-neutral-700/80 px-2 py-0.5 text-[9px] font-mono text-neutral-300 rounded shadow-sm shrink-0">
              <Camera className="w-2.5 h-2.5 text-blue-400" />
              {currentImgIdx + 1}/{images.length}
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product, e);
          }}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors z-20 group/heart"
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart 
            className={`w-4 h-4 transition-all duration-300 ${
              isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : 'text-neutral-300 group-hover/heart:text-rose-400 group-hover/heart:scale-110'
            }`} 
          />
        </button>

        {/* Image Sliding Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/70 hover:bg-blue-600 text-white border border-white/10 hover:border-blue-500 shadow-md backdrop-blur-sm transition-all duration-200 z-20 opacity-0 group-hover:opacity-100 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/70 hover:bg-blue-600 text-white border border-white/10 hover:border-blue-500 shadow-md backdrop-blur-sm transition-all duration-200 z-20 opacity-0 group-hover:opacity-100 active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Miniature Pagination Dots */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full border border-neutral-800">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgError(false);
                    setCurrentImgIdx(idx);
                  }}
                  className={`h-1 rounded-full transition-all duration-200 ${
                    currentImgIdx === idx ? 'w-3.5 bg-blue-400' : 'w-1 bg-neutral-500 hover:bg-neutral-300'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details Box - Flex column taking full remaining height */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 bg-neutral-950 rounded-b-2xl justify-between">
        <div className="flex flex-col">
          {/* Title row with fixed 2-line height for 100% uniformity */}
          <div className="h-10 sm:h-11 flex items-start overflow-hidden">
            <h3 className="text-sm font-medium text-neutral-300 line-clamp-2 leading-snug w-full">
              <span className="font-bold text-white mr-1">{product.brand}</span>
              {displayName || product.name}
            </h3>
          </div>
          
          {/* Description row with fixed 2-line height for 100% uniformity */}
          <div className="h-9 mt-1.5 overflow-hidden">
            <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
              {displayDescription}
            </p>
          </div>
        </div>

        {/* Price & Action Button Row - Always pinned to bottom with mt-auto */}
        <div className="flex items-center justify-between gap-2 pt-3.5 mt-4 border-t border-neutral-900/90">
          <div className="shrink-0">
            <p className="text-base sm:text-lg font-bold text-white tracking-tight whitespace-nowrap">
              ₦{product.price.toLocaleString()}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={product.stock === 0}
            className={`shrink-0 px-3 sm:px-3.5 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-xl whitespace-nowrap flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm ${
              product.stock === 0
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-blue-600/20'
            }`}
          >
            {product.stock === 0 ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

