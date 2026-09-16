import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Subscription failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <section className="w-full bg-neutral-900 border-t border-neutral-800 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div className="w-full lg:max-w-xl">
          <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-500 shrink-0" />
            Stay Connected with Tizzitech
          </h3>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Subscribe to our newsletter for exclusive access to <strong className="text-white font-medium">New Products Updates</strong>, early notifications on <strong className="text-white font-medium">Site Maintenance</strong>, and detailed <strong className="text-white font-medium">Product Reviews</strong>.
          </p>
        </div>

        <div className="w-full lg:w-auto flex-1 max-w-xl lg:max-w-md">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-black p-1.5 rounded-2xl border border-neutral-800 focus-within:border-blue-500 transition-all gap-2 sm:gap-1.5 shadow-lg overflow-hidden">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                className="w-full sm:flex-1 min-w-0 bg-transparent border-none text-white px-4 py-3 text-sm focus:outline-none disabled:opacity-50 placeholder-neutral-500"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50 text-xs sm:text-sm uppercase tracking-widest active:scale-95 shadow-md cursor-pointer whitespace-nowrap"
              >
                {status === 'loading' ? 'Joining...' : 'Subscribe'}
              </button>
            </div>
            {status === 'success' && (
              <p className="mt-2.5 text-green-400 text-sm flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle className="w-4 h-4 shrink-0" /> {message}
              </p>
            )}
            {status === 'error' && (
              <p className="mt-2.5 text-red-400 text-sm flex items-center gap-1.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" /> {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
