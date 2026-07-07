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
    <section className="w-full bg-neutral-900 border-t border-neutral-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl">
          <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-500" />
            Stay Connected with Tizzitech
          </h3>
          <p className="text-neutral-400">
            Subscribe to our newsletter for exclusive access to <strong className="text-white font-medium">New Products Updates</strong>, early notifications on <strong className="text-white font-medium">Site Maintenance</strong>, and detailed <strong className="text-white font-medium">Product Reviews</strong>.
          </p>
        </div>

        <div className="w-full md:w-auto flex-1 max-w-md">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex bg-black p-1 rounded-lg border border-neutral-800 focus-within:border-blue-500 transition-colors">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                className="flex-1 bg-transparent border-none text-white px-4 py-3 text-sm focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-md transition-colors disabled:opacity-50 text-sm uppercase tracking-widest"
              >
                {status === 'loading' ? 'Joining...' : 'Subscribe'}
              </button>
            </div>
            {status === 'success' && (
              <p className="absolute -bottom-7 left-0 text-green-400 text-sm flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> {message}
              </p>
            )}
            {status === 'error' && (
              <p className="absolute -bottom-7 left-0 text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
