import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function PrivacyPolicy() {
  return (
    <div className="bg-black min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={pageVariants} className="prose prose-invert prose-blue max-w-none">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          <p className="text-neutral-400">Effective Date: January 1, 2026</p>
          <div className="space-y-6 text-neutral-300 mt-8">
            <p>Welcome to Tizzitech. We value your privacy and are committed to protecting your personal data.</p>
            <h3 className="text-xl font-bold text-white">1. Information We Collect</h3>
            <p>We collect information you provide directly to us when you create an account, make a purchase, or contact us for support. This may include your name, email address, phone number, shipping address, and payment information.</p>
            <h3 className="text-xl font-bold text-white">2. How We Use Your Information</h3>
            <p>We use your information to process transactions, deliver products, communicate with you about your orders, and send you promotional offers if you have opted in.</p>
            <h3 className="text-xl font-bold text-white">3. Data Security</h3>
            <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            <h3 className="text-xl font-bold text-white">4. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at hello@tizzitech.com.ng.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function TermsOfService() {
  return (
    <div className="bg-black min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={pageVariants} className="prose prose-invert prose-blue max-w-none">
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          <p className="text-neutral-400">Effective Date: January 1, 2026</p>
          <div className="space-y-6 text-neutral-300 mt-8">
            <p>Please read these Terms of Service carefully before using the Tizzitech website and services.</p>
            <h3 className="text-xl font-bold text-white">1. Acceptance of Terms</h3>
            <p>By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>
            <h3 className="text-xl font-bold text-white">2. Purchases and Payment</h3>
            <p>All purchases made through our store are subject to product availability. We reserve the right to refuse or cancel your order if fraud or an unauthorized or illegal transaction is suspected.</p>
            <h3 className="text-xl font-bold text-white">3. Intellectual Property</h3>
            <p>The service and its original content, features, and functionality are and will remain the exclusive property of Tizzitech and its licensors.</p>
            <h3 className="text-xl font-bold text-white">4. Governing Law</h3>
            <p>These terms shall be governed and construed in accordance with the laws of our operating jurisdiction, without regard to its conflict of law provisions.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function RefundPolicy() {
  return (
    <div className="bg-black min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={pageVariants} className="prose prose-invert prose-blue max-w-none">
          <h1 className="text-4xl font-bold text-white mb-8">Return & Refund Policy</h1>
          <p className="text-neutral-400">Effective Date: January 1, 2026</p>
          <div className="space-y-6 text-neutral-300 mt-8">
            <p>Thank you for shopping at Tizzitech.</p>
            <h3 className="text-xl font-bold text-white">1. Returns</h3>
            <p>You have 14 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it. Your item must be in the original packaging.</p>
            <h3 className="text-xl font-bold text-white">2. Refunds</h3>
            <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item. If your return is approved, we will initiate a refund to your credit card (or original method of payment).</p>
            <h3 className="text-xl font-bold text-white">3. Shipping Returns</h3>
            <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.</p>
            <h3 className="text-xl font-bold text-white">4. Contact Us</h3>
            <p>If you have any questions on how to return your item to us, contact us.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
