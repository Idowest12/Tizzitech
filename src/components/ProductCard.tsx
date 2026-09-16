import React, { useState } from 'react';
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
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

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length <= 1) return;
    setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length <= 1) return;
    setCurrentImgIdx((prev) => (prev + 1) % images.length);
  };

  const activeSrc = images[currentImgIdx] || product.imageUrl;

  return (
    <div 
      onClick={() => onViewProduct(product)}
      className="group relative flex flex-col bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-900 hover:border-neutral-700/80 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer select-none"
    >
      <div className="aspect-[4/3] bg-neutral-900 overflow-hidden relative border-b border-neutral-900 flex items-center justify-center rounded-t-2xl">
        {activeSrc ? (
          <img
            key={activeSrc}
            src={activeSrc}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center rounded-t-2xl transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span className="text-neutral-700 text-xs uppercase tracking-widest font-bold">No Image</span>
        )}

        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20">
          <span className="inline-flex items-center bg-white px-2 py-0.5 text-[9px] font-bold text-black uppercase tracking-widest rounded shadow-sm">
            FEATURED
          </span>
          <span className="inline-flex items-center bg-neutral-950/90 backdrop-blur-sm border border-neutral-800 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-widest rounded shadow-sm">
            {product.condition}
          </span>
          {images.length > 1 && (
            <span className="inline-flex items-center gap-1 bg-black/75 backdrop-blur-sm border border-neutral-700/80 px-2 py-0.5 text-[9px] font-mono text-neutral-300 rounded shadow-sm">
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

        {/* Image Sliding Navigation Arrows (Appear on Card Hover or Touch) */}
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

      <div className="flex flex-col space-y-1 p-5 bg-neutral-950 flex-1 rounded-b-2xl">
        <h3 className="text-sm font-medium text-neutral-400 line-clamp-1 w-full truncate">
           <span className="font-bold text-white">{product.brand}</span> {product.name}
        </h3>
        
        <div className="flex-1">
          {product.description && (
             <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
               {product.description}
             </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 mt-auto border-t border-neutral-900">
          <p className="text-lg font-serif font-bold text-white mt-1">
            ₦{product.price.toLocaleString()}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={product.stock === 0}
            className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-widest active:scale-95 cursor-pointer"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
        
        {product.stock > 0 && product.stock <= 5 && (
           <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider mt-1">Only {product.stock} left!</p>
        )}
      </div>
    </div>
  );
}
