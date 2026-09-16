import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    _hp_website: '' // Hidden honeypot trap
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Thank you! Your message has been received.');
        setFormData({ name: '', email: '', subject: '', message: '', _hp_website: '' });
      } else {
        setErrorMsg(data.message || data.error || 'Failed to send message. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contact-us-view" className="w-full bg-black text-white relative animate-in fade-in duration-500 pb-20">
      {/* Hero Section */}
      <div className="relative w-full h-[40vh] flex items-center bg-neutral-950 border-b border-neutral-900">
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-6xl font-serif font-black uppercase tracking-tighter leading-none mb-4">
              Get in <span className="text-blue-600">Touch.</span>
            </h1>
            <p className="text-lg text-neutral-400 font-light max-w-lg mb-8 leading-relaxed">
              We're here to help. Reach out to us for any inquiries, support, or tech-related questions.
            </p>
          </div>
        </div>
      </div>

      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-serif font-black uppercase mb-8">Contact Information</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center text-blue-500 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-2">Phone / WhatsApp</h3>
                    <p className="text-neutral-400 font-mono">+234 (0) 800 000 0000</p>
                    <a href="https://wa.me/" className="text-blue-500 mt-2 block text-xs hover:text-blue-400 tracking-widest uppercase font-bold">Chat on WhatsApp &rarr;</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center text-blue-500 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-2">Email</h3>
                    <a href="mailto:hello@tizzitech.com.ng" className="text-neutral-400 font-mono hover:text-white transition-colors">hello@tizzitech.com.ng</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full border border-neutral-800 bg-neutral-950 flex items-center justify-center text-blue-500 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-2">Office Location</h3>
                    <p className="text-neutral-400 leading-relaxed font-light text-sm">
                      Computer Village, <br />
                      Ikeja, Lagos, Nigeria
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-neutral-950 border border-neutral-900 p-8 rounded-lg">
            <h2 className="text-2xl font-serif font-black uppercase mb-8">Send us a Message</h2>

            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-lg flex items-center gap-3 text-emerald-400 text-sm">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 bg-rose-950/60 border border-rose-500/50 rounded-lg flex items-center gap-3 text-rose-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form id="contact-form" className="space-y-6" onSubmit={handleSubmit}>
              {/* Invisible Honeypot Anti-Bot Field */}
              <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                <input
                  type="text"
                  name="_hp_website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData._hp_website}
                  onChange={(e) => setFormData({ ...formData, _hp_website: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-neutral-500 uppercase mb-2">Name</label>
                <input 
                  id="contact-input-name"
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                  className="w-full bg-black border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors rounded-none"
                  placeholder="Your full name"
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-neutral-500 uppercase mb-2">Email</label>
                <input 
                  id="contact-input-email"
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  maxLength={120}
                  className="w-full bg-black border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors rounded-none"
                  placeholder="you@example.com"
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-neutral-500 uppercase mb-2">Subject (Optional)</label>
                <input 
                  id="contact-input-subject"
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  maxLength={150}
                  className="w-full bg-black border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors rounded-none"
                  placeholder="e.g. Order inquiry, custom specs, delivery"
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-neutral-500 uppercase mb-2">Message</label>
                <textarea 
                  id="contact-input-message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  maxLength={2000}
                  className="w-full bg-black border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none rounded-none"
                  placeholder="How can we assist you today?"
                  required 
                ></textarea>
              </div>
              <button 
                id="contact-submit-btn"
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold tracking-widest uppercase py-4 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
