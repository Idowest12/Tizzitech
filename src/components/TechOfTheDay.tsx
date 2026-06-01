import React from 'react';

export function TechOfTheDay() {
  return (
    <div className="w-full bg-black text-white relative animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="w-full bg-neutral-950 py-16 border-b border-neutral-900 border-x-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 z-0" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <p className="text-blue-500 font-bold tracking-widest text-xs uppercase mb-4">Latest Insights</p>
          <h1 className="font-serif text-4xl sm:text-6xl font-black text-white leading-none uppercase tracking-tighter mb-6">
            Tech of the <span className="text-blue-600">Day</span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            A deep dive into the latest product launches, innovations, and what the big tech companies are saying right now.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-16 space-y-24">
        
        {/* Article 1 */}
        <article className="border border-neutral-800 bg-neutral-900/50 rounded-2xl overflow-hidden shadow-2xl">
          <div className="aspect-video w-full relative">
            <img 
              src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=2671&auto=format&fit=crop" 
              alt="Samsung Galaxy S26 Concept" 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-full">
              New Release
            </div>
          </div>
          <div className="p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-black uppercase tracking-tighter mb-6">
              The Next Frontier: Samsung Galaxy S26
            </h2>
            <div className="space-y-6 text-neutral-300 leading-relaxed font-light text-lg">
              <p>
                Samsung has officially unveiled the highly anticipated Galaxy S26 series, promising a massive leap forward in both AI integration and physical durability. With the new "Titanium Armor" chassis, the S26 is built to survive the harshest conditions while remaining incredibly lightweight.
              </p>
              <p>
                According to Samsung's launch keynote, the true focus this year is on <strong>Proactive AI</strong>. The S26 doesn't just respond to requests; it anticipates needs. "We are moving from a reactive smartphone experience to a proactive personal assistant," said the head of Samsung Mobile. The device actively manages battery optimization based on your schedule, pre-loads apps before you even swipe, and features a completely revamped camera matrix that utilizes neural processing to balance exposure in real-time.
              </p>
              <div className="bg-neutral-950 p-6 border-l-4 border-blue-600 my-8">
                <h4 className="font-bold text-white uppercase tracking-widest text-sm mb-2">Key Upgrades:</h4>
                <ul className="list-disc list-inside space-y-2 text-neutral-400 text-base">
                  <li>Snapdragon 8 Gen 4 (Custom for Galaxy)</li>
                  <li>New 200MP ISOCELL sensor with 0 delay shutter</li>
                  <li>144Hz Dynamic AMOLED display that peaks at 3000 nits</li>
                  <li>7 years of guaranteed OS and security updates</li>
                </ul>
              </div>
              <p>
                The Galaxy S26 represents a maturing of the brand's vision. It's less about flashy new gimmicks and more about deeply integrating machine learning into the very fabric of the operating system to create a frictionless daily experience.
              </p>
            </div>
          </div>
        </article>

        {/* Article 2 */}
        <article className="border border-neutral-800 bg-neutral-900/50 rounded-2xl overflow-hidden shadow-2xl">
          <div className="aspect-video w-full relative">
            <img 
              src="https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=2574&auto=format&fit=crop" 
              alt="MacBook Pro M4" 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-full">
              Incoming
            </div>
          </div>
          <div className="p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-black uppercase tracking-tighter mb-6">
              Apple's Stealthy Move: M4 Silicon Unveiled
            </h2>
            <div className="space-y-6 text-neutral-300 leading-relaxed font-light text-lg">
              <p>
                In a surprise press release without the usual flashy keynote event, Apple has announced the next generation of its custom silicon: the M4 chip. Slated to debut first in the updated MacBook Pro lineup, this chip focuses heavily on local machine learning acceleration.
              </p>
              <p>
                Apple's official statement highlighted a redesigned Neural Engine that is capable of 38 trillion operations per second, making it significantly faster at processing complex AI models entirely on-device. This means features like live video transcription, advanced image generation, and complex code compilation will happen instantaneously and completely off-grid.
              </p>
              <p>
                "With the M4 generation, we are not just increasing clock speeds; we are fundamentally changing how the processor handles intelligent workloads," the company stated. "The M4 provides desktop-class AI capabilities in a fanless, silent design."
              </p>
            </div>
          </div>
        </article>

      </div>
    </div>
  );
}
