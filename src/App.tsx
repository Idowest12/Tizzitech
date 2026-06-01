import React, { useState, useMemo, useEffect } from "react";
import { Menu, ChevronDown, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./components/Header";
import { ProductCard } from "./components/ProductCard";
import { Filters } from "./components/Filters";
import { CartDrawer } from "./components/CartDrawer";
import { AdminDashboard } from "./components/AdminDashboard";
import { ProductOverviewPane } from "./components/ProductOverviewPane";
import { CheckoutView } from "./components/CheckoutView";
import { TrackingDashboard } from "./components/TrackingDashboard";
import { UserProfileDashboard } from "./components/UserProfileDashboard";
import { AuthModal } from "./components/AuthModal";
import { AboutUs } from "./components/AboutUs";
import { ContactUs } from "./components/ContactUs";
import { FAQs } from "./components/FAQs";
import { TechOfTheDay } from "./components/TechOfTheDay";
import { ProductDetails } from "./components/ProductDetails";
import { useAuth } from "./contexts/AuthContext";
import { initialProducts, CATEGORIES } from "./data";
import { Category, Condition, CartItem, Product, Order } from "./types";

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
  const { user, profile } = useAuth();

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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [view, setView] = useState<
    | "store"
    | "admin"
    | "tracking"
    | "profile"
    | "about"
    | "techoftheday"
    | "contact"
    | "faqs"
    | "product-details"
    | "checkout"
  >("store");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Persistent Orders for User
  useEffect(() => {
    if (user) {
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
      } else {
        // Seed some beautiful, realistic order history spanning March, April, May 2026
        const seedOrders: Order[] = [
          {
            id: "TZ-20260315-AX9",
            address: "15, Isaac John Street, G.R.A, Ikeja, Lagos",
            total: 1215000,
            status: "Delivered",
            orderDate: new Date("2026-03-15T11:20:00Z"),
            expectedDeliveryDate: new Date("2026-03-18T14:30:00Z"),
            items: [
              {
                id: "p2",
                name: "Dell XPS 15",
                category: "Laptops",
                brand: "Dell",
                price: 1200000,
                condition: "Used",
                stock: 2,
                imageUrl:
                  "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
                quantity: 1,
              },
              {
                id: "p8",
                name: "Logitech Pebble Mouse",
                category: "Mouse",
                brand: "Logitech",
                price: 15000,
                condition: "New",
                stock: 12,
                imageUrl:
                  "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
                quantity: 1,
              },
            ],
          },
          {
            id: "TZ-20260408-BN2",
            address: "Block B4, Flat 6, Lekki Gardens Phase 4, Lekki, Lagos",
            total: 35000,
            status: "Delivered",
            orderDate: new Date("2026-04-08T09:12:00Z"),
            expectedDeliveryDate: new Date("2026-04-11T12:00:00Z"),
            items: [
              {
                id: "p9",
                name: "USB-C Fast Charger 65W",
                category: "Chargers",
                brand: "Anker",
                price: 25000,
                condition: "New",
                stock: 20,
                imageUrl:
                  "https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&w=800&q=80",
                quantity: 1,
              },
              {
                id: "p12",
                name: "Heavy Duty Phone Case",
                category: "Case Protector",
                brand: "Spigen",
                price: 10000,
                condition: "New",
                stock: 15,
                imageUrl:
                  "https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?auto=format&fit=crop&w=800&q=80",
                quantity: 1,
              },
            ],
          },
          {
            id: "TZ-20260512-CQ4",
            address:
              "Apartment 3A, Tower C, Eko Atlantic City, Victoria Island, Lagos",
            total: 724000,
            status: "Delivered",
            orderDate: new Date("2026-05-12T14:45:00Z"),
            expectedDeliveryDate: new Date("2026-05-15T15:10:00Z"),
            items: [
              {
                id: "p3",
                name: "iPhone 13 Pro",
                category: "Phones",
                brand: "Apple",
                price: 699000,
                condition: "Used",
                stock: 8,
                imageUrl:
                  "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80",
                quantity: 1,
              },
              {
                id: "p9",
                name: "USB-C Fast Charger 65W",
                category: "Chargers",
                brand: "Anker",
                price: 25000,
                condition: "New",
                stock: 20,
                imageUrl:
                  "https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&w=800&q=80",
                quantity: 1,
              },
            ],
          },
          {
            id: "TZ-20260528-DY5",
            address: "67, Adeniran Ogunsanya Street, Surulere, Lagos",
            total: 3514000,
            status: "In Transit",
            orderDate: new Date("2026-05-28T16:30:00Z"),
            expectedDeliveryDate: new Date("2026-06-01T12:00:00Z"),
            items: [
              {
                id: "p1",
                name: 'MacBook Pro 16" M2 Max',
                category: "Laptops",
                brand: "Apple",
                price: 3499000,
                condition: "New",
                stock: 5,
                imageUrl:
                  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
                quantity: 1,
              },
              {
                id: "p8",
                name: "Logitech Pebble Mouse",
                category: "Mouse",
                brand: "Logitech",
                price: 15000,
                condition: "New",
                stock: 12,
                imageUrl:
                  "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
                quantity: 1,
              },
            ],
          },
        ];
        setOrders(seedOrders);
        localStorage.setItem(
          `tizzitech_orders_${user.uid}`,
          JSON.stringify(seedOrders),
        );
      }
    }
  }, [user]);

  // Persist order updates to storage
  useEffect(() => {
    if (user && orders.length > 0) {
      localStorage.setItem(
        `tizzitech_orders_${user.uid}`,
        JSON.stringify(orders),
      );
    }
  }, [orders, user]);

  // Clear user-specific data on logout
  useEffect(() => {
    if (!user) {
      setOrders([]);
      setCart([]);
      if (view === "profile" || view === "tracking" || view === "admin") {
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

  // Admin Handlers
  const updateStock = (id: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, stock: newStock } : item,
      ),
    );
  };

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
    <div className="min-h-screen bg-black flex flex-col font-sans text-neutral-300">
      <Header
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setView("admin")}
        onOpenTracking={() => setView("tracking")}
        onOpenProfile={() => setView("profile")}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAbout={() => setView("about")}
        onOpenTechOfTheDay={() => setView("techoftheday")}
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
        onGoHome={() => {
          setView("store");
          setSelectedCategory("All");
          setSearchQuery("");
          setSelectedBrands([]);
          setSelectedCondition("All");
          setMaxPrice(highestPriceLimit);
        }}
      />

      <main className="flex-1 w-full bg-black relative">
        {view === "techoftheday" ? (
          <TechOfTheDay />
        ) : view === "about" ? (
          <AboutUs />
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
          />
        ) : view === "checkout" ? (
          <CheckoutView
            cart={cart}
            hasPastOrders={orders.length > 0}
            onComplete={(newOrder) => {
              setOrders((prev) => [newOrder, ...prev]);
              setCart([]);
              setView("tracking");
            }}
            onCancel={() => setView("store")}
          />
        ) : view === "admin" ? (
          <div className="relative z-10 pt-8 pb-16">
            <AdminDashboard products={products} onUpdateStock={updateStock} />
          </div>
        ) : view === "tracking" ? (
          <div className="relative z-10 pt-8 pb-16">
            <TrackingDashboard orders={orders} />
          </div>
        ) : view === "profile" ? (
          <div className="relative z-10 pt-8 pb-16">
            <UserProfileDashboard orders={orders} />
          </div>
        ) : (
          <div className="relative z-10 w-full flex flex-col animate-in fade-in duration-500">
            {/* Hero Section */}
            {!searchQuery &&
              selectedCategory === "All" &&
              selectedBrands.length === 0 && (
                <div className="w-full bg-neutral-950 py-16 sm:py-24 border-b border-neutral-900">
                  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                      {user && (
                        <p className="text-blue-500 font-bold tracking-widest text-xs uppercase mb-4">
                          {getGreeting()}
                        </p>
                      )}
                      <h1 className="font-serif text-4xl sm:text-7xl font-black text-white leading-none uppercase mb-6 mt-4">
                        Tech <br />
                        <span className="text-blue-600">Accessories</span>
                      </h1>
                      <p className="text-neutral-400 max-w-md text-lg mb-8">
                        Laptops, phones, keyboards & tech accessories —
                        everything in one place.
                      </p>
                      <button
                        onClick={() => {
                          document
                            .getElementById("product-grid")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="bg-blue-600 text-white font-bold py-3 px-8 text-sm tracking-widest uppercase hover:bg-blue-700 transition-colors flex items-center gap-4"
                      >
                        Shop Now →
                      </button>
                    </div>
                    <div className="hidden lg:block relative">
                      <div className="aspect-[4/3] bg-neutral-900 overflow-hidden ml-[38px] flex items-center justify-center p-8">
                        <img
                          src="https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=2662&auto=format&fit=crop"
                          alt="Hero Featured Logo"
                          className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 opacity-80 rounded-2xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
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

              <section className="flex-1 flex flex-col pt-4">
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
                    <div className="mb-6 flex justify-between items-center text-xs tracking-widest uppercase font-bold text-neutral-500 border-b border-neutral-900 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-black tracking-widest">
                          {selectedCategory === "All"
                            ? "ALL PRODUCTS"
                            : selectedCategory === "Tech"
                              ? "TIZZITECH STORE"
                              : selectedCategory === "Accessories"
                                ? "ACCESSORIES"
                                : selectedCategory}
                        </span>
                        <span className="text-neutral-600 font-mono">
                          ({filteredProducts.length})
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-1 sm:gap-2 relative">
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
                        selectedCategory +
                        selectedCondition +
                        selectedBrands.join("") +
                        searchQuery +
                        maxPrice +
                        sortBy
                      }
                      className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      {filteredProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          variants={itemVariants}
                          layout
                        >
                          <ProductCard
                            product={product}
                            onAddToCart={addToCart}
                            onViewProduct={(p) => {
                              setSelectedProduct(p);
                              setView("product-details");
                            }}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-black border-t border-neutral-900 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 font-serif font-black text-xl tracking-tighter text-white uppercase mb-6">
              <img
                src="https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=2662&auto=format&fit=crop"
                alt="Tizzitech Logo"
                className="h-6 w-6 object-cover rounded-full"
              />
              <span>Tizzitech</span>
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
      </footer>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setView("checkout");
        }}
      />

      {/* Product details are handled on full-screen landing pages */}

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </div>
  );
}
