import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  onViewProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewProduct }) => {
  return (
    <div 
      onClick={() => onViewProduct(product)}
      className="group relative flex flex-col bg-transparent cursor-pointer"
    >
      <div className="aspect-[4/3] bg-neutral-900 overflow-hidden relative border border-neutral-900 border-b-0 flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span className="text-neutral-700 text-xs uppercase tracking-widest font-bold">No Image</span>
        )}
        <div className="absolute top-2 left-2 flex gap-2">
            <span className="inline-flex items-center bg-white px-2 py-1 text-[10px] font-bold text-black uppercase tracking-widest shadow-sm">
                FEATURED
            </span>
            <span className="inline-flex items-center bg-neutral-950 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-widest shadow-sm">
                {product.condition}
            </span>
        </div>
        
        {/* Hover overlay button style */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="bg-white text-black text-xs font-bold uppercase tracking-widest px-6 py-3 flex items-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                VIEW PRODUCT →
            </span>
        </div>
      </div>

      <div className="flex flex-col space-y-1 p-4 bg-neutral-950 border border-neutral-900 border-t-0 flex-1">
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
            className="flex items-center justify-center rounded-none bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-widest"
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
