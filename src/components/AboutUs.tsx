import React from 'react';

export function AboutUs() {
  return (
    <div className="w-full bg-black text-white relative animate-in fade-in duration-500 pb-20">
      
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] flex items-center bg-black overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1519389950473-47bacb2679dc?q=80&w=2070&auto=format&fit=crop" 
          alt="Brand Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
        />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <h1 className="text-5xl sm:text-7xl font-serif font-black uppercase tracking-tighter leading-none mb-6">
              The Brand <br/><span className="text-blue-600">Behind</span><br/>The Gear.
            </h1>
            <p className="text-xl text-neutral-400 font-light max-w-lg mb-8 leading-relaxed">
              We didn't just open a tech store. We built a standard for premium devices and accessories that you can actually trust.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-neutral-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-black uppercase tracking-tighter">
            Why you Should <span className="text-blue-500">Shop with us</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-neutral-950 border border-neutral-900 rounded-lg hover:border-blue-900 transition-colors group">
            <div className="w-12 h-12 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
              <span className="font-serif font-bold">01</span>
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest mb-4">We don't Compromise on Quality</h3>
            <p className="text-neutral-500 leading-relaxed text-sm">
              Every device and accessory is thoroughly vetted. We only stock authentic, high-quality products that stand the test of time, ensuring you get exactly what you pay for without unexpected failures.
            </p>
          </div>
          
          <div className="p-8 bg-neutral-950 border border-neutral-900 rounded-lg hover:border-blue-900 transition-colors group">
            <div className="w-12 h-12 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
              <span className="font-serif font-bold">02</span>
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest mb-4">We work On Customer Budget</h3>
            <p className="text-neutral-500 leading-relaxed text-sm">
              We believe great tech shouldn't break the bank. We work directly with your budget to find the optimal balance, ensuring you still get the best possible value and performance for your money.
            </p>
          </div>
          
          <div className="p-8 bg-neutral-950 border border-neutral-900 rounded-lg hover:border-blue-900 transition-colors group">
            <div className="w-12 h-12 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
              <span className="font-serif font-bold">03</span>
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest mb-4">We Guide You to the Best Option</h3>
            <p className="text-neutral-500 leading-relaxed text-sm">
              Through careful assessment of what you want to achieve, we guide you in making the better purchase. No upsells—just honest recommendations tailored to your specific workflow and needs.
            </p>
          </div>
        </div>
      </div>

      {/* Founder Section */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] max-w-md w-full mx-auto lg:mx-0">
             <div className="absolute inset-0 bg-blue-600 translate-x-4 translate-y-4 rounded-xl opacity-20"></div>
             <img 
               src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop" 
               alt="Founder" 
               className="relative z-10 w-full h-full object-cover rounded-xl filter grayscale contrast-125"
             />
          </div>
          <div className="space-y-8">
            <div>
              <p className="text-blue-500 text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                <span className="w-8 h-px bg-blue-500 block"></span>
                The Person Behind It
              </p>
              <h2 className="text-4xl sm:text-5xl font-serif font-black uppercase tracking-tighter leading-none">
                A Message from <br/><span className="text-blue-600">The Founder.</span>
              </h2>
            </div>
            
            <div className="space-y-6 text-neutral-400 leading-relaxed font-light">
              <p>
                I started This online cause I noticed that there were many vendors who just want to sell their laptop just for the money and gain, thereby leading their customers to make wrong choices especially to novices in the computer space.
              </p>
              <p>
                I started this cause of my Love for Tech and seeing many innocent people being scammed on daily basis.
              </p>
              <p>
                But here I am to correct that: by Trying to help clients to make a better choice of systems based on what they intend to do, while still working within their Budget.
              </p>
            </div>

            <div className="pt-8 border-t border-neutral-900">
              <p className="font-serif text-2xl text-white italic mb-1">Tizzi</p>
              <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Founder, Tizzitech</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full bg-blue-600 mt-12 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-serif font-black uppercase text-white mb-2 tracking-tighter">Ready to get Your Best Value for your money?</h2>
            <p className="text-blue-100/80 max-w-2xl text-lg">Why not shop with us today.</p>
          </div>
          <button className="whitespace-nowrap px-8 py-4 bg-white text-blue-900 font-bold tracking-widest uppercase border border-white hover:bg-neutral-100 transition-colors shadow-xl">
            Shop Now &rarr;
          </button>
        </div>
      </div>

    </div>
  );
}
