import React from 'react';
import { X, Trash2, Plus, Minus, CreditCard, ShoppingCart } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, cart, updateQuantity, removeFromCart, onCheckout }: CartDrawerProps) {
  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-neutral-950 shadow-2xl flex flex-col transform transition-transform duration-300 border-l border-neutral-900">
        <div className="flex items-center justify-between px-6 py-6 border-b border-neutral-900">
          <h2 className="text-2xl font-serif font-black text-white tracking-widest uppercase">Your Cart</h2>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="h-20 w-20 flex items-center justify-center mb-6">
                <ShoppingCart className="h-12 w-12 text-neutral-800" />
              </div>
              <p className="text-neutral-500 mb-8 font-medium uppercase tracking-widest text-xs">Your cart is completely empty.</p>
              <button 
                onClick={onClose}
                className="bg-white px-8 py-3 text-xs font-bold tracking-widest uppercase text-black hover:bg-neutral-200 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="-my-6 divide-y divide-neutral-900">
              {cart.map((item) => (
                <li key={item.id} className="flex py-6">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover object-center" />
                    ) : (
                      <span className="text-neutral-700 text-[10px] uppercase tracking-widest font-bold">No Image</span>
                    )}
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-sm font-bold text-white gap-4">
                        <h3 className="line-clamp-2 leading-snug">{item.name}</h3>
                        <p className="whitespace-nowrap font-serif tracking-tight">₦{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                      <p className="mt-1 text-xs text-neutral-500 uppercase tracking-widest">{item.brand} • <span className="text-neutral-600">{item.condition}</span></p>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center border border-neutral-800 bg-neutral-900 h-8">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="h-full px-3 text-neutral-400 hover:text-white transition-colors flex items-center justify-center"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 font-bold text-white text-xs">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-full px-3 text-neutral-400 hover:text-white transition-colors flex items-center justify-center"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex">
                        <button 
                          type="button" 
                          onClick={() => removeFromCart(item.id)}
                          className="font-bold text-neutral-500 hover:text-blue-500 flex items-center transition-colors uppercase tracking-widest text-[10px]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-neutral-900 px-6 py-6 bg-black">
            <div className="flex justify-between items-end mb-2">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Total</p>
              <p className="text-3xl font-serif font-black text-white">₦{total.toLocaleString()}</p>
            </div>
            <p className="text-xs text-neutral-600 mb-6 font-medium uppercase tracking-widest">Taxes and delivery calculated at checkout.</p>
            <div>
              <button
                className="flex w-full items-center justify-center gap-3 bg-blue-600 px-6 py-4 text-xs font-bold text-white hover:bg-blue-700 transition-all uppercase tracking-widest"
                onClick={onCheckout}
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
