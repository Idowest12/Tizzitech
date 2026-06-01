import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqData = [
  {
    question: "Do you offer warranty on your products?",
    answer: "Yes, all our new laptops and phones come with standard manufacturer warranties. We also provide our own limited warranty for certified pre-owned devices. Please check individual product pages for specific warranty durations."
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 7-day return policy for defective items. If your device has a factory defect within 7 days of purchase, you can return it for an exchange. Physical damage or issues caused by user mishandling are not covered."
  },
  {
    question: "Do you deliver nationwide?",
    answer: "Yes! We offer nationwide delivery across Nigeria. Delivery within Lagos takes 1-2 business days, while outside Lagos takes 3-5 business days depending on your exact location."
  },
  {
    question: "Can I swap my old laptop/phone for a new one?",
    answer: "Yes, we accept trade-ins! You can bring your current device to our physical store for a quick evaluation, and we will offer you a discount on your new purchase based on its value."
  },
  {
    question: "Are your phones fully unlocked?",
    answer: "Absolutely. All phones sold at Tizzitech are fully factory unlocked and will work perfectly with any network provider locally and internationally."
  }
];

export function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full bg-black text-white relative animate-in fade-in duration-500 pb-20">
      {/* Hero Section */}
      <div className="relative w-full h-[40vh] flex items-center bg-neutral-950 border-b border-neutral-900">
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-serif font-black uppercase tracking-tighter leading-none mb-4">
              Frequently Asked <span className="text-blue-600">Questions.</span>
            </h1>
            <p className="text-lg text-neutral-400 font-light mb-8 leading-relaxed">
              Find answers to common questions about our products, deliveries, and policies.
            </p>
          </div>
        </div>
      </div>

      <div className="py-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div key={index} className="border border-neutral-900 bg-neutral-950 rounded-lg overflow-hidden">
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-neutral-900 transition-colors"
              >
                <span className="font-bold tracking-widest uppercase text-sm">{faq.question}</span>
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-blue-500 shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-neutral-500 shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-neutral-400 text-sm leading-relaxed font-light">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center border-t border-neutral-900 pt-16">
          <h2 className="text-xl font-serif font-black uppercase mb-4">Still have questions?</h2>
          <p className="text-neutral-500 mb-8 max-w-md mx-auto">If you couldn't find the answer to your question, feel free to reach out to our support team.</p>
          <a href="mailto:hello@tizzitech.com.ng" className="inline-block px-8 py-4 bg-blue-600 text-white font-bold tracking-widest uppercase hover:bg-blue-700 transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
