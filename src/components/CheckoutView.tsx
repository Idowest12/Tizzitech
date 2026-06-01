import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, MapPin, Phone, FileText, CheckCircle2, ChevronRight, ShoppingBag, ArrowLeft, Shield, Sparkles, Tag } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useAuth } from '../contexts/AuthContext';
import { CartItem, Order } from '../types';

interface CheckoutViewProps {
  cart: CartItem[];
  hasPastOrders?: boolean;
  onComplete: (order: Order) => void;
  onCancel: () => void;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export function CheckoutView({ cart, hasPastOrders, onComplete, onCancel }: CheckoutViewProps) {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullname, setFullname] = useState(user?.name || '');
  const [emailAddress, setEmailAddress] = useState(user?.email || '');
  const [paymentOption, setPaymentOption] = useState('card');
  const [streetAddress, setStreetAddress] = useState('');
  const [stateLocation, setStateLocation] = useState('Lagos');
  const [city, setCity] = useState('');
  const [lga, setLga] = useState('');
  const [locationCenter, setLocationCenter] = useState({ lat: 6.5244, lng: 3.3792 });
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [couponCode, setCouponCode] = useState('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    // Scroll to the top when checkout renders
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleConfirmOrder = () => {
    setIsSuccess(true);
    
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 3);
    
    const newOrder: Order = {
      id: `TZ${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      items: [...cart],
      total,
      status: 'Confirmed',
      orderDate: new Date(),
      expectedDeliveryDate: expectedDate,
      address: `${streetAddress}, ${city}, ${lga}, ${stateLocation}` || 'Lagos Deliveries, Lagos, Nigeria'
    };

    setTimeout(() => {
      onComplete(newOrder);
      setIsSuccess(false);
      setStep(1);
    }, 2500);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    handleConfirmOrder();
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
    <div className="w-full bg-black text-white relative animate-in fade-in duration-500 min-h-screen pb-24">
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
            <div className="flex items-center gap-4 bg-neutral-950 border border-neutral-900 px-6 py-4 rounded-xl shrink-0">
              <div className={`flex items-center gap-2.5 text-xs font-bold tracking-widest uppercase transition-colors ${step >= 1 ? 'text-white' : 'text-neutral-600'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-neutral-900'}`}>1</span>
                <span>Contact</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-800" />
              <div className={`flex items-center gap-2.5 text-xs font-bold tracking-widest uppercase transition-colors ${step >= 2 ? 'text-white' : 'text-neutral-600'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-neutral-900'}`}>2</span>
                <span>Delivery</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-800" />
              <div className={`flex items-center gap-2.5 text-xs font-bold tracking-widest uppercase transition-colors ${step >= 3 ? 'text-white' : 'text-neutral-600'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-neutral-900'}`}>3</span>
                <span>Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Inputs Left vs Order Summary Right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Complete Checkout Actions Form */}
          <div className="lg:col-span-7 bg-neutral-950 border border-neutral-900/60 p-8 sm:p-10 rounded-2xl">
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
                              setPaymentOption('card');
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
                            {['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'].map(area => (
                              <option key={area} value={area}>{area}</option>
                            ))}
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
                      </div>
                    </div>
                  </div>

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

                  <div className="w-full bg-black border border-neutral-900 text-white rounded-xl overflow-hidden flex min-h-[350px]">
                    {/* Sidebar / Tabs */}
                    <div className="w-1/3 bg-neutral-950 flex flex-col border-r border-neutral-900">
                      <div className="p-4 border-b border-neutral-900 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                        Pay With
                      </div>
                      <div className="flex-1 flex flex-col">
                        {[
                          { id: 'card', label: 'Card', icon: <CreditCard className="w-4 h-4" /> },
                          { id: 'transfer', label: 'Bank Transfer', icon: <FileText className="w-4 h-4" /> },
                          ...(stateLocation === 'Lagos' && hasPastOrders ? [{ id: 'pod', label: 'Pay on Delivery', icon: <ShoppingBag className="w-4 h-4" /> }] : [])
                        ].map(option => (
                           <button
                             key={option.id}
                             type="button"
                             onClick={() => setPaymentOption(option.id)}
                             className={`flex items-center gap-3 px-4 py-4 text-sm font-medium transition-colors border-l-4 ${
                               paymentOption === option.id
                                 ? 'border-emerald-500 bg-black text-emerald-500'
                                 : 'border-transparent text-neutral-500 hover:bg-neutral-900 hover:text-white'
                             }`}
                           >
                             <span className={paymentOption === option.id ? 'text-emerald-500' : 'text-neutral-500'}>
                               {option.icon}
                             </span>
                             {option.label}
                           </button>
                        ))}
                      </div>
                      
                      {stateLocation === 'Lagos' && !hasPastOrders && (
                        <div className="p-4 bg-orange-500/10 border-t border-orange-500/20 text-[9px] text-orange-400 font-medium leading-tight">
                          * Pay on Delivery activates after your first successful purchase.
                        </div>
                      )}
                    </div>

                    {/* Right Content Pane */}
                    <div className="w-2/3 p-6 flex flex-col bg-black">
                      <div className="flex justify-between items-start mb-6">
                         <div className="flex flex-col">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">{emailAddress || 'guest@example.com'}</span>
                            <span className="text-emerald-500 font-bold font-mono">Pay ₦{total.toLocaleString()}</span>
                         </div>
                      </div>

                      <div className="flex-1">
                        {paymentOption === 'card' && (
                          <div className="space-y-4 animate-in fade-in duration-300">
                            <h4 className="text-center font-bold tracking-widest uppercase text-xs text-neutral-300 mb-4">Enter your card details to pay</h4>
                            <div>
                               <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-2">Card Number</label>
                               <input 
                                 type="text"
                                 placeholder="0000 0000 0000 0000"
                                 required={paymentOption === 'card'}
                                 value={cardDetails.number}
                                 onChange={(e) => setCardDetails(prev => ({...prev, number: e.target.value}))}
                                 className="w-full bg-neutral-950 border border-neutral-900 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-neutral-700 font-mono text-sm"
                               />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                 <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-2">Card Expiry</label>
                                 <input 
                                   type="text"
                                   placeholder="MM / YY"
                                   required={paymentOption === 'card'}
                                   value={cardDetails.expiry}
                                   onChange={(e) => setCardDetails(prev => ({...prev, expiry: e.target.value}))}
                                   className="w-full bg-neutral-950 border border-neutral-900 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-neutral-700 font-mono text-sm text-center"
                                 />
                               </div>
                               <div>
                                 <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-2">CVV</label>
                                 <input 
                                   type="text"
                                   placeholder="123"
                                   required={paymentOption === 'card'}
                                   value={cardDetails.cvv}
                                   onChange={(e) => setCardDetails(prev => ({...prev, cvv: e.target.value}))}
                                   className="w-full bg-neutral-950 border border-neutral-900 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-neutral-700 font-mono text-sm text-center"
                                 />
                               </div>
                            </div>
                            <button
                              type="submit"
                              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-lg text-xs uppercase tracking-widest transition-colors shadow-none"
                            >
                              Pay ₦{total.toLocaleString()}
                            </button>
                          </div>
                        )}

                        {paymentOption === 'transfer' && (
                          <div className="space-y-4 animate-in fade-in duration-300 text-center">
                            <h4 className="font-bold tracking-widest uppercase text-xs text-neutral-300 mb-2">Transfer to the account below</h4>
                            <div className="bg-neutral-950 border border-neutral-900 p-5 rounded-lg space-y-3 text-left">
                               <div className="flex justify-between border-b border-neutral-900 pb-2">
                                 <span className="text-[10px] text-neutral-500 tracking-widest uppercase">Bank Name</span>
                                 <span className="text-xs font-bold text-white font-mono">GTB</span>
                               </div>
                               <div className="flex justify-between border-b border-neutral-900 pb-2">
                                 <span className="text-[10px] text-neutral-500 tracking-widest uppercase">Account Name</span>
                                 <span className="text-xs font-bold text-white font-mono">Tizzitech Global</span>
                               </div>
                               <div className="flex justify-between items-center pt-1">
                                 <span className="text-[10px] text-neutral-500 tracking-widest uppercase">Account Number</span>
                                 <span className="text-lg font-black text-emerald-500 font-mono">0421394182</span>
                               </div>
                            </div>
                            <button
                              type="submit"
                              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-lg text-xs uppercase tracking-widest transition-colors shadow-none"
                            >
                              I've sent the money
                            </button>
                          </div>
                        )}

                        {paymentOption === 'pod' && (
                          <div className="space-y-4 animate-in fade-in duration-300 text-center flex flex-col items-center justify-center h-full">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-2">
                               <ShoppingBag className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold tracking-widest uppercase text-xs text-neutral-300">Pay on Delivery</h4>
                            <p className="text-xs text-neutral-500 max-w-[200px] leading-relaxed">
                              You'll pay via cash or POS when your items arrive at your location.
                            </p>
                            <button
                              type="submit"
                              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-lg text-xs uppercase tracking-widest transition-colors shadow-none"
                            >
                              Confirm Order
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 flex justify-center items-center gap-1 text-[10px] font-medium tracking-widest uppercase text-neutral-600">
                        <Shield className="w-3 h-3" />
                        Secured by <span className="font-bold text-white">paystack</span>
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
                     <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 shrink-0 relative rounded-lg overflow-hidden flex items-center justify-center p-1">
                       <img src={item.imageUrl} alt={item.name} className="max-h-full max-w-full object-contain" />
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
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="e.g. DISCOUNT20"
                    className="flex-1 bg-black border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm uppercase placeholder:normal-case font-mono"
                  />
                  <button type="button" className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
                    Apply
                  </button>
                </div>
              </div>

              <div className="space-y-3.5 text-xs border-t border-neutral-900 pt-6">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal Invoice</span>
                  <span className="text-white font-mono font-medium">₦{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Inland Shipping</span>
                  <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-wider">Free Delivery</span>
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
