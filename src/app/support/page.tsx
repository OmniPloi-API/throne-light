'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Footer } from '@/components/shared';
import { Send, CheckCircle, HelpCircle, AlertCircle, Package, CreditCard, Settings, MessageSquare } from 'lucide-react';

type TicketCategory = 'ORDER_ISSUE' | 'REFUND_REQUEST' | 'TECHNICAL_ISSUE' | 'ACCOUNT_ISSUE' | 'GENERAL_INQUIRY' | 'OTHER';

interface FormData {
  name: string;
  email: string;
  category: TicketCategory | '';
  subject: string;
  message: string;
  orderNumber: string;
}

const categoryOptions: { value: TicketCategory; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'ORDER_ISSUE', label: 'Order Issue', icon: <Package className="w-5 h-5" />, description: 'Problems with your order' },
  { value: 'REFUND_REQUEST', label: 'Refund Request', icon: <CreditCard className="w-5 h-5" />, description: 'Request a refund' },
  { value: 'TECHNICAL_ISSUE', label: 'Technical Issue', icon: <Settings className="w-5 h-5" />, description: 'App or website problems' },
  { value: 'ACCOUNT_ISSUE', label: 'Account Issue', icon: <AlertCircle className="w-5 h-5" />, description: 'Login or account access' },
  { value: 'GENERAL_INQUIRY', label: 'General Inquiry', icon: <HelpCircle className="w-5 h-5" />, description: 'Questions or feedback' },
  { value: 'OTHER', label: 'Other', icon: <MessageSquare className="w-5 h-5" />, description: 'Something else' },
];

export default function SupportPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
    orderNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit support request');
      }

      setTicketNumber(data.ticketNumber);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-manuscript">
        <Navigation currentSite="book" />
        <div className="pt-32 pb-20 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="font-serif text-3xl text-charcoal mb-4">Request Submitted</h1>
            <p className="text-charcoal/70 mb-6">
              Thank you for reaching out. Your support request has been received.
            </p>
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-6 mb-8">
              <p className="text-sm text-charcoal/60 mb-2">Your Ticket Number</p>
              <p className="font-mono text-2xl text-gold font-bold">{ticketNumber}</p>
            </div>
            <p className="text-charcoal/60 text-sm mb-8">
              A confirmation email has been sent to <strong>{formData.email}</strong>. 
              We typically respond within 24-48 hours.
            </p>
            <a
              href="/book"
              className="btn-royal inline-flex items-center gap-2"
            >
              Return to Home
            </a>
          </motion.div>
        </div>
        <Footer variant="book" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-manuscript">
      <Navigation currentSite="book" />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-gold" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">
              Customer Support
            </h1>
            <p className="text-charcoal/70 text-lg max-w-xl mx-auto">
              We're here to help. Submit your request below and our team will get back to you as soon as possible.
            </p>
          </motion.div>

          {/* Support Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl border border-charcoal/5 overflow-hidden"
          >
            <div className="p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-3">
                    What can we help you with? <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categoryOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: option.value }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.category === option.value
                            ? 'border-gold bg-gold/5'
                            : 'border-charcoal/10 hover:border-gold/40'
                        }`}
                      >
                        <div className={`mb-2 ${formData.category === option.value ? 'text-gold' : 'text-charcoal/40'}`}>
                          {option.icon}
                        </div>
                        <p className="font-medium text-charcoal text-sm">{option.label}</p>
                        <p className="text-xs text-charcoal/50 mt-1">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-charcoal"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-charcoal"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                {/* Order Number (Optional) */}
                {(formData.category === 'ORDER_ISSUE' || formData.category === 'REFUND_REQUEST') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label htmlFor="orderNumber" className="block text-sm font-medium text-charcoal mb-2">
                      Order Number <span className="text-charcoal/40">(if applicable)</span>
                    </label>
                    <input
                      type="text"
                      id="orderNumber"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-charcoal"
                      placeholder="e.g., ORD-12345"
                    />
                  </motion.div>
                )}

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-charcoal mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-charcoal"
                    placeholder="Brief description of your issue"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all resize-none text-charcoal"
                    placeholder="Please describe your issue in detail..."
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.category}
                  className="w-full btn-royal inline-flex items-center justify-center gap-2 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Support Request</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer Info */}
            <div className="px-8 py-6 bg-manuscript/50 border-t border-charcoal/5">
              <p className="text-center text-charcoal/50 text-sm">
                We typically respond within 24-48 hours. For urgent matters, please include "URGENT" in your subject line.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer variant="book" />
    </main>
  );
}
