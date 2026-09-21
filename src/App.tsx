import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import React, { useState, useMemo, useEffect } from "react";
import { Menu, ChevronDown, SlidersHorizontal, Lock, ArrowUp, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./components/Header";
import { ProductCard } from "./components/ProductCard";
import { ProductCardSkeleton } from "./components/Skeleton";
import { Filters } from "./components/Filters";
import { CartDrawer } from "./components/CartDrawer";
import { ProductOverviewPane } from "./components/ProductOverviewPane";
import { CheckoutView } from "./components/CheckoutView";
import { TrackingDashboard } from "./components/TrackingDashboard";
import { PrivacyPolicy, TermsOfService, RefundPolicy } from "./components/LegalPages";
import { UserProfileDashboard } from "./components/UserProfileDashboard";
import { AuthModal } from "./components/AuthModal";
import { ResetPasswordView } from "./components/ResetPasswordView";
import { VerifyEmailView } from "./components/VerifyEmailView";
import { AboutUs } from "./components/AboutUs";
import { ContactUs } from "./components/ContactUs";
import { FAQs } from "./components/FAQs";
import { TechOfTheDay } from "./components/TechOfTheDay";
import { ProductDetails } from "./components/ProductDetails";
import { ProductLaunchWaitlist } from "./components/ProductLaunchWaitlist";
import { Newsletter } from "./components/Newsletter";
import { HeroSlider } from "./components/HeroSlider";
import { useAuth } from "./contexts/AuthContext";
import { useToast } from "./contexts/ToastContext";
import { initialProducts, CATEGORIES as FALLBACK_CATEGORIES, BRANDS as FALLBACK_BRANDS, defaultHeroConfig } from "./data";
import { Category, Condition, CartItem, Product, Order, HeroConfig } from "./types";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function App() {
  const { user, profile, role } = useAuth();
  const { showToast } = useToast();

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('tizzitech_wishlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name =
      profile?.codename ||
      profile?.firstName ||
      user?.displayName ||
      "Traveler";
    if (hour < 12) return `Good Morning, ${name}`;
    if (hour < 18) return `Good Afternoon, ${name}`;
    return `Good Evening, ${name}`;
  };

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger when scrolled down (> 180px so it appears reliably on both mobile and desktop)
      const scrollPos =
        window.pageYOffset ||
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setShowBackToTop(scrollPos > 180);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    try {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch {
      window.scrollTo(0, 0);
    }
    if (document.documentElement) {
      try {
        document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        document.documentElement.scrollTop = 0;
      }
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  };

  useEffect(() => {
    localStorage.setItem('tizzitech_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.includes(product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((id) => id !== product.id));
      showToast(`"${product.name}" removed from wishlist.`, 'info');
    } else {
      setWishlist((prev) => [...prev, product.id]);
      showToast(`"${product.name}" added to wishlist.`, 'success');
    }
  };
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('tizzitech_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [view, setView] = useState<
    | "store"
    | "tracking"
    | "profile"
    | "about"
    | "techoftheday"
    | "contact"
    | "faqs"
    | "product-details"
    | "checkout"
    | "reset-password"
    | "verify-email"
    | "privacy"
    | "terms"
    | "refund"
    | "launch"
    | "admin"
  >("store");
  const [searchQuery, setSearchQuery] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [verifyToken, setVerifyToken] = useState<string | null>(null);

  useEffect(() => {
    const visitorId = localStorage.getItem('tizzitech_visitor_id') || `v_${Math.random().toString(36).substring(2,15)}`;
    if (!localStorage.getItem('tizzitech_visitor_id')) {
      localStorage.setItem('tizzitech_visitor_id', visitorId);
    }

    const logVisit = async () => {
      let clientGeo = null;
      try {
        const cached = localStorage.getItem('tizzitech_client_geo');
        if (cached) {
          clientGeo = JSON.parse(cached);
        } else {
          // Fetch from a highly reliable, HTTPS-friendly IP geolocation API with a tight 1.5s timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1500);
          const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            if (data && data.country_code) {
              clientGeo = {
                country: data.country_code.toUpperCase(),
                region: data.region || 'Unknown',
                city: data.city || 'Unknown'
              };
              localStorage.setItem('tizzitech_client_geo', JSON.stringify(clientGeo));
            }
          }
        }
      } catch (e) {
        console.warn('Client-side geo-IP lookup skipped/failed:', e);
      }

      fetch('/api/analytics/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, isRegistered: !!user, clientGeo })
      }).catch(() => {});
    };

    logVisit();
  }, [user]);
  useEffect(() => {
    // Parse URL for params like reset-password, verify-email and tracking
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const tokenParam = params.get('token');
    const orderIdParam = params.get('orderId');
    
    if (viewParam === 'reset-password' && tokenParam) {
      setResetToken(tokenParam);
      setView('reset-password');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (viewParam === 'verify-email' && tokenParam) {
      setVerifyToken(tokenParam);
      setView('verify-email');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (viewParam === 'tracking') {
      setView('tracking');
    } else if (viewParam === 'admin') {
      setView('admin');
    } else if (viewParam === 'launch') {
      setView('launch');
    }
  }, []);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  useEffect(() => {
    // Fetch products and settings from cached backend endpoints to reduce Firestore reads and scale seamlessly
    const loadProducts = async () => {
      setLoadingProducts(true);
      // 1. Fetch Settings from cached backend endpoint
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const s = await res.json();
          if (s.brands) setBrandsList(s.brands);
          if (s.categories) setCategoriesList(s.categories);
          if (s.deliveryZones) setDeliveryZones(s.deliveryZones);
          if (s.heroConfig) {
            setHeroConfig(s.heroConfig);
            localStorage.setItem('tizzitech_hero_config', JSON.stringify(s.heroConfig));
          }
        }
      } catch (err) {
        console.warn("Could not load latest global settings from cached backend:", err);
      }

      // Also fetch from Firestore settings/global if available
      try {
        const sSnap = await getDoc(doc(db, 'settings', 'global'));
        if (sSnap.exists()) {
          const sData = sSnap.data();
          if (sData.heroConfig) {
            setHeroConfig(sData.heroConfig);
            localStorage.setItem('tizzitech_hero_config', JSON.stringify(sData.heroConfig));
          }
        }
      } catch (err) {
        // offline or rules fallback
      }
      
      // 2. Fetch Products from cached backend endpoint
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setProducts(data as Product[]);
          }
        }
      } catch (err) {
        console.warn("Could not load latest products from cached backend:", err);
        // Products are already initialized with initialProducts, so the app will load successfully
      } finally {
        // Add a small delay for a smooth perceived experience
        setTimeout(() => {
          setLoadingProducts(false);
        }, 800);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (user && pendingCheckout) {
      setView("checkout");
      setPendingCheckout(false);
    }
  }, [user, pendingCheckout]);

  useEffect(() => {
    if (view === "admin") {
      window.location.href = "/admin.html";
    }
  }, [view]);

  // Persistent Orders for User
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (user) {
      // Fetch real orders from database using the token
      const fetchOrders = async () => {
        try {
          const token = localStorage.getItem('authToken');
          if (token && user.uid) {
            const res = await fetch(`/api/users/${encodeURIComponent(user.uid)}/orders`, {
              headers: {
                'Authorization': `Bearer ${token}`
              },
              cache: 'no-store'
            });
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              const data = await res.json();
              if (data.success && data.orders) {
                const mapped = data.orders.map((o: any) => ({
                  id: o.id,
                  address: o.address,
                  total: parseFloat(o.total),
                  status: o.status,
                  orderDate: new Date(o.orderDate),
                  expectedDeliveryDate: new Date(o.expectedDeliveryDate),
                  items: (o.items || []).map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    brand: item.brand,
                    price: parseFloat(item.price),
                    quantity: item.quantity,
                    imageUrl: item.imageUrl
                  }))
                }));
                
                if (mapped.length > 0) {
                  mapped.sort((a: any, b: any) => b.orderDate.getTime() - a.orderDate.getTime());
                  setOrders(mapped);
                  return;
                }
              }
            }
          }
        } catch (e: any) {
          if (e.message !== 'Failed to fetch') {
            console.error("Error fetching user orders:", e);
          }
        }
        
        // Fallback to local storage
        const storedOrders = localStorage.getItem(`tizzitech_orders_${user.uid}`);
        if (storedOrders) {
          try {
            const parsed = JSON.parse(storedOrders).map((o: any) => ({
              ...o,
              orderDate: new Date(o.orderDate),
              expectedDeliveryDate: new Date(o.expectedDeliveryDate),
            }));
            setOrders(parsed);
          } catch (e) {
            console.error("Error reading stored orders:", e);
          }
        }
      };
      fetchOrders();
      intervalId = setInterval(fetchOrders, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);



  // Persist guest orders whenever they change
  useEffect(() => {
    if (!user && orders.length > 0) {
      localStorage.setItem('tizzitech_guest_orders', JSON.stringify(orders));
    }
  }, [user, orders]);

  // Load guest orders from local storage

  useEffect(() => {
    if (!user) {
      const guestOrders = localStorage.getItem('tizzitech_guest_orders');
      if (guestOrders) {
        try {
          const parsed = JSON.parse(guestOrders).map((o: any) => ({
            ...o,
            orderDate: new Date(o.orderDate),
            expectedDeliveryDate: new Date(o.expectedDeliveryDate)
          }));
          // Only set if we don't already have orders to avoid overwrite issues during session
          if (orders.length === 0) {
            setOrders(parsed);
          }
        } catch (e) {
          console.error('Error parsing guest orders', e);
        }
      }
    }
  }, [user]);

  // Poll for order status updates
  const orderIdsKey = useMemo(() => orders.map(o => o.id).sort().join(','), [orders]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (orders.length > 0) {
      const fetchStatuses = async () => {
        try {
          const orderIds = orders.map(o => o.id);
          const res = await fetch('/api/orders/statuses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderIds })
          });
          
          const contentType = res.headers.get("content-type");
          if (res.ok && contentType && contentType.includes("application/json")) {
            const data = await res.json();
            if (data.success && data.statuses) {
              setOrders(prevOrders => {
                let changed = false;
                const updatedOrders = prevOrders.map(o => {
                  if (data.statuses[o.id] && data.statuses[o.id] !== o.status) {
                    changed = true;
                    return { ...o, status: data.statuses[o.id] as any };
                  }
                  return o;
                });

                if (changed) {
                  if (user) {
                    localStorage.setItem(`tizzitech_orders_${user.uid}`, JSON.stringify(updatedOrders));
                  } else {
                    localStorage.setItem('tizzitech_guest_orders', JSON.stringify(updatedOrders));
                  }
                  return updatedOrders;
                }
                return prevOrders;
              });
            }
          }
        } catch (e: any) {
          if (e.message !== 'Failed to fetch') {
            console.warn("Could not poll order statuses:", e?.message || e);
          }
        }
      };
      // Fetch immediately and then poll every 6s
      fetchStatuses();
      intervalId = setInterval(fetchStatuses, 6000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, orderIdsKey]);

  // Persist order updates to storage
  useEffect(() => {
    if (user && orders.length > 0) {
      localStorage.setItem(
        `tizzitech_orders_${user.uid}`,
        JSON.stringify(orders),
      );
    }
  }, [orders, user]);

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem('tizzitech_cart', JSON.stringify(cart));
  }, [cart]);

  // Clear user-specific data on logout
  useEffect(() => {
    if (!user) {
      setOrders([]);
      if (view === "profile" || view === "tracking") {
        setView("store");
      }
    }
  }, [user, view]);

  // Filters State
  const highestPriceLimit =
    Math.max(...initialProducts.map((p) => p.price)) + 500;
  const [selectedCategory, setSelectedCategory] = useState<
    Category | "All" | "Tech" | "Accessories"
  >("All");
  const [selectedCondition, setSelectedCondition] = useState<Condition | "All">(
    "All",
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(highestPriceLimit);
  const [brandsList, setBrandsList] = useState(FALLBACK_BRANDS);
  const [categoriesList, setCategoriesList] = useState(FALLBACK_CATEGORIES);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(() => {
    const saved = localStorage.getItem('tizzitech_hero_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.slides)) {
          const hasLegacyAi = parsed.slides.some((s: any) => s.title?.includes('ENGINEERED RIGHT'));
          if (hasLegacyAi) {
            localStorage.setItem('tizzitech_hero_config', JSON.stringify(defaultHeroConfig));
            return defaultHeroConfig;
          }
          return parsed;
        }
      } catch (e) {}
    }
    return defaultHeroConfig;
  });
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">(
    "newest",
  );

  // Scroll to top when view or category changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view, selectedCategory]);

  // Cart Handlers
  const addToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQ = item.quantity + delta;
          if (newQ < 1) return item;
          const product = products.find((p) => p.id === id);
          if (product && newQ > product.stock) return item;
          return { ...item, quantity: newQ };
        }
        return item;
      }),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedCategory !== "All") {
      if (selectedCategory === "Tech") {
        result = result.filter(
          (p) => p.category === "Laptops" || p.category === "Phones",
        );
      } else if (selectedCategory === "Accessories") {
        result = result.filter(
          (p) => p.category !== "Laptops" && p.category !== "Phones",
        );
      } else {
        result = result.filter((p) => p.category === selectedCategory);
      }
    }

    if (selectedCondition !== "All") {
      result = result.filter((p) => p.condition === selectedCondition);
    }

    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    if (maxPrice < highestPriceLimit) {
      result = result.filter((p) => p.price <= maxPrice);
    }

    if (sortBy === "price_asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else {
      // Add logic for 'newest' here if there is a date field,
      // or assume initial order is newest.
    }

    return result;
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedCondition,
    selectedBrands,
    maxPrice,
    highestPriceLimit,
    sortBy,
  ]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-black flex flex-col font-sans text-neutral-300 w-full max-w-[100vw] overflow-x-clip">
      {/* STATIC/STICKY TOP HEADER AREA (Pinned at top on Desktop & Mobile during scroll) */}
      <div className="sticky top-0 z-50 w-full bg-neutral-950/95 backdrop-blur-md shadow-lg shadow-black/50">
        <Header
          cartCount={cartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenTracking={() => setView("tracking")}
          onOpenProfile={() => setView("profile")}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenAbout={() => setView("about")}
          onOpenTechOfTheDay={() => setView("techoftheday")}
          onOpenLaunchWaitlist={() => setView("launch")}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setView("store");
            setSearchQuery("");
            setSelectedBrands([]);
            setSelectedCondition("All");
            setMaxPrice(highestPriceLimit);
          }}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchStart={() => setView("store")}
          onGoHome={() => {
            setView("store");
            setSelectedCategory("All");
            setSearchQuery("");
            setSelectedBrands([]);
            setSelectedCondition("All");
            setMaxPrice(highestPriceLimit);
          }}
          currentView={view}
        />

        {/* PROMINENT TOP PRODUCT LAUNCH ANNOUNCEMENT RIBBON */}
        {view === "store" && !searchQuery && selectedCategory === "All" && selectedBrands.length === 0 && (
          <aside 
            id="pre-launch-announcement-ribbon"
            aria-label="Pre-Launch 2026 Announcement"
            className="w-full relative bg-neutral-950/95 border-b border-neutral-850 backdrop-blur-md overflow-hidden"
          >
            {/* Subtle top accent ambient glow line */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-3 sm:gap-6">
              {/* Left Side: Badge & Highlighted Teaser */}
              <div 
                onClick={() => setView("launch")}
                className="flex items-center gap-2.5 sm:gap-3 min-w-0 cursor-pointer group flex-1"
              >
                {/* Badge: Single line, no wrapping */}
                <div className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold text-[11px] tracking-wider uppercase whitespace-nowrap shadow-sm">
                  <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
                  <span>Pre-Launch 2026</span>
                </div>

                {/* Hardware Drop Highlights */}
                <div className="flex items-center gap-2 text-xs text-neutral-300 min-w-0 truncate">
                  <span className="hidden sm:inline text-neutral-400 font-medium">Flagship Drops:</span>
                  <span className="font-medium text-neutral-100 truncate group-hover:text-blue-300 transition-colors">
                    Galaxy Z Fold 7, iPhone 18 Fold & Pixel 11 Pro
                  </span>
                  <span className="hidden md:inline-flex text-neutral-400 text-[11px] whitespace-nowrap">
                    • VIP Early Access & 7% Off
                  </span>
                </div>
              </div>

              {/* Right Side: Action Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="launch-waitlist-ribbon-btn"
                  onClick={() => setView("launch")}
                  className="group inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold tracking-wide transition-all shadow-sm hover:shadow-blue-600/30 whitespace-nowrap active:scale-95"
                >
                  <span>Join Waitlist</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      <main className="flex-1 w-full max-w-[100vw] bg-black relative overflow-x-clip">
        {view === "launch" ? (
          <ProductLaunchWaitlist onGoToStore={() => setView("store")} />
        ) : view === "techoftheday" ? (
          <TechOfTheDay />
        ) : view === "privacy" ? (
          <PrivacyPolicy />
        ) : view === "terms" ? (
          <TermsOfService />
        ) : view === "refund" ? (
          <RefundPolicy />
        ) : view === "about" ? (
          <AboutUs
            onShopNow={() => {
              setView("store");
              window.scrollTo({ top: 0, behavior: "smooth" });
              setTimeout(() => {
                document
                  .getElementById("product-grid")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          />
        ) : view === "contact" ? (
          <ContactUs />
        ) : view === "faqs" ? (
          <FAQs />
        ) : view === "product-details" && selectedProduct ? (
          <ProductDetails
            product={selectedProduct}
            onAddToCart={addToCart}
            onGoBack={() => setView("store")}
            products={products}
            setProducts={setProducts}
            onRequireAuth={() => setIsAuthOpen(true)}
            isWishlisted={wishlist.includes(selectedProduct.id)}
            onToggleWishlist={handleToggleWishlist}
          />
        ) : view === "checkout" ? (
          <CheckoutView cart={cart} deliveryZones={deliveryZones}
            hasPastOrders={orders.length > 0}
            onComplete={(newOrder) => {
              setOrders((prev) => [newOrder, ...prev]);
              setCart([]);
              setView("tracking");
            }}
            onCancel={() => setView("store")}
          />
        ) : view === "tracking" ? (
          <div className="relative z-10 pt-8 pb-16">
            <TrackingDashboard orders={orders} />
          </div>
        ) : view === "reset-password" && resetToken ? (
          <ResetPasswordView 
            token={resetToken} 
            onSuccess={() => setView("store")}
            onCancel={() => setView("store")}
          />
        ) : view === "verify-email" && verifyToken ? (
          <VerifyEmailView 
            token={verifyToken}
            onSuccess={() => setView("store")}
            onCancel={() => setView("store")}
          />
        ) : view === "profile" ? (
          <div className="relative z-10 pt-8 pb-16">
            <UserProfileDashboard 
              orders={orders} 
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={addToCart}
              products={products}
            />
          </div>
        ) : (
          <div className="relative z-10 w-full flex flex-col animate-in fade-in duration-500">
            {/* Hero Section with Animated Background Slideshow & Delivery Ticker */}
            {!searchQuery &&
              selectedCategory === "All" &&
              selectedBrands.length === 0 && (
                <HeroSlider
                  config={heroConfig}
                  greeting={user ? getGreeting() : undefined}
                  brands={brandsList}
                  onShopNow={() => {
                    document
                      .getElementById("product-grid")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  onSecondaryAction={(actionText) => {
                    if (actionText?.toLowerCase().includes("launch") || actionText?.includes("2026")) {
                      setView("launch");
                    } else if (actionText?.toLowerCase().includes("track")) {
                      setView("tracking");
                    } else if (actionText?.toLowerCase().includes("tech") || actionText?.toLowerCase().includes("day")) {
                      document.getElementById("tech-of-day")?.scrollIntoView({ behavior: "smooth" });
                    } else {
                      document.getElementById("product-grid")?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  onSelectBrand={(brand) => {
                    setSelectedBrands([brand]);
                    document
                      .getElementById("product-grid")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                />
              )}

            <div
              id="product-grid"
              className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-8"
            >
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <Filters
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedCondition={selectedCondition}
                  setSelectedCondition={setSelectedCondition}
                  selectedBrands={selectedBrands}
                  toggleBrand={toggleBrand}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  highestPriceLimit={highestPriceLimit}
                />
              </aside>

              <section className="flex-1 flex flex-col pt-4 min-w-0">
                {filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <h3 className="text-xl font-serif text-white mb-2 uppercase">
                      No products found
                    </h3>
                    <p className="text-neutral-500 max-w-sm">
                      Try adjusting your filters or search query.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("All");
                        setSelectedCondition("All");
                        setSelectedBrands([]);
                        setMaxPrice(highestPriceLimit);
                      }}
                      className="mt-6 text-blue-500 hover:text-blue-400 font-bold tracking-widest text-xs uppercase"
                    >
                      Clear all filters →
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 flex flex-wrap justify-between items-center text-xs tracking-widest uppercase font-bold text-neutral-500 border-b border-neutral-900 pb-4 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-white text-sm font-black tracking-widest truncate">
                          {selectedCategory === "All"
                            ? "ALL PRODUCTS"
                            : selectedCategory === "Tech"
                              ? "TIZZITECH STORE"
                              : selectedCategory === "Accessories"
                                ? "ACCESSORIES"
                                : selectedCategory}
                        </span>
                        <span className="text-neutral-600 font-mono shrink-0">
                          ({filteredProducts.length})
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-1 sm:gap-2 relative shrink-0">
                        {/* Mobile Hamburger for Condition */}
                        <div className="sm:hidden group">
                          <details className="relative">
                            <summary className="p-2 w-9 h-9 border border-neutral-800 bg-black text-neutral-400 flex items-center justify-center cursor-pointer list-none focus:outline-none flex-shrink-0">
                              <Menu className="w-4 h-4" />
                            </summary>
                            <div className="absolute top-full right-0 mt-2 w-32 bg-black border border-neutral-800 shadow-2xl z-50">
                              <div className="px-3 py-2 border-b border-neutral-900 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                                Condition
                              </div>
                              {["All", "New", "Used"].map((cond) => (
                                <button
                                  key={cond}
                                  onClick={() => {
                                    setSelectedCondition(cond as any);
                                    // Close details
                                    const details = document.activeElement?.closest("details");
                                    if(details) details.removeAttribute("open");
                                  }}
                                  className={`block w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                                    selectedCondition === cond ? "text-blue-500 bg-neutral-900/30" : "text-neutral-400 hover:bg-neutral-900/50 hover:text-white"
                                  }`}
                                >
                                  {cond}
                                </button>
                              ))}
                            </div>
                          </details>
                        </div>

                        {/* Desktop Condition Select */}
                        <div className="hidden sm:flex items-center">
                          <label htmlFor="condition" className="mr-1 text-xs uppercase tracking-widest font-bold text-neutral-500">
                            CONDITION:
                          </label>
                          <select
                            id="condition"
                            value={selectedCondition}
                            onChange={(e) =>
                              setSelectedCondition(e.target.value as any)
                            }
                            className="bg-black border border-neutral-800 text-white text-xs uppercase tracking-widest p-2 h-9 focus:outline-none focus:border-neutral-500 mr-2"
                          >
                            <option value="All">All Conditions</option>
                            <option value="New">New</option>
                            <option value="Used">Used</option>
                          </select>
                        </div>

                        <label htmlFor="sort" className="hidden sm:block mr-1 text-xs uppercase tracking-widest font-bold text-neutral-500">
                          SORT BY:
                        </label>
                        <select
                          id="sort"
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="bg-black border border-neutral-800 text-white text-[10px] sm:text-xs uppercase tracking-widest px-1 sm:px-2 py-1 h-9 focus:outline-none focus:border-neutral-500 min-w-[80px]"
                        >
                          <option value="newest">Newest</option>
                          <option value="price_asc">Price: Low - High</option>
                          <option value="price_desc">Price: High - Low</option>
                        </select>
                      </div>
                    </div>
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      key={
                        loadingProducts ? "loading" :
                        selectedCategory +
                        selectedCondition +
                        selectedBrands.join("") +
                        searchQuery +
                        maxPrice +
                        sortBy
                      }
                      className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      {loadingProducts ? (
                        Array.from({ length: 6 }).map((_, idx) => (
                          <motion.div key={idx} variants={itemVariants} className="h-full flex flex-col">
                            <ProductCardSkeleton />
                          </motion.div>
                        ))
                      ) : (
                        filteredProducts.map((product) => (
                          <motion.div
                            key={product.id}
                            variants={itemVariants}
                            layout
                            className="h-full flex flex-col"
                          >
                            <ProductCard
                              product={product}
                              onAddToCart={addToCart}
                              onViewProduct={(p) => {
                                setSelectedProduct(p);
                                setView("product-details");
                              }}
                              isWishlisted={wishlist.includes(product.id)}
                              onToggleWishlist={handleToggleWishlist}
                            />
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  </>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Newsletter */}
      <Newsletter />

      {/* Footer */}
      <footer className="w-full bg-black border-t border-neutral-900 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 font-serif font-black text-xl tracking-tighter text-white uppercase mb-6">
              <img
                src="/logo-icon.svg"
                alt="Tizzitech Logo"
                className="h-8 w-8 object-contain rounded-lg drop-shadow-[0_0_8px_rgba(2,132,199,0.4)]"
              />
              <span className="flex items-center">
                Tizzi<span className="text-blue-500">tech</span>
              </span>
            </div>
            <p className="text-neutral-500 text-sm max-w-xs">
              Premium Tech Gear and Accessories. A Brand you can trust for
              Quality and affordability.
            </p>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-6">
              Shop
            </h4>
            <div className="flex flex-col gap-4 text-sm text-neutral-500">
              <button
                onClick={() => {
                  setView("store");
                  setSelectedCategory("All");
                  setSearchQuery("");
                  setSelectedBrands([]);
                  setSelectedCondition("All");
                  setMaxPrice(highestPriceLimit);
                }}
                className="text-left hover:text-white transition-colors"
              >
                All Products
              </button>
              <button
                onClick={() => {
                  setView("store");
                  setSelectedCategory("Laptops");
                  setSearchQuery("");
                  setSelectedBrands([]);
                  setSelectedCondition("All");
                  setMaxPrice(highestPriceLimit);
                }}
                className="text-left hover:text-white transition-colors"
              >
                Laptops
              </button>
              <button
                onClick={() => {
                  setView("store");
                  setSelectedCategory("Phones");
                  setSearchQuery("");
                  setSelectedBrands([]);
                  setSelectedCondition("All");
                  setMaxPrice(highestPriceLimit);
                }}
                className="text-left hover:text-white transition-colors"
              >
                Phones
              </button>
              <button
                onClick={() => {
                  setView("store");
                  setSelectedCategory("Chargers");
                  setSearchQuery("");
                  setSelectedBrands([]);
                  setSelectedCondition("All");
                  setMaxPrice(highestPriceLimit);
                }}
                className="text-left hover:text-white transition-colors"
              >
                Accessories
              </button>
            </div>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-6">
              Info
            </h4>
            <div className="flex flex-col gap-4 text-sm text-neutral-500 items-start">
              <button
                onClick={() => setView("about")}
                className="text-left hover:text-white transition-colors"
              >
                About Us
              </button>
              <button
                onClick={() => setView("contact")}
                className="text-left hover:text-white transition-colors"
              >
                Contact
              </button>
              <button
                onClick={() => setView("tracking")}
                className="text-left hover:text-white text-white font-medium transition-colors"
              >
                Track Order
              </button>
              <button
                onClick={() => setView("faqs")}
                className="text-left hover:text-white transition-colors"
              >
                FAQs
              </button>
            
              <button
                onClick={() => setView("privacy")}
                className="text-left hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setView("terms")}
                className="text-left hover:text-white transition-colors"
              >
                Terms of Service
              </button>
              <button
                onClick={() => setView("refund")}
                className="text-left hover:text-white transition-colors"
              >
                Refund Policy
              </button>

            </div>
          </div>
          <div>
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-6">
              Contact
            </h4>
            <div className="flex flex-col gap-4 text-sm text-neutral-500 items-start">
              <a
                href="https://wa.me/message/YOUR_WHATSAPP_LINK"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                WhatsApp Us
              </a>
              <a
                href="mailto:hello@tizzitech.com.ng"
                className="hover:text-white transition-colors"
              >
                hello@tizzitech.com.ng
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-neutral-900 text-center text-sm text-neutral-500">
          Copyright &copy; 2026 Tizzitech Team. All rights reserved.
        </div>
</footer>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          if (!user) {
            setPendingCheckout(true);
            setIsAuthOpen(true);
          } else {
            setView("checkout");
          }
        }}
      />

      {/* Product details are handled on full-screen landing pages */}

      {isAuthOpen && <AuthModal onClose={() => {
        setIsAuthOpen(false);
        setPendingCheckout(false);
      }} />}

      {/* Floating Back to Top Button (Universal Desktop & Mobile) */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            key="back-to-top"
            id="back-to-top-btn"
            initial={{ opacity: 0, scale: 0.8, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={scrollToTop}
            aria-label="Back to top"
            title="Back to Top"
            className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-neutral-900/95 sm:bg-neutral-900/90 hover:bg-blue-600 active:bg-blue-700 text-neutral-300 hover:text-white border border-neutral-750 hover:border-blue-500 shadow-2xl shadow-black/80 backdrop-blur-md transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer active:scale-90 flex items-center justify-center touch-manipulation select-none"
          >
            <ArrowUp className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-active:-translate-y-1 text-neutral-200 group-hover:text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
