import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Check, Shield, Star, Plus, Minus, MessageSquare, Calendar, User } from 'lucide-react';
import { Product, Review } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ProductDetailsProps {
  product: Product;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  onGoBack: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export function ProductDetails({ product, onAddToCart, onGoBack, products, setProducts }: ProductDetailsProps) {
  const { profile, user } = useAuth();
  const [activeImage, setActiveImage] = useState<string>('');
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string>('');

  useEffect(() => {
    setActiveImage(product.images && product.images.length > 0 ? product.images[0] : product.imageUrl);
    setPurchaseQuantity(1);
    setReviewComment('');
    setReviewSuccessMsg('');
    // Scroll to top on load
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  // Handle adding to cart with custom quantity support
  const handleAddToCart = () => {
    if (product.stock === 0) return;
    
    // Call onAddToCart multiple times based on the selected quantity
    for (let i = 0; i < purchaseQuantity; i++) {
      onAddToCart(product);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const reviewAuthor = profile?.firstName ? profile.firstName : (user?.displayName || 'Anonymous');

    const newReview: Review = {
      id: 'rev_' + Date.now(),
      author: reviewAuthor,
      rating: ratingInput,
      comment: reviewComment.trim(),
      date: new Date().toISOString().split('T')[0]
    };

    // Update global products list with the new review so it persists
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === product.id) {
          const currentReviews = p.reviews || [];
          return {
            ...p,
            reviews: [newReview, ...currentReviews]
          };
        }
        return p;
      })
    );

    // Also update dynamic product view immediately
    if (!product.reviews) {
      product.reviews = [];
    }
    product.reviews = [newReview, ...product.reviews];

    // Reset review input fields
    setReviewComment('');
    setRatingInput(5);
    setReviewSuccessMsg('Thank you! Your satisfaction review has been published.');
    
    setTimeout(() => {
      setReviewSuccessMsg('');
    }, 4000);
  };

  // Get current average rating and count
  const reviewsList = product.reviews || [];
  const averageRating = reviewsList.length > 0
    ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1)
    : '0';

  return (
    <div className="w-full bg-black text-white relative animate-in fade-in duration-500 min-h-screen pb-24">
      {/* Navigation Header bar and path */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button 
          onClick={onGoBack}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold py-2 px-4 border border-neutral-900 rounded bg-neutral-950/40"
        >
          <ArrowLeft className="w-4 h-4 text-blue-500" />
          <span>Back to products</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* LEFT: Complete Interactive Image Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-square w-full rounded-2xl bg-neutral-950 border border-neutral-900 flex items-center justify-center p-8 overflow-hidden group">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={activeImage || undefined} 
                alt={product.name} 
                className="max-h-[80%] max-w-[85%] object-contain drop-shadow-[0_20px_50px_rgba(37,99,235,0.15)] transition-all duration-500 group-hover:scale-105"
              />
              
              <div className="absolute top-6 right-6">
                <span className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                  {product.condition}
                </span>
              </div>
            </div>

            {/* Thumbnail Carousel if supplementary images are details */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImage === img ? 'border-blue-600 bg-neutral-900 scale-105' : 'border-neutral-900 bg-neutral-950/50 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Complete Product Information Landing Details */}
          <div className="flex flex-col space-y-8">
            <div>
              <div className="text-blue-500 font-bold tracking-widest text-xs uppercase mb-2">{product.brand}</div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black uppercase tracking-tighter text-white leading-tight mb-4">
                {product.name}
              </h1>

              {/* Average Star Score */}
              <div className="flex items-center gap-3 mt-2 border-b border-neutral-900 pb-4">
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={`w-4 h-4 ${s <= Math.round(Number(averageRating)) ? 'fill-current' : 'text-neutral-700'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-neutral-300">{averageRating !== '0' ? `${averageRating} / 5.0` : 'No reviews'}</span>
                <span className="text-neutral-600">|</span>
                <span className="text-xs text-neutral-500 tracking-wider uppercase font-medium">{reviewsList.length} Customer Reviews</span>
              </div>
            </div>

            {/* Price display with beautiful visual box */}
            <div className="bg-neutral-950/60 border border-neutral-900 p-6 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Affordable Price</div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-white">₦{product.price.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Availability</div>
                <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${product.stock > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  <Check className="w-4 h-4" />
                  <span>{product.stock > 0 ? `${product.stock} In Stock` : 'Out of stock'}</span>
                </div>
              </div>
            </div>

            {/* Description Card */}
            {product.description && (
              <div className="space-y-3">
                <h3 className="text-xs text-neutral-400 font-bold tracking-widest uppercase border-b border-neutral-900 pb-2">Description</h3>
                <p className="text-neutral-400 leading-relaxed font-light text-sm sm:text-base">
                  {product.description}
                </p>
              </div>
            )}

            {/* Product Specifications Layout Grid */}
            <div className="space-y-4">
              <h3 className="text-xs text-neutral-400 font-bold tracking-widest uppercase border-b border-neutral-900 pb-2">Specifications</h3>
              {product.specs && Object.keys(product.specs).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 flex flex-col justify-center">
                      <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1">{key}</div>
                      <div className="text-sm text-neutral-200 font-medium">{value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm italic">No specific technical data available.</p>
              )}
            </div>

            {/* Cart Interactive CTA controls */}
            <div className="space-y-4 pt-6 border-t border-neutral-900">
              <div className="flex flex-col sm:flex-row gap-4">
                {product.stock > 0 && (
                  <div className="flex items-center justify-between border border-neutral-800 bg-neutral-950 p-2 shrink-0">
                    <button 
                      onClick={() => setPurchaseQuantity(prev => Math.max(1, prev - 1))}
                      className="p-2 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-mono font-bold text-sm text-white">{purchaseQuantity}</span>
                    <button 
                      onClick={() => setPurchaseQuantity(prev => Math.min(product.stock, prev + 1))}
                      className="p-2 hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest text-neutral-500 pt-2">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <span>Genuine Tech Warranty • Speedy Lagos & Nationwide dispatch</span>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS & SATISFACTION FEEDBACK MODULE */}
        <div className="mt-24 border-t border-neutral-900 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            
            {/* Satisfaction Metric Breakdown */}
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-black uppercase tracking-tight text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                <span>Customer Satisfaction</span>
              </h2>

              <div className="bg-neutral-950/50 border border-neutral-900 rounded-2xl p-6 space-y-4">
                <div className="text-center py-4 bg-neutral-950 border border-neutral-900/40 rounded-xl">
                  <div className="text-4xl font-black font-mono text-white mb-1">{averageRating}</div>
                  <div className="flex justify-center text-amber-500 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={`w-4 h-4 ${s <= Math.round(Number(averageRating)) ? 'fill-current' : 'text-neutral-800'}`} 
                      />
                    ))}
                  </div>
                  <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">satisfaction rating • {reviewsList.length} reviews</div>
                </div>

                {/* Rating bars for satisfaction level details */}
                <div className="space-y-2 pt-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviewsList.filter((r) => r.rating === stars).length;
                    const percent = reviewsList.length > 0 ? (count / reviewsList.length) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs text-neutral-400">
                        <span className="w-3 font-bold">{stars}★</span>
                        <div className="flex-1 bg-neutral-900 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-8 text-neutral-500 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* List of Reviews Display */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-xs text-neutral-500 font-bold tracking-widest uppercase mb-4">Latest Feedback Reviews ({reviewsList.length})</h3>
                {reviewsList.length === 0 ? (
                  <div className="bg-neutral-950/40 border border-neutral-900 p-8 rounded-xl text-center text-neutral-500 text-sm">
                    No reviews yet. Be the first to express your satisfaction levels!
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviewsList.map((rev) => (
                      <div key={rev.id} className="bg-neutral-950/40 border border-neutral-900 p-6 rounded-xl space-y-3 transition-colors hover:border-neutral-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-blue-500">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white">{rev.author}</div>
                              <div className="flex items-center text-amber-500 mt-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star 
                                    key={s} 
                                    className={`w-3 h-3 ${s <= rev.rating ? 'fill-current' : 'text-neutral-800'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
                            <Calendar className="w-3 h-3" />
                            <span>{rev.date}</span>
                          </div>
                        </div>
                        <p className="text-sm text-neutral-300 leading-relaxed pl-10 font-light">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit a review Form */}
              <div className="bg-neutral-950 border border-neutral-900 p-8 rounded-2xl space-y-6">
                <div>
                  <h3 className="text-lg font-serif font-black uppercase text-white">Write a Review</h3>
                  <p className="text-xs text-neutral-500 mt-1">Share your product satisfaction feedback with the Tizzitech community.</p>
                </div>

                {reviewSuccessMsg && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
                    {reviewSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2">Satisfaction Rating</label>
                      <div className="flex items-center gap-1 py-1.5">
                        {[1, 2, 3, 4, 5].map((stars) => (
                          <button
                            key={stars}
                            type="button"
                            onClick={() => setRatingInput(stars)}
                            onMouseEnter={() => setHoverRating(stars)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="text-amber-500 hover:scale-110 transition-transform transform p-1"
                          >
                            <Star 
                              className={`w-6 h-6 ${
                                stars <= (hoverRating ?? ratingInput) ? 'fill-current text-amber-500' : 'text-neutral-700'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2">My Feedback Review</label>
                    <textarea 
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience about performance, quality, and service satisfaction levels..."
                      className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      required 
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-widest uppercase transition-colors"
                  >
                    Submit Satisfaction Review
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
