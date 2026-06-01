import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export function ContactUs() {
  return (
    <div className="w-full bg-black text-white relative animate-in fade-in duration-500 pb-20">
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
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Message Sent!"); }}>
              <div>
                <label className="block text-xs font-bold tracking-widest text-neutral-500 uppercase mb-2">Name</label>
                <input 
                  type="text" 
                  className="w-full bg-black border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-neutral-500 uppercase mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full bg-black border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest text-neutral-500 uppercase mb-2">Message</label>
                <textarea 
                  rows={5}
                  className="w-full bg-black border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  required 
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold tracking-widest uppercase py-4 hover:bg-blue-700 transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
