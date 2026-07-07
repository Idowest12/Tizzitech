import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { Package, Truck, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface TrackingDashboardProps {
  orders: Order[];
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export function TrackingDashboard({ orders }: TrackingDashboardProps) {
  const [riderLocation, setRiderLocation] = useState({ lat: 6.5244, lng: 3.3792 });

  // Simulate rider movement
  useEffect(() => {
    const interval = setInterval(() => {
      setRiderLocation((prev) => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-neutral-900/50 rounded-2xl border border-neutral-800 backdrop-blur-sm shadow-xl mx-4 sm:mx-8 my-8">
        <Package className="w-16 h-16 text-neutral-600 mb-6" />
        <h3 className="text-2xl font-bold text-white mb-2 tracking-wide">No Orders Found</h3>
        <p className="text-neutral-400 max-w-sm">You haven't placed any orders yet. Start exploring our store to find your next tech gear.</p>
      </div>
    );
  }

  const getStatusIndex = (status: OrderStatus) => {
    const statuses: OrderStatus[] = ['Confirmed', 'Accepted', 'In Transit', 'Picked Up', 'Delivered'];
    if (status === 'Processing') return 1;
    if (status === 'Shipped') return 2;
    return Math.max(0, statuses.indexOf(status));
  };

  const statusSteps = [
    { label: 'Confirmed', icon: Clock },
    { label: 'Accepted', icon: CheckCircle2 },
    { label: 'In Transit', icon: Truck },
    { label: 'Picked Up', icon: Package },
    { label: 'Delivered', icon: CheckCircle2 },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Order Tracking</h1>
          <p className="mt-2 text-sm font-medium text-neutral-400">Track the status of your recent orders</p>
        </div>
      </div>

      <div className="space-y-8">
        {orders.map((order) => {
          const currentStageIndex = getStatusIndex(order.status);
          const isDelivered = order.status === 'Delivered';

          return (
            <div key={order.id} className="bg-neutral-900 overflow-hidden rounded-2xl shadow-xl shadow-black/50 border border-neutral-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
                <div className="flex flex-col gap-1">
                   <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Order ID #{order.id.toUpperCase()}</p>
                   <p className="text-xs text-neutral-500">Placed on {new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                {!isDelivered && (
                   <div className="mt-2 sm:mt-0 text-sm font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 shadow-sm w-fit">
                      Estimated Delivery: {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                   </div>
                )}
                {isDelivered && (
                   <div className="mt-2 sm:mt-0 text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-sm w-fit">
                      Delivered
                   </div>
                )}
              </div>

              <div className="p-6 sm:p-8">
                {/* Timeline */}
                <div className="relative">
                  <div className="absolute left-0 top-1/2 -mt-px h-0.5 w-full bg-neutral-800 hidden sm:block" />
                  <div className="absolute left-4 top-0 h-full w-0.5 bg-neutral-800 sm:hidden" />
                  
                  <div className="relative flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
                    {statusSteps.map((step, index) => {
                      const isCompleted = index <= currentStageIndex;
                      const isActive = index === currentStageIndex;
                      const Icon = step.icon;
                      
                      return (
                        <div key={step.label} className="flex sm:flex-col items-center sm:w-1/5 gap-4 sm:gap-2 relative z-10 group">
                           {/* Line connecting vertical steps on mobile */}
                           {index < statusSteps.length - 1 && (
                             <div className={`absolute top-10 left-4 w-0.5 h-full -z-10 sm:hidden ${isCompleted ? 'bg-blue-500' : 'bg-neutral-800'}`} />
                           )}
                           
                          <div
                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                              isCompleted
                                ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                : 'bg-neutral-900 border-neutral-700 text-neutral-500 group-hover:border-neutral-600'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="sm:text-center mt-0 sm:mt-2">
                            <p className={`text-sm font-bold uppercase tracking-wide ${isCompleted ? 'text-white' : 'text-neutral-500'}`}>
                              {step.label}
                            </p>
                            {isActive && !isDelivered && (
                               <p className="text-xs text-blue-400 font-medium mt-1">Current Status</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {!isDelivered && (
                <div className="border-t border-neutral-800 p-6 sm:p-8">
                  <h4 className="text-sm font-bold text-neutral-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    Live Tech Dispatch Tracking
                  </h4>
                  <div className="rounded-xl overflow-hidden border border-neutral-800 h-[250px] relative bg-neutral-950">
                    {hasValidKey ? (
                      <APIProvider apiKey={API_KEY} version="weekly">
                        <Map
                          defaultCenter={riderLocation}
                          defaultZoom={15}
                          mapId="RIDER_TRACKING_MAP"
                          style={{ width: '100%', height: '100%' }}
                          disableDefaultUI={true}
                        >
                          <AdvancedMarker position={riderLocation}>
                            <Pin background="#3b82f6" glyphColor="#fff" borderColor="#1d4ed8">
                              <Truck className="w-4 h-4 text-white" />
                            </Pin>
                          </AdvancedMarker>
                        </Map>
                         <div className="absolute top-2 left-2 bg-neutral-900/90 backdrop-blur border border-neutral-800 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-400 flex items-center gap-2 shadow-lg">
                           <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                           Dispatch nearby
                         </div>
                      </APIProvider>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                        <Truck className="w-8 h-8 text-neutral-600 mb-2" />
                        <p className="text-sm text-neutral-400 font-medium mb-1">Rider tracking requires Google Maps API Key</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-neutral-950/50 px-6 py-4 border-t border-neutral-800 flex flex-col sm:flex-row gap-4 justify-between">
                 <div>
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Shipping Address</p>
                    <p className="text-sm text-neutral-300">{order.address}</p>
                 </div>
                 <div className="sm:text-right">
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-lg font-black text-white">₦{order.total.toLocaleString()}</p>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
