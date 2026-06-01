import React, { useState } from 'react';
import { Package, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface AdminDashboardProps {
  products: Product[];
  onUpdateStock: (id: string, newStock: number) => void;
}

export function AdminDashboard({ products, onUpdateStock }: AdminDashboardProps) {
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-500" />
            Inventory Dashboard
          </h1>
          <p className="mt-2 text-sm text-neutral-400 font-medium">
            Manage your store's tech inventory, pricing, and stock levels securely.
          </p>
        </div>
        <div className="mt-4 flex sm:ml-16 sm:mt-0 sm:flex-none justify-end">
          <button
            type="button"
            disabled
            className="block rounded-xl bg-blue-600 px-5 py-2.5 text-center text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 opacity-50 cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Product <span className="text-[10px] font-bold border border-white/30 rounded px-2 py-0.5 ml-1 bg-white/10 tracking-widest uppercase">PRO</span>
          </button>
        </div>
      </div>

      <div className="mt-8 flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-4 w-4 text-neutral-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border border-neutral-700 bg-neutral-900 py-2.5 pl-11 pr-4 text-neutral-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all"
            placeholder="Search by product name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow-2xl ring-1 ring-neutral-800 sm:rounded-2xl bg-neutral-900/50 backdrop-blur-sm">
              <table className="min-w-full divide-y divide-neutral-800">
                <thead className="bg-neutral-900/80">
                  <tr>
                    <th scope="col" className="py-4 pl-4 pr-3 text-left text-xs font-bold text-neutral-400 uppercase tracking-widest sm:pl-6">Product</th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-neutral-400 uppercase tracking-widest">Brand</th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-neutral-400 uppercase tracking-widest">Price</th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-neutral-400 uppercase tracking-widest">Status</th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-neutral-400 uppercase tracking-widest">Stock Units</th>
                    <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80 bg-neutral-900/30">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-neutral-800/50 transition-colors">
                      <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0 bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
                            <img className="h-full w-full object-cover" src={product.imageUrl} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="font-bold text-white text-base">{product.name}</div>
                            <div className="text-neutral-500 text-xs mt-1 font-medium bg-neutral-800 inline-block px-2 py-0.5 rounded">ID: {product.id} • {product.condition}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-neutral-400 font-medium">
                        {product.brand}
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-base text-white font-bold">
                        ₦{product.price.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm">
                        {product.stock > 5 ? (
                          <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 ring-1 ring-inset ring-emerald-500/20">Active</span>
                        ) : product.stock > 0 ? (
                          <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 ring-1 ring-inset ring-amber-500/20">Low Stock</span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-400 ring-1 ring-inset ring-rose-500/20">Out of Stock</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-neutral-400">
                        <input
                          type="number"
                          min="0"
                          value={product.stock}
                          onChange={(e) => onUpdateStock(product.id, parseInt(e.target.value) || 0)}
                          className="block w-20 rounded-lg border border-neutral-700 bg-neutral-900 py-1.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm sm:leading-6 font-bold text-center"
                        />
                      </td>
                      <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-3 text-neutral-500">
                          <button disabled className="hover:text-blue-400 opacity-30 cursor-not-allowed transition-colors" title="Edit (Disabled in mock)">
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button disabled className="hover:text-rose-400 opacity-30 cursor-not-allowed transition-colors" title="Delete (Disabled in mock)">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                     <tr>
                        <td colSpan={6} className="py-12 text-center text-neutral-500 text-sm font-medium">
                           No products found matching "{search}".
                        </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
