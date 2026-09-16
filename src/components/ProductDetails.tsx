import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Check, Shield, Star, Plus, Minus, MessageSquare, Calendar, User, Heart, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { Product, Review } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ProductDetailsProps {
  product: Product;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  onGoBack: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onRequireAuth?: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export function ProductDetails({ 
  product, 
  onAddToCart, 
  onGoBack, 
  products, 
  setProducts, 
  onRequireAuth,
  isWishlisted,
  onToggleWishlist
}: ProductDetailsProps) {
  const { profile, user } = useAuth();
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string>('');

  // Multi-image gallery list
  const allImages = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    return product.imageUrl ? [product.imageUrl] : [];
  }, [product]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setCurrentIndex(0);
    setPurchaseQuantity(1);
    setReviewComment('');
    setReviewSuccessMsg('');
    // Scroll to top on load
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  const handleNextImage = () => {
    if (allImages.length <= 1) return;
    setSlideDirection(1);
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    if (allImages.length <= 1) return;
    setSlideDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
    touchStartX.current = null;
  };

  // Handle adding to cart with custom quantity support
  const handleAddToCart = () => {
    if (product.stock === 0) return;
    
    // Call onAddToCart multiple times based on the selected quantity
    for (let i = 0; i < purchaseQuantity; i++) {
      onAddToCart(product);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
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

    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      const data = await res.json();
      if (data.success && data.review) {
        newReview.id = data.review.id;
      }
    } catch (err) {
      console.error('Failed to post review to backend', err);
    }

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

  const reviewsList = product.reviews || [];
  const averageRating = reviewsList.length > 0
    ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1)
    : '0';

  return (
    <div className="w-full bg-black text-white relative animate-in fade-in duration-500 min-h-screen pb-24 overflow-x-hidden">
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
          
          {/* LEFT: Complete Interactive Sliding Image Gallery */}
          <div className="space-y-6">
            <div 
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative aspect-square w-full rounded-2xl bg-neutral-950 border border-neutral-900 flex items-center justify-center p-6 sm:p-8 overflow-hidden group select-none"
            >
              {allImages.length > 0 ? (
                <AnimatePresence initial={false} custom={slideDirection} mode="wait">
                  <motion.img 
                    key={currentIndex}
                    custom={slideDirection}
                    initial={{ opacity: 0, x: slideDirection > 0 ? 50 : -50, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: slideDirection > 0 ? -50 : 50, scale: 0.98 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    src={allImages[currentIndex]} 
                    alt={`${product.name} - view ${currentIndex + 1}`} 
                    referrerPolicy="no-referrer"
                    className="max-h-[85%] max-w-[90%] object-contain drop-shadow-[0_20px_50px_rgba(37,99,235,0.15)] transition-transform duration-500 group-hover:scale-105"
                  />
                </AnimatePresence>
              ) : (
                <span className="text-neutral-600 text-sm uppercase tracking-widest font-bold">No Image Available</span>
              )}

              {/* Badges: Condition and Image Counter */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                <span className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-sm">
                  {product.condition}
                </span>
              </div>

              {allImages.length > 1 && (
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
                  <span className="bg-neutral-900/80 text-neutral-300 border border-neutral-800 px-3 py-1.5 rounded-full text-xs font-mono font-medium backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    <span>{currentIndex + 1} / {allImages.length}</span>
                  </span>
                </div>
              )}

              {/* Sliding Arrow Controls (Left & Right) */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-blue-600 text-white border border-white/10 hover:border-blue-500 shadow-xl backdrop-blur-md transition-all duration-200 z-20 active:scale-95 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    aria-label="Next image"
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-blue-600 text-white border border-white/10 hover:border-blue-500 shadow-xl backdrop-blur-md transition-all duration-200 z-20 active:scale-95 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </>
              )}

              {/* Slider Dots */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-neutral-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-800">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSlideDirection(idx > currentIndex ? 1 : -1);
                        setCurrentIndex(idx);
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentIndex === idx ? 'w-6 bg-blue-500' : 'w-1.5 bg-neutral-600 hover:bg-neutral-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Carousel if supplementary images are available */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSlideDirection(idx > currentIndex ? 1 : -1);
                      setCurrentIndex(idx);
                    }}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      currentIndex === idx 
                        ? 'border-blue-500 bg-neutral-900 scale-105 shadow-lg shadow-blue-500/20' 
                        : 'border-neutral-900 bg-neutral-950/50 opacity-60 hover:opacity-100 hover:border-neutral-700'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1 py-0.2 bg-black/80 rounded text-neutral-300">
                      #{idx + 1}
                    </span>
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
                  className="flex-1 py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>

                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`py-4 px-6 border flex items-center justify-center gap-2 transition-all active:scale-95 text-xs font-bold uppercase tracking-widest ${
                    isWishlisted 
                      ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' 
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
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

                {!user ? (
                  <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-xl text-center space-y-4">
                    <p className="text-sm text-neutral-400">You must be signed in to write a review.</p>
                    <button
                      type="button"
                      onClick={onRequireAuth}
                      className="px-6 py-2.5 bg-white text-black font-bold text-xs tracking-widest uppercase rounded hover:bg-neutral-200 transition-colors inline-block"
                    >
                      Sign In / Register
                    </button>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
