import { Metadata } from 'next';
import HeroSection from '@/components/book/HeroSection';
import MirrorSection from '@/components/book/MirrorSection';
import ConfrontationSection from '@/components/book/ConfrontationSection';
import ScrollSection from '@/components/book/ScrollSection';
import WitnessesSection from '@/components/book/WitnessesSection';
import VowSection from '@/components/book/VowSection';
import AltarSection from '@/components/book/AltarSection';
import { Navigation, Footer } from '@/components/shared';

export const metadata: Metadata = {
  title: 'The Crowded Bed & The Empty Throne | By EOLLES',
  description: 'A prophetic scroll for women who are done competing for a man\'s attention and ready to reclaim their crown. Stop auditioning for a man who is only offering you rotation. It is time to reign.',
  openGraph: {
    title: 'The Crowded Bed & The Empty Throne',
    description: 'You\'ve been in rotation. It\'s time to reign.',
    type: 'website',
  },
};

export default function BookPage() {
  return (
    <main className="relative">
      <Navigation currentSite="book" />
      
      {/* Section 1: The Hero */}
      <HeroSection />
      
      {/* Section 2: The Mirror (The Problem) */}
      <MirrorSection />
      
      {/* Section 3: The Confrontation (The Filter) */}
      <ConfrontationSection />
      
      {/* Section 4: The Scroll (About the Book) */}
      <ScrollSection />
      
      {/* Section 5: The Witnesses (Testimonials) */}
      <WitnessesSection />
      
      {/* Section 6: The Vow (Interactive Covenant) */}
      <VowSection />
      
      {/* Section 7: The Altar (Footer/Final CTA) */}
      <AltarSection />
      
      <Footer variant="book" />
    </main>
  );
}
