'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getCopyrightYear } from '@/lib/copyright';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-onyx text-parchment">
      {/* Header */}
      <header className="border-b border-gold/20 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link 
            href="/"
            className="flex items-center gap-2 text-parchment/60 hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl md:text-4xl text-gold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert prose-gold max-w-none space-y-8 text-parchment/80">
          <p className="text-sm text-parchment/50">
            Last Updated: January 2, 2026
          </p>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">1. Information We Collect</h2>
            <p>
              Throne Light Publishing LLC ("we," "us," or "our") collects information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Name and email address when you make a purchase or create an account</li>
              <li>Payment information processed securely through Stripe</li>
              <li>Reading preferences and progress within the ThroneLight Reader</li>
              <li>Communications you send to us</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Process your purchases and deliver digital content</li>
              <li>Send order confirmations and important updates</li>
              <li>Provide customer support</li>
              <li>Improve our products and services</li>
              <li>Protect against fraud and unauthorized transactions</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">3. Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Payment processors (Stripe) to complete transactions</li>
              <li>Service providers who assist in operating our website</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. Payment information is encrypted and processed through Stripe's secure payment infrastructure. We never store your full credit card details on our servers.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">5. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, remember your preferences, and understand how you use our services. You can control cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your data (subject to legal requirements)</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">7. Refund Policy</h2>
            <p>
              We offer a <strong>7-day money-back guarantee</strong> on digital purchases. If you are not satisfied with your purchase, contact us within 7 days for a full refund. Physical products may be returned in unused condition within 7 days.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">8. Children's Privacy</h2>
            <p>
              Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our practices, please contact us at:
            </p>
            <p className="mt-4">
              <strong className="text-gold">Throne Light Publishing LLC</strong><br />
              Email: info@thronelightpublishing.com
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gold/10 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-parchment/40 text-xs">
            © {getCopyrightYear()} Throne Light Publishing LLC. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
