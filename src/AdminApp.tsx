import React, { useState, useEffect, useRef } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { Product, Order } from './types';
import { Lock, ShieldAlert, KeyRound, ArrowLeft } from 'lucide-react';
import { auth } from './firebase';

import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';

import { collection, getDocs, doc, updateDoc, setDoc, onSnapshot, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, logAuditActivity } from './firebase';


export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState<'login' | 'otp'>('login');
  const [otpValue, setOtpValue] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [isResending, setIsResending] = useState(false);

  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [visits, setVisits] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Require OTP on entry: check if a verified session token already exists in this browser tab
  useEffect(() => {
    const sessionToken = sessionStorage.getItem('tizzitech_admin_token');
    const sessionEmail = sessionStorage.getItem('tizzitech_admin_email');

    // If no existing token in this session, always force the login + OTP flow
    if (!sessionToken || !sessionEmail) {
      setIsAuthenticated(false);
      setAuthStep('login');
      return;
    }

    // Verify previously authenticated session token
    fetch('/api/admin/validate-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: sessionEmail, token: sessionToken })
    })
      .then(res => res.json())
      .then(valData => {
        if (valData.valid) {
          setAdminEmail(sessionEmail);
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem('tizzitech_admin_token');
          sessionStorage.removeItem('tizzitech_admin_email');
          setIsAuthenticated(false);
          setAuthStep('login');
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        setAuthStep('login');
      });
  }, []);

  // Load Firestore listeners only when authenticated via OTP
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() }) as any));
      setIsLoadingProducts(false);
    }, (err) => {
      console.warn('Products read permission denied:', err.message);
      setIsLoadingProducts(false);
    });

    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
      const ordersList = snap.docs.map(d => d.data() as any);
      ordersList.sort((a, b) => {
        const valA = a.orderDate || a.order_date || '';
        const valB = b.orderDate || b.order_date || '';
        const tA = valA ? new Date(valA).getTime() : 0;
        const tB = valB ? new Date(valB).getTime() : 0;
        return (isNaN(tB) ? 0 : tB) - (isNaN(tA) ? 0 : tA);
      });
      setOrders(ordersList);
      setIsLoadingOrders(false);
    }, (err) => {
      console.warn('Orders read permission denied:', err.message);
      setIsLoadingOrders(false);
    });
      
    const unsubAuditLogs = onSnapshot(collection(db, 'audit_logs'), (snap) => {
      const logs = snap.docs.map(d => d.data());
      logs.sort((a, b) => b.timestamp - a.timestamp);
      setAuditLogs(logs);
    }, (err) => console.warn('Audit logs read permission denied:', err.message));

    const unsubVisits = onSnapshot(collection(db, 'analytics_visits'), (snap) => {
      setVisits(snap.docs.map(d => d.data() as any));
    }, (err) => console.warn('Visits read permission denied:', err.message));

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    }, (err) => console.warn('Users read permission denied:', err.message));

    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snap) => {
      setCoupons(snap.docs.map(d => d.data() as any));
    }, (err) => console.warn('Coupons read permission denied:', err.message));

    return () => {
      unsubProducts();
      unsubOrders();
      unsubAuditLogs();
      unsubVisits();
      unsubUsers();
      unsubCoupons();
    };
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpSuccessMsg('');
    setLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const user = cred.user;
      
      if (!user.email) throw new Error('No email found in Google profile');
      
      const normalizedEmail = user.email.toLowerCase().trim();
      setAdminEmail(normalizedEmail);
      setOtpValue(''); // Must enter code received in email
      
      const res = await fetch('/api/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail })
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to dispatch access code to your email.');
      }

      setAuthStep('otp');
      setOtpSuccessMsg(data.message || `A 6-digit access code was sent to ${normalizedEmail}. Please check your inbox.`);
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
      setAuthStep('login');
      signOut(auth).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpSuccessMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, otp: otpValue.trim() })
      });
      const data = await res.json();
      if (data.success && data.token) {
        sessionStorage.setItem('tizzitech_admin_token', data.token);
        sessionStorage.setItem('tizzitech_admin_email', adminEmail);
        logAuditActivity('LOGIN_SUCCESS', 'Administrator successfully completed 2FA OTP verification', adminEmail);
        setIsAuthenticated(true);
      } else {
        setError(data.message || 'Invalid access code. Please check your email and try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!adminEmail || isResending) return;
    setIsResending(true);
    setError('');
    setOtpSuccessMsg('');
    try {
      const res = await fetch('/api/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSuccessMsg(`A fresh 6-digit access code was sent to ${adminEmail}. Check your inbox!`);
      } else {
        setError(data.message || 'Failed to resend code.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error resending code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail })
      }).catch(() => {});
      await signOut(auth);
      sessionStorage.removeItem('tizzitech_admin_token');
      sessionStorage.removeItem('tizzitech_admin_email');
      setIsAuthenticated(false);
      setAuthStep('login');
      setOtpValue('');
      setAdminEmail('');
      setError('');
      setOtpSuccessMsg('');
    } catch(e) {
      console.error(e);
    }
  };


  // Auto-logout after 10 minutes of inactivity
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
      }, 10 * 60 * 1000); // 10 minutes
    };

    resetTimer();

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();
    
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated]);

