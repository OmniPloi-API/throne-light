'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getCopyrightYear } from '@/lib/copyright';

export default function TermsOfServicePage() {
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
        <h1 className="font-serif text-3xl md:text-4xl text-gold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert prose-gold max-w-none space-y-8 text-parchment/80">
          <p className="text-sm text-parchment/50">
            Last Updated: January 2, 2026
          </p>

          <p>
            Welcome to Throne Light Publishing LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or using the ThroneLight Reader application, website, or any related services (collectively, the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). Please read them carefully.
          </p>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">1. Acceptance of Terms</h2>
            <p>
              By downloading, installing, or using the ThroneLight Reader, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">2. License and Usage Rights</h2>
            <p>
              Upon purchase of digital content through the ThroneLight Reader, you are granted a <strong>non-exclusive, non-transferable, revocable license</strong> to access and read the content for personal, non-commercial use only. This license does not grant you ownership of the content.
            </p>
            <p className="mt-4"><strong>You MAY:</strong></p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Read purchased content on devices you own</li>
              <li>Access your library from multiple personal devices</li>
              <li>Bookmark, highlight, and take personal notes</li>
            </ul>
            <p className="mt-4"><strong>You MAY NOT:</strong></p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Copy, reproduce, distribute, or share the content with others</li>
              <li>Modify, adapt, translate, or create derivative works</li>
              <li>Remove or alter any copyright notices or watermarks</li>
              <li>Use screen recording, screenshots, or other capture methods to reproduce content</li>
              <li>Circumvent any technological protection measures</li>
              <li>Share your account credentials with others</li>
              <li>Resell, sublicense, or commercially exploit the content</li>
              <li>Use the content for any unlawful purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">3. Account Responsibility</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
            <p className="mt-4">
              We reserve the right to suspend or terminate accounts that we reasonably believe are being shared or used in violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">4. Intellectual Property</h2>
            <p>
              All content available through the ThroneLight Reader, including but not limited to text, graphics, logos, images, and software, is the property of Throne Light Publishing LLC or its content providers and is protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="mt-4">
              Unauthorized reproduction, distribution, or display of copyrighted material may result in civil and criminal penalties.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">5. Content Protection</h2>
            <p>
              To protect our authors and content, the ThroneLight Reader may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Digital watermarking tied to your account</li>
              <li>Screenshot and screen recording detection</li>
              <li>Device and session limits</li>
              <li>Activity monitoring for suspicious behavior</li>
            </ul>
            <p className="mt-4">
              Attempts to circumvent these protections constitute a material breach of these Terms and may result in immediate account termination and legal action.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">6. Refund Policy</h2>
            <p>
              We offer a <strong>7-day money-back guarantee</strong> on digital purchases. To request a refund, contact us within 7 days of purchase. Refunds are processed to the original payment method.
            </p>
            <p className="mt-4">
              We reserve the right to deny refund requests that we reasonably believe are fraudulent or abusive, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Multiple refund requests from the same user</li>
              <li>Requests made after fully consuming the content</li>
              <li>Requests made in conjunction with unauthorized copying or distribution</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">7. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use bots, scrapers, or automated tools to access the Service</li>
              <li>Impersonate any person or entity</li>
              <li>Harass, abuse, or harm others through the Service</li>
              <li>Upload viruses or malicious code</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">8. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, THRONE LIGHT PUBLISHING LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
            </p>
            <p className="mt-4">
              Our total liability for any claim arising from these Terms or the Service shall not exceed the amount you paid for the specific content or service giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Throne Light Publishing LLC, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">11. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Service at any time, with or without cause, and with or without notice. Upon termination, your license to access content through the Service is immediately revoked.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">12. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will notify you of material changes by posting the updated Terms on this page and updating the &quot;Last Updated&quot; date. Your continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United States and the State of Delaware, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">14. Dispute Resolution</h2>
            <p>
              Any disputes arising from these Terms or the Service shall first be attempted to be resolved through good-faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-gold mb-4">15. Contact Information</h2>
            <p>
              For questions about these Terms or the Service, please contact us at:
            </p>
            <p className="mt-4">
              <strong className="text-gold">Throne Light Publishing LLC</strong><br />
              Email: legal@thronelight.com
            </p>
          </section>

          <section className="border-t border-gold/20 pt-8">
            <p className="text-parchment/50 text-sm">
              By using the ThroneLight Reader, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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
