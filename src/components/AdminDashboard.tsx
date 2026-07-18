import React, { useState, useMemo, useRef } from 'react';
import { Bell, Package, Plus, Search, ShieldAlert, KeyRound , Edit2, Trash2, LayoutDashboard, ShoppingCart, Tags, Mail, TrendingUp, Users, CheckCircle, AlertCircle, XCircle, BarChart3, FileText, Map, Star, Sliders, MapPin, DollarSign, Eye } from 'lucide-react';
import { Product, Order } from '../types';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth, logAuditActivity } from '../firebase';
import { NewsletterAdmin } from './NewsletterAdmin';
import { AdminManager } from './AdminManager';
import { DashboardStatsSkeleton, TableRowsSkeleton, ChartSkeleton } from './Skeleton';

interface AdminDashboardProps {
  auditLogs?: any[];
  visits?: any[];
  allUsers?: any[];
  products: Product[];
  orders: Order[];
  onUpdateStock: (id: string, newStock: number) => void;
  onUpdateOrderStatus: (id: string, newStatus: string) => void;
  onAddProduct: (newProduct: Product) => void;
  onGoHome: () => void;
  onLogout: () => void;
  isLoading?: boolean;
}

type TabType = 'dashboard' | 'analytics' | 'sales-report' | 'orders' | 'products' | 'attributes' | 'customers' | 'invoices' | 'discounts' | 'delivery' | 'featured' | 'newsletter' | 'admins' | 'audit-logs';