const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      await updateDoc(doc(db, 'products', id), { stock: newStock });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
      logAuditActivity('STOCK_UPDATE', `Updated stock for product ${id} to ${newStock}`, adminEmail);
    } catch (e: any) {
      console.error("Error updating stock:", e);
      handleFirestoreError(e, OperationType.UPDATE, `products/${id}`);
    }
  };

  const handleBatchUpdateStock = async (updates: { id: string; stock: number }[]) => {
    if (!updates || updates.length === 0) return;
    try {
      // 1. Local state update for immediate UI response
      setProducts(prev => {
        const map = new Map(updates.map(u => [u.id, u.stock]));
        return prev.map(p => map.has(p.id) ? { ...p, stock: map.get(p.id)! } : p);
      });

      // 2. Batch write to Firestore
      try {
        const batch = writeBatch(db);
        for (const u of updates) {
          batch.update(doc(db, 'products', u.id), { stock: u.stock });
        }
        await batch.commit();
      } catch (fsErr) {
        console.warn("Direct Firestore batch stock update notice:", fsErr);
      }

      // 3. Sync with backend API
      const token = sessionStorage.getItem('tizzitech_admin_token') || '';
      await fetch('/api/admin/products/batch-stock', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ updates })
      }).catch(err => console.error("Failed to sync batch stock update with API:", err));

      logAuditActivity('BATCH_STOCK_UPDATE', `Batch updated stock for ${updates.length} products`, adminEmail);
    } catch (e: any) {
      console.error("Error batch updating stock:", e);
      handleFirestoreError(e, OperationType.UPDATE, 'products/batch');
    }
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      // 1. Local state update for instantaneous UI feedback
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o));

      // 2. Update Firestore document directly
      try {
        await updateDoc(doc(db, 'orders', id), { status: newStatus });
      } catch (fsErr) {
        console.warn("Direct Firestore update notice:", fsErr);
      }

      // 3. Call backend API to persist & trigger branded HTML emails to customer
      const token = sessionStorage.getItem('tizzitech_admin_token') || '';
      await fetch(`/api/admin/orders/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      }).catch(err => console.error("Failed to send status update email via API:", err));

      logAuditActivity('ORDER_UPDATE', `Updated order ${id} status to ${newStatus}`, adminEmail);
    } catch (e: any) {
      console.error("Error updating order status:", e);
      handleFirestoreError(e, OperationType.UPDATE, `orders/${id}`);
    }
  };

  const handleBatchUpdateOrderStatus = async (orderIds: string[], newStatus: string) => {
    if (!orderIds || orderIds.length === 0) return;
    try {
      // 1. Local state update for instant UI feedback
      setOrders(prev => {
        const idSet = new Set(orderIds);
        return prev.map(o => idSet.has(o.id) ? { ...o, status: newStatus as any } : o);
      });

      // 2. Batch write to Firestore
      try {
        const batch = writeBatch(db);
        for (const id of orderIds) {
          batch.update(doc(db, 'orders', id), { status: newStatus });
        }
        await batch.commit();
      } catch (fsErr) {
        console.warn("Direct Firestore batch order status notice:", fsErr);
      }

      // 3. Call backend API to persist & send status emails
      const token = sessionStorage.getItem('tizzitech_admin_token') || '';
      await fetch('/api/admin/orders/batch-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderIds, status: newStatus })
      }).catch(err => console.error("Failed to batch update order status via API:", err));

      logAuditActivity('BATCH_ORDER_UPDATE', `Batch updated status of ${orderIds.length} orders to "${newStatus}"`, adminEmail);
    } catch (e: any) {
      console.error("Error batch updating order status:", e);
      handleFirestoreError(e, OperationType.UPDATE, 'orders/batch');
    }
  };

  const handleAddProduct = async (newProduct: Product) => {
    try {
      await setDoc(doc(db, 'products', newProduct.id), newProduct);
      setProducts(prev => [...prev, newProduct]);
      logAuditActivity('PRODUCT_CREATE', `Created product ${newProduct.name} (${newProduct.id}) with ${newProduct.images?.length || 1} images`, adminEmail);
    } catch (e: any) {
      console.error("Error adding product:", e);
      handleFirestoreError(e, OperationType.CREATE, 'products');
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      await updateDoc(doc(db, 'products', updatedProduct.id), { ...updatedProduct });
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      
      const token = sessionStorage.getItem('tizzitech_admin_token') || '';
      await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedProduct)
      }).catch(err => console.warn('API update sync warning:', err));

      logAuditActivity('PRODUCT_UPDATE', `Updated product ${updatedProduct.name} (${updatedProduct.id}) with ${updatedProduct.images?.length || 1} images`, adminEmail);
    } catch (e: any) {
      console.error("Error updating product:", e);
      handleFirestoreError(e, OperationType.UPDATE, `products/${updatedProduct.id}`);
    }
  };

if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center px-4 font-sans text-neutral-300">
        <div className="w-full max-w-md bg-neutral-950 border border-neutral-900 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle decoration lines */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
          
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 mb-6">
              {authStep === 'login' ? (
                <Lock className="h-8 w-8 text-blue-500 animate-pulse" />
              ) : (
                <KeyRound className="h-8 w-8 text-emerald-500 animate-pulse" />
              )}
            </div>
            <h1 className="text-2xl font-serif font-black text-white uppercase tracking-tight mb-2">
              ADMIN CONTROL PORTAL
            </h1>
            <p className="text-sm text-neutral-400 max-w-xs mb-8">
              {authStep === 'login' 
                ? 'Secured administrative access. Authentication required.'
                : `Enter the 6-digit access code sent to your email (${adminEmail}).`}
            </p>
          </div>

          {authStep === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <p className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 text-center">
                  ADMINISTRATOR LOGIN
                </p>
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 items-start animate-shake">
                  <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400 font-medium leading-relaxed">{error}</p>
                </div>
              )}
              <button 
                type="button"
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-neutral-100 hover:bg-white text-black font-bold py-3.5 px-6 rounded-xl text-sm tracking-widest uppercase transition-colors flex items-center justify-center gap-3 shadow-lg shadow-white/5 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Sending Code...' : 'Sign In with Google'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {otpSuccessMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-emerald-400 font-medium">{otpSuccessMsg}</p>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 text-center">
                  6-DIGIT EMAIL CODE
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  value={otpValue}
                  onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-4 text-center text-white text-2xl tracking-[0.75em] focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  required
                />
                <p className="text-[11px] text-neutral-500 text-center mt-2">
                  Check your inbox and spam folder for the code.
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 items-start animate-shake">
                  <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400 font-medium leading-relaxed">{error}</p>
                </div>
              )}

              <button 
                type="submit"
                disabled={otpValue.length !== 6 || loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl text-sm tracking-widest uppercase transition-colors flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/10"
              >
                {loading ? 'Verifying...' : 'Verify Access Code'}
              </button>

              <div className="flex items-center justify-between pt-2">
                <button 
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isResending ? 'Resending...' : 'Resend Code'}
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    signOut(auth).catch(() => {});
                    setAuthStep('login');
                    setOtpValue('');
                    setError('');
                    setOtpSuccessMsg('');
                  }}
                  className="text-xs text-neutral-500 hover:text-white font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {authStep === 'login' && (
            <button
              onClick={() => window.location.href = '/'}
              className="w-full mt-6 bg-transparent hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-800 text-neutral-400 hover:text-white font-bold py-3 px-6 rounded-xl text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Exit to Storefront
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center text-neutral-400 font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-neutral-800 border-t-blue-500 mb-4"></div>
        <p className="text-xs font-bold uppercase tracking-widest">Entering Core Management System...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans text-neutral-300">
      <div className="relative z-10 w-full flex-1">
        <AdminDashboard visits={visits} allUsers={users} auditLogs={auditLogs}
          products={products}
          orders={orders}
          coupons={coupons}
          onUpdateStock={handleUpdateStock}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onBatchUpdateStock={handleBatchUpdateStock}
          onBatchUpdateOrderStatus={handleBatchUpdateOrderStatus}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onLogout={handleLogout}
          isLoading={isLoadingProducts || isLoadingOrders}
          onGoHome={() => {
            window.location.href = '/';
          }}
        />
      </div>
    </div>
  );
}
