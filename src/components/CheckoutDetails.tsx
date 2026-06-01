import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, MapPin, Phone, FileText, CheckCircle2, ArrowLeft, Shield, Banknote, ShoppingBag } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useAuth } from '../contexts/AuthContext';
import { CartItem, Order } from '../types';

interface CheckoutDetailsProps {
  cart: CartItem[];
  onComplete: (order: Order) => void;
  onCancel: () => void;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export function CheckoutDetails({ cart, onComplete, onCancel }: CheckoutDetailsProps) {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentOption, setPaymentOption] = useState('card');
  const [addressDetails, setAddressDetails] = useState('');
  const [locationCenter, setLocationCenter] = useState({ lat: 6.5244, lng: 3.3792 });
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    // Scroll to top when loading checkout or changing active steps
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleSuccess = () => {
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
      address: addressDetails || 'Address provided at checkout'
    };

    setTimeout(() => {
      onComplete(newOrder);
      setIsSuccess(false);
      setStep(1);
    }, 2800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    handleSuccess();
  };

  if (isSuccess) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-black text-white animate-in fade-in duration-500">
        <div className="max-w-md w-full bg-neutral-950 border border-neutral-900 px-8 py-16 rounded-2xl shadow-2xl space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-black text-white uppercase tracking-tighter">Order Confirmed!</h2>
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Thank you for shopping with Tizzitech.</p>
          </div>
          <p className="text-sm text-neutral-400 font-light leading-relaxed">
            Your premium tech gear is now being processed. You can monitor and follow your order details anytime in real-time.
          </p>
          <div className="pt-4">
            <span className="inline-block text-xs text-neutral-600 font-mono tracking-widest uppercase">Redirecting to order tracking...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black text-white relative animate-in fade-in duration-500 min-h-screen pb-24">
      {/* Navigation & Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-900 mb-12">
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold py-2 px-4 border border-neutral-900 rounded bg-neutral-950/40 w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-blue-500" />
          <span>Keep shopping</span>
        </button>
        <div className="text-left sm:text-right">
          <h1 className="text-xl font-serif font-black uppercase text-white tracking-tight">Checkout Portal</h1>
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">Premium & Secure checkout pipeline</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Modern Stepper Indicator */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { num: 1, name: 'Contact' },
              { num: 2, name: 'Delivery' },
              { num: 3, name: 'Payment' }
            ].map(s => (
              <div 
                key={s.num}
                onClick={() => {
                  if (s.num < step) setStep(s.num);
                }}
                className={`flex flex-col items-center cursor-pointer transition-all ${
                  step === s.num 
                    ? 'text-white' 
                    : s.num < step 
                      ? 'text-neutral-400 font-medium' 
                      : 'text-neutral-600 pointer-events-none'
                }`}
              >
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold font-mono text-sm mb-2 transition-all ${
                  step === s.num 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25 scale-110' 
                    : s.num < step 
                      ? 'bg-neutral-950 border-neutral-800 text-blue-500' 
                      : 'bg-neutral-950/20 border-neutral-900 text-neutral-700'
                }`}>
                  {s.num < step ? <CheckCircle2 className="w-5 h-5 text-blue-500" /> : s.num}
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest">{s.name}</span>
              </div>
            ))}
          </div>
          <div className="relative mt-4 h-1 bg-neutral-900 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-blue-600 transition-all duration-500" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20 bg-neutral-950 border border-neutral-900 rounded-2xl space-y-6">
            <ShoppingBag className="w-12 h-12 text-neutral-700 mx-auto" />
            <h2 className="text-xl font-serif font-black uppercase text-white">Your Cart is Empty</h2>
            <p className="text-sm text-neutral-500 max-w-xs mx-auto">Please select premium tech gear from our catalog before checking out.</p>
            <button 
              onClick={onCancel}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-widest uppercase transition-colors"
            >
              Discover Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* LEFT: Spacious 8-column layout for Form & Interaction details */}
            <div className="lg:col-span-8 bg-neutral-950/40 border border-neutral-900 rounded-2xl p-6 sm:p-10 space-y-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                      <h2 className="text-2xl font-serif font-black uppercase tracking-tight text-white mb-2">Contact Details</h2>
                      <p className="text-xs text-neutral-500">Provide direct contact details to coordinate prompt dispatch updates.</p>
                    </div>

                    <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2">Phone Number *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="w-4 h-4 text-neutral-600" />
                          </div>
                          <input 
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="e.g. 08011234567"
                            className="w-full bg-black border border-neutral-800 rounded-lg py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-neutral-800 font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-blue-500/5 border border-blue-500/15 rounded-lg text-neutral-400 text-xs leading-relaxed font-light flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <span>We respect your privacy. Tizzitech only uses your phone number to communicate order fulfillment updates and delivery timing.</span>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                      <h2 className="text-2xl font-serif font-black uppercase tracking-tight text-white mb-2">Delivery Information</h2>
                      <p className="text-xs text-neutral-500">Let us know exactly where to express ship your brand new gear.</p>
                    </div>

                    <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2">Delivery Address *</label>
                        <textarea
                          required
                          value={addressDetails}
                          onChange={(e) => setAddressDetails(e.target.value)}
                          placeholder="Provide detailed information (Street, Building No, Area, City, State)..."
                          className="w-full bg-black border border-neutral-800 rounded-lg p-4 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-neutral-800 h-28 resize-none text-sm leading-relaxed"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase">Map Pinpoint Pin (Optional)</label>
                        <div className="rounded-xl border border-neutral-800 h-[260px] relative overflow-hidden bg-black flex items-center justify-center">
                          {hasValidKey ? (
                            <APIProvider apiKey={API_KEY} version="weekly">
                              <Map
                                defaultCenter={locationCenter}
                                defaultZoom={12}
                                mapId="CHECKOUT_MAP_PORTAL"
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
                            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center max-w-sm">
                              <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-600 mb-3">
                                <MapPin className="w-5 h-5" />
                              </div>
                              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Interactive Map</h4>
                              <p className="text-[10px] text-neutral-600 leading-normal max-w-xs mt-1 uppercase tracking-wider">A Google Maps Platform API key is required to render local maps in Lagos, Nigeria.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                      <h2 className="text-2xl font-serif font-black uppercase tracking-tight text-white mb-2">Choose Payment Option</h2>
                      <p className="text-xs text-neutral-500">All payment workflows are securely formatted and verified.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { id: 'card', label: 'Credit / Debit Card', desc: 'Secure settlement via checkout gateway', icon: CreditCard },
                        { id: 'transfer', label: 'Bank Transfer Details', desc: 'Secure local wire or internet transfer', icon: Banknote },
                        { id: 'pod', label: 'Pay on Delivery (Lagos Match)', desc: 'Pay with cash / POS upon shipment arrival', icon: CheckCircle2 }
                      ].map(option => {
                        const IconComponent = option.icon;
                        const isSelected = paymentOption === option.id;
                        return (
                          <div key={option.id} className="space-y-4">
                            <label 
                              className={`relative flex items-center gap-4 p-5 cursor-pointer border rounded-xl transition-all ${
                                isSelected 
                                  ? 'border-blue-600 bg-blue-900/10 shadow-[0_0_20px_rgba(37,99,235,0.05)]' 
                                  : 'border-neutral-950 bg-neutral-950 hover:bg-neutral-900 hover:border-neutral-800'
                              }`}
                            >
                              <input 
                                type="radio" 
                                name="payment_option" 
                                className="sr-only"
                                checked={isSelected}
                                onChange={() => setPaymentOption(option.id)}
                              />
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${
                                isSelected ? 'bg-blue-600/15 border-blue-500 text-blue-500' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                              }`}>
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <span className="block text-xs font-bold text-white uppercase tracking-widest">{option.label}</span>
                                <span className="block text-[10px] text-neutral-500 mt-1">{option.desc}</span>
                              </div>
                              
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                isSelected ? 'border-blue-500 bg-blue-600 text-white' : 'border-neutral-800 bg-black'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </label>

                            {/* Supplementary Card form */}
                            {paymentOption === 'card' && option.id === 'card' && (
                              <motion.div 
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-5 space-y-4"
                              >
                                <div>
                                  <label className="block text-[9px] font-bold tracking-widest text-neutral-500 uppercase mb-1.5">Card Number</label>
                                  <input 
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    required={paymentOption === 'card'}
                                    value={cardDetails.number}
                                    onChange={(e) => setCardDetails(prev => ({...prev, number: e.target.value}))}
                                    className="w-full bg-black border border-neutral-850 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-neutral-800 font-mono text-xs"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[9px] font-bold tracking-widest text-neutral-500 uppercase mb-1.5">Expiry Date</label>
                                    <input 
                                      type="text"
                                      placeholder="MM/YY"
                                      required={paymentOption === 'card'}
                                      value={cardDetails.expiry}
                                      onChange={(e) => setCardDetails(prev => ({...prev, expiry: e.target.value}))}
                                      className="w-full bg-black border border-neutral-850 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-neutral-800 font-mono text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold tracking-widest text-neutral-500 uppercase mb-1.5">CVV Code</label>
                                    <input 
                                      type="password"
                                      placeholder="•••"
                                      maxLength={3}
                                      required={paymentOption === 'card'}
                                      value={cardDetails.cvv}
                                      onChange={(e) => setCardDetails(prev => ({...prev, cvv: e.target.value}))}
                                      className="w-full bg-black border border-neutral-850 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-neutral-800 font-mono text-xs"
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Supplementary Bank transfer details */}
                            {paymentOption === 'transfer' && option.id === 'transfer' && (
                              <motion.div 
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-6 space-y-4 text-center"
                              >
                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Kindly Transfer Exactly:</p>
                                <p className="text-3xl font-mono font-bold text-blue-500">₦{total.toLocaleString()}</p>
                                
                                <div className="bg-black border border-neutral-900 rounded-lg p-5 mt-4 text-left space-y-3">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-neutral-500 font-bold uppercase tracking-widest">Bank Name</span>
                                    <span className="font-bold text-white uppercase tracking-wider">Guaranty Trust Bank (GTB)</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs border-t border-neutral-900/50 pt-3">
                                    <span className="text-neutral-500 font-bold uppercase tracking-widest">Account Name</span>
                                    <span className="font-bold text-white uppercase tracking-wider">Tizzitech Global</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs border-t border-neutral-900/50 pt-3">
                                    <span className="text-neutral-500 font-bold uppercase tracking-widest">Account Number</span>
                                    <span className="font-mono font-bold text-white text-sm tracking-widest select-all">0421394182</span>
                                  </div>
                                </div>
                                <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest max-w-xs mx-auto mt-2 leading-relaxed">
                                  Our operations team will verify your transfer and authorize your dispatch automatically.
                                </p>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Submit Controls & Stepper Actions */}
                <div className="pt-8 border-t border-neutral-900/60 flex items-center justify-between">
                  {step > 1 ? (
                    <button 
                      type="button" 
                      onClick={() => setStep(step - 1)} 
                      className="text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-widest transition-colors py-2"
                    >
                      &larr; Go Back
                    </button>
                  ) : <div />}

                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
                  >
                    {step === 3 ? 'Confirm Order' : `Proceed →`}
                  </button>
                </div>

              </form>
            </div>

            {/* RIGHT: Spacious Summary sidebar detailing items cleanly */}
            <div className="lg:col-span-4 bg-neutral-950 border border-neutral-900 rounded-2xl p-6 sm:p-8 space-y-6">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-900 pb-3">Shopping Summary</h3>
              
              {/* Scrollable list of items being purchased */}
              <div className="max-h-[380px] overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-black/40 border border-neutral-900 rounded-lg p-3">
                    <div className="w-14 h-14 bg-neutral-950 border border-neutral-900 rounded-md shrink-0 relative flex items-center justify-center p-2">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                      <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-bold font-mono">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wide truncate">{item.name}</h4>
                      <p className="text-[10px] text-neutral-500 mt-1 uppercase font-medium tracking-wide">Brand: {item.brand}</p>
                      <p className="text-xs font-mono font-bold text-neutral-400 mt-1">₦{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Calculation breakdown */}
              <div className="space-y-3 text-xs border-t border-neutral-900 pt-6">
                <div className="flex justify-between text-neutral-500">
                  <span className="font-bold uppercase tracking-wider">Subtotal</span>
                  <span className="text-neutral-300 font-mono">₦{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span className="font-bold uppercase tracking-wider">Lagos Express Shipping</span>
                  <span className="text-emerald-500 font-bold uppercase tracking-widest text-[9px]">Free Shipping</span>
                </div>
                
                <div className="border-t border-neutral-900 pt-5 mt-4 flex items-end justify-between text-white">
                  <span className="text-sm font-bold uppercase tracking-widest text-neutral-400">Total Purchase</span>
                  <span className="text-2xl font-serif font-black tracking-tight text-white">₦{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Secure footer attributes */}
              <div className="bg-black/50 border border-neutral-900 p-4 rounded-xl flex items-center justify-center text-[10px] text-neutral-500 font-bold uppercase tracking-widest text-center mt-6">
                <Shield className="w-4 h-4 text-emerald-500 inline mr-2 shrink-0" />
                <span>SSL Secured Transactions</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
