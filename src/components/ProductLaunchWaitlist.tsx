import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Clock,
  ShieldCheck,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Flame,
  Smartphone,
  Watch,
  Layers,
  Zap,
  Star,
  Gift,
  ArrowRight,
  Mail,
  User,
  Sliders,
  Check,
  Share2,
  Award,
  Lock
} from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface LaunchProduct {
  id: string;
  name: string;
  brand: "Samsung" | "Apple" | "Google" | "Xiaomi";
  badge: string;
  releaseWindow: string;
  imageUrl: string;
  keySpecs: string[];
  description: string;
  estimatedPrice: string;
  highlightColor: string;
}

const LAUNCH_PRODUCTS: LaunchProduct[] = [
  {
    id: "samsung-fold7",
    name: "Samsung Galaxy Z Fold 7 Ultra",
    brand: "Samsung",
    badge: "Official Next-Gen Foldable",
    releaseWindow: "Q3 2026 / Expected in ~120 Days",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=80",
    keySpecs: [
      "8.0\" QHD+ 120Hz Flex AMOLED",
      "Armor Aluminum 3 + Quad Hinge",
      "Snapdragon 8 Gen 5 for Galaxy",
      "S-Pen Ultra Integrated Slate"
    ],
    description: "The pinnacle of foldable engineering. Zero-gap crease geometry paired with pro-grade quad cameras and real-time AI multitasking.",
    estimatedPrice: "From ₦2,450,000",
    highlightColor: "from-blue-600/20 to-cyan-500/10 border-cyan-500/30 text-cyan-400"
  },
  {
    id: "iphone-18-fold",
    name: "Apple iPhone 18 & iPhone Fold",
    brand: "Apple",
    badge: "Apple's First Foldable Concept",
    releaseWindow: "Anticipated Late 2026 Drop",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80",
    keySpecs: [
      "ProMotion Liquid Retina Fold",
      "Apple A20 Bionic 2nm Architecture",
      "Titanium Aerospace Chassis",
      "Quantum LiDAR Quad Optics"
    ],
    description: "Cupertino's most closely guarded innovation. Seamless dual screen transition with revolutionary self-healing display glass.",
    estimatedPrice: "From ₦2,950,000",
    highlightColor: "from-purple-600/20 to-pink-500/10 border-purple-500/30 text-purple-400"
  },
  {
    id: "pixel-11-watch4",
    name: "Google Pixel 11 Pro & Pixel Watch 4",
    brand: "Google",
    badge: "Native Gemini 3 Ultra AI",
    releaseWindow: "Upcoming Fall Flagship Drop",
    imageUrl: "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=1000&q=80",
    keySpecs: [
      "Tensor G6 On-Device Intelligence",
      "Sapphire Glass 48h Smartwatch",
      "Periscope Telephoto 100x Zoom",
      "Autonomous AI Assist Suite"
    ],
    description: "The ultimate Android hardware ecosystem. Deep neural processing coupled with continuous bio-metric health monitoring.",
    estimatedPrice: "From ₦1,850,000 (Bundle)",
    highlightColor: "from-emerald-600/20 to-teal-500/10 border-emerald-500/30 text-emerald-400"
  },
  {
    id: "xiaomi-mix-fold4",
    name: "Xiaomi Mix Fold 4 Ultra",
    brand: "Xiaomi",
    badge: "Ultra-Thin Leica Optics",
    releaseWindow: "Global Launch Edition",
    imageUrl: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1000&q=80",
    keySpecs: [
      "9.4mm Ultra-Slim Folded Body",
      "Leica Summilux Quad Lens System",
      "120W HyperCharge + 50W Wireless",
      "5100mAh Silicon-Carbon Battery"
    ],
    description: "Refining slimness and photography. Industry-leading Leica color science wrapped in carbon-reinforced hinge architecture.",
    estimatedPrice: "From ₦1,980,000",
    highlightColor: "from-amber-600/20 to-orange-500/10 border-amber-500/30 text-amber-400"
  }
];

