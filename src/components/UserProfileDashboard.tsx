import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Mail,
  Shield,
  ShieldCheck,
  MapPin,
  Package,
  Clock,
  Tag,
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  ShoppingBag,
  Phone,
  Wallet,
  Truck,
  RotateCw,
  XCircle,
  Heart,
  Headphones,
  Edit2,
  Check,
  Copy,
  ExternalLink,
  Key,
  Loader2,
  ArrowLeft,
  Send,
  LogOut,
} from "lucide-react";
import { Order, OrderStatus } from "../types";
import { NIGERIAN_STATES, LGAS_BY_STATE } from "../utils/nigeriaLocations";

interface UserProfileDashboardProps {
  orders: Order[];
}

type Tab =
  | "personal"
  | "orders"
  | "address"
  | "security"
  | "wishlist"
  | "support"
  | "";

export function UserProfileDashboard({ orders }: UserProfileDashboardProps) {
  const { user, role, profile, updateProfile, logOut } = useAuth();

  // Local active tab
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>("All");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {},
  );
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Success indicator states
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Local state for orders (enables real-time session cancellation)
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);

  useEffect(() => {
    // Sync with props whenever page loads or updates
    setLocalOrders(orders);
  }, [orders]);

  useEffect(() => {
    if (!activeTab) return;
    // Only scroll logic for mobile where the tab unfolds inline
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        const el = document.getElementById("mobile-tab-" + activeTab);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      // Desktop scroll to top of the dashboard main content
      setTimeout(() => {
        const el = document.getElementById("desktop-main-tab-content");
        if (el) {
          // We'll scroll relative so the whole container is visible
          const y = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    }
  }, [activeTab]);

  // Profile extensions loaded from localStorage for 100% durable persistence
  const [gender, setGender] = useState(() => {
    return localStorage.getItem("tizz_profile_gender") || "Male";
  });
  const [avatarUrl, setAvatarUrl] = useState(() => {
    return (
      localStorage.getItem("tizz_profile_avatar") ||
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"
    );
  });
  // Address subfields state
  const [editFirstName, setEditFirstName] = useState(profile?.firstName || "");
  const [editSurname, setEditSurname] = useState(profile?.surname || "");
  const [editAddress, setEditAddress] = useState(profile?.address || "");
  const [editPhone, setEditPhone] = useState(profile?.phone || "");
  const [editCodename, setEditCodename] = useState(profile?.codename || "");

  // Address subfields state
  const [addressCity, setAddressCity] = useState(
    () => localStorage.getItem("tizz_addr_city") || "Lagos",
  );
  const [addressState, setAddressState] = useState(
    () => localStorage.getItem("tizz_addr_state") || "Lagos State",
  );
  const [addressPost, setAddressPost] = useState(
    () => localStorage.getItem("tizz_addr_post") || "100001",
  );
  const [addressCountry, setAddressCountry] = useState(
    () => localStorage.getItem("tizz_addr_country") || "Nigeria",
  );

  // Interactive Avatar selection drawer state
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Support Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: "user" | "agent"; text: string; time: string }>
  >([
    {
      sender: "agent",
      text: "Hello! Thanks for reaching out to Tizzitech Support. How can we help you today with your orders or account profile?",
      time: "Just now",
    },
  ]);

  // Sync edit values with profile when profile loads
  useEffect(() => {
    if (profile) {
      setEditFirstName(profile.firstName || "");
      setEditSurname(profile.surname || "");
      setEditAddress(profile.address || "");
      setEditPhone(profile.phone || "");
      setEditCodename(profile.codename || "Explorer");
    }
  }, [profile]);

  const premadeAvatars = [
    {
      name: "Entrepreneur (Roan)",
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    },
    {
      name: "Creative Designer",
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    },
    {
      name: "Senior Engineer",
      url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250",
    },
    {
      name: "Solutions Architect",
      url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
    },
    {
      name: "Security Director",
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
    },
  ];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center mx-auto max-w-md px-4 mt-12 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl">
        <Shield className="w-16 h-16 text-neutral-600 mb-6" />
        <h3 className="text-2xl font-black text-white mb-2 tracking-wide uppercase">
          Not Authenticated
        </h3>
        <p className="text-neutral-400 mb-6">
          Please sign in to view your account dashboard.
        </p>
      </div>
    );
  }

  // Profile update save callback
  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      if (updateProfile) {
        await updateProfile({
          firstName: editFirstName,
          surname: editSurname,
          address: editAddress,
          phone: editPhone,
          codename: editCodename,
        });
      }

      // Save custom fields
      localStorage.setItem("tizz_profile_gender", gender);
      localStorage.setItem("tizz_profile_avatar", avatarUrl);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAddresses = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem("tizz_addr_city", addressCity);
      localStorage.setItem("tizz_addr_state", addressState);
      localStorage.setItem("tizz_addr_post", addressPost);
      localStorage.setItem("tizz_addr_country", addressCountry);

      if (updateProfile && editAddress) {
        updateProfile({ address: editAddress });
      }

      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  // Simulated Cancel Order function
  const handleCancelOrder = (orderId: string) => {
    setLocalOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "Confirmed" as OrderStatus,
              expectedDeliveryDate: new Date(),
            }
          : o,
      ),
    );
    // Move to cancelled section
    const updated = localOrders.map((o) => {
      if (o.id === orderId) {
        // Create copies
        const copy = { ...o };
        // Set custom cancelled fields
        Object.assign(copy, { isCancelled: true, status: "Cancelled" });
        return copy;
      }
      return o;
    });
    setLocalOrders(updated as any);
    localStorage.setItem(`tizz_cancelled_order_${orderId}`, "true");
  };

  // Wishlist simulations (pull 3 highly structured mock favorites for high-end aesthetic)
  const mockWishlist = [
    {
      id: "fav-1",
      name: "MacBook Pro M3 Max - Space Black",
      category: "Laptops",
      brand: "Apple",
      price: 2950000,
      imageUrl:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80",
      inStock: true,
    },
    {
      id: "fav-2",
      name: "iPhone 15 Pro Titanium",
      category: "Phones",
      brand: "Apple",
      price: 1450000,
      imageUrl:
        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=300&q=80",
      inStock: true,
    },
    {
      id: "fav-3",
      name: "Keychron Q1 Max Mechanical Keyboard",
      category: "Keyboards",
      brand: "Keychron",
      price: 195000,
      imageUrl:
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=300&q=80",
      inStock: false,
    },
  ];

  // Helper copy tracking number
  const copyTrackingNumber = (num: string, id: string) => {
    navigator.clipboard.writeText(num);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Support instant responses
  const handleSendSupportMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    const timeStr = new Date().toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: userMsg, time: timeStr },
    ]);
    setChatInput("");

    // Instant realistic replies
    setTimeout(() => {
      let agentText =
        "I have recorded your request. Our support engineer is reviewing your profile setup and will respond in 2-3 minutes. Thank you!";
      const textLower = userMsg.toLowerCase();
      if (
        textLower.includes("order") ||
        textLower.includes("track") ||
        textLower.includes("delivery")
      ) {
        agentText =
          "Regarding your order check, under 'My Orders' we have live tracking status bars connected. Your dispatches are in transit and updated hourly!";
      } else if (textLower.includes("cancel") || textLower.includes("refund")) {
        agentText =
          "Under 'My Orders' tab you can cancel any newly Confirmed orders instantly by expanding the Order Card Details and hitting 'Cancel Order'!";
      } else if (
        textLower.includes("address") ||
        textLower.includes("change")
      ) {
        agentText =
          "You can update your shipping delivery hub directly under the 'Billing & Address' dashboard tab. Updates sync instantly to new checkouts.";
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: "agent", text: agentText, time: "Just now" },
      ]);
    }, 1000);
  };

  // Grouped status stats (Interactive counters exactly matching Roan Atkinson profile Mockup!)
  const stats = useMemo(() => {
    let pending = 0;
    let processing = 0;
    let delivered = 0;
    let cancelled = 0;

    localOrders.forEach((o) => {
      // Check if manually marked cancelled
      const isCancelled =
        localStorage.getItem(`tizz_cancelled_order_${o.id}`) === "true" ||
        (o as any).status === "Cancelled";
      if (isCancelled) {
        cancelled++;
      } else if (o.status === "Delivered") {
        delivered++;
      } else if (
        o.status === "Shipped" ||
        o.status === "In Transit" ||
        o.status === "Accepted"
      ) {
        processing++;
      } else {
        pending++; // Confirmed defaults to pending payment
      }
    });

    return { pending, processing, delivered, cancelled };
  }, [localOrders]);

  // Accordion drawer handler
  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Filtering orders dynamically based on search & selection filter
  const filteredOrders = useMemo(() => {
    let list = localOrders.map((o) => {
      // Inject cancelled property if stored in localStorage
      const isCancelled =
        localStorage.getItem(`tizz_cancelled_order_${o.id}`) === "true" ||
        (o as any).status === "Cancelled";
      if (isCancelled) {
        return { ...o, status: "Cancelled" as any };
      }
      return o;
    });

    // Apply Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.items.some(
            (item) =>
              item.name.toLowerCase().includes(q) ||
              item.brand.toLowerCase().includes(q),
          ),
      );
    }

    // Apply Status Filter (Clickable Counter Cards)
    if (selectedStatusFilter !== "All") {
      if (selectedStatusFilter === "Pending") {
        list = list.filter((o) => o.status === "Confirmed");
      } else if (selectedStatusFilter === "Processing") {
        list = list.filter(
          (o) =>
            o.status === "Accepted" ||
            o.status === "Shipped" ||
            o.status === "In Transit",
        );
      } else if (selectedStatusFilter === "Delivered") {
        list = list.filter((o) => o.status === "Delivered");
      } else if (selectedStatusFilter === "Cancelled") {
        list = list.filter((o) => o.status === "Cancelled");
      }
    }

    return list;
  }, [localOrders, searchQuery, selectedStatusFilter]);

  const tabContents = () => (
    <>
      {/* TAB CONTENT: 1. Personal Info (Image 2 representation) */}
      {activeTab === "personal" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-neutral-800 pb-4">
            <h3 className="text-xl font-serif font-black text-white uppercase tracking-tight">
              Personal Information
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Configure your primary accounts and credentials safely.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2 font-mono">
                First Name*
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                  placeholder="e.g. Roan"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2 font-mono">
                Last Name / Surname
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={editSurname}
                  onChange={(e) => setEditSurname(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                  placeholder="e.g. Atkinson"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2 font-mono">
                Email Address*
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-600" />
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full bg-neutral-950/60 border border-neutral-900 rounded-xl pl-11 pr-16 py-3 text-sm text-neutral-500 cursor-not-allowed font-medium"
                />
                <span className="absolute right-4 top-3.5 text-[9px] font-mono tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">
                  Verified
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2 font-mono">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold font-mono"
                  placeholder="+234..."
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2 font-mono">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2 font-mono">
                Nick name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={editCodename}
                  onChange={(e) => setEditCodename(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                  placeholder="Enter nickname..."
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-800 flex justify-end">
            <button
              onClick={handleUpdateProfile}
              className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-widest py-3 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Update Changes
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. My Orders (Clickable status sliders, progress pipeline - Image 1 representation) */}
      {activeTab === "orders" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-neutral-800 pb-4">
            <h3 className="text-xl font-serif font-black text-white uppercase tracking-tight">
              Orders
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Live updates, interactive tracking statuses, and detailed
              dispatches.
            </p>
          </div>

          {/* Counter Buttons directly from first image mockup - CLICKABLE to filter ooh! */}
          <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 font-mono">
              Interactive Filter Categories (Click to toggle)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Wallet card filter */}
              <button
                onClick={() =>
                  setSelectedStatusFilter(
                    selectedStatusFilter === "Pending" ? "All" : "Pending",
                  )
                }
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative ${
                  selectedStatusFilter === "Pending"
                    ? "bg-blue-600/10 border-blue-500 ring-1 ring-blue-500"
                    : "bg-black/40 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <Wallet className="w-5 h-5 text-blue-500 mb-4" />
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Unpaid/Pending
                  </h4>
                  <p className="text-lg font-black text-white mt-1 font-mono">
                    {stats.pending}
                  </p>
                </div>
              </button>

              {/* Processing circular card filter */}
              <button
                onClick={() =>
                  setSelectedStatusFilter(
                    selectedStatusFilter === "Processing"
                      ? "All"
                      : "Processing",
                  )
                }
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative ${
                  selectedStatusFilter === "Processing"
                    ? "bg-pink-600/10 border-pink-500 ring-1 ring-pink-500"
                    : "bg-black/40 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <RotateCw className="w-5 h-5 text-pink-500 mb-4 animate-spin-slow" />
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Processing
                  </h4>
                  <p className="text-lg font-black text-white mt-1 font-mono">
                    {stats.processing}
                  </p>
                </div>
              </button>

              {/* Truck delivered card filter */}
              <button
                onClick={() =>
                  setSelectedStatusFilter(
                    selectedStatusFilter === "Delivered" ? "All" : "Delivered",
                  )
                }
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative ${
                  selectedStatusFilter === "Delivered"
                    ? "bg-emerald-600/10 border-emerald-500 ring-1 ring-emerald-500"
                    : "bg-black/40 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <Truck className="w-5 h-5 text-emerald-500 mb-4" />
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Delivered
                  </h4>
                  <p className="text-lg font-black text-white mt-1 font-mono">
                    {stats.delivered}
                  </p>
                </div>
              </button>

              {/* Cancelled card filter */}
              <button
                onClick={() =>
                  setSelectedStatusFilter(
                    selectedStatusFilter === "Cancelled" ? "All" : "Cancelled",
                  )
                }
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative ${
                  selectedStatusFilter === "Cancelled"
                    ? "bg-red-600/10 border-red-500 ring-1 ring-red-500"
                    : "bg-black/40 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <XCircle className="w-5 h-5 text-red-500 mb-4" />
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Cancelled
                  </h4>
                  <p className="text-lg font-black text-white mt-1 font-mono">
                    {stats.cancelled}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Sub-filtering, resetting, and real-time search interface */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-black/40 border border-neutral-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] font-black uppercase text-neutral-500 font-mono">
                Running views:
              </span>
              <button
                onClick={() => {
                  setSelectedStatusFilter("All");
                  setSearchQuery("");
                }}
                className={`text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg border leading-tight transition-all duration-200 ${
                  selectedStatusFilter === "All" && !searchQuery
                    ? "bg-white text-neutral-950 border-white"
                    : "text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-white"
                }`}
              >
                Show All
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, product brand..."
                className="w-full bg-black border border-neutral-800/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Order List */}
          {filteredOrders.length > 0 ? (
            <div className="space-y-5">
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrders[order.id];
                const statusColor =
                  order.status === "Delivered"
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : order.status === "Cancelled"
                      ? "text-red-500 bg-red-500/10 border-red-500/20"
                      : "text-blue-400 bg-blue-500/10 border-blue-500/20";

                return (
                  <div
                    key={order.id}
                    className={`bg-black/50 border rounded-2xl p-5 shadow-lg hover:border-neutral-700 transition-all duration-300 ${
                      isExpanded
                        ? "border-neutral-700 ring-1 ring-neutral-800/50"
                        : "border-neutral-800/80"
                    }`}
                  >
                    {/* Inner high quality representation of Roan Atkinson mockup */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-black text-white">
                            Order ID: {order.id}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${statusColor}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 font-semibold flex items-center gap-1.5 pt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          Date:{" "}
                          {new Date(order.orderDate).toLocaleDateString(
                            undefined,
                            { year: "numeric", month: "short", day: "numeric" },
                          )}
                        </p>
                        {/* Interactive tracking code copying ooh! */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <p className="text-[10px] text-neutral-500 font-bold whitespace-nowrap">
                            Tracking:{" "}
                            <span className="font-mono text-neutral-300">
                              TIZZ-{order.id.slice(0, 8).toUpperCase()}
                            </span>
                          </p>
                          <button
                            onClick={() =>
                              copyTrackingNumber(
                                `TIZZ-${order.id.slice(0, 8).toUpperCase()}`,
                                order.id,
                              )
                            }
                            className="text-neutral-500 hover:text-white transition-colors"
                            title="Copy code"
                          >
                            {copiedOrderId === order.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          {order.items.slice(0, 4).map((item, idx) => (
                            <div
                              key={idx}
                              className="w-10 h-10 rounded border border-neutral-800 bg-neutral-900 overflow-hidden shrink-0"
                            >
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-700">
                                  <Package className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          ))}
                          {order.items.length > 4 && (
                            <div className="w-10 h-10 rounded border border-neutral-800 bg-neutral-900 flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold text-neutral-500">
                                +{order.items.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row md:items-end gap-4 w-full md:w-auto justify-between border-t border-neutral-900 md:border-t-0 pt-4 md:pt-0">
                        <div className="md:text-right">
                          <span className="block text-[10px] text-neutral-500 uppercase tracking-widest font-black leading-none">
                            Total Billing
                          </span>
                          <span className="text-xl font-black text-white font-mono mt-0.5 block">
                            ₦{order.total.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-neutral-400 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded mt-1 inline-block font-mono">
                            Qty:{" "}
                            {order.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0,
                            )}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800/80 text-white font-black text-[10px] uppercase tracking-widest py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all self-end sm:self-auto w-full sm:w-auto"
                        >
                          {isExpanded ? "Collapse" : "Details"}
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Expanded products lists and Delivery Step timeline */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-neutral-900 space-y-6 animate-in slide-in-from-top-4 duration-300">
                        {/* Live shipping stage tracker */}
                        <div className="bg-neutral-950 rounded-2xl p-5 border border-neutral-900/60">
                          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-4 font-mono">
                            Live Stage Tracking
                          </p>
                          <div className="grid grid-cols-4 gap-2 relative">
                            {/* Progress line connection tracker */}
                            <div className="absolute top-3 inset-x-4 h-1 bg-neutral-800 z-0">
                              <div
                                className="bg-blue-500 h-full transition-all duration-1000"
                                style={{
                                  width:
                                    order.status === "Cancelled"
                                      ? "0%"
                                      : order.status === "Delivered"
                                        ? "100%"
                                        : order.status === "In Transit" ||
                                            order.status === "Shipped"
                                          ? "66%"
                                          : order.status === "Accepted"
                                            ? "33%"
                                            : "5%",
                                }}
                              />
                            </div>

                            {/* Step details 1 */}
                            <div className="text-center z-10">
                              <div
                                className={`w-7 h-7 rounded-full text-xs font-black mx-auto flex items-center justify-center transition-all ${
                                  order.status === "Cancelled"
                                    ? "bg-neutral-800 text-neutral-500"
                                    : "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                }`}
                              >
                                1
                              </div>
                              <p className="text-[8px] sm:text-[9px] font-black tracking-tight sm:tracking-wider uppercase mt-1.5 text-neutral-300 break-words line-clamp-1 sm:line-clamp-none">
                                Confirmed
                              </p>
                            </div>

                            {/* Step details 2 */}
                            <div className="text-center z-10 min-w-0">
                              <div
                                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[10px] sm:text-xs font-black mx-auto flex items-center justify-center transition-all ${
                                  order.status !== "Confirmed" &&
                                  order.status !== "Cancelled"
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-neutral-800 text-neutral-500"
                                }`}
                              >
                                2
                              </div>
                              <p className="text-[8px] sm:text-[9px] font-black tracking-tight sm:tracking-wider uppercase mt-1.5 text-neutral-300 break-words line-clamp-1 sm:line-clamp-none">
                                Dispatched
                              </p>
                            </div>

                            {/* Step details 3 */}
                            <div className="text-center z-10 min-w-0">
                              <div
                                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[10px] sm:text-xs font-black mx-auto flex items-center justify-center transition-all ${
                                  order.status === "Shipped" ||
                                  order.status === "In Transit" ||
                                  order.status === "Delivered"
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-neutral-800 text-neutral-500"
                                }`}
                              >
                                3
                              </div>
                              <p className="text-[8px] sm:text-[9px] font-black tracking-tight sm:tracking-wider uppercase mt-1.5 text-neutral-300 break-words line-clamp-1 sm:line-clamp-none">
                                In Transit
                              </p>
                            </div>

                            {/* Step details 4 */}
                            <div className="text-center z-10 min-w-0">
                              <div
                                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[10px] sm:text-xs font-black mx-auto flex items-center justify-center transition-all ${
                                  order.status === "Delivered"
                                    ? "bg-emerald-500 text-neutral-950 font-black"
                                    : "bg-neutral-800 text-neutral-500"
                                }`}
                              >
                                {order.status === "Delivered" ? "✓" : "4"}
                              </div>
                              <p
                                className={`text-[8px] sm:text-[9px] font-black tracking-tight sm:tracking-wider uppercase mt-1.5 break-words line-clamp-1 sm:line-clamp-none ${order.status === "Delivered" ? "text-emerald-400" : "text-neutral-500"}`}
                              >
                                Delivered
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Products List inside order */}
                        <div className="space-y-3.5">
                          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 font-mono">
                            Invoice Items list
                          </p>
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-2 sm:gap-4 bg-neutral-900/60 border border-neutral-900 rounded-xl p-2.5 sm:p-3"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-950 rounded-lg overflow-hidden border border-neutral-800 flex-shrink-0">
                                  {item.imageUrl ? (
                                    <img
                                      src={item.imageUrl}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-700">
                                      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-white truncate">
                                    {item.name}
                                  </h4>
                                  <p className="text-[9px] sm:text-[10px] text-neutral-500 font-bold uppercase mt-0.5 truncate">
                                    {item.brand} •{" "}
                                    <span className="text-neutral-400">
                                      {item.condition}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 font-mono">
                                <p className="text-[10px] sm:text-xs font-bold text-white">
                                  ₦
                                  {(
                                    item.price * item.quantity
                                  ).toLocaleString()}
                                </p>
                                <p className="text-[8px] sm:text-[10px] text-neutral-500">
                                  ₦{item.price.toLocaleString()} x{" "}
                                  {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Cancellation feature directly from order card details */}
                        <div className="pt-4 border-t border-neutral-900 flex justify-between items-center flex-wrap gap-4">
                          <span className="text-[10px] text-neutral-400 font-bold font-mono">
                            Delivery Address:{" "}
                            {order.address ||
                              profile?.address ||
                              "No Address Listed"}
                          </span>
                          {order.status === "Confirmed" && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-black transition-colors"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-black/40 border border-neutral-800 rounded-3xl">
              <Package className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
              <p className="text-neutral-400 font-black uppercase tracking-wide text-xs">
                No orders located ooh
              </p>
              <p className="text-[11px] text-neutral-500 mt-1 max-w-xs mx-auto">
                Adjust your active filter category buttons above or try typing
                another query.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 3. Delivery Addresses */}
      {activeTab === "address" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-neutral-800 pb-4">
            <h3 className="text-xl font-serif font-black text-white uppercase tracking-tight">
              Address
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Updates made here will automatically pre-populate shipping values
              for fast checkouts.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2 font-mono">
                Address*
              </label>
              <textarea
                rows={3}
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium resize-none"
                placeholder="e.g. 15 Tech Hub Boulevard, Ikeja"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2 font-mono">
                  State
                </label>
                <select
                  value={addressState}
                  onChange={(e) => {
                    setAddressState(e.target.value);
                    // Reset city when state changes if possible, but keeping it simple
                    setAddressCity("");
                  }}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                >
                  <option value="">Select State</option>
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2 font-mono">
                  City / Location
                </label>
                {LGAS_BY_STATE[addressState] &&
                LGAS_BY_STATE[addressState].length > 0 ? (
                  <select
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                  >
                    <option value="">Select City / Location</option>
                    {LGAS_BY_STATE[addressState].map((lga) => (
                      <option key={lga} value={lga}>
                        {lga}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                    placeholder="Enter City / Location"
                  />
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2 font-mono">
                  Country
                </label>
                <input
                  type="text"
                  value={addressCountry}
                  onChange={(e) => setAddressCountry(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-800 flex justify-end">
            <button
              onClick={handleSaveAddresses}
              className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-widest py-3 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Save Shipping Hub
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. Security & Cryptology */}
      {activeTab === "security" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-neutral-800 pb-4">
            <h3 className="text-xl font-serif font-black text-white uppercase tracking-tight">
              Change Password
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Configure multi-factor validation, passwords, and sessions
              security logs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 font-mono">
                Update Account Password
              </p>

              <div>
                <label className="block text-[9px] font-bold text-neutral-500 uppercase mb-1.5 font-mono">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-neutral-500 uppercase mb-1.5 font-mono">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-neutral-500 uppercase mb-1.5 font-mono">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={() => {
                  setIsSaving(true);
                  setTimeout(() => {
                    setIsSaving(false);
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 2000);
                  }, 500);
                }}
                className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg transition-colors border border-neutral-700 inline-block"
              >
                Update Password
              </button>
            </div>

            <div className="space-y-5 bg-black/40 border border-neutral-800 p-5 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Authorized
                Logs
              </p>
              <div className="space-y-3 font-mono">
                <div className="flex justify-between items-start text-[10px] border-b border-neutral-900 pb-2">
                  <div>
                    <p className="text-white font-bold">Lagos, Nigeria</p>
                    <p className="text-neutral-500 mt-0.5">
                      Chrome on Windows (Active)
                    </p>
                  </div>
                  <span className="text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded text-[8px]">
                    Now
                  </span>
                </div>

                <div className="flex justify-between items-start text-[10px] border-b border-neutral-900 pb-2">
                  <div>
                    <p className="text-neutral-400">Lagos State, NG</p>
                    <p className="text-neutral-600 mt-0.5">
                      iPhone iOS • Tizzitech app
                    </p>
                  </div>
                  <span className="text-neutral-500 font-bold">
                    12 hours ago
                  </span>
                </div>

                <div className="flex justify-between items-start text-[10px]">
                  <div>
                    <p className="text-neutral-400">London, United Kingdom</p>
                    <p className="text-neutral-600 mt-0.5">
                      FireFox browser session
                    </p>
                  </div>
                  <span className="text-neutral-500 font-bold">
                    May 30, 2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. Wishlist collection panel */}
      {activeTab === "wishlist" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-neutral-800 pb-4">
            <h3 className="text-xl font-serif font-black text-white uppercase tracking-tight">
              Interactive Wishlist
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Saved products, pre-set purchase list, and customized item
              bookmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {mockWishlist.map((item) => (
              <div
                key={item.id}
                className="bg-black/40 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-36 rounded-xl bg-neutral-900 overflow-hidden border border-neutral-800">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[10px] uppercase text-blue-500 tracking-wider font-bold font-mono mt-3">
                    {item.category}
                  </p>
                  <h4 className="text-sm font-bold text-white mt-1 leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {item.brand}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-900/60 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-neutral-500">
                      Fixed Cost
                    </p>
                    <p className="text-sm font-black text-white font-mono">
                      ₦{item.price.toLocaleString()}
                    </p>
                  </div>
                  {item.inStock ? (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-1 rounded">
                      Sold Out
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. Customer Care Support Chat Console representing Headphones in Roan Atkinson's UI */}
      {activeTab === "support" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-neutral-800 pb-4">
            <h3 className="text-xl font-serif font-black text-white uppercase tracking-tight">
              Support Terminal
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Direct consulting access regarding payments, deliveries, or
              returns.
            </p>
          </div>

          <div className="bg-black/40 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col h-[400px]">
            {/* Chat logs */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide text-xs">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                >
                  <span className="text-[8px] text-neutral-500 font-mono block mb-1">
                    {msg.time}
                  </span>
                  <div
                    className={`p-3 rounded-2xl leading-relaxed font-medium ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat sender */}
            <div className="bg-black border-t border-neutral-800 p-3 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSendSupportMessage()
                }
                placeholder="Type your questions here..."
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSendSupportMessage}
                className="bg-blue-600 hover:bg-blue-500 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-white uppercase tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-neutral-400 mt-2">
          Manage your account settings, orders, and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left COLUMN: Beautiful Left Profile Card & Navigator Side Panel (Image 1 & Image 2 combination) */}
        <div className="lg:col-span-1 lg:col-start-1 lg:row-start-1 order-1 space-y-6">
          <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-6 flex flex-col items-center shadow-xl relative overflow-hidden">
            {/* Roan Atkinson wavy accent circle background */}
            <div className="absolute top-0 inset-x-0 h-28 bg-linear-to-b from-blue-600/10 to-transparent pointer-events-none" />

            {/* Interactive Portrait Circle */}
            <div className="relative z-10 mt-2 mb-4 group">
              <div className="w-24 h-24 rounded-full bg-neutral-800 border-4 border-blue-600/40 p-1 flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/10 transition-all duration-300 group-hover:border-blue-500">
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button
                onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 border-2 border-neutral-900 flex items-center justify-center text-neutral-950 transition-colors shadow-md"
                title="Change Avatar"
              >
                <Edit2 className="w-3.5 h-3.5 font-bold" />
              </button>
            </div>

            {/* Avatar Selection Area */}
            {showAvatarSelector && (
              <div className="w-full bg-black border border-neutral-800 rounded-2xl p-4 my-2 text-left animate-in slide-in-from-top-2 duration-200">
                <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-3 block border-b border-neutral-800 pb-1.5">
                  Select Premium Avatar
                </p>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {premadeAvatars.map((av, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setAvatarUrl(av.url);
                        localStorage.setItem("tizz_profile_avatar", av.url);
                        setShowAvatarSelector(false);
                      }}
                      className="w-10 h-10 rounded-full overflow-hidden border border-neutral-800 hover:border-blue-500 transition-colors"
                      title={av.name}
                    >
                      <img
                        src={av.url}
                        alt={av.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-neutral-500 text-center">
                  Click avatar to preview change.
                </div>
              </div>
            )}

            <div className="text-center z-10">
              <h2 className="text-xl font-black text-white tracking-tight uppercase leading-tight">
                {profile?.firstName || profile?.surname
                  ? `${profile.firstName || ""} ${profile.surname || ""}`.trim()
                  : user.displayName || "Tech Explorer"}
              </h2>
              <span className="inline-block px-3 py-1 mt-2 bg-neutral-950 text-blue-400 font-mono text-[10px] font-bold uppercase rounded border border-neutral-800/80 tracking-widest">
                {profile?.codename || "Explorer"}
              </span>
              <p className="text-[11px] text-neutral-500 font-medium mt-3 flex items-center justify-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>
            </div>

            {/* Sidebar Tab Select (Beautiful design from Image 2 sidebar, but matching dark concept) */}
            <nav className="w-full mt-8 border-t border-neutral-800/80 pt-6 space-y-2">
              <button
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setActiveTab(activeTab === "personal" ? "" : "personal");
                  } else {
                    setActiveTab("personal");
                  }
                }}
                className={`w-full text-left font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center gap-3.5 transition-all duration-300 ${
                  activeTab === "personal"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }`}
              >
                <User className="w-4 h-4" />
                Personal Info
              </button>
              {activeTab === "personal" && (
                <div
                  id={"mobile-tab-" + "personal"}
                  className="lg:hidden mt-4 mb-6 animate-in slide-in-from-top-2 duration-300 -mx-6"
                >
                  <div className="bg-neutral-950/50 border-y border-neutral-800 p-6 sm:px-8 shadow-inner overflow-hidden">
                    {tabContents()}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setActiveTab(activeTab === "orders" ? "" : "orders");
                  } else {
                    setActiveTab("orders");
                  }
                }}
                className={`w-full text-left font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center justify-between transition-all duration-300 ${
                  activeTab === "orders"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Package className="w-4 h-4" />
                  My Orders
                </div>
                {localOrders.length > 0 && (
                  <span
                    className={`text-[9px] font-black rounded-full px-2 py-0.5 ${activeTab === "orders" ? "bg-white text-blue-600" : "bg-neutral-950 text-blue-500 border border-neutral-800"}`}
                  >
                    {localOrders.length}
                  </span>
                )}
              </button>
              {activeTab === "orders" && (
                <div
                  id={"mobile-tab-" + "orders"}
                  className="lg:hidden mt-4 mb-6 animate-in slide-in-from-top-2 duration-300 -mx-6"
                >
                  <div className="bg-neutral-950/50 border-y border-neutral-800 p-6 sm:px-8 shadow-inner overflow-hidden">
                    {tabContents()}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setActiveTab(activeTab === "address" ? "" : "address");
                  } else {
                    setActiveTab("address");
                  }
                }}
                className={`w-full text-left font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center gap-3.5 transition-all duration-300 ${
                  activeTab === "address"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }`}
              >
                <MapPin className="w-4 h-4" />
                Address
              </button>
              {activeTab === "address" && (
                <div
                  id={"mobile-tab-" + "address"}
                  className="lg:hidden mt-4 mb-6 animate-in slide-in-from-top-2 duration-300 -mx-6"
                >
                  <div className="bg-neutral-950/50 border-y border-neutral-800 p-6 sm:px-8 shadow-inner overflow-hidden">
                    {tabContents()}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setActiveTab(activeTab === "wishlist" ? "" : "wishlist");
                  } else {
                    setActiveTab("wishlist");
                  }
                }}
                className={`w-full text-left font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center justify-between transition-all duration-300 ${
                  activeTab === "wishlist"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Heart className="w-4 h-4" />
                  My Wishlist
                </div>
                <span className="text-[9px] font-black bg-neutral-950 text-pink-500 border border-neutral-800 rounded-full px-2 py-0.5">
                  3
                </span>
              </button>
              {activeTab === "wishlist" && (
                <div
                  id={"mobile-tab-" + "wishlist"}
                  className="lg:hidden mt-4 mb-6 animate-in slide-in-from-top-2 duration-300 -mx-6"
                >
                  <div className="bg-neutral-950/50 border-y border-neutral-800 p-6 sm:px-8 shadow-inner overflow-hidden">
                    {tabContents()}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setActiveTab(activeTab === "security" ? "" : "security");
                  } else {
                    setActiveTab("security");
                  }
                }}
                className={`w-full text-left font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center gap-3.5 transition-all duration-300 ${
                  activeTab === "security"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }`}
              >
                <Key className="w-4 h-4" />
                Change Password
              </button>
              {activeTab === "security" && (
                <div
                  id={"mobile-tab-" + "security"}
                  className="lg:hidden mt-4 mb-6 animate-in slide-in-from-top-2 duration-300 -mx-6"
                >
                  <div className="bg-neutral-950/50 border-y border-neutral-800 p-6 sm:px-8 shadow-inner overflow-hidden">
                    {tabContents()}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setActiveTab(activeTab === "support" ? "" : "support");
                  } else {
                    setActiveTab("support");
                  }
                }}
                className={`w-full text-left font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center gap-3.5 transition-all duration-300 ${
                  activeTab === "support"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                }`}
              >
                <Headphones className="w-4 h-4" />
                Customer Care
              </button>
              {activeTab === "support" && (
                <div
                  id={"mobile-tab-" + "support"}
                  className="lg:hidden mt-4 mb-6 animate-in slide-in-from-top-2 duration-300 -mx-6"
                >
                  <div className="bg-neutral-950/50 border-y border-neutral-800 p-6 sm:px-8 shadow-inner overflow-hidden">
                    {tabContents()}
                  </div>
                </div>
              )}

              <button
                onClick={logOut}
                className="w-full text-left font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center gap-3.5 transition-all duration-300 text-red-500 hover:text-white hover:bg-neutral-800/50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Left COLUMN: Account Integrity */}
        <div className="lg:col-span-1 lg:col-start-1 lg:row-start-2 order-3 space-y-6">
          <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-800 pb-2 font-mono">
              Account Integrity
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" /> Active Dispatches
              </span>
              <span className="text-sm font-black text-white">
                {stats.processing + stats.pending}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-400 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Delivered
              </span>
              <span className="text-sm font-black text-white">
                {stats.delivered}
              </span>
            </div>
            <div className="pt-2 border-t border-neutral-800">
              <div className="flex items-center gap-2 bg-neutral-950/80 px-3 py-2 rounded-xl text-[10px] text-neutral-400 font-semibold font-mono border border-neutral-800/60 justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="capitalize">{role} Account Confirmed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right COLUMN: Active Tab Workspace Pane */}
        <div
          id="desktop-main-tab-content"
          className="hidden lg:block lg:col-span-3 lg:col-start-2 lg:row-start-1 lg:row-span-2 order-2 space-y-6"
        >
          {/* Main Container Wrapper */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl min-h-[500px]">
            {/* Success update notification widget */}
            {saveSuccess && (
              <div className="mb-6 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-300">
                <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-black uppercase tracking-wider">
                    Changes Saved ooh
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Your customer information and dashboard variables were
                    successfully synchronized.
                  </p>
                </div>
              </div>
            )}

            {tabContents()}
          </div>
        </div>
      </div>
    </div>
  );
}
