import React from 'react';

interface AboutUsProps {
  onShopNow?: () => void;
}

export function AboutUs({ onShopNow }: AboutUsProps) {
  return (
    <div className="w-full bg-black text-white relative animate-in fade-in duration-500 pb-20 overflow-x-hidden">
      
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

      {/* Founder Section - Comes before Why Shop With Us */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-neutral-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] max-w-md w-full mx-auto lg:mx-0">
             <div className="absolute inset-0 bg-blue-600/20 translate-x-4 translate-y-4 rounded-3xl border border-blue-500/30"></div>
             <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl group">
               <img 
                 src="/founder.jpg" 
                 alt="Tizzi - Founder & CEO of Tizzitech" 
                 referrerPolicy="no-referrer"
                 onError={(e) => {
                   const target = e.currentTarget;
                   if (target.src.endsWith('/founder.jpg')) {
                     target.src = '/founder.png';
                   } else if (target.src.endsWith('/founder.png')) {
                     target.src = '/founder.jpeg';
                   } else if (!target.src.includes('unsplash.com')) {
                     target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop';
                   }
                 }}
                 className="w-full h-full object-cover object-top rounded-3xl transition-transform duration-700 group-hover:scale-105"
               />
               <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 z-20 rounded-b-3xl">
                 <p className="text-white font-serif font-black text-xl tracking-tight">Tizzi</p>
                 <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Founder & CEO • Tizzitech</p>
                 <p className="text-neutral-400 text-[11px] italic mt-1">"Tech for a Smarter Tomorrow"</p>
               </div>
             </div>
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

      {/* Why Choose Us Section */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-neutral-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-black uppercase tracking-tighter">
            Why you Should <span className="text-blue-500">Shop with us</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-neutral-950 border border-neutral-900 rounded-2xl hover:border-blue-900/60 hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
              <span className="font-serif font-bold">01</span>
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest mb-4">We don't Compromise on Quality</h3>
            <p className="text-neutral-500 leading-relaxed text-sm">
              Every device and accessory is thoroughly vetted. We only stock authentic, high-quality products that stand the test of time, ensuring you get exactly what you pay for without unexpected failures.
            </p>
          </div>
          
          <div className="p-8 bg-neutral-950 border border-neutral-900 rounded-2xl hover:border-blue-900/60 hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
              <span className="font-serif font-bold">02</span>
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest mb-4">We work On Customer Budget</h3>
            <p className="text-neutral-500 leading-relaxed text-sm">
              We believe great tech shouldn't break the bank. We work directly with your budget to find the optimal balance, ensuring you still get the best possible value and performance for your money.
            </p>
          </div>
          
          <div className="p-8 bg-neutral-950 border border-neutral-900 rounded-2xl hover:border-blue-900/60 hover:shadow-xl transition-all group">
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

      {/* CTA Section */}
      <div className="w-full bg-blue-600 mt-12 py-16 sm:py-20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
          <div>
            <h2 className="text-3xl sm:text-4xl font-serif font-black uppercase text-white mb-2 tracking-tighter">
              Ready to get Your Best Value for your money?
            </h2>
            <p className="text-blue-100/90 max-w-2xl text-base sm:text-lg">
              Why not shop with us today.
            </p>
          </div>
          <button 
            onClick={onShopNow}
            className="w-full sm:w-auto shrink-0 px-8 sm:px-10 py-4 bg-white text-blue-950 hover:bg-neutral-100 font-black tracking-widest uppercase rounded-xl border border-white hover:border-blue-100 shadow-2xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-3 text-sm group"
          >
            <span>Shop Now</span>
            <span className="transition-transform group-hover:translate-x-1.5 font-bold">&rarr;</span>
          </button>
        </div>
      </div>

    </div>
  );
}