export function AdminDashboard({ products, orders, visits = [], allUsers = [], auditLogs = [], onUpdateStock, onUpdateOrderStatus, onAddProduct, onGoHome, onLogout, isLoading = false }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [previousOrderCount, setPreviousOrderCount] = useState<number | null>(null);
  const [newOrderNotification, setNewOrderNotification] = useState<string | null>(null);

  React.useEffect(() => {
    if (previousOrderCount !== null && orders.length > previousOrderCount) {
      setNewOrderNotification(`New order received! Total orders: ${orders.length}`);
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.3);
          
          setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
            gain2.gain.setValueAtTime(0.1, ctx.currentTime);
            osc2.start(ctx.currentTime);
            osc2.stop(ctx.currentTime + 0.3);
          }, 150);
        }
      } catch(e) {}
      
      const timer = setTimeout(() => setNewOrderNotification(null), 10000);
      return () => clearTimeout(timer);
    }
    setPreviousOrderCount(orders.length);
  }, [orders.length]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'customers') {
      setLoadingUsers(true);
      const token = sessionStorage.getItem('tizzitech_admin_token') || '';
      fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUsers(data.users);
          }
          setLoadingUsers(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingUsers(false);
        });
    }
  }, [activeTab]);
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders' | 'profit'>('revenue');
  const [salesReportFilterMonth, setSalesReportFilterMonth] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [navSearch, setNavSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedMapOrder, setSelectedMapOrder] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [orderModalTab, setOrderModalTab] = useState<'details' | 'email'>('details');
  const [orderFilterTab, setOrderFilterTab] = useState<'remaining' | 'delivered' | 'all'>('remaining');

  // New product form state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [promptConfig, setPromptConfig] = useState<{title: string, onConfirm: (val: string) => void} | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
    name: '', brand: '', category: 'Laptops', price: 0, costPrice: 0, condition: 'New', stock: 0, imageUrl: '', description: ''
  });
  const analyticsStats = useMemo(() => {
    const total = visits.length;
    const registered = visits.filter(v => v.isRegistered).length;
    const guest = total - registered;

    const uniqueVisitors = new Set(visits.map(v => v.visitorId)).size;
    const regular = visits.length - uniqueVisitors; // rough estimate of return visits

    // Group by day for chart
    const dailyVisits: Record<string, number> = {};
    visits.forEach(v => {
      if (v.timestamp) {
        const day = new Date(v.timestamp).toLocaleDateString();
        dailyVisits[day] = (dailyVisits[day] || 0) + 1;
      }
    });

    const chartData = Object.keys(dailyVisits).slice(-14).map(date => ({
      date,
      visits: dailyVisits[date]
    }));

    // Group visits by country & region
    const visitsByCountry: Record<string, number> = {};
    const visitsByRegion: Record<string, number> = {};

    visits.forEach(v => {
      const countryRaw = v.country ? v.country.trim() : '';
      if (!countryRaw || countryRaw.toUpperCase() === 'UNKNOWN') return; // ignore legacy/unknown

      const country = countryRaw.toUpperCase();
      const region = v.region ? v.region.trim() : '';
      
      const countryName = country === 'US' ? 'United States' : (country === 'NG' ? 'Nigeria' : (country === 'GB' ? 'United Kingdom' : countryRaw));
      visitsByCountry[countryName] = (visitsByCountry[countryName] || 0) + 1;

      if (region && region.toUpperCase() !== 'UNKNOWN') {
        const regionKey = `${region} (${countryName})`;
        visitsByRegion[regionKey] = (visitsByRegion[regionKey] || 0) + 1;
      }
    });

    // Group users (signups) by country & region
    const signupsByCountry: Record<string, number> = {};
    const signupsByRegion: Record<string, number> = {};

    allUsers.forEach(u => {
      const countryRaw = u.country ? u.country.trim() : '';
      if (!countryRaw || countryRaw.toUpperCase() === 'UNKNOWN') return; // ignore legacy/unknown

      const country = countryRaw.toUpperCase();
      const region = u.region ? u.region.trim() : '';

      const countryName = country === 'US' ? 'United States' : (country === 'NG' ? 'Nigeria' : (country === 'GB' ? 'United Kingdom' : countryRaw));
      signupsByCountry[countryName] = (signupsByCountry[countryName] || 0) + 1;

      if (region && region.toUpperCase() !== 'UNKNOWN') {
        const regionKey = `${region} (${countryName})`;
        signupsByRegion[regionKey] = (signupsByRegion[regionKey] || 0) + 1;
      }
    });

    const countriesVisitsList = Object.keys(visitsByCountry).map(c => ({
      country: c,
      count: visitsByCountry[c]
    })).sort((a, b) => b.count - a.count);

    const regionsVisitsList = Object.keys(visitsByRegion).map(r => ({
      region: r,
      count: visitsByRegion[r]
    })).sort((a, b) => b.count - a.count);

    const countriesSignupsList = Object.keys(signupsByCountry).map(c => ({
      country: c,
      count: signupsByCountry[c]
    })).sort((a, b) => b.count - a.count);

    const regionsSignupsList = Object.keys(signupsByRegion).map(r => ({
      region: r,
      count: signupsByRegion[r]
    })).sort((a, b) => b.count - a.count);

    return { 
      total, 
      registered, 
      guest, 
      uniqueVisitors, 
      regular, 
      chartData,
      countriesVisitsList,
      regionsVisitsList,
      countriesSignupsList,
      regionsSignupsList
    };
  }, [visits, allUsers]);

  // Brands & Conditions state
  const [brands, setBrands] = useState(['Apple', 'Samsung', 'Sony', 'Dell', 'Asus', 'iPhone', 'MacBook', 'HP', 'Lenovo']);
  const [conditions, setConditions] = useState(['Brand New', 'Like New', 'Excellent', 'Good', 'Fair']);
  const [newBrand, setNewBrand] = useState('');
  const [newCondition, setNewCondition] = useState('');
  
  React.useEffect(() => {
    getDoc(doc(db, 'newsletter_campaigns', 'global_settings'))
      .then(snap => {
        if(snap.exists()) {
          const d = snap.data();
          if(d.brands) setBrands(d.brands);
          if(d.categories) setConditions(d.categories); // Note: we are mapping conditions to categories for now or just keeping it simple
          if(d.deliveryZones) setDeliveryZones(d.deliveryZones);
        }
      })
      .catch(err => {
        console.warn("Could not fetch global settings in AdminDashboard (offline fallback enabled):", err);
      });
  }, []);
  
  const saveSettings = async (b, c, z) => {
    try {
      await setDoc(doc(db, 'newsletter_campaigns', 'global_settings'), { brands: b || brands, categories: c || conditions, deliveryZones: z || deliveryZones }, { merge: true });
    } catch(e) {
      console.error(e);
    }
  };

  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const generateReceipt = (order: Order) => {
    setReceiptOrder(order);
  };

  // Delivery Zones state
  const [deliveryZones, setDeliveryZones] = useState([
  { "zone": "Agege", "state": "Lagos State", "time": "Standard Delivery", "fee": 5000 },
  { "zone": "Ajeromi-Ifelodun", "state": "Lagos State", "time": "Standard Delivery", "fee": 5000 },
  { "zone": "Alimosho", "state": "Lagos State", "time": "Standard Delivery", "fee": 3000 },
  { "zone": "Amuwo-Odofin", "state": "Lagos State", "time": "Standard Delivery", "fee": 5000 },
  { "zone": "Apapa", "state": "Lagos State", "time": "Standard Delivery", "fee": 5000 },
  { "zone": "Badagry", "state": "Lagos State", "time": "Standard Delivery", "fee": 6000 },
  { "zone": "Epe", "state": "Lagos State", "time": "Standard Delivery", "fee": 5000 },
  { "zone": "Eti-Osa", "state": "Lagos State", "time": "Standard Delivery", "fee": 7000 },
  { "zone": "Ibeju-Lekki", "state": "Lagos State", "time": "Standard Delivery", "fee": 5000 },
  { "zone": "Ifako-Ijaiye", "state": "Lagos State", "time": "Standard Delivery", "fee": 5000 },
  { "zone": "Ikeja", "state": "Lagos State", "time": "Standard Delivery", "fee": 5000 },
  { "zone": "Ikorodu", "state": "Lagos State", "time": "Standard Delivery", "fee": 5000 },
  { "zone": "Kosofe", "state": "Lagos State", "time": "Standard Delivery", "fee": 5000 },
  { "zone": "Lagos Island", "state": "Lagos State", "time": "Standard Delivery", "fee": 5000 },
  { "zone": "Lagos Mainland", "state": "Lagos State", "time": "Standard Delivery", "fee": 5000 },
  { "zone": "Mushin", "state": "Lagos State", "time": "Standard Delivery", "fee": 3000 },
  { "zone": "Ojo", "state": "Lagos State", "time": "Standard Delivery", "fee": 5000 },
  { "zone": "Oshodi-Isolo", "state": "Lagos State", "time": "Standard Delivery", "fee": 4000 },
  { "zone": "Shomolu", "state": "Lagos State", "time": "Standard Delivery", "fee": 3500 },
  { "zone": "Surulere", "state": "Lagos State", "time": "Standard Delivery", "fee": 5000 }
]);
  const [showAddZone, setShowAddZone] = useState(false);
  const [newZone, setNewZone] = useState({ zone: '', state: '', time: '', fee: 0 });
  const [editingZoneIndex, setEditingZoneIndex] = useState<number | null>(null);
  const [editingZone, setEditingZone] = useState({ zone: '', state: '', time: '', fee: 0 });

  // Email Notification Toast State
  const [emailToast, setEmailToast] = useState<string | null>(null);

  // Image Upload State
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
              } else {
                resolve(file); // fallback
              }
            },
            'image/jpeg',
            0.7
          );
        };
      };
      reader.onerror = () => resolve(file); // fallback on error
    });
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    setIsUploading(true);
    try {
      const compressedFile = await compressImage(file);
      
      // Convert to Base64 to bypass Vercel serverless limitations with multipart form data
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
      reader.readAsDataURL(compressedFile);
      const base64Data = await base64Promise;

      const token = sessionStorage.getItem('tizzitech_admin_token') || '';
      
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: base64Data })
      });
      
      if (!res.ok && res.headers.get('content-type')?.includes('text/html')) {
          throw new Error('Server returned HTML. Vercel payload limit might be exceeded, or route crashed.');
      }
      
      const data = await res.json();
      if (data.success) {
         setNewProductForm(prev => ({...prev, imageUrl: data.url}));
      } else {
         alert('Upload failed: ' + data.error);
      }
    } catch(err: any) {
      alert('Upload error: ' + err.message + '. If using the preview, the file might still be too large.');
    }
    setIsUploading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  };

  const showEmailToast = (message: string) => {
    setEmailToast(message);
    setTimeout(() => {
      setEmailToast(null);
    }, 3000);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    onUpdateOrderStatus(orderId, newStatus);
    if (newStatus === 'Accepted' || newStatus === 'In Transit') {
      showEmailToast(`Email notification triggered successfully to customer: Order ${newStatus === 'In Transit' ? 'On Route' : newStatus}`);
    } else {
      showEmailToast(`Order status updated to ${newStatus}`);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.id || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.email || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.fullname || o.address || "").toLowerCase().includes(orderSearch.toLowerCase());
    
    if (!matchesSearch) return false;

    if (orderFilterTab === 'remaining') {
      return o.status !== 'Delivered' && o.status !== 'Cancelled';
    } else if (orderFilterTab === 'delivered') {
      return o.status === 'Delivered';
    }
    return true; // 'all'
  });
  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (p.brand || '').toLowerCase().includes(search.toLowerCase()) || 
    (p.id || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = orders.filter(o => o.status === 'Confirmed' || o.status === 'Processing' || o.status === 'Picked Up' || o.status === 'Delivered').reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const activeUsers = 124; // Mock value
  const totalInventoryValue = products.reduce((sum, p) => sum + ((p.costPrice || 0) * p.stock), 0);
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  const NavItem = ({ tab, icon: Icon, label, badge }: { tab: TabType, icon: any, label: string, badge?: number }) => {
    if (navSearch && !label.toLowerCase().includes(navSearch.toLowerCase())) return null;
    return (
    <button 
      onClick={() => setActiveTab(tab)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === tab ? 'bg-blue-500/10 text-blue-400' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
    >
      <Icon className="h-4 w-4" />
      {label}
      {badge ? (
        <span className="ml-auto bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded-full">{badge}</span>
      ) : null}
    </button>
    );
  };

  return (
    <>
      {newOrderNotification && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 flex items-center gap-3 bg-blue-500 text-white px-5 py-3 rounded-lg shadow-xl shadow-blue-500/20 border border-blue-400">
          <Bell className="w-5 h-5 animate-pulse" />
          <div className="font-bold text-sm">
            {newOrderNotification}
          </div>
          <button onClick={() => setNewOrderNotification(null)} className="ml-2 hover:bg-blue-600 p-1 rounded-md transition-colors">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="flex h-screen bg-black text-neutral-300 font-sans absolute inset-0 z-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-950 border-r border-neutral-900 flex flex-col pt-6 h-full flex-shrink-0">
        <div className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <img
               src="/logo.svg"
               alt="Tizzitech Logo"
               className="h-10 w-auto object-contain"
             />
             <span className="text-white font-bold tracking-wider font-serif uppercase">Tizzitech Admin</span>
          </div>
        </div>

        <div className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-thin pb-4">
          <p className="px-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 mt-4">Overview</p>
          <NavItem tab="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem tab="analytics" icon={BarChart3} label="Analytics" />
          <NavItem tab="sales-report" icon={TrendingUp} label="Sales Report" />
          
          <p className="px-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 mt-6">Commerce</p>
          <NavItem tab="orders" icon={ShoppingCart} label="Orders" badge={orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length} />
          <NavItem tab="products" icon={Package} label="Products" />
          <NavItem tab="attributes" icon={Sliders} label="Brands & Conditions" />
          <NavItem tab="customers" icon={Users} label="Customers" />
          <NavItem tab="delivery" icon={Map} label="Delivery Zones" />
          
          <p className="px-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 mt-6">Finance & Marketing</p>
          <NavItem tab="featured" icon={Star} label="Tech of the Day" />
          <NavItem tab="invoices" icon={FileText} label="Invoices" />
          <NavItem tab="discounts" icon={Tags} label="Coupons" />
          <NavItem tab="newsletter" icon={Mail} label="Newsletter" />
          <NavItem tab="admins" icon={ShieldAlert} label="Administrators" />
          <NavItem tab="audit-logs" icon={ShieldAlert} label="Audit Logs" />
        </div>

        <div className="p-4 border-t border-neutral-900 mt-auto flex-shrink-0 space-y-2">
          <button 
            onClick={onLogout}
            className="w-full border border-red-900/30 hover:bg-red-900/20 text-red-400 py-2 rounded-lg text-sm font-bold tracking-wide transition-colors"
          >
             Sign Out
          </button>
          <button 
            onClick={onGoHome}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-2 rounded-lg text-sm font-bold tracking-wide transition-colors"
          >
             Back to Store
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-black h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 border-b border-neutral-900 flex items-center justify-between px-8 bg-neutral-950 flex-shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search navigation tabs..." 
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="h-8 w-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                A
             </div>
          </div>
        </header>

        {/* Global Toast */}
        {emailToast && (
          <div className="absolute top-20 right-8 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 z-50 font-bold text-sm">
            <CheckCircle className="h-5 w-5" />
            {emailToast}
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-neutral-400 text-sm mt-1">Welcome back. Here's what's happening with your business today.</p>
              </div>

              {isLoading ? (
                <>
                  <DashboardStatsSkeleton />
                  <ChartSkeleton />
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">Total Inventory Value</p>
                          <h3 className="text-2xl font-bold text-white mt-2 font-mono">₦{totalInventoryValue.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                          <DollarSign className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="mt-4 text-xs font-bold text-neutral-500 flex items-center gap-1">
                        Based on cost prices
                      </div>
                    </div>

                    <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">Total Revenue</p>
                          <h3 className="text-2xl font-bold text-white mt-2 font-mono">₦{totalRevenue.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="mt-4 text-xs font-bold text-blue-400 flex items-center gap-1">
                        ↑ 12.5% vs last month
                      </div>
                    </div>

                    <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">Active Users</p>
                          <h3 className="text-2xl font-bold text-white mt-2 font-mono">{activeUsers.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                          <Users className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="mt-4 text-xs font-bold text-blue-400 flex items-center gap-1">
                        ↑ 8.2% vs last month
                      </div>
                    </div>

                    <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">Total Orders</p>
                          <h3 className="text-2xl font-bold text-white mt-2 font-mono">{totalOrders.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                          <ShoppingCart className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="mt-4 text-xs font-bold text-rose-400 flex items-center gap-1">
                        ↓ 3.1% vs last month
                      </div>
                    </div>

                    <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">Low Stock Alerts</p>
                          <h3 className="text-2xl font-bold text-white mt-2 font-mono">{lowStockProducts + outOfStockProducts}</h3>
                        </div>
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                          <Package className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="mt-4 text-xs font-bold text-rose-400 flex items-center gap-1">
                        {outOfStockProducts} zero stock items
                      </div>
                    </div>
                  </div>

                  {/* Responsive Chart Area */}
                  <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 mt-6 flex flex-col shadow-sm">
                     <div className="flex justify-between items-center mb-6">
                       <div>
                         <h3 className="text-white font-bold">Overview</h3>
                         <p className="text-xs text-neutral-400">Monthly performance for the current year</p>
                       </div>
                       <div className="flex gap-2 bg-neutral-900 rounded-lg p-1">
                         <button onClick={() => setChartMetric('revenue')} className={`px-3 py-1 rounded text-xs font-bold transition-colors ${chartMetric === 'revenue' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'}`}>Revenue</button>
                         <button onClick={() => setChartMetric('orders')} className={`px-3 py-1 rounded text-xs font-bold transition-colors ${chartMetric === 'orders' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'}`}>Orders</button>
                         <button onClick={() => setChartMetric('profit')} className={`px-3 py-1 rounded text-xs font-bold transition-colors ${chartMetric === 'profit' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'}`}>Profit</button>
                       </div>
                     </div>
                     
                     <div className="w-full mt-4 h-[350px] min-h-[350px]">
                       <ResponsiveContainer width="100%" height="100%">
                         <ComposedChart data={[
                            { name: 'Jan', revenue: 4000, orders: 24, profit: 2400 },
                            { name: 'Feb', revenue: 3000, orders: 18, profit: 1398 },
                            { name: 'Mar', revenue: 5000, orders: 30, profit: 2800 },
                            { name: 'Apr', revenue: 2780, orders: 15, profit: 1908 },
                            { name: 'May', revenue: 6890, orders: 40, profit: 4800 },
                            { name: 'Jun', revenue: 8390, orders: 50, profit: 6800 },
                            { name: 'Jul', revenue: 5490, orders: 35, profit: 4300 },
                            { name: 'Aug', revenue: 6000, orders: 38, profit: 3400 },
                            { name: 'Sep', revenue: 7390, orders: 42, profit: 5300 },
                            { name: 'Oct', revenue: 8090, orders: 55, profit: 6000 },
                            { name: 'Nov', revenue: 9500, orders: 65, profit: 7500 },
                            { name: 'Dec', revenue: 11000, orders: 80, profit: 8900 },
                         ]}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                           <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                           <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => chartMetric === 'orders' ? val : `₦${val/1000}k`} />
                           <Tooltip 
                             contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '8px', color: '#fff' }}
                             itemStyle={{ color: '#fff' }}
                           />
                           {chartMetric === 'revenue' && <Area type="monotone" dataKey="revenue" fill="#3b82f6" fillOpacity={0.1} stroke="#3b82f6" strokeWidth={3} />}
                           {chartMetric === 'revenue' && <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />}
                           {chartMetric === 'orders' && <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />}
                           {chartMetric === 'profit' && <Area type="monotone" dataKey="profit" fill="#8b5cf6" fillOpacity={0.2} stroke="#8b5cf6" strokeWidth={3} />}
                         </ComposedChart>
                       </ResponsiveContainer>
                     </div>
                  </div>
                </>
              )}

              {/* Low Stock Action Center */}
              <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 mt-6 shadow-sm animate-in fade-in">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      Low Stock Action Center
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">Quick replenishment for products below or equal to threshold (5 units)</p>
                  </div>
                  <span className="text-xs bg-amber-500/10 text-amber-400 font-bold px-2.5 py-1 rounded-full border border-amber-500/20">
                    {products.filter(p => p.stock <= 5).length} Items Running Low
                  </span>
                </div>

                {products.filter(p => p.stock <= 5).length === 0 ? (
                  <div className="text-center py-8 bg-neutral-900/10 rounded-xl border border-dashed border-neutral-900">
                    <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm text-neutral-400 font-medium">All products are well stocked!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-neutral-900 text-neutral-400">
                          <th className="pb-3 font-semibold">Product</th>
                          <th className="pb-3 font-semibold">Category</th>
                          <th className="pb-3 font-semibold">Current Stock</th>
                          <th className="pb-3 font-semibold text-right">Quick Restock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900/50">
                        {products.filter(p => p.stock <= 5).map(product => (
                          <tr key={product.id} className="hover:bg-neutral-900/20 transition-colors">
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-neutral-900 rounded overflow-hidden p-0.5 flex items-center justify-center shrink-0">
                                  {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
                                  ) : (
                                    <Package className="h-4 w-4 text-neutral-600" />
                                  )}
                                </div>
                                <div>
                                  <span className="font-bold text-neutral-200 block truncate max-w-[220px]">{product.name}</span>
                                  <span className="text-[10px] text-neutral-500">ID: {product.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-neutral-400">{product.category}</td>
                            <td className="py-3">
                              {product.stock === 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                                  <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                  Out of Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                                  <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                  {product.stock} units
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-right">
                              <div className="inline-flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={product.stock}
                                  onChange={(e) => onUpdateStock(product.id, parseInt(e.target.value) || 0)}
                                  className={`w-16 bg-neutral-900 rounded px-2 py-1 text-center font-mono text-white text-xs ${
                                    product.stock === 0 ? 'border border-rose-500/40' : 'border border-amber-500/40'
                                  }`}
                                />
                                <button
                                  onClick={() => onUpdateStock(product.id, product.stock + 10)}
                                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all whitespace-nowrap active:scale-95 text-[10px]"
                                >
                                  +10 Units
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="animate-in fade-in">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                      Inventory Management
                    </h1>
                    <p className="text-sm text-neutral-400 mt-1">Manage pricing, stocks, and new product listings.</p>
                 </div>
                 <div className="flex items-center gap-3">
                   <button
                     onClick={() => {
                       const headers = ['Product ID', 'Name', 'Category', 'Brand', 'Condition', 'Selling Price (₦)', 'Cost Price (₦)', 'Stock Level'];
                       const rows = products.map(p => [
                         p.id,
                         `"${p.name.replace(/"/g, '""')}"`,
                         `"${p.category || ''}"`,
                         `"${p.brand || ''}"`,
                         `"${p.condition || ''}"`,
                         p.price,
                         p.costPrice || 0,
                         p.stock
                       ].join(','));
                       const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.join('\n');
                       const encodedUri = encodeURI(csvContent);
                       const link = document.createElement("a");
                       link.setAttribute("href", encodedUri);
                       link.setAttribute("download", `inventory_export_${Date.now()}.csv`);
                       document.body.appendChild(link);
                       link.click();
                       link.remove();
                     }}
                     className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide flex items-center gap-2 transition-colors"
                   >
                      <FileText className="h-4 w-4" /> Export Goods
                   </button>
                   <button 
                     onClick={() => setShowAddProduct(true)}
                     className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide flex items-center gap-2 transition-colors"
                   >
                      <Plus className="h-4 w-4" /> Add Product
                   </button>
                 </div>
              </div>

              {showAddProduct && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                  <div className="bg-neutral-950 border border-neutral-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
                    <button onClick={() => setShowAddProduct(false)} className="absolute top-6 right-6 text-neutral-500 hover:text-white"><XCircle className="h-6 w-6" /></button>
                    <h2 className="text-xl font-bold text-white mb-6">Add New Product</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Product Name</label>
                          <input type="text" value={newProductForm.name} onChange={e => setNewProductForm({...newProductForm, name: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Selling Price (₦)</label>
                          <input type="number" value={newProductForm.price} onChange={e => setNewProductForm({...newProductForm, price: Number(e.target.value)})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white font-mono" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Cost Price (₦)</label>
                          <input type="number" value={newProductForm.costPrice} onChange={e => setNewProductForm({...newProductForm, costPrice: Number(e.target.value)})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white font-mono" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">Brand</label>
                            <button type="button" onClick={(e) => {
                              e.preventDefault();
                              setPromptValue('');
                              setPromptConfig({
                                title: 'Enter new brand name:',
                                onConfirm: (newB) => {
                                  if (newB && newB.trim()) {
                                const b = newB.trim();
                                if (!brands.includes(b)) {
                                  const updatedBrands = [...brands, b];
                                  setBrands(updatedBrands);
                                  saveSettings(updatedBrands, null, null);
                                }
                                setNewProductForm({...newProductForm, brand: b});
                              }
                                }
                              });
                            }} className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
                          </div>
                          <select value={newProductForm.brand} onChange={e => setNewProductForm({...newProductForm, brand: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white">
                            <option value="">Select Brand</option>
                            {brands.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">Condition</label>
                            <button type="button" onClick={(e) => {
                              e.preventDefault();
                              setPromptValue('');
                              setPromptConfig({
                                title: 'Enter new condition:',
                                onConfirm: (newC) => {
                                  if (newC && newC.trim()) {
                                const c = newC.trim();
                                if (!conditions.includes(c)) {
                                  const updatedConds = [...conditions, c];
                                  setConditions(updatedConds);
                                  saveSettings(null, updatedConds, null);
                                }
                                setNewProductForm({...newProductForm, condition: c});
                              }
                                }
                              });
                            }} className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
                          </div>
                          <select value={newProductForm.condition} onChange={e => setNewProductForm({...newProductForm, condition: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white">
                            <option value="">Select Condition</option>
                            {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Category</label>
                          <input type="text" value={newProductForm.category} onChange={e => setNewProductForm({...newProductForm, category: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Initial Stock</label>
                          <input type="number" value={newProductForm.stock} onChange={e => setNewProductForm({...newProductForm, stock: Number(e.target.value)})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white font-mono" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Product Image</label>
                        
                        <div 
                          className={`w-full border-2 border-dashed ${isUploading ? 'border-blue-500 bg-blue-500/10' : 'border-neutral-700 hover:border-neutral-500 bg-neutral-900/50'} rounded-lg p-6 text-center transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[120px]`}
                          onClick={() => !isUploading && fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (!isUploading) handleDrop(e); }}
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                          />
                          
                          {isUploading ? (
                            <div className="flex flex-col items-center text-blue-500 animate-pulse">
                              <span className="text-sm font-bold uppercase tracking-widest">Compressing & Uploading...</span>
                            </div>
                          ) : newProductForm.imageUrl ? (
                            <div className="flex flex-col items-center">
                              <img src={newProductForm.imageUrl} alt="Preview" className="h-20 object-contain mb-3 rounded border border-neutral-700" />
                              <span className="text-[10px] text-neutral-400 font-mono break-all max-w-full px-4">{newProductForm.imageUrl}</span>
                              <span className="text-xs text-blue-500 font-bold uppercase mt-2">Click or drag to replace</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center text-neutral-400">
                              <svg className="w-8 h-8 mb-2 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm font-bold">Drag & Drop an image here</span>
                              <span className="text-xs mt-1">or click to browse</span>
                              <span className="text-[10px] mt-2 text-neutral-500 bg-neutral-900 px-2 py-1 rounded border border-neutral-800">Auto-compressed to bypass size limits</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2 flex gap-2 items-center">
                          <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Or enter URL manually:</span>
                          <input type="text" value={newProductForm.imageUrl} onChange={e => setNewProductForm({...newProductForm, imageUrl: e.target.value})} className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-white text-xs font-mono" placeholder="https://" />
                        </div>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Description</label>
                         <textarea value={newProductForm.description} onChange={e => setNewProductForm({...newProductForm, description: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white h-24 resize-none"></textarea>
                      </div>
                      <button 
                        onClick={() => {
                          if (newProductForm.name.trim() !== "" && newProductForm.price >= 0) {
                            onAddProduct({
                              ...newProductForm,
                              id: `p_${Date.now()}`,
                              specs: {},
                              reviews: []
                            } as Product);
                            setShowAddProduct(false);
                            setNewProductForm({name: '', brand: '', category: 'Laptops', price: 0, costPrice: 0, condition: 'New', stock: 0, imageUrl: '', description: ''});
                          }
                        }}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500"
                      >
                        Submit Product
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    className="w-full bg-neutral-950 border border-neutral-900 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Search by product name, brand, or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-neutral-900/50 border-b border-neutral-900">
                    <tr>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Product</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Price</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Status</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Stock Units</th>
                      <th className="py-4 px-6 text-right text-xs font-bold text-neutral-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/50">
                    {isLoading ? (
                      <TableRowsSkeleton cols={5} rows={6} />
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-neutral-900/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-neutral-900 rounded-lg shrink-0 overflow-hidden border border-neutral-800 p-1 flex items-center justify-center text-[10px] text-neutral-600">
                                {product.imageUrl ? (
                                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain" />
                                ) : (
                                  <span>No Img</span>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm">{product.name}</p>
                                <p className="text-xs text-neutral-500 mt-1">ID: {product.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-mono text-white text-sm font-bold">₦{product.price.toLocaleString()}</td>
                          <td className="py-4 px-6">
                            {product.stock > 5 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                                Active
                              </span>
                            ) : product.stock > 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)] animate-pulse">
                                <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20">
                                <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                                Out of Stock
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                               <input
                                 type="number"
                                 min="0"
                                 value={product.stock}
                                 onChange={(e) => onUpdateStock(product.id, parseInt(e.target.value) || 0)}
                                 className={`w-20 bg-neutral-900 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none font-mono text-center transition-all ${
                                   product.stock === 0
                                     ? 'border border-rose-500/40 focus:ring-1 focus:ring-rose-500/50'
                                     : product.stock <= 5
                                     ? 'border border-amber-500/40 focus:ring-1 focus:ring-amber-500/50'
                                     : 'border border-neutral-800 focus:border-blue-500/50'
                                 }`}
                               />
                               {product.stock <= 5 && (
                                 <div className="flex items-center shrink-0">
                                   {product.stock === 0 ? (
                                     <span title="Out of Stock! Please restock.">
                                       <XCircle className="h-4 w-4 text-rose-500" />
                                     </span>
                                   ) : (
                                     <span title={`Low Stock Warning: Only ${product.stock} left.`}>
                                       <AlertCircle className="h-4 w-4 text-amber-400 animate-pulse" />
                                     </span>
                                   )}
                                 </div>
                               )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button disabled className="p-2 text-neutral-500 hover:text-white transition-colors cursor-not-allowed opacity-50" title="Edit (Disabled in mock)">
                              <Edit2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="animate-in fade-in">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Order Management</h1>
                <p className="text-sm text-neutral-400 mt-1">Accept, track, and update customer order statuses.</p>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-neutral-900/60 mb-6">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                  <button
                    onClick={() => setOrderFilterTab('remaining')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                      orderFilterTab === 'remaining'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/25 shadow-sm'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border-transparent'
                    }`}
                  >
                    Remaining Orders
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-extrabold ${
                      orderFilterTab === 'remaining' ? 'bg-amber-500/20 text-amber-300' : 'bg-neutral-900 text-neutral-500'
                    }`}>
                      {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length}
                    </span>
                  </button>

                  <button
                    onClick={() => setOrderFilterTab('delivered')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                      orderFilterTab === 'delivered'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/25 shadow-sm'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border-transparent'
                    }`}
                  >
                    Delivered
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-extrabold ${
                      orderFilterTab === 'delivered' ? 'bg-blue-500/20 text-blue-300' : 'bg-neutral-900 text-neutral-500'
                    }`}>
                      {orders.filter(o => o.status === 'Delivered').length}
                    </span>
                  </button>

                  <button
                    onClick={() => setOrderFilterTab('all')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                      orderFilterTab === 'all'
                        ? 'bg-neutral-800 text-white border-neutral-700 shadow-sm'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border-transparent'
                    }`}
                  >
                    All History
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-extrabold ${
                      orderFilterTab === 'all' ? 'bg-neutral-700 text-neutral-200' : 'bg-neutral-900 text-neutral-500'
                    }`}>
                      {orders.length}
                    </span>
                  </button>
                </div>

                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    className="w-full bg-neutral-950 border border-neutral-900 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Search orders..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-neutral-900/50 border-b border-neutral-900">
                    <tr>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Order ID & Date</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Customer / Address</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Items & Total</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Current Status</th>
                      <th className="py-4 px-6 text-right text-xs font-bold text-neutral-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/50">
                    {isLoading ? (
                      <TableRowsSkeleton cols={5} rows={6} />
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-neutral-500 text-sm">No orders found.</td>
                      </tr>
                    ) : filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-neutral-900/30 transition-colors">
                        <td className="py-4 px-6">
                           <p className="font-mono text-sm font-bold text-blue-400">{order.id}</p>
                           <p className="text-xs text-neutral-500 mt-1">{new Date(order.orderDate).toLocaleDateString()}</p>
                        </td>
                        <td className="py-4 px-6 max-w-[200px]">
                           <p className="text-sm text-white line-clamp-1">{order.address}</p>
                           <p className="text-xs text-neutral-500 mt-1 line-clamp-1">Via secure checkout</p>
                        </td>
                        <td className="py-4 px-6">
                           <p className="text-sm text-white">{order.items.length} items</p>
                           <p className="font-mono text-sm font-bold text-white mt-1">₦{order.total.toLocaleString()}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${(order.status === 'Processing' || order.status === 'Accepted' || order.status === 'Pending') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : order.status === 'Confirmed' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : (order.status === 'Picked Up' || order.status === 'In Transit') ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : order.status === 'Delivered' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 flex justify-end items-center gap-2">
                           <button onClick={() => {
                             const orderWithHistory = { ...order };
                             if (!orderWithHistory.emailHistory) {
                               const orderDate = new Date(order.orderDate);
                               orderWithHistory.emailHistory = [
                                 {
                                   date: orderDate,
                                   subject: '🛍️ Tizzitech Order Confirmation',
                                   recipient: (order as any).email || 'customer-email-not-logged@example.com',
                                   status: 'Sent'
                                 }
                               ];
                               if (order.status !== 'Confirmed') {
                                 const statusDate = new Date(orderDate.getTime() + 1000 * 60 * 60 * 2); // 2 hours later
                                 orderWithHistory.emailHistory.push({
                                   date: statusDate,
                                   subject: `🚚 Order Update: ${order.status}`,
                                   recipient: (order as any).email || 'customer-email-not-logged@example.com',
                                   status: 'Sent'
                                 });
                               }
                             }
                             setSelectedOrderDetails(orderWithHistory);
                           }} className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors border border-transparent hover:border-neutral-700" title="View Order Details">
                              <Eye className="h-4 w-4" />
                           </button>
                           <button onClick={() => setSelectedMapOrder(order.id)} className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors border border-transparent hover:border-neutral-700" title="View Delivery Map Node">
                              <MapPin className="h-4 w-4" />
                           </button>
                           {(order.status === 'Confirmed' || order.status === 'Pending') && (
                              <div className="flex gap-2">
                                 <button onClick={() => handleUpdateOrderStatus(order.id, 'Accepted')} className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 p-1.5 rounded-lg transition-colors border border-amber-500/20" title="Accept Order (Send Email)">
                                    <CheckCircle className="h-4 w-4" />
                                 </button>
                                 <button onClick={() => handleUpdateOrderStatus(order.id, 'Cancelled')} className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 p-1.5 rounded-lg transition-colors border border-rose-500/20" title="Decline">
                                    <XCircle className="h-4 w-4" />
                                 </button>
                              </div>
                           )}
                           {order.status === 'Accepted' && (
                              <button onClick={() => handleUpdateOrderStatus(order.id, 'In Transit')} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold border border-purple-500/20" title="Set On Route (Send Email)">
                                 Set On Route
                              </button>
                           )}
                           {(order.status === 'In Transit' || order.status === 'Processing') && (
                              <button onClick={() => handleUpdateOrderStatus(order.id, 'Picked Up')} className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold border border-indigo-500/20 border-r" title="Ready to pick up">
                                 Ready for Pickup
                              </button>
                           )}
                           {order.status === 'Picked Up' && (
                              <button onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold border border-blue-500/20">
                                 Mark Delivered
                              </button>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DISCOUNTS / COUPONS TAB */}
          {activeTab === 'discounts' && (
             <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">Coupons</h1>
                  <p className="text-neutral-400 text-sm mt-1">Manage promotional discount codes.</p>
                </div>
                <button onClick={() => alert("Coupon creation requires backend support. Feature coming soon!")} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide flex items-center gap-2 transition-colors"><Plus className="h-4 w-4" /> Add Code</button>
              </div>
              <div className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-neutral-900/50 border-b border-neutral-900">
                    <tr>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Code</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Type</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Value</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Uses</th>
                      <th className="py-4 px-6 text-right text-xs font-bold text-neutral-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/50 bg-black">
                     <tr className="hover:bg-neutral-900/30 transition-colors">
                       <td className="py-4 px-6 text-sm font-bold text-white font-mono uppercase">WELCOME10</td>
                       <td className="py-4 px-6 text-sm text-neutral-400">Percentage</td>
                       <td className="py-4 px-6 text-sm font-bold text-white">10% Off</td>
                       <td className="py-4 px-6 text-sm text-neutral-400 font-mono">142 used</td>
                       <td className="py-4 px-6 text-right">
                         <span className="inline-flex px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] uppercase font-bold tracking-wider">Active</span>
                       </td>
                     </tr>
                     <tr className="hover:bg-neutral-900/30 transition-colors">
                       <td className="py-4 px-6 text-sm font-bold text-white font-mono uppercase">FREESHIP24</td>
                       <td className="py-4 px-6 text-sm text-neutral-400">Shipping</td>
                       <td className="py-4 px-6 text-sm font-bold text-white">Free Shipping</td>
                       <td className="py-4 px-6 text-sm text-neutral-400 font-mono">31 used</td>
                       <td className="py-4 px-6 text-right">
                         <span className="inline-flex px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] uppercase font-bold tracking-wider">Paused</span>
                       </td>
                     </tr>
                     <tr className="hover:bg-neutral-900/30 transition-colors">
                       <td className="py-4 px-6 text-sm font-bold text-white font-mono uppercase">BLACKFRIDAY</td>
                       <td className="py-4 px-6 text-sm text-neutral-400">Fixed Cart</td>
                       <td className="py-4 px-6 text-sm font-bold text-white">₦50,000 Off</td>
                       <td className="py-4 px-6 text-sm text-neutral-400 font-mono">928 used</td>
                       <td className="py-4 px-6 text-right">
                         <span className="inline-flex px-2 py-1 bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 rounded text-[10px] uppercase font-bold tracking-wider">Expired</span>
                       </td>
                     </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FEATURED / TECH OF THE DAY TAB */}
          {activeTab === 'featured' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">Tech of the Day</h1>
                  <p className="text-neutral-400 text-sm mt-1">Select and feature a specific product on the front page.</p>
                </div>
                <button onClick={() => alert("Featured product updated!")} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide transition-colors">Save Changes</button>
              </div>
              <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-sm">
                <div className="mb-6">
                   <label className="block text-sm font-bold text-neutral-400 uppercase tracking-widest mb-2">Current Featured Product</label>
                   <select className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors">
                      <option value="">Select a product...</option>
                      {products.map(p => (
                         <option key={p.id} value={p.id}>{p.name} - ₦{p.price.toLocaleString()}</option>
                      ))}
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-bold text-neutral-400 uppercase tracking-widest mb-2">Editor's Note (Optional)</label>
                   <textarea className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors h-32 resize-none" placeholder="Add a short description about why this is the Tech of the Day..."></textarea>
                </div>
              </div>
            </div>
          )}

          {/* ATTRIBUTES TAB */}
          {activeTab === 'attributes' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">Brands & Conditions</h1>
                  <p className="text-neutral-400 text-sm mt-1">Manage filter attributes used across the store.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Brands Column */}
                <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-sm flex flex-col">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-white font-bold text-lg">Brands</h3>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                          placeholder="New brand..."
                          value={newBrand}
                          onChange={(e) => setNewBrand(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const valBrand = newBrand.trim(); 
                              if (valBrand && !brands.includes(valBrand)) {
                                const newB = [...brands, valBrand];
                                setBrands(newB);
                                setNewBrand('');
                                saveSettings(newB, null, null);
                              } else if (brands.includes(valBrand)) {
                                setNewBrand('');
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            const valBrand = newBrand.trim(); 
                            if (valBrand && !brands.includes(valBrand)) {
                              const newB = [...brands, valBrand];
                              setBrands(newB);
                              setNewBrand('');
                              saveSettings(newB, null, null);
                            } else if (brands.includes(valBrand)) {
                              setNewBrand('');
                            }
                          }}
                          className="text-blue-400 text-sm font-bold flex items-center gap-1 hover:text-blue-300 cursor-pointer"
                        >
                           <Plus className="h-4 w-4" /> Add
                        </button>
                      </div>
                   </div>
                   <div className="space-y-3 flex-1 overflow-y-auto max-h-96">
                      {brands.map((brand, idx) => (
                         <div key={idx} className="flex justify-between items-center bg-black border border-neutral-900 px-4 py-3 rounded-lg">
                            <span className="text-white font-medium">{brand}</span>
                            <div className="flex gap-3">
                               <button 
                                 onClick={() => { setBrands(brands.filter(b => b !== brand)); saveSettings(brands.filter(b => b !== brand), null, null); }}
                                 className="text-rose-500/70 hover:text-rose-500 transition-colors"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Conditions Column */}
                <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-sm flex flex-col">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-white font-bold text-lg">Conditions</h3>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                          placeholder="New condition..."
                          value={newCondition}
                          onChange={(e) => setNewCondition(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const valCond = newCondition.trim(); 
                              if (valCond && !conditions.includes(valCond)) {
                                const newC = [...conditions, valCond];
                                setConditions(newC);
                                setNewCondition(''); 
                                saveSettings(null, newC, null);
                              } else if (conditions.includes(valCond)) {
                                setNewCondition('');
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            const valCond = newCondition.trim(); 
                            if (valCond && !conditions.includes(valCond)) {
                              const newC = [...conditions, valCond];
                              setConditions(newC);
                              setNewCondition(''); 
                              saveSettings(null, newC, null);
                            } else if (conditions.includes(valCond)) {
                              setNewCondition('');
                            }
                          }}
                          className="text-blue-400 text-sm font-bold flex items-center gap-1 hover:text-blue-300 cursor-pointer"
                        >
                           <Plus className="h-4 w-4" /> Add
                        </button>
                      </div>
                   </div>
                   <div className="space-y-3 flex-1 overflow-y-auto max-h-96">
                      {conditions.map((cond, idx) => (
                         <div key={idx} className="flex justify-between items-center bg-black border border-neutral-900 px-4 py-3 rounded-lg">
                            <span className="text-white font-medium">{cond}</span>
                            <div className="flex gap-3">
                               <button 
                                 onClick={() => { setConditions(conditions.filter(c => c !== cond)); saveSettings(null, conditions.filter(c => c !== cond), null); }}
                                 className="text-rose-500/70 hover:text-rose-500 transition-colors"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

              </div>
            </div>
          )}

          {/* DELIVERY TAB */}
          {activeTab === 'delivery' && (
            <div className="animate-in fade-in space-y-6">
               <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">Delivery Zones</h1>
                  <p className="text-neutral-400 text-sm mt-1">Configure LGA delivery pricing and regions.</p>
                </div>
                <button 
                  onClick={() => setShowAddZone(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide flex items-center gap-2 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Zone
                </button>
              </div>

              {showAddZone && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                  <div className="bg-neutral-950 border border-neutral-900 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                    <button onClick={() => setShowAddZone(false)} className="absolute top-6 right-6 text-neutral-500 hover:text-white"><XCircle className="h-6 w-6" /></button>
                    <h2 className="text-xl font-bold text-white mb-6">Add Delivery Zone</h2>
                    <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Zone Name</label>
                          <input type="text" value={newZone.zone} onChange={e => setNewZone({...newZone, zone: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">State / Region</label>
                          <input type="text" value={newZone.state} onChange={e => setNewZone({...newZone, state: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Estimated Time</label>
                          <input type="text" value={newZone.time} onChange={e => setNewZone({...newZone, time: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Fee (₦)</label>
                          <input type="number" value={newZone.fee} onChange={e => setNewZone({...newZone, fee: Number(e.target.value)})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white font-mono" />
                        </div>
                        <button 
                          onClick={() => {
                            if (newZone.zone && newZone.state) {
                              const nz = [...deliveryZones, newZone];
                              setDeliveryZones(nz);
                              saveSettings(null, null, nz);
                              logAuditActivity('DELIVERY_ZONE_ADD', `Added delivery zone: ${newZone.zone} (${newZone.state}) with fee ₦${newZone.fee}`, auth.currentUser?.email || 'admin@tizzitech.com');
                              setShowAddZone(false);
                              setNewZone({zone: '', state: '', time: '', fee: 0});
                            }
                          }}
                          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 mt-4"
                        >
                          Save Zone
                        </button>
                    </div>
                  </div>
                </div>
              )}

              {editingZoneIndex !== null && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                  <div className="bg-neutral-950 border border-neutral-900 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                    <button onClick={() => setEditingZoneIndex(null)} className="absolute top-6 right-6 text-neutral-500 hover:text-white"><XCircle className="h-6 w-6" /></button>
                    <h2 className="text-xl font-bold text-white mb-6">Edit Delivery Zone</h2>
                    <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Zone Name</label>
                          <input type="text" value={editingZone.zone} onChange={e => setEditingZone({...editingZone, zone: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">State / Region</label>
                          <input type="text" value={editingZone.state} onChange={e => setEditingZone({...editingZone, state: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Estimated Time</label>
                          <input type="text" value={editingZone.time} onChange={e => setEditingZone({...editingZone, time: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Fee (₦)</label>
                          <input type="number" value={editingZone.fee} onChange={e => setEditingZone({...editingZone, fee: Number(e.target.value)})} className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white font-mono" />
                        </div>
                        <button 
                          onClick={() => {
                            if (editingZone.zone && editingZone.state) {
                              const nz = [...deliveryZones];
                              const oldZone = nz[editingZoneIndex];
                              nz[editingZoneIndex] = editingZone;
                              setDeliveryZones(nz);
                              saveSettings(null, null, nz);
                              logAuditActivity('DELIVERY_ZONE_UPDATE', `Updated delivery zone: ${oldZone.zone} (${oldZone.state}) -> Price: ₦${oldZone.fee} to ₦${editingZone.fee}, Time: "${oldZone.time}" to "${editingZone.time}"`, auth.currentUser?.email || 'admin@tizzitech.com');
                              setEditingZoneIndex(null);
                            }
                          }}
                          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 mt-4"
                        >
                          Save Changes
                        </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-neutral-900/50 border-b border-neutral-900">
                    <tr>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Zone / State</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Est. Time</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Fee (Standard)</th>
                      <th className="py-4 px-6 text-right text-xs font-bold text-neutral-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/50 bg-black">
                     {deliveryZones.map((z, idx) => (
                       <tr key={idx} className="hover:bg-neutral-900/30 transition-colors">
                         <td className="py-4 px-6">
                            <p className="text-sm font-bold text-white">{z.zone}</p>
                            <p className="text-xs text-neutral-500">{z.state}</p>
                         </td>
                         <td className="py-4 px-6 text-sm text-neutral-400">{z.time}</td>
                         <td className="py-4 px-6 text-sm font-bold text-white font-mono">₦{z.fee.toLocaleString()}</td>
                         <td className="py-4 px-6 text-right flex justify-end gap-2">
                           <button 
                             onClick={() => {
                               setEditingZoneIndex(idx);
                               setEditingZone({ ...z });
                             }}
                             className="text-blue-400 hover:text-blue-300 text-sm font-bold transition-colors"
                           >
                             Edit
                           </button>
                           <button 
                             onClick={() => {
                               if (window.confirm(`Are you sure you want to delete delivery zone: ${z.zone}?`)) {
                                 const nz = deliveryZones.filter((_, i) => i !== idx);
                                 setDeliveryZones(nz);
                                 saveSettings(null, null, nz);
                                 logAuditActivity('DELIVERY_ZONE_DELETE', `Deleted delivery zone: ${z.zone} (${z.state})`, auth.currentUser?.email || 'admin@tizzitech.com');
                               }
                             }} 
                             className="text-rose-500/70 hover:text-rose-500 text-sm font-bold transition-colors ml-2"
                           >
                             Delete
                           </button>
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="animate-in fade-in space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Analytics</h1>
                <p className="text-neutral-400 text-sm mt-1">Detailed performance metrics and visitor insights.</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                 <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-sm">
                   <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-4">Total Visitors</h3>
                   <div className="text-4xl font-black text-white">{analyticsStats.total.toLocaleString()}</div>
                 </div>
                 <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-sm">
                   <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-4">Unique Visitors</h3>
                   <div className="text-4xl font-black text-white">{analyticsStats.uniqueVisitors.toLocaleString()}</div>
                 </div>
                 <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-sm">
                   <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-4">Registered Users</h3>
                   <div className="text-4xl font-black text-blue-500">{analyticsStats.registered.toLocaleString()}</div>
                 </div>
                 <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-sm">
                   <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-4">Guests</h3>
                   <div className="text-4xl font-black text-neutral-500">{analyticsStats.guest.toLocaleString()}</div>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-sm col-span-2">
                   <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-6">Daily Visits (Last 14 Days)</h3>
                   <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={analyticsStats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                         <defs>
                           <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                           </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                         <XAxis dataKey="date" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                         <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                         <Tooltip 
                           contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #262626', borderRadius: '8px', fontSize: '12px' }}
                           itemStyle={{ color: '#fff' }}
                         />
                         <Area type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                       </AreaChart>
                     </ResponsiveContainer>
                   </div>
                 </div>
                 <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-sm">
                   <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-4">Visitor Type Breakdown</h3>
                   <div className="w-40 h-40 mx-auto rounded-full border-[16px] border-neutral-900 border-t-blue-500 border-r-indigo-500 border-b-purple-500 relative flex items-center justify-center">
                      <div className="text-center">
                         <span className="block text-xl font-bold text-white">{analyticsStats.total > 0 ? '100%' : '0%'}</span>
                         <span className="text-[10px] text-neutral-500 uppercase">Visits</span>
                      </div>
                   </div>
                   <div className="mt-6 space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Signed Up</span>
                        <span className="font-bold text-white">
                          {analyticsStats.total > 0 ? Math.round((analyticsStats.registered / analyticsStats.total) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div>Guest / Non-Signed Up</span>
                        <span className="font-bold text-white">
                          {analyticsStats.total > 0 ? Math.round((analyticsStats.guest / analyticsStats.total) * 100) : 0}%
                        </span>
                      </div>
                   </div>
                 </div>
              </div>

              {/* Geolocation Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visits by Location */}
                <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-neutral-200 text-sm font-bold uppercase tracking-wider">Visits by Location</h3>
                      <p className="text-xs text-neutral-500 mt-1">Countries and regions where your visitors originate from.</p>
                    </div>
                    <div className="px-2.5 py-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 rounded-full">
                      Live Tracking
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Top Countries */}
                    <div>
                      <h4 className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-3">Top Countries</h4>
                      {analyticsStats.countriesVisitsList.length === 0 ? (
                        <p className="text-xs text-neutral-600 italic">No geolocation data recorded yet.</p>
                      ) : (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                          {analyticsStats.countriesVisitsList.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="text-neutral-300 font-medium">{item.country}</span>
                              <span className="text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded font-mono font-bold">
                                {item.count} {item.count === 1 ? 'visit' : 'visits'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Top Regions */}
                    <div>
                      <h4 className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-3">Top Regions</h4>
                      {analyticsStats.regionsVisitsList.length === 0 ? (
                        <p className="text-xs text-neutral-600 italic">No region data recorded yet.</p>
                      ) : (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                          {analyticsStats.regionsVisitsList.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="text-neutral-300 font-medium truncate max-w-[150px]">{item.region}</span>
                              <span className="text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded font-mono font-bold">
                                {item.count} {item.count === 1 ? 'visit' : 'visits'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Signups by Location */}
                <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-neutral-200 text-sm font-bold uppercase tracking-wider">User Signups by Location</h3>
                      <p className="text-xs text-neutral-500 mt-1">Countries and regions where users registered.</p>
                    </div>
                    <div className="px-2.5 py-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 rounded-full">
                      Signups
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Top Countries */}
                    <div>
                      <h4 className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-3">Top Countries</h4>
                      {analyticsStats.countriesSignupsList.length === 0 ? (
                        <p className="text-xs text-neutral-600 italic">No signup geo data recorded yet.</p>
                      ) : (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                          {analyticsStats.countriesSignupsList.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="text-neutral-300 font-medium">{item.country}</span>
                              <span className="text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded font-mono font-bold border border-emerald-900/40">
                                {item.count} {item.count === 1 ? 'user' : 'users'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Top Regions */}
                    <div>
                      <h4 className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-3">Top Regions</h4>
                      {analyticsStats.regionsSignupsList.length === 0 ? (
                        <p className="text-xs text-neutral-600 italic">No signup region data recorded yet.</p>
                      ) : (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                          {analyticsStats.regionsSignupsList.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="text-neutral-300 font-medium truncate max-w-[150px]">{item.region}</span>
                              <span className="text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded font-mono font-bold border border-emerald-900/40">
                                {item.count} {item.count === 1 ? 'user' : 'users'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SALES REPORT TAB */}
          {activeTab === 'sales-report' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">Sales & Goods Report</h1>
                  <p className="text-neutral-400 text-sm mt-1">Track monthly sales by product, analyze costs, and export data.</p>
                </div>
                <div className="flex gap-3">
                  <select 
                    value={salesReportFilterMonth}
                    onChange={(e) => setSalesReportFilterMonth(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-2 outline-none focus:border-blue-500"
                  >
                    <option value="All">All Months (Cumulative)</option>
                    {Array.from(new Set(orders.map(o => new Date(o.orderDate).toLocaleString('default', { month: 'long', year: 'numeric' }))))
                      .sort((a,b) => new Date(b).getTime() - new Date(a).getTime())
                      .map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                  </select>
                  <button
                    onClick={() => {
                      // Export logic here
                      const headers = ['Month', 'Order ID', 'Product', 'Brand', 'Condition', 'Quantity', 'Selling Price (₦)', 'Cost Price (₦)', 'Profit (₦)'];
                      const rows: string[] = [];
                      orders.forEach(order => {
                        const month = new Date(order.orderDate).toLocaleString('default', { month: 'long', year: 'numeric' });
                        if (salesReportFilterMonth !== 'All' && month !== salesReportFilterMonth) return;
                        order.items.forEach(item => {
                          const productRef = products.find(p => p.id === item.id) || item;
                          const costPrice = productRef.costPrice || 0;
                          const profit = (item.price - costPrice) * item.quantity;
                          rows.push([
                            month,
                            order.id,
                            `"${item.name.replace(/"/g, '""')}"`,
                            `"${productRef.brand || ''}"`,
                            `"${productRef.condition || ''}"`,
                            item.quantity,
                            item.price,
                            costPrice,
                            profit
                          ].join(','));
                        });
                      });
                      const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.join('\n');
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `sales_report_${salesReportFilterMonth.replace(/ /g, '_')}_${Date.now()}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
                  >
                    <FileText className="h-4 w-4" /> Export Sales (CSV)
                  </button>
                </div>
              </div>

              {/* Data Presentation */}
              <div className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                   <thead className="bg-neutral-900/50 border-b border-neutral-900">
                     <tr>
                       <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Product</th>
                       <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Quantity Sold</th>
                       <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Revenue</th>
                       <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Cost</th>
                       <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Est. Profit</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-neutral-900/50">
                     {(() => {
                       const productStats: Record<string, { name: string, brand: string, count: number, revenue: number, cost: number, profit: number }> = {};
                       
                       orders.forEach(order => {
                         const month = new Date(order.orderDate).toLocaleString('default', { month: 'long', year: 'numeric' });
                         if (salesReportFilterMonth !== 'All' && month !== salesReportFilterMonth) return;
                         
                         order.items.forEach(item => {
                           if (!productStats[item.id]) {
                             const productRef = products.find(p => p.id === item.id) || item;
                             productStats[item.id] = { 
                               name: item.name, 
                               brand: productRef.brand || 'Unknown', 
                               count: 0, 
                               revenue: 0, 
                               cost: 0, 
                               profit: 0 
                             };
                           }
                           const productRef = products.find(p => p.id === item.id) || item;
                           const costPrice = productRef.costPrice || 0;
                           
                           productStats[item.id].count += item.quantity;
                           productStats[item.id].revenue += (item.price * item.quantity);
                           productStats[item.id].cost += (costPrice * item.quantity);
                           productStats[item.id].profit += ((item.price - costPrice) * item.quantity);
                         });
                       });
                       
                       const sortedProducts = Object.values(productStats).sort((a,b) => b.revenue - a.revenue);
                       let totalRevenue = 0, totalCost = 0, totalProfit = 0, totalItems = 0;
                       
                       return (
                         <>
                           {sortedProducts.map((stats, i) => {
                             totalRevenue += stats.revenue;
                             totalCost += stats.cost;
                             totalProfit += stats.profit;
                             totalItems += stats.count;
                             return (
                               <tr key={i} className="hover:bg-neutral-900/30 transition-colors">
                                 <td className="py-4 px-6">
                                   <div className="font-bold text-white">{stats.name}</div>
                                   <div className="text-xs text-neutral-500">{stats.brand}</div>
                                 </td>
                                 <td className="py-4 px-6 text-neutral-300">{stats.count} units</td>
                                 <td className="py-4 px-6 text-neutral-300 font-mono">₦{stats.revenue.toLocaleString()}</td>
                                 <td className="py-4 px-6 text-neutral-400 font-mono">₦{stats.cost.toLocaleString()}</td>
                                 <td className="py-4 px-6 text-green-400 font-mono">+₦{stats.profit.toLocaleString()}</td>
                               </tr>
                             )
                           })}
                           {sortedProducts.length > 0 && (
                             <tr className="bg-neutral-900/40">
                               <td className="py-4 px-6 text-white font-bold uppercase tracking-widest text-xs">Total</td>
                               <td className="py-4 px-6 text-white font-bold">{totalItems} units</td>
                               <td className="py-4 px-6 text-white font-mono font-bold">₦{totalRevenue.toLocaleString()}</td>
                               <td className="py-4 px-6 text-neutral-300 font-mono font-bold">₦{totalCost.toLocaleString()}</td>
                               <td className="py-4 px-6 text-green-400 font-mono font-bold">+₦{totalProfit.toLocaleString()}</td>
                             </tr>
                           )}
                           {sortedProducts.length === 0 && (
                             <tr>
                               <td colSpan={5} className="py-8 text-center text-neutral-500">No sales data available.</td>
                             </tr>
                           )}
                         </>
                       );
                     })()}
                   </tbody>
                 </table>
              </div>
            </div>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">Customers</h1>
                  <p className="text-neutral-400 text-sm mt-1">View and manage your customer database.</p>
                </div>
              </div>
              <div className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-neutral-900/50 border-b border-neutral-900">
                    <tr>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Customer</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Location</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Orders</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Products Bought</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/50">
                    {isLoading ? (
                      <TableRowsSkeleton cols={5} rows={6} />
                    ) : (
                      <>
                        {/* Distinct customers from orders */}
                    {Array.from(new Set(orders.map(o => o.email || o.address))).map((key, idx) => {
                       const customerOrders = orders.filter(o => (o.email || o.address) === key);
                       const spent = customerOrders.reduce((sum, o) => sum + o.total, 0);
                       const firstOrder = customerOrders[0];
                       const name = firstOrder?.fullname || `Customer ${idx + 1}`;
                       const email = firstOrder?.email || `customer${idx + 1}@example.com`;
                       const address = firstOrder?.address || '';
                       const initials = name.substring(0, 2).toUpperCase();
                       const allProducts = customerOrders.flatMap(o => (o.items || []).map((i: any) => i.name || 'Product'));
                       const uniqueProducts = Array.from(new Set(allProducts));

                       return (
                         <tr key={idx} className="hover:bg-neutral-900/30 transition-colors">
                           <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                                    {initials}
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-white">{name}</p>
                                    <p className="text-xs text-neutral-500">{email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 px-6 text-sm text-neutral-400 max-w-[200px] truncate">{address}</td>
                           <td className="py-4 px-6 text-sm text-white font-mono">{customerOrders.length}</td>
                           <td className="py-4 px-6 text-sm text-neutral-400">
                             <div className="flex flex-wrap gap-1">
                               {uniqueProducts.map((p, i) => (
                                 <span key={i} className="inline-block px-2 py-1 bg-neutral-900 rounded text-xs truncate max-w-[150px]">
                                   {p}
                                 </span>
                               ))}
                             </div>
                           </td>
                           <td className="py-4 px-6 text-sm text-white font-mono font-bold">₦{spent.toLocaleString()}</td>
                         </tr>
                       );
                    })}
                    {filteredOrders.length === 0 && (
                      <tr className="hover:bg-neutral-900/30 transition-colors">
                        <td className="py-4 px-6">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">JD</div>
                              <div>
                                 <p className="text-sm font-bold text-white">John Doe</p>
                                 <p className="text-xs text-neutral-500">john@example.com</p>
                              </div>
                           </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-neutral-400">Lagos, Nigeria</td>
                        <td className="py-4 px-6 text-sm text-white font-mono">0</td>
                        <td className="py-4 px-6 text-sm text-neutral-400">No products</td>
                        <td className="py-4 px-6 text-sm text-white font-mono font-bold">₦0</td>
                      </tr>
                    )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* INVOICES TAB */}
          {activeTab === 'invoices' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">Invoices</h1>
                  <p className="text-neutral-400 text-sm mt-1">Manage and track billing invoices.</p>
                </div>
                <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm tracking-wide transition-colors">
                  Print Invoices List
                </button>
              </div>
              <div className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-neutral-900/50 border-b border-neutral-900">
                    <tr>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Invoice ID</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Date</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Amount</th>
                      <th className="py-4 px-6 text-xs font-bold text-neutral-400 uppercase tracking-widest">Status</th>
                      <th className="py-4 px-6 text-right text-xs font-bold text-neutral-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/50">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={`inv-${order.id}`} className="hover:bg-neutral-900/30 transition-colors">
                        <td className="py-4 px-6 font-mono text-sm text-white">INV-{order.id.slice(2)}</td>
                        <td className="py-4 px-6 text-sm text-neutral-400">{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td className="py-4 px-6 font-mono text-sm font-bold text-white">₦{order.total.toLocaleString()}</td>
                        <td className="py-4 px-6">
                           <span className="inline-flex px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] uppercase font-bold tracking-wider">Paid</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                           <button onClick={() => generateReceipt(order)} className="text-blue-400 hover:text-blue-300 text-sm font-bold transition-colors">Generate Receipt</button>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-neutral-500 text-sm">No invoices generated yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

{activeTab === 'admins' && (
            <div className="p-8 animate-fade-in overflow-y-auto h-full">
              <AdminManager />
            </div>
          )}

          {activeTab === 'newsletter' && (
            <div className="animate-in fade-in space-y-6">
              <NewsletterAdmin />
            </div>
          )}

          {activeTab === 'audit-logs' && (
            <div className="animate-in fade-in space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-3"><ShieldAlert className="w-6 h-6 text-emerald-500" /> Security & Audit Logs</h1>
                  <p className="text-neutral-400 text-sm mt-1">Review system access, security events, and administrative activities.</p>
                </div>
              </div>
              
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="bg-black p-4 font-bold uppercase tracking-widest text-xs text-neutral-500 border-b border-neutral-800">Timestamp</th>
                      <th className="bg-black p-4 font-bold uppercase tracking-widest text-xs text-neutral-500 border-b border-neutral-800">Action</th>
                      <th className="bg-black p-4 font-bold uppercase tracking-widest text-xs text-neutral-500 border-b border-neutral-800">Admin Email</th>
                      <th className="bg-black p-4 font-bold uppercase tracking-widest text-xs text-neutral-500 border-b border-neutral-800">Details</th>
                      <th className="bg-black p-4 font-bold uppercase tracking-widest text-xs text-neutral-500 border-b border-neutral-800 text-right">Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {isLoading ? (
                      <TableRowsSkeleton cols={5} rows={6} />
                    ) : (
                      <>
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-black/30 transition-colors">
                            <td className="p-4">
                               <div className="text-sm font-medium text-neutral-300">{new Date(log.timestamp).toLocaleString()}</div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                                log.action === 'LOGIN_ATTEMPT' ? 'bg-blue-500/10 text-blue-400' :
                                log.action === 'LOGOUT' ? 'bg-neutral-500/10 text-neutral-400' :
                                log.action === 'STOCK_UPDATE' ? 'bg-purple-500/10 text-purple-400' :
                                log.action === 'ORDER_UPDATE' ? 'bg-emerald-500/10 text-emerald-400' :
                                'bg-neutral-800 text-neutral-300'
                              }`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-neutral-300">{log.email}</td>
                            <td className="p-4 text-sm text-neutral-400">{log.details}</td>
                            <td className="p-4 text-xs text-neutral-500 text-right space-y-1">
                               <div>IP: {log.ip || 'unknown'}</div>
                               <div className="truncate max-w-[200px]" title={log.userAgent}>{log.userAgent || 'unknown'}</div>
                            </td>
                          </tr>
                        ))}
                        {auditLogs.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-neutral-500 text-sm">No audit logs found.</td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* OTHER PLACEHOLDER TABS */}
          {['ecommerce', 'crm', 'saas', 'charts', 'chat', 'files', 'kanban', 'calendar', 'wizard', 'forms', 'billing'].includes(activeTab) && (
             <div className="animate-in fade-in flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
                <div className="h-16 w-16 bg-neutral-900 rounded-2xl flex items-center justify-center mb-6">
                   <Package className="h-8 w-8 text-neutral-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2 capitalize">{activeTab}</h2>
                <p className="text-neutral-400 text-sm mb-8">This module is currently being configured and will bring additional administrative capabilities to your workflow soon.</p>
                <button className="bg-neutral-900 text-white px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-colors">
                   Configure Module
                </button>
             </div>
          )}

        </div>
      </main>

      {/* Map Viewer Modal */}
      {selectedMapOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="bg-neutral-950 border border-neutral-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
               <div className="p-4 border-b border-neutral-900 flex justify-between items-center bg-neutral-900/50">
                  <div className="flex items-center gap-3">
                     <MapPin className="text-blue-500 h-5 w-5" />
                     <h3 className="text-white font-bold text-sm">Delivery Location Map - Order #{selectedMapOrder.slice(0, 8)}</h3>
                  </div>
                  <button onClick={() => setSelectedMapOrder(null)} className="text-neutral-500 hover:text-white transition-colors">
                     <XCircle className="h-5 w-5" />
                  </button>
               </div>
               <div className="p-1 bg-neutral-900 relative">
                  {/* Real Live Map View */}
                  <div className="w-full h-[400px] bg-neutral-950 rounded-xl relative overflow-hidden border border-neutral-900">
                     <iframe 
                       width="100%" 
                       height="100%" 
                       frameBorder="0" 
                       scrolling="no" 
                       marginHeight={0} 
                       marginWidth={0} 
                       src={`https://maps.google.com/maps?q=${encodeURIComponent(orders.find(o => o.id === selectedMapOrder)?.address || 'Lagos, Nigeria')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                       className="rounded-xl border-none filter invert contrast-[1.15] hue-rotate-[180deg] brightness-[0.85] w-full h-full"
                       title="Delivery Location Map"
                     ></iframe>
                     
                     <div className="absolute bottom-4 right-4 bg-neutral-950/90 backdrop-blur border border-neutral-800 p-3 rounded-xl flex items-center gap-3 shadow-2xl z-10">
                        <div className="h-10 w-10 bg-neutral-900 rounded-lg flex items-center justify-center text-blue-500">
                           <Map className="h-5 w-5" />
                        </div>
                        <div>
                           <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Distance (Est.)</p>
                           <p className="text-sm font-mono font-bold text-white">
                              {Math.floor(Math.random() * 8 + 3)}.{Math.floor(Math.random() * 9)} km
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="p-4 bg-neutral-950 flex justify-end gap-3 border-t border-neutral-900">
                  <button onClick={() => setSelectedMapOrder(null)} className="px-4 py-2 rounded-lg text-sm font-bold text-neutral-400 hover:text-white transition-colors">
                     Close Map
                  </button>
                  <button className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-500/20">
                     Dispatch Rider
                  </button>
               </div>
           </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-neutral-900 flex justify-between items-start bg-neutral-900/10">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Order Details #{selectedOrderDetails.id}</h3>
                <p className="text-sm text-neutral-400">Date: {new Date(selectedOrderDetails.orderDate).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => generateReceipt(selectedOrderDetails)} className="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center gap-1 transition-colors">
                  <FileText className="h-4 w-4" /> Generate Receipt
                </button>
                <button onClick={() => setSelectedOrderDetails(null)} className="text-neutral-500 hover:text-white transition-colors">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="flex border-b border-neutral-900 px-6 mt-4">
              <button 
                onClick={() => setOrderModalTab('details')}
                className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${orderModalTab === 'details' ? 'border-indigo-500 text-white' : 'border-transparent text-neutral-400 hover:text-white'}`}
              >
                Order Summary
              </button>
              <button 
                onClick={() => setOrderModalTab('email')}
                className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${orderModalTab === 'email' ? 'border-indigo-500 text-white' : 'border-transparent text-neutral-400 hover:text-white'}`}
              >
                Email History
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {orderModalTab === 'details' && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-neutral-900/30 p-4 rounded-xl border border-neutral-900">
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Customer Info</p>
                      <p className="text-sm text-white">{selectedOrderDetails.address}</p>
                      <p className="text-xs text-neutral-400 mt-2">Delivery expected by {new Date(selectedOrderDetails.expectedDeliveryDate).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-neutral-900/30 p-4 rounded-xl border border-neutral-900">
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Order Status</p>
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold border ${(selectedOrderDetails.status === 'Processing' || selectedOrderDetails.status === 'Accepted' || selectedOrderDetails.status === 'Pending') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : selectedOrderDetails.status === 'Confirmed' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : (selectedOrderDetails.status === 'Picked Up' || selectedOrderDetails.status === 'In Transit') ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : selectedOrderDetails.status === 'Delivered' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                        {selectedOrderDetails.status}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-bold mb-3 border-b border-neutral-900 pb-2">Items Ordered</h4>
                    <div className="space-y-3">
                      {selectedOrderDetails.items.map((item, idx) => { const productRef = products.find(p => p.id === item.id) || item; return (
                        <div key={idx} className="flex justify-between items-center bg-neutral-900/20 p-3 rounded-lg border border-neutral-900/50">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-neutral-800 rounded flex items-center justify-center p-1">
                              {productRef.imageUrl ? <img src={productRef.imageUrl} alt={productRef.name || 'Product'} className="max-h-full object-contain" /> : <Package className="h-4 w-4 text-neutral-500" />}
                            </div>
                            <div>
                              <p className="text-sm text-white font-bold">{productRef.name || 'Unknown Product'}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-xs text-neutral-500">Qty: {item.quantity}</span>
                                {productRef.brand && <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">{productRef.brand}</span>}
                                {productRef.condition && <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">{productRef.condition}</span>}
                                {productRef.category && <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">{productRef.category}</span>}
                              </div>
                            </div>
                          </div>
                          <p className="font-mono text-sm text-neutral-300">₦{((item.price || 0) * (item.quantity || 0)).toLocaleString()}</p>
                        </div>
                      );})}
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-900 flex justify-between items-center px-2">
                       <span className="text-neutral-400 font-bold">Total Amount</span>
                       <span className="text-xl font-mono font-bold text-white">₦{selectedOrderDetails.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {orderModalTab === 'email' && (
                <div className="animate-in fade-in">
                   <h4 className="text-white font-bold mb-4 border-b border-neutral-900 pb-2">Automated Notifications Sent</h4>
                   
                   {!selectedOrderDetails.emailHistory || selectedOrderDetails.emailHistory.length === 0 ? (
                      <div className="text-center py-8 text-neutral-500">
                         <Mail className="h-8 w-8 mx-auto mb-3 opacity-20" />
                         <p className="text-sm">No email history found for this order.</p>
                      </div>
                   ) : (
                      <div className="space-y-4 relative border-l-2 border-neutral-900 ml-3 pl-6">
                        {selectedOrderDetails.emailHistory.map((email, idx) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-[31px] top-1 h-3 w-3 bg-neutral-950 border-2 border-indigo-500 rounded-full"></div>
                            <div className="bg-neutral-900/30 p-4 rounded-xl border border-neutral-900">
                               <div className="flex justify-between items-start mb-2">
                                  <div>
                                     <h5 className="text-sm font-bold text-white">{email.subject}</h5>
                                     <p className="text-xs text-neutral-500 mt-1">To: {email.recipient}</p>
                                  </div>
                                  <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded ${email.status === 'Sent' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : email.status === 'Failed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                     {email.status}
                                  </span>
                               </div>
                               <p className="text-xs text-neutral-400 font-mono mt-3 text-right">
                                  {new Date(email.date).toLocaleString()}
                               </p>
                            </div>
                          </div>
                        ))}
                      </div>
                   )}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-neutral-950 border-t border-neutral-900 flex justify-end">
              <button onClick={() => setSelectedOrderDetails(null)} className="px-5 py-2 rounded-lg text-sm font-bold bg-neutral-900 hover:bg-neutral-800 text-white transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Custom Prompt Modal */}
      {promptConfig && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">{promptConfig.title}</h3>
            <input
              type="text"
              autoFocus
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  promptConfig.onConfirm(promptValue);
                  setPromptConfig(null);
                }
              }}
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white mb-6 focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setPromptConfig(null)} className="px-4 py-2 rounded text-sm font-bold text-neutral-400 hover:text-white">Cancel</button>
              <button onClick={() => { promptConfig.onConfirm(promptValue); setPromptConfig(null); }} className="px-4 py-2 rounded text-sm font-bold bg-blue-600 text-white hover:bg-blue-500">Add</button>
            </div>
          </div>
        </div>
      )}


      {/* Printable Receipt Modal */}
      {receiptOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 no-print">
          <div className="bg-white border border-neutral-200 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50 sticky top-0 z-10 no-print">
              <h3 className="text-neutral-800 font-bold text-lg">Generate Receipt</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => window.print()} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-bold text-sm transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Print Receipt
                </button>
                <button 
                  onClick={() => setReceiptOrder(null)} 
                  className="text-neutral-500 hover:text-neutral-800 transition-colors bg-neutral-200 hover:bg-neutral-300 rounded p-2"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-10 overflow-y-auto flex-1 bg-white" id="printable-receipt">
              <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-6 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <img src="/logo.svg" alt="Tizzitech Logo" className="h-12 w-auto" />
                  </div>
                  <div className="text-neutral-600 font-medium text-sm">Premium Tech & Accessories</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-neutral-800 tracking-tight">RECEIPT / INVOICE</div>
                  <div className="text-sm text-neutral-500 mt-1 uppercase font-bold tracking-widest">Original Copy</div>
                </div>
              </div>

              <div className="flex justify-between mb-10">
                <div className="text-neutral-800 text-sm">
                  <div className="font-bold text-neutral-500 uppercase tracking-widest text-xs mb-1">Billed To</div>
                  <div className="font-bold text-lg">{receiptOrder.fullname || 'Customer'}</div>
                  <div className="text-neutral-600 mt-1">{receiptOrder.address}</div>
                  <div className="text-neutral-600">{receiptOrder.email || ''}</div>
                </div>
                <div className="text-right text-sm text-neutral-800">
                  <div className="mb-1"><span className="font-bold text-neutral-500 uppercase tracking-widest text-xs mr-2">Invoice No:</span> <span className="font-mono font-bold">INV-{(receiptOrder.id ? String(receiptOrder.id).slice(0, 8).toUpperCase() : "UNKNOWN")}</span></div>
                  <div className="mb-1"><span className="font-bold text-neutral-500 uppercase tracking-widest text-xs mr-2">Date:</span> {receiptOrder.orderDate ? new Date(receiptOrder.orderDate).toLocaleDateString() : "Unknown Date"}</div>
                  <div><span className="font-bold text-neutral-500 uppercase tracking-widest text-xs mr-2">Status:</span> <span className="uppercase font-bold text-blue-600">{receiptOrder.status}</span></div>
                </div>
              </div>

              <table className="w-full text-left border-collapse mb-8 text-neutral-800">
                <thead>
                  <tr>
                    <th className="bg-neutral-100 p-3 font-bold uppercase tracking-widest text-xs border-b border-neutral-300 rounded-tl-lg">Item Description</th>
                    <th className="bg-neutral-100 p-3 font-bold uppercase tracking-widest text-xs border-b border-neutral-300 text-center">Qty</th>
                    <th className="bg-neutral-100 p-3 font-bold uppercase tracking-widest text-xs border-b border-neutral-300 text-right">Unit Price</th>
                    <th className="bg-neutral-100 p-3 font-bold uppercase tracking-widest text-xs border-b border-neutral-300 text-right rounded-tr-lg">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(receiptOrder.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 border-b border-neutral-200 text-sm font-medium">{item.name}</td>
                      <td className="p-3 border-b border-neutral-200 text-sm text-center">{item.quantity}</td>
                      <td className="p-3 border-b border-neutral-200 text-sm font-mono text-right">₦{(item.price || 0).toLocaleString()}</td>
                      <td className="p-3 border-b border-neutral-200 text-sm font-mono font-bold text-right">₦{(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mb-12">
                <div className="w-64 text-right">
                  <div className="flex justify-between items-center text-xl text-neutral-800 font-bold border-t-2 border-neutral-800 pt-4 mt-2">
                    <span className="uppercase tracking-widest text-sm text-neutral-500">Total Amount</span>
                    <span className="font-mono text-2xl">₦{receiptOrder.total ? receiptOrder.total.toLocaleString() : "0"}</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-neutral-500 text-xs border-t border-neutral-200 pt-8 mt-auto">
                <p className="font-bold text-neutral-700 text-sm mb-1">Thank you for shopping with Tizzitech!</p>
                <p>This is a computer-generated document. No signature is required.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
