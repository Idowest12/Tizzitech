import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mail, CheckCircle, AlertCircle, RefreshCw, Send, Users, Image as ImageIcon, Download, Sparkles, Phone, ShieldCheck, Tag, TrendingUp, UserX, Zap, ShoppingBag } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  productInterest?: string;
  vipPassId?: string;
  source?: string;
  subscribedAt: any;
  status: string;
  deliveryStatus?: string;
  welcomeEmailSent?: boolean;
  emailError?: string;
}

export function NewsletterAdmin() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering & Search
  const [filterSource, setFilterSource] = useState<'all' | 'waitlist' | 'newsletter'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Target audience selection
  const [targetAudience, setTargetAudience] = useState<'all' | 'waitlist' | 'newsletter'>('all');

  // Email state
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Inactive User Re-engagement State (30+ days)
  const [inactiveCount, setInactiveCount] = useState<number>(0);
  const [loadingInactive, setLoadingInactive] = useState<boolean>(false);
  const [reengaging, setReengaging] = useState<boolean>(false);
  const [reengageResult, setReengageResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchInactiveCount = async () => {
    setLoadingInactive(true);
    try {
      const token = sessionStorage.getItem('tizzitech_admin_token') || '';
      const res = await fetch('/api/admin/inactive-users-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setInactiveCount(data.count || 0);
      }
    } catch (err) {
      console.warn("Failed to fetch inactive user count:", err);
    }
    setLoadingInactive(false);
  };

  const handleTriggerReengagement = async () => {
    if (!confirm(`Are you sure you want to dispatch a 30-Day Win-Back email campaign with top 3 products to ${inactiveCount} inactive customer(s)?`)) {
      return;
    }
    setReengaging(true);
    setReengageResult(null);
    try {
      const token = sessionStorage.getItem('tizzitech_admin_token') || '';
      const res = await fetch('/api/admin/reengage-inactive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ daysInactive: 30 })
      });
      const data = await res.json();
      setReengageResult({
        success: data.success,
        message: data.message || (data.success ? 'Re-engagement campaign dispatched successfully!' : 'Failed to dispatch campaign')
      });
      fetchInactiveCount();
    } catch (err: any) {
      setReengageResult({ success: false, message: err.message || 'Error executing re-engagement campaign' });
    }
    setReengaging(false);
  };

  // Image Upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
      reader.readAsDataURL(file);
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
          throw new Error('Server returned HTML. Vercel payload limit (4.5MB) might be exceeded, or the route crashed.');
      }
      
      const data = await res.json();
      if (data.success) {
         const imageTag = `\n<img src="${data.url}" alt="Newsletter Image" style="max-width: 100%; border-radius: 8px; margin-top: 15px;" />\n`;
         setContent(prev => prev + imageTag);
      } else {
         alert('Upload failed: ' + data.error);
      }
    } catch(err: any) {
      alert('Upload error: ' + err.message);
    }
    setIsUploading(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fetchSubscribers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('tizzitech_admin_token') || '';
      const res = await fetch('/api/admin/newsletter/subscribers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers);
      } else {
        setError(data.message || data.error || 'Failed to fetch subscribers');
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscribers();
    fetchInactiveCount();
  }, []);

  const exportToCSV = (onlyWaitlist = false) => {
    const dataToExport = onlyWaitlist 
      ? subscribers.filter(s => s.source === 'product_launch_waitlist' || Boolean(s.vipPassId))
      : subscribers;

    if (dataToExport.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = ['VIP Pass ID', 'Full Name', 'Email', 'Phone', 'Product Interest', 'Source', 'Subscribed At', 'Status'];
    const rows = dataToExport.map(s => [
      `"${s.vipPassId || 'N/A'}"`,
      `"${s.name || ''}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.productInterest || 'General'}"`,
      `"${s.source || 'newsletter'}"`,
      `"${s.subscribedAt ? new Date(s.subscribedAt).toLocaleString() : ''}"`,
      `"${s.status || 'active'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', onlyWaitlist ? `tizzitech_vip_waitlist_${Date.now()}.csv` : `tizzitech_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) return;
    
    setSending(true);
    setSendResult(null);
    try {
      const token = sessionStorage.getItem('tizzitech_admin_token') || '';
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subject, content, targetAudience })
      });
      const data = await res.json();
      setSendResult({ success: data.success, message: data.message });
      if (data.success) {
        setSubject('');
        setContent('');
      }
    } catch (err: any) {
      setSendResult({ success: false, message: err.message });
    }
    setSending(false);
  };

  // Filter subscribers based on category & search query
  const waitlistCount = subscribers.filter(s => s.source === 'product_launch_waitlist' || Boolean(s.vipPassId)).length;
  const generalCount = subscribers.length - waitlistCount;

  const filteredSubscribers = subscribers.filter(sub => {
    const isWaitlist = sub.source === 'product_launch_waitlist' || Boolean(sub.vipPassId);
    if (filterSource === 'waitlist' && !isWaitlist) return false;
    if (filterSource === 'newsletter' && isWaitlist) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEmail = sub.email?.toLowerCase().includes(q);
      const matchName = sub.name?.toLowerCase().includes(q);
      const matchVip = sub.vipPassId?.toLowerCase().includes(q);
      const matchProduct = sub.productInterest?.toLowerCase().includes(q);
      const matchPhone = sub.phone?.toLowerCase().includes(q);
      return matchEmail || matchName || matchVip || matchProduct || matchPhone;
    }

    return true;
  });

  // Calculate 30-day signups trend for Recharts LineChart
  const trendData = useMemo(() => {
    const daysMap = new Map<string, { dateKey: string; label: string; waitlist: number; newsletter: number }>();
    const now = new Date();

    // Initialize 30 consecutive days up to today
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      daysMap.set(dateKey, { dateKey, label, waitlist: 0, newsletter: 0 });
    }

    // Populate counts from subscribers array
    subscribers.forEach(sub => {
      let subDate: Date | null = null;
      if (sub.subscribedAt) {
        if (typeof sub.subscribedAt === 'string' || typeof sub.subscribedAt === 'number') {
          const parsed = new Date(sub.subscribedAt);
          if (!isNaN(parsed.getTime())) subDate = parsed;
        } else if (sub.subscribedAt.seconds) {
          subDate = new Date(sub.subscribedAt.seconds * 1000);
        } else if (typeof sub.subscribedAt.toDate === 'function') {
          subDate = sub.subscribedAt.toDate();
        }
      }

      if (subDate) {
        const key = subDate.toISOString().split('T')[0];
        if (daysMap.has(key)) {
          const entry = daysMap.get(key)!;
          const isWaitlist = sub.source === 'product_launch_waitlist' || Boolean(sub.vipPassId);
          if (isWaitlist) {
            entry.waitlist += 1;
          } else {
            entry.newsletter += 1;
          }
        }
      }
    });

    return Array.from(daysMap.values());
  }, [subscribers]);

  const last30WaitlistTotal = trendData.reduce((acc, curr) => acc + curr.waitlist, 0);
  const last30NewsletterTotal = trendData.reduce((acc, curr) => acc + curr.newsletter, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-widest uppercase flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            Subscribers & VIP Waitlist Portal
          </h2>
          <p className="text-neutral-400 text-xs mt-1">
            Separate, export, and manage VIP Pre-Launch Waitlist leads vs standard newsletter subscribers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(true)}
            className="px-3 py-2 bg-gradient-to-r from-cyan-950 to-purple-950 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
            title="Download VIP Waitlist CSV"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>Export VIP Waitlist CSV</span>
          </button>
          <button 
            onClick={fetchSubscribers} 
            className="p-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 30-Day Growth Trend Line Chart */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              Signups Growth Trend (Last 30 Days)
            </h3>
            <p className="text-neutral-400 text-xs mt-0.5">
              Comparative visualization of VIP Pre-Launch Waitlist leads vs. General Newsletter signups.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="text-neutral-300 font-medium">VIP Waitlist (30d):</span>
              <span className="text-cyan-300 font-bold font-mono">+{last30WaitlistTotal}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-950/40 border border-purple-800/40 px-3 py-1.5 rounded-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              <span className="text-neutral-300 font-medium">Newsletter (30d):</span>
              <span className="text-purple-300 font-bold font-mono">+{last30NewsletterTotal}</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis 
                dataKey="label" 
                stroke="#737373" 
                tick={{ fill: '#a3a3a3', fontSize: 11 }}
                tickMargin={8}
                minTickGap={15}
              />
              <YAxis 
                stroke="#737373" 
                tick={{ fill: '#a3a3a3', fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#171717', 
                  borderColor: '#404040', 
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                itemStyle={{ fontSize: '12px', padding: '2px 0' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} 
              />
              <Line 
                type="monotone" 
                dataKey="waitlist" 
                name="VIP Waitlist Signups" 
                stroke="#22d3ee" 
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#22d3ee' }}
                activeDot={{ r: 6, fill: '#06b6d4' }}
              />
              <Line 
                type="monotone" 
                dataKey="newsletter" 
                name="Newsletter Subscribers" 
                stroke="#c084fc" 
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#c084fc' }}
                activeDot={{ r: 6, fill: '#a855f7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subscribers List Panel */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Audience Records ({filteredSubscribers.length})
            </h3>
            
            {/* Filter Pill Tabs */}
            <div className="flex items-center bg-black border border-neutral-800 rounded-lg p-1 text-xs">
              <button
                onClick={() => setFilterSource('all')}
                className={`px-2.5 py-1 rounded font-bold transition-colors ${filterSource === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'}`}
              >
                All ({subscribers.length})
              </button>
              <button
                onClick={() => setFilterSource('waitlist')}
                className={`px-2.5 py-1 rounded font-bold transition-colors flex items-center gap-1 ${filterSource === 'waitlist' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-neutral-400 hover:text-neutral-200'}`}
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                VIP Waitlist ({waitlistCount})
              </button>
              <button
                onClick={() => setFilterSource('newsletter')}
                className={`px-2.5 py-1 rounded font-bold transition-colors ${filterSource === 'newsletter' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'}`}
              >
                Newsletter ({generalCount})
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, VIP Pass ID or device..."
              className="w-full bg-black border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          
          {loading ? (
            <div className="text-neutral-500 text-sm py-8 text-center">Loading audience records...</div>
          ) : error ? (
            <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="text-neutral-500 text-sm py-8 text-center">No matching subscribers found.</div>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
              {filteredSubscribers.map((sub, i) => {
                const isWaitlist = sub.source === 'product_launch_waitlist' || Boolean(sub.vipPassId);
                return (
                  <div key={sub.id || i} className={`bg-black border p-3.5 rounded-xl transition-all ${isWaitlist ? 'border-cyan-500/30 bg-gradient-to-r from-neutral-950 via-neutral-950 to-cyan-950/20' : 'border-neutral-800'}`}>
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-bold">{sub.email}</span>
                          {isWaitlist && (
                            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> VIP WAITLIST
                            </span>
                          )}
                        </div>
                        {sub.name && (
                          <div className="text-neutral-300 text-xs font-medium">{sub.name}</div>
                        )}
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                        sub.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {sub.status}
                      </span>
                    </div>

                    {/* Additional Metadata for Waitlist Entries */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] pt-2 border-t border-neutral-900 text-neutral-400 font-mono">
                      {sub.vipPassId && (
                        <div>
                          <span className="text-neutral-500">Pass ID: </span>
                          <span className="text-cyan-400 font-bold">{sub.vipPassId}</span>
                        </div>
                      )}
                      {sub.productInterest && (
                        <div>
                          <span className="text-neutral-500">Device: </span>
                          <span className="text-neutral-200 truncate">{sub.productInterest}</span>
                        </div>
                      )}
                      {sub.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-neutral-500" />
                          <span className="text-neutral-300">{sub.phone}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-neutral-500">Joined: </span>
                        <span>{sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Automated Win-Back Campaign Card & Manual Broadcast */}
        <div className="space-y-6">
          {/* Automated & Manual Win-Back Re-engagement Card */}
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-purple-950/30 border border-purple-500/30 rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit mb-2">
                  <Zap className="w-3 h-3 text-purple-400" /> Automated Daily & Instant Win-Back
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserX className="h-5 w-5 text-purple-400" />
                  Inactive Customer Re-engagement (30+ Days)
                </h3>
                <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
                  Automatically detects registered customers who haven't visited in the last 30 days and dispatches a personalized, high-converting email highlighting your top 3 flagship products with a welcome-back perk.
                </p>
              </div>

              <div className="bg-black/60 border border-purple-500/30 px-3.5 py-2.5 rounded-xl text-center min-w-[100px]">
                <div className="text-xs text-neutral-400 font-medium">Inactive Users</div>
                <div className="text-xl font-bold font-mono text-purple-300">
                  {loadingInactive ? '...' : inactiveCount}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
                <span>Features <strong>Top 3 Featured Products</strong> + Coupon Code</span>
              </div>

              <button
                type="button"
                onClick={handleTriggerReengagement}
                disabled={reengaging || loadingInactive}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-5 py-2.5 rounded-lg text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                {reengaging ? 'Dispatching Campaign...' : `Send Win-Back Email (${inactiveCount} Users)`}
              </button>
            </div>

            {reengageResult && (
              <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${reengageResult.success ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                {reengageResult.success ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                {reengageResult.message}
              </div>
            )}
          </div>

          {/* Send Newsletter Form */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-400" />
              Compose Launch Email Broadcast
            </h3>
          
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Target Audience</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetAudience('all')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    targetAudience === 'all'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-black border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  All ({subscribers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTargetAudience('waitlist')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                    targetAudience === 'waitlist'
                      ? 'bg-cyan-600/20 border-cyan-400 text-cyan-300'
                      : 'bg-black border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Waitlist ({waitlistCount})
                </button>
                <button
                  type="button"
                  onClick={() => setTargetAudience('newsletter')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    targetAudience === 'newsletter'
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                      : 'bg-black border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Newsletter ({generalCount})
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Subject</label>
              <input 
                type="text" 
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                placeholder="🔥 PRE-LAUNCH DROP: 7% Off & Free Launch Shipping Inside!"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">HTML Content</label>
                <div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-bold tracking-widest uppercase disabled:opacity-50 transition-colors"
                  >
                    <ImageIcon className="h-3 w-3" />
                    {isUploading ? 'Uploading...' : 'Insert Image'}
                  </button>
                </div>
              </div>
              <textarea 
                required
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white font-mono text-xs h-64 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                placeholder="<h1>Your VIP Pre-Launch Order Is Ready!</h1><p>Use your Pass ID at checkout for 7% Off & Free Launch Shipping...</p>"
              />
              <p className="text-neutral-500 text-xs mt-1">Basic HTML template with logo is automatically wrapped around your content.</p>
            </div>
            
            <button 
              type="submit" 
              disabled={sending || subscribers.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 uppercase tracking-widest text-sm disabled:opacity-50"
            >
              {sending ? 'Sending...' : targetAudience === 'waitlist' ? `Send Broadcast to VIP Waitlist (${waitlistCount})` : targetAudience === 'newsletter' ? `Send Broadcast to Newsletter (${generalCount})` : `Send Broadcast to All (${subscribers.length})`}
            </button>
            
            {sendResult && (
              <div className={`p-3 rounded-lg flex items-start gap-2 text-sm ${sendResult.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {sendResult.success ? <CheckCircle className="h-4 w-4 mt-0.5" /> : <AlertCircle className="h-4 w-4 mt-0.5" />}
                <p>{sendResult.message}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  </div>
);
}

