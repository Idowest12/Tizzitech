import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, MapPin, Phone, FileText, CheckCircle2, ChevronRight, ShoppingBag, ArrowLeft, Shield, Sparkles, Tag, AlertCircle } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useAuth } from '../contexts/AuthContext';
import { usePaystackPayment } from 'react-paystack';
import { PaystackService } from '../services/paystack';
import { CartItem, Order } from '../types';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface CheckoutViewProps {
  cart: CartItem[];
  hasPastOrders?: boolean;
  onComplete: (order: Order) => void;
  onCancel: () => void;
  deliveryZones?: any[];

}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export function CheckoutView({ cart, hasPastOrders, onComplete, onCancel, deliveryZones = [] }: CheckoutViewProps) {
  const { user, profile, updateProfile } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || '');
  const [fullname, setFullname] = useState(user?.displayName || '');
  const [emailAddress, setEmailAddress] = useState(user?.email || '');
  const [paymentOption, setPaymentOption] = useState('payonline');
  const [streetAddress, setStreetAddress] = useState(profile?.address || '');
  const [saveAddress, setSaveAddress] = useState(!!user);
  const [stateLocation, setStateLocation] = useState(profile?.stateLocation || 'Lagos');
  const [city, setCity] = useState(profile?.city || '');
  const [lga, setLga] = useState(profile?.lga || '');
  const [locationCenter, setLocationCenter] = useState({ lat: 6.5244, lng: 3.3792 });
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [step, setStep] = useState(1);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const getDeliveryFee = (selectedLga: string) => {
    if (!selectedLga) return 0;
    switch (selectedLga) {
      case 'Eti-Osa': return 7000;
      case 'Oshodi-Isolo': return 4000;
      case 'Shomolu': return 3500;
      case 'Badagry': return 6000;
      case 'Alimosho': return 3000;
      case 'Mushin': return 3000;
      default: return 5000;
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'Percentage') {
      return Math.round(subtotal * (Number(appliedCoupon.value) / 100));
    }
    if (appliedCoupon.type === 'Fixed') {
      return Number(appliedCoupon.value);
    }
    return 0; // Shipping discount handled on delivery fee
  };

  const discountAmount = getDiscountAmount();
  const baseDeliveryFee = getDeliveryFee(lga);
  const deliveryFee = (appliedCoupon?.type === 'Shipping' || appliedCoupon?.freeShipping) ? 0 : baseDeliveryFee;
  const total = Math.max(0, subtotal + deliveryFee - discountAmount);

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    if (!couponCode) return;
    const cleanCode = couponCode.toUpperCase().replace(/\s+/g, '');
    const rawInput = couponCode.trim();
    
    try {
      // 1. Check standard coupon code in Firestore
      const couponSnap = await getDoc(doc(db, 'coupons', cleanCode));
      if (couponSnap.exists()) {
        const couponData = couponSnap.data();
        if (couponData.status !== 'Active') {
          setCouponError('This coupon is currently inactive.');
          return;
        }
        if (couponData.expiryDate && new Date(couponData.expiryDate).getTime() < Date.now()) {
          setCouponError('This coupon has expired.');
          return;
        }
        if (subtotal < (couponData.minPurchase || 0)) {
          setCouponError(`Minimum purchase of ₦${Number(couponData.minPurchase).toLocaleString()} required.`);
          return;
        }
        setAppliedCoupon(couponData);
        setCouponSuccess(`Coupon "${cleanCode}" applied! (Saved ₦${(couponData.type === 'Percentage' ? Math.round(subtotal * (Number(couponData.value) / 100)) : couponData.type === 'Fixed' ? couponData.value : baseDeliveryFee).toLocaleString()})`);
        return;
      }

      // 2. Check VIP Pre-Launch Waitlist Pass ID or registered Waitlist Email
      const subsRef = collection(db, 'newsletter_subscribers');
      let vipMatch = false;
      let subscriberData: any = null;

      // Query by Pass ID
      const qPass = query(subsRef, where('vipPassId', '==', cleanCode));
      const passSnap = await getDocs(qPass);

      if (!passSnap.empty) {
        vipMatch = true;
        subscriberData = passSnap.docs[0].data();
      } else {
        // Query by registered email
        const qEmail = query(subsRef, where('email', '==', rawInput.toLowerCase()));
        const emailSnap = await getDocs(qEmail);
        if (!emailSnap.empty) {
          vipMatch = true;
          subscriberData = emailSnap.docs[0].data();
        }
      }

      if (vipMatch && subscriberData) {
        const vipCoupon = {
          code: subscriberData.vipPassId || cleanCode,
          type: 'Percentage',
          value: 7,
          freeShipping: true,
          minPurchase: 0,
          isVipPass: true
        };
        setAppliedCoupon(vipCoupon);
        const percentSavings = Math.round(subtotal * 0.07);
        setCouponSuccess(`✨ VIP Pre-Launch Pass Verified! 7% Discount (₦${percentSavings.toLocaleString()}) + 100% Free Launch Delivery Applied!`);
        return;
      }

      setCouponError('Invalid coupon or VIP Pass ID. Please enter your VIP Pass ID (e.g. TZ-VIP-XXXXX) or registered Waitlist email.');
    } catch(err) {
      console.error(err);
      setCouponError('An error occurred during coupon verification.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const paystackConfig = {
    reference: `TZ_${new Date().getTime().toString()}`,
    email: emailAddress || 'customer@tizzitech.com',
    amount: total * 100, // Paystack uses kobo (kobo = naira * 100)
    publicKey: PaystackService.getPublicKey() || 'pk_test_b8e217112ebde369baaa90fbdc9da3a763c87e14', 
  };
  
  const initializePayment = usePaystackPayment(paystackConfig);

  useEffect(() => {
    if (profile) {
      if (profile.address && !streetAddress) setStreetAddress(profile.address);
      if (profile.phone && !phoneNumber) setPhoneNumber(profile.phone);
      if (profile.city && !city) setCity(profile.city);
      if (profile.stateLocation && stateLocation === 'Lagos') setStateLocation(profile.stateLocation);
      if (profile.lga && !lga) setLga(profile.lga);
    }
    if (user) {
      if (user.displayName && !fullname) setFullname(user.displayName);
      if (user.email && !emailAddress) setEmailAddress(user.email);
    }
  }, [profile, user]);

  useEffect(() => {
    // Scroll to the top when checkout renders
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleConfirmOrder = async () => {
    setIsSuccess(true);
    
    const address = `${streetAddress}, ${city}, ${lga}, ${stateLocation}` || 'Lagos Deliveries, Lagos, Nigeria';
    
    try {
      const activeToken = localStorage.getItem('authToken') || sessionStorage.getItem('tizzitech_token') || localStorage.getItem('tizzitech_token');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeToken ? { 'Authorization': `Bearer ${activeToken}` } : {})
        },
        body: JSON.stringify({
          fullname,
          email: emailAddress,
          address,
          paymentOption,
          total,
          items: cart.map(item => ({ id: item.id, price: item.price, quantity: item.quantity, name: item.name })),
          userId: user?.uid || null
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to place order via server.');
      }

      const orderId = data.orderId;

      if (saveAddress && updateProfile) { try { await updateProfile({ phone: phoneNumber, address: streetAddress, city, stateLocation, lga }); } catch (e) { console.error("Failed to save address to profile", e); } }
      const newOrder: Order = {
        id: orderId,
        items: [...cart],
        total,
        status: data.status || 'Pending',
        orderDate: new Date(),
        expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : new Date(Date.now() + 3*24*60*60*1000),
        address
      };

      setTimeout(() => {
        onComplete(newOrder);
        setIsSuccess(false);
        setStep(1);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || 'Failed to place order.';
      try {
        const parsed = JSON.parse(errMsg);
        if (parsed.message) errMsg = parsed.message;
      } catch(e) {}
      
      setErrorMessage(errMsg);
      setIsSuccess(false);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    if (paymentOption === 'payonline') {
      initializePayment({
        onSuccess: async (reference: any) => {
          const verifyResult = await PaystackService.verifyTransaction(reference.reference);
          if (verifyResult.success) {
            handleConfirmOrder();
          } else {
            setErrorMessage('Payment verification failed: ' + (verifyResult.message || 'Please contact support if you were debited.'));
          }
        },
        onClose: () => {
          // User closed the payment modal
          console.log('Payment modal closed');
        }
      });
    } else {
      handleConfirmOrder();
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full bg-black text-white py-32 flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-500">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-center max-w-md p-10 bg-neutral-950 border border-neutral-900 rounded-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600 animate-pulse" />
          <div className="w-20 h-20 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-500 mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-serif font-black text-white uppercase tracking-tight mb-3">Order Placed!</h2>
          <p className="text-sm text-neutral-400 font-light mb-6">
            Thank you for shopping with Tizzitech. We have received your order details and are preparing it for delivery.
          </p>
          <div className="text-xs text-neutral-500 bg-black border border-neutral-900 py-3 px-4 font-mono uppercase tracking-widest rounded-lg">
            Status: Confirmed & Pending Dispatch
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black text-white relative animate-in fade-in duration-500 min-h-screen pb-24 overflow-x-hidden">
      {/* Upper Navigation & Title Frame */}
      <div className="border-b border-neutral-900 bg-neutral-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <button 
                onClick={onCancel}
                className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold mb-4 py-1.5 px-3 border border-neutral-800 rounded bg-black/40"
              >
                <ArrowLeft className="w-4 h-4 text-blue-500" />
                <span>Return to shopping</span>
              </button>
              <h1 className="text-4xl sm:text-5xl font-serif font-black uppercase tracking-tighter leading-none mb-2">
                Order <span className="text-blue-600">Checkout.</span>
              </h1>
              <p className="text-sm text-neutral-500 font-light">Complete your purchase details securely through our dedicated invoice portal.</p>
            </div>

            {/* Expansive Progress Bar */}
            <div className="flex items-center gap-2 sm:gap-4 bg-neutral-950 border border-neutral-900 px-3.5 py-3 sm:px-6 sm:py-4 rounded-xl shrink-0 overflow-x-auto w-full md:w-auto justify-between sm:justify-start">
              <div className={`flex items-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs font-bold tracking-widest uppercase transition-colors ${step >= 1 ? 'text-white' : 'text-neutral-600'}`}>
                <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] shrink-0 ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-neutral-900'}`}>1</span>
                <span>Contact</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-800 shrink-0" />
              <div className={`flex items-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs font-bold tracking-widest uppercase transition-colors ${step >= 2 ? 'text-white' : 'text-neutral-600'}`}>
                <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] shrink-0 ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-neutral-900'}`}>2</span>
                <span>Delivery</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-800 shrink-0" />
              <div className={`flex items-center gap-1.5 sm:gap-2.5 text-[11px] sm:text-xs font-bold tracking-widest uppercase transition-colors ${step >= 3 ? 'text-white' : 'text-neutral-600'}`}>
                <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] shrink-0 ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-neutral-900'}`}>3</span>
                <span>Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-red-950/40 border border-red-900/50 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-1">Order Error</h3>
              <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Form Inputs Left vs Order Summary Right */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          
          {/* LEFT: Complete Checkout Actions Form */}
          <div className="lg:col-span-7 bg-neutral-950 border border-neutral-900/60 p-3.5 sm:p-8 md:p-10 rounded-2xl">
            <form onSubmit={handleNextStep} className="space-y-8">
              
              {/* STEP 1: CONTACT INFORMATION */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-neutral-900 pb-4">
                    <h3 className="text-lg font-serif font-black uppercase text-white flex items-center gap-2">
                      <Phone className="w-5 h-5 text-blue-500" />
                      <span>Contact Details</span>
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">Please provide your contact information to authorize tracking & shipping communications.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2">Your Full Name *</label>
                      <input 
                        type="text"
                        required
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2">Email Address *</label>
                      <input 
                        type="email"
                        required
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="e.g. john@domain.com"
                        className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2">Phone Number *</label>
                    <input 
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. +234 801 123 4567"
                      className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1.5 uppercase font-medium tracking-wide">For updates on shipping status via WhatsApp</p>
                  </div>
                </div>
              )}

              {/* STEP 2: SHIPPING METHODS & MAP LOCATION DETAILS */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-neutral-900 pb-4">
                    <h3 className="text-lg font-serif font-black uppercase text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <span>Delivery Information</span>
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">Specify your exact address details to complete rapid dispatch.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2">Street Address *</label>
                      <input
                        type="text"
                        required
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="e.g. No 15, Allen Avenue, opposite Union Bank"
                        className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2">State *</label>
                        <select
                          required
                          value={stateLocation}
                          onChange={(e) => {
                            setStateLocation(e.target.value);
                            setLga(''); // Reset LGA on state change
                            if (e.target.value !== 'Lagos' && paymentOption === 'pod') {
                              setPaymentOption('payonline');
                            }
                          }}
                          className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm appearance-none"
                        >
                          <option value="Lagos">Lagos</option>
                          <option value="Abuja">Abuja</option>
                          <option value="Rivers">Rivers</option>
                          <option value="Ogun">Ogun</option>
                          <option value="Oyo">Oyo</option>
                          <option value="Kano">Kano</option>
                          <option value="Outside Lagos">Other State (Outside Lagos)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2">City *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Ikeja"
                          className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2">Local Government Area (LGA) *</label>
                        {stateLocation === 'Lagos' ? (
                          <select
                            required
                            value={lga}
                            onChange={(e) => setLga(e.target.value)}
                            className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm appearance-none"
                          >
                            <option value="" disabled>Select LGA</option>
                            {['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'].map(area => {
                              const fee = getDeliveryFee(area);
                              return (
                                <option key={area} value={area}>
                                  {area} {fee > 0 ? `(₦${fee.toLocaleString()})` : ''}
                                </option>
                              );
                            })}
                          </select>
                        ) : (
                          <input
                            type="text"
                            required
                            value={lga}
                            onChange={(e) => setLga(e.target.value)}
                            placeholder="e.g. Municipal Gov Area"
                            className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                          />
                        )}
                        {lga && (
                          <div className="mt-3 flex items-center justify-between p-3 bg-blue-900/10 border border-blue-900/30 rounded-lg">
                            <span className="text-xs text-neutral-400 font-medium">Delivery Fee</span>
                            <span className="text-sm font-mono font-bold text-blue-400">
                              {deliveryFee > 0 ? `₦${deliveryFee.toLocaleString()}` : 'Standard'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {user && (
                    <div className="flex items-center space-x-3 pt-2 pb-4">
                      <input type="checkbox" id="saveAddress" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="w-4 h-4 rounded border-neutral-800 text-blue-600 focus:ring-blue-500 bg-black cursor-pointer" />
                      <label htmlFor="saveAddress" className="text-sm text-neutral-300 select-none cursor-pointer">Save this address for future checkouts</label>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase">Map Pin Location (Optional)</label>
                    <div className="rounded-xl border border-neutral-800 h-[220px] relative bg-black overflow-hidden">
                      {hasValidKey ? (
                        <APIProvider apiKey={API_KEY} version="weekly">
                          <Map
                            defaultCenter={locationCenter}
                            defaultZoom={12}
                            mapId="CHECKOUT_MAP_ID_FULL"
                            style={{ width: '100%', height: '100%' }}
                            disableDefaultUI={true}
                            gestureHandling="cooperative"
                            onClick={(e) => e.detail.latLng && setLocationCenter(e.detail.latLng)}
                          >
                            <AdvancedMarker position={locationCenter}>
                              <Pin background="#2563eb" glyphColor="#fff" borderColor="#1e40af" />
                            </AdvancedMarker>
                          </Map>
                        </APIProvider>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                          <MapPin className="w-8 h-8 text-neutral-800 mb-3" />
                          <p className="text-xs text-neutral-500 tracking-widest uppercase font-bold">Interactive map display with pinpoint navigation</p>
                          <p className="text-[10px] text-neutral-600 mt-1">Check manual address details or provide custom instructions</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: BILLING PAYMENT INTEGRATION OPTIONS */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-neutral-900 pb-4">
                    <h3 className="text-lg font-serif font-black uppercase text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-500" />
                      <span>Payment Selection</span>
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">Select your preferred payment processor.</p>
                  </div>

                  <div className="w-full bg-black border border-neutral-900 text-white rounded-xl overflow-hidden flex flex-row min-h-[360px]">
                    {/* Sidebar / Tabs */}
                    <div className="w-36 sm:w-48 md:w-56 shrink-0 bg-neutral-950 flex flex-col border-r border-neutral-900">
                      <div className="p-3 sm:p-4 border-b border-neutral-900 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Pay With
                      </div>
                      <div className="flex-1 flex flex-col divide-y divide-neutral-900/60">
                        {[
                          { 
                            id: 'payonline', 
                            title: 'Pay Online',
                            subtitle: 'Card / Transfer', 
                            icon: <CreditCard className="w-4 h-4 shrink-0" /> 
                          },
                          ...(stateLocation === 'Lagos' && hasPastOrders ? [{ 
                            id: 'pod', 
                            title: 'Pay on Delivery',
                            subtitle: 'Cash / POS', 
                            icon: <ShoppingBag className="w-4 h-4 shrink-0" /> 
                          }] : [])
                        ].map(option => (
                           <button
                             key={option.id}
                             type="button"
                             onClick={() => setPaymentOption(option.id)}
                             className={`flex items-start gap-2 sm:gap-3 p-3 sm:px-4 sm:py-3.5 text-left transition-colors border-l-4 ${
                               paymentOption === option.id
                                 ? 'border-emerald-500 bg-black text-emerald-400 font-semibold'
                                 : 'border-transparent text-neutral-400 hover:bg-neutral-900/80 hover:text-white'
                             }`}
                           >
                             <span className={`mt-0.5 ${paymentOption === option.id ? 'text-emerald-400' : 'text-neutral-500'}`}>
                               {option.icon}
                             </span>
                             <div className="flex flex-col min-w-0 flex-1">
                               <span className="text-[11px] sm:text-xs font-bold leading-snug break-words">
                                 {option.id === 'pod' ? (
                                   <span className="flex flex-col sm:inline">
                                     <span>Pay on</span>
                                     <span className="sm:ml-1">Delivery</span>
                                   </span>
                                 ) : (
                                   option.title
                                 )}
                               </span>
                               <span className="text-[9px] sm:text-[10px] text-neutral-500 leading-tight mt-1">
                                 {option.subtitle}
                               </span>
                             </div>
                           </button>
                        ))}
                      </div>
                      
                      {stateLocation === 'Lagos' && !hasPastOrders && (
                        <div className="p-2.5 sm:p-3 bg-orange-500/10 border-t border-orange-500/20 text-[9px] text-orange-400 font-medium leading-tight">
                          * Pay on Delivery unlocks after your first purchase.
                        </div>
                      )}
                    </div>

                    {/* Right Content Pane */}
                    <div className="flex-1 min-w-0 p-3.5 sm:p-6 flex flex-col justify-between bg-black">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 mb-2 border-b border-neutral-900/80">
                         <div className="flex flex-col min-w-0">
                            <span className="text-[9px] sm:text-[10px] text-neutral-400 uppercase tracking-wider font-mono truncate max-w-[180px] sm:max-w-[240px]">{emailAddress || 'guest@example.com'}</span>
                            <span className="text-emerald-400 font-bold font-mono text-sm sm:text-base">Pay ₦{total.toLocaleString()}</span>
                         </div>
                         <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono self-start sm:self-auto uppercase tracking-wider">
                           Verified
                         </span>
                      </div>

                      <div className="flex-1 flex flex-col justify-center items-center py-2 text-center">
                        {paymentOption === 'payonline' && (
                          <div className="w-full space-y-3 animate-in fade-in duration-300 flex flex-col items-center justify-center">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                               <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="px-1">
                              <h4 className="font-bold tracking-wider uppercase text-[11px] sm:text-xs text-neutral-200">Pay Securely with Paystack</h4>
                              <p className="text-[10px] sm:text-xs text-neutral-400 max-w-[240px] mt-1 leading-snug mx-auto">
                                Click the button below to open the secure Paystack checkout.
                              </p>
                            </div>
                            <button
                              type="submit"
                              className="w-full max-w-[240px] mt-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold py-2.5 sm:py-3.5 px-3 rounded-xl text-[11px] sm:text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-1.5"
                            >
                              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                              <span className="truncate">Pay ₦{total.toLocaleString()}</span>
                            </button>
                          </div>
                        )}

                        {paymentOption === 'pod' && (
                          <div className="w-full space-y-3 animate-in fade-in duration-300 flex flex-col items-center justify-center">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                               <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="px-1">
                              <h4 className="font-bold tracking-wider uppercase text-[11px] sm:text-xs text-neutral-200">Pay on Delivery</h4>
                              <p className="text-[10px] sm:text-xs text-neutral-400 max-w-[240px] mt-1 leading-snug mx-auto">
                                You will pay via cash or POS upon delivery.
                              </p>
                            </div>
                            <button
                              type="submit"
                              className="w-full max-w-[240px] mt-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold py-2.5 sm:py-3.5 px-3 rounded-xl text-[11px] sm:text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                              <span className="truncate">Confirm (₦{total.toLocaleString()})</span>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-2.5 border-t border-neutral-900/60 flex justify-center items-center gap-1 text-[9px] sm:text-[10px] font-medium tracking-wider uppercase text-neutral-400">
                        <Shield className="w-3 h-3 text-blue-400 shrink-0" />
                        <span>Secured by <span className="font-bold text-neutral-200">paystack</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Actions Navigation buttons */}
              <div className="pt-6 border-t border-neutral-900/60 flex items-center justify-between">
                {step > 1 ? (
                  <button 
                    type="button" 
                    onClick={() => setStep(step - 1)} 
                    className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-widest transition-colors py-2 px-3 hover:bg-neutral-900/40 rounded"
                  >
                    ← Previous Step
                  </button>
                ) : (
                  <div />
                )}
                {step !== 3 && (
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
                  >
                    Continue to {step === 1 ? 'Delivery' : 'Payment'} →
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT: Complete Order Items Invoice Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-neutral-950 border border-neutral-900/60 p-8 rounded-2xl">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-900 pb-4 mb-6 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-505" />
                <span>My Invoice Summary ({cart.length})</span>
              </h3>
              
              <ul className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin">
                {cart.map(item => (
                  <li key={item.id} className="flex gap-4 p-3 bg-black/40 border border-neutral-900 rounded-xl">
                     <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 shrink-0 relative rounded-lg flex items-center justify-center p-1">
                       {item.imageUrl ? (
                         <img src={item.imageUrl} alt={item.name} referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain rounded-md" />
                       ) : (
                         <span className="text-neutral-700 text-[10px] uppercase tracking-widest font-bold">No Img</span>
                       )}
                       <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                         {item.quantity}
                       </span>
                     </div>
                     <div className="flex-1 flex flex-col justify-center">
                       <p className="text-xs font-bold text-neutral-300 line-clamp-1 uppercase tracking-wider leading-tight mb-1">{item.name}</p>
                       <p className="text-xs font-mono text-neutral-400">₦{item.price.toLocaleString()} each</p>
                     </div>
                     <div className="flex items-center justify-end font-mono text-xs font-bold text-white pl-2">
                       ₦{(item.price * item.quantity).toLocaleString()}
                     </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-neutral-900 pt-6 mt-6">
                <label className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2">
                  <Tag className="w-3 h-3" /> Add Coupon Code
                </label>
                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. TZ-VIP-94820 OR DISCOUNT20"
                        className="flex-1 bg-black border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm uppercase placeholder:normal-case font-mono"
                      />
                      <button 
                        type="button" 
                        onClick={handleApplyCoupon}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="text-[10px] text-cyan-400/80">
                      ⚡ <strong>VIP Waitlist Members:</strong> Enter your VIP Pass ID or registered email for 7% Off + Free Delivery!
                    </p>
                    {couponError && (
                      <p className="text-[11px] text-rose-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-lg text-emerald-400 text-xs">
                      <span className="font-mono font-bold tracking-wide uppercase">{appliedCoupon.code}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {appliedCoupon.isVipPass ? '7% VIP Off + Free Delivery' : appliedCoupon.type === 'Percentage' ? `${appliedCoupon.value}% Off` : appliedCoupon.type === 'Fixed' ? `₦${appliedCoupon.value.toLocaleString()} Off` : 'Free Shipping'}
                        </span>
                        <button 
                          type="button" 
                          onClick={handleRemoveCoupon} 
                          className="text-neutral-400 hover:text-white font-bold ml-1 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    {couponSuccess && (
                      <p className="text-[11px] text-emerald-500 font-medium">
                        {couponSuccess}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3.5 text-xs border-t border-neutral-900 pt-6">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal Invoice</span>
                  <span className="text-white font-mono font-medium">₦{subtotal.toLocaleString()}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium animate-in fade-in">
                    <span>Discount Coupon</span>
                    <span className="font-mono">-₦{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-400">
                  <span>Inland Shipping</span>
                  {appliedCoupon?.type === 'Shipping' || appliedCoupon?.freeShipping ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-neutral-500 line-through font-mono">₦{baseDeliveryFee.toLocaleString()}</span>
                      <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider">Free Launch Delivery</span>
                    </div>
                  ) : baseDeliveryFee > 0 ? (
                    <span className="text-white font-mono font-medium">₦{baseDeliveryFee.toLocaleString()}</span>
                  ) : (
                    <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-wider">{lga ? 'Standard Delivery' : 'Select LGA for Delivery Fee'}</span>
                  )}
                </div>
                
                <div className="border-t border-neutral-900 pt-4 mt-2 flex justify-between items-end text-white">
                  <span className="text-lg font-serif font-black uppercase tracking-tight">Total Amount</span>
                  <span className="text-2xl font-mono font-bold text-blue-500">₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Secure Badging panel */}
            <div className="bg-neutral-950/40 border border-neutral-900 p-6 rounded-xl space-y-3 text-center">
              <Shield className="w-6 h-6 text-blue-500 mx-auto" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-300">Tizzitech Guarantee Protection</h4>
              <p className="text-[10px] text-neutral-500 font-light leading-relaxed max-w-xs mx-auto">
                All devices are fully validated, insured during delivery, and come with a standard limited satisfaction guarantee.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