export function ProductLaunchWaitlist({ onGoToStore }: { onGoToStore: () => void }) {
  const { showToast } = useToast();
  const { user, profile } = useAuth();

  // Flexible Countdown State (Defaults to ~120 Days)
  const [targetDays, setTargetDays] = useState<number>(() => {
    const saved = localStorage.getItem("tizz_waitlist_target_days");
    return saved ? parseInt(saved, 10) : 120;
  });

  // Calculate target date based on targetDays from now
  const [targetTimestamp, setTargetTimestamp] = useState<number>(() => {
    return Date.now() + targetDays * 24 * 60 * 60 * 1000;
  });

  const [timeLeft, setTimeLeft] = useState({
    days: targetDays,
    hours: 14,
    minutes: 32,
    seconds: 45
  });

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [customDaysInput, setCustomDaysInput] = useState(targetDays.toString());

  // Form State
  const [email, setEmail] = useState(profile?.email || user?.email || "");
  const [fullName, setFullName] = useState(profile?.firstName || user?.displayName || "");
  const [selectedProductInterest, setSelectedProductInterest] = useState<string>("All 2026 Flagships");
  const [notifyMethod, setNotifyMethod] = useState<"email" | "whatsapp" | "both">("email");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // VIP Pass state
  const [vipPass, setVipPass] = useState<{ id: string; date: string; product: string } | null>(() => {
    const saved = localStorage.getItem("tizz_vip_waitlist_pass");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Product notification subscriptions
  const [subscribedProducts, setSubscribedProducts] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("tizz_subscribed_launch_products");
    return saved ? JSON.parse(saved) : {};
  });

  // Update Countdown Timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const difference = targetTimestamp - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp]);

  const handleAdjustCountdown = (newDays: number) => {
    setTargetDays(newDays);
    localStorage.setItem("tizz_waitlist_target_days", newDays.toString());
    const newTimestamp = Date.now() + newDays * 24 * 60 * 60 * 1000;
    setTargetTimestamp(newTimestamp);
    setShowAdjustModal(false);
    showToast(`Launch countdown adjusted to ${newDays} days!`, "success");
  };

  const handleSubscribeWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    setIsSubmitting(true);
    const passId = `TZ-VIP-${Math.floor(100000 + Math.random() * 900000)}`;
    const passData = {
      id: passId,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      product: selectedProductInterest
    };

    try {
      // 1. Save subscription to Firestore
      await addDoc(collection(db, "newsletter_subscribers"), {
        email: email.trim(),
        name: fullName.trim(),
        productInterest: selectedProductInterest,
        notifyMethod,
        phone: phone.trim(),
        source: "product_launch_waitlist",
        vipPassId: passId,
        subscribedAt: serverTimestamp(),
        status: "active"
      });

      // 2. Local storage persistence
      localStorage.setItem("tizz_vip_waitlist_pass", JSON.stringify(passData));
      setVipPass(passData);

      showToast(`Congratulations ${fullName || "Tech Enthusiast"}! You are now locked in for VIP Early Access.`, "success");
    } catch (err) {
      console.warn("Firestore save fallback to local:", err);
      localStorage.setItem("tizz_vip_waitlist_pass", JSON.stringify(passData));
      setVipPass(passData);
      showToast(`VIP Priority Pass reserved! Pass ID: ${passId}`, "success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProductNotification = (productId: string, productName: string) => {
    setSubscribedProducts((prev) => {
      const updated = { ...prev, [productId]: !prev[productId] };
      localStorage.setItem("tizz_subscribed_launch_products", JSON.stringify(updated));
      if (updated[productId]) {
        showToast(`Instant alert enabled for ${productName}!`, "success");
      } else {
        showToast(`Alert removed for ${productName}.`, "info");
      }
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-cyan-500 selection:text-black">
      {/* BACKGROUND GRAPHIC ACCENTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-cyan-600/10 via-purple-600/10 to-emerald-600/10 blur-[140px] rounded-full opacity-60" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {/* TOP BAR BRAND & STORE RETURN BUTTON */}
        <div className="flex items-center justify-between pb-8 border-b border-neutral-900">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-mono tracking-widest uppercase text-cyan-400 font-bold">
              Tizzitech Pre-Launch Hub 2026
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdjustModal(true)}
              className="text-xs font-mono text-neutral-400 hover:text-cyan-400 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
              title="Adjust launch countdown days"
            >
              <Sliders className="h-3.5 w-3.5 text-cyan-400" />
              <span>Countdown ({targetDays} Days)</span>
            </button>

            <button
              onClick={onGoToStore}
              className="text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-4 py-2 rounded-xl flex items-center gap-2 transition-all hover:border-neutral-700"
            >
              <span>Back to Store</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* HERO COUNTDOWN HEADER */}
        <section className="py-12 md:py-16 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-emerald-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-6 shadow-lg shadow-cyan-950/40">
              <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
              <span>Next-Gen Smartphone & Wearable Drops</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase font-serif leading-none mb-6">
              The Future of Tech <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
                Is Almost Here
              </span>
            </h1>

            <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
              Be among the privileged first in West Africa to reserve upcoming flagship foldables, high-tier smartphones, and smartwatch innovations. Exclusive pre-order priority, zero-deposit reservation, and guaranteed warranty.
            </p>

            {/* COUNTDOWN CLOCK */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto mb-10">
              {[
                { label: "DAYS", value: timeLeft.days },
                { label: "HOURS", value: timeLeft.hours },
                { label: "MINUTES", value: timeLeft.minutes },
                { label: "SECONDS", value: timeLeft.seconds }
              ].map((unit, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-900/80 border border-neutral-800 backdrop-blur-md rounded-2xl p-3 sm:p-5 flex flex-col items-center justify-center shadow-xl shadow-black/40 relative overflow-hidden group hover:border-cyan-500/40 transition-all"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-60" />
                  <span className="text-2xl sm:text-4xl lg:text-5xl font-mono font-black text-white tracking-tight">
                    {String(unit.value).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-neutral-400 tracking-widest uppercase mt-1">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>

            {/* IMMEDIATE VIP ACCESS SIGNUP FORM (PHASE 1 - RIGHT NEXT TO COUNTDOWN) */}
            <div id="vip-signup-form" className="max-w-3xl mx-auto bg-gradient-to-b from-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left mb-14">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500" />

              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>VIP Instant Priority & Pre-Order Perks</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-serif">
                  Join the VIP Launch Waitlist
                </h2>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-cyan-300">
                  <span className="bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">✨ Free Shipping</span>
                  <span className="bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg text-purple-300">🏷️ 7% Discount on 1st Order</span>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-emerald-300">🚀 Free Delivery 1st Week of Launch</span>
                </div>
              </div>

              {vipPass ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-neutral-950 border border-cyan-500/40 rounded-2xl p-6 text-center relative overflow-hidden shadow-xl"
                >
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-mono font-bold uppercase">
                      <Check className="h-3 w-3" /> VIP PASS ACTIVE
                    </span>
                  </div>

                  <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-4">
                    <Award className="h-6 w-6" />
                  </div>

                  <h3 className="text-xl font-bold text-white font-serif mb-1">
                    Your VIP Priority Access Pass Is Secured!
                  </h3>
                  <p className="text-xs text-neutral-400 mb-4">
                    You'll automatically receive Free Shipping, 7% off your first purchase, and Free Delivery during launch week.
                  </p>

                  <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 max-w-sm mx-auto text-left mb-6 font-mono text-xs space-y-2">
                    <div className="flex justify-between border-b border-neutral-800 pb-2">
                      <span className="text-neutral-500">Pass ID:</span>
                      <span className="text-cyan-400 font-bold">{vipPass.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-neutral-800 pb-2">
                      <span className="text-neutral-500">Interest:</span>
                      <span className="text-white font-bold truncate max-w-[180px]">{vipPass.product}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Reserved On:</span>
                      <span className="text-neutral-300">{vipPass.date}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`I just claimed my VIP Launch Pass #${vipPass.id} for the 2026 Next-Gen Flagship drop on Tizzitech!`);
                        showToast("Pass details copied to clipboard!", "success");
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Share2 className="h-4 w-4 text-cyan-400" />
                      <span>Share Pass ID</span>
                    </button>

                    <button
                      onClick={onGoToStore}
                      className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
                    >
                      Browse Available Products
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribeWaitlist} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Tosin Idowu"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                      Primary Device Preference
                    </label>
                    <select
                      value={selectedProductInterest}
                      onChange={(e) => setSelectedProductInterest(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="All 2026 Flagships">All 2026 Flagship Drops</option>
                      <option value="Samsung Galaxy Z Fold 7 Ultra">Samsung Galaxy Z Fold 7 Ultra</option>
                      <option value="Apple iPhone 18 & iPhone Fold">Apple iPhone 18 & iPhone Fold Concept</option>
                      <option value="Google Pixel 11 Pro & Pixel Watch 4">Google Pixel 11 Pro & Pixel Watch 4</option>
                      <option value="Xiaomi Mix Fold 4 Ultra">Xiaomi Mix Fold 4 Ultra</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 hover:opacity-95 text-black font-extrabold rounded-xl text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-cyan-950/50 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Securing VIP Priority...</span>
                      ) : (
                        <>
                          <Gift className="h-5 w-5" />
                          <span>Get VIP Pass + 7% Off & Free Launch Shipping</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-center text-neutral-500 mt-2">
                    🔒 Zero deposit required. Automatic notification & discount voucher upon drop.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </section>

        {/* FEATURED ANTICIPATED PRODUCTS GRID */}
        <section className="py-8 border-t border-neutral-900">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold mb-1">
                <Flame className="h-4 w-4 text-amber-400" />
                Anticipated Lineup 2026 / 2027
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase font-serif">
                Upcoming Flagship Devices
              </h2>
            </div>
            <p className="text-xs text-neutral-400 max-w-md">
              Tap "Notify Me" on any device to lock in your priority notification slot before official inventory drops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {LAUNCH_PRODUCTS.map((prod) => {
              const isSubscribed = !!subscribedProducts[prod.id];
              return (
                <motion.div
                  key={prod.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden shadow-xl"
                >
                  <div className="absolute top-0 right-0 p-6 pointer-events-none">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-950/80 text-cyan-300 border border-neutral-800">
                      {prod.badge}
                    </span>
                  </div>

                  <div>
                    {/* PRODUCT IMAGE & BRAND */}
                    <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden mb-6 bg-neutral-950 border border-neutral-900 group">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <span className="text-xs font-mono font-extrabold text-cyan-400 bg-neutral-950/90 px-3 py-1 rounded-lg border border-neutral-800">
                          {prod.releaseWindow}
                        </span>
                        <span className="text-xs font-mono font-bold text-white bg-neutral-950/90 px-3 py-1 rounded-lg border border-neutral-800">
                          {prod.estimatedPrice}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-serif">
                      {prod.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 mb-6 leading-relaxed">
                      {prod.description}
                    </p>

                    {/* SPECS LIST */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {prod.keySpecs.map((spec, i) => (
                        <div
                          key={i}
                          className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl px-3 py-2 text-[11px] text-neutral-300 flex items-center gap-2"
                        >
                          <Zap className="h-3 w-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ACTION BAR */}
                  <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between gap-4">
                    <button
                      onClick={() => toggleProductNotification(prod.id, prod.name)}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        isSubscribed
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      }`}
                    >
                      {isSubscribed ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span>Alert Set for {prod.brand}</span>
                        </>
                      ) : (
                        <>
                          <BellRing className="h-4 w-4 text-cyan-400" />
                          <span>Notify Me First</span>
                        </>
                      )}
                    </button>

                    <a
                      href="#vip-signup-form"
                      onClick={() => setSelectedProductInterest(prod.name)}
                      className="px-4 py-3 rounded-xl text-xs font-bold text-white bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 transition-colors"
                    >
                      Reserve Priority
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ADJUST COUNTDOWN MODAL (Allows user/tester to adjust countdown days) */}
      <AnimatePresence>
        {showAdjustModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full relative shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-2 font-serif">
                Adjust Launch Countdown
              </h3>
              <p className="text-xs text-neutral-400 mb-4">
                Set or reduce the launch timer days anytime as requested (e.g., 120, 90, 30, 7 days).
              </p>

              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-4 gap-2">
                  {[120, 90, 30, 7].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleAdjustCountdown(d)}
                      className={`py-2 rounded-lg text-xs font-mono font-bold border transition-colors ${
                        targetDays === d
                          ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                          : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white"
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Custom Days Input
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={customDaysInput}
                    onChange={(e) => setCustomDaysInput(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const parsed = parseInt(customDaysInput, 10);
                    if (parsed && parsed > 0) {
                      handleAdjustCountdown(parsed);
                    }
                  }}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs uppercase tracking-wider"
                >
                  Apply Days
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
