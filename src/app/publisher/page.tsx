import { Metadata } from 'next';
import FoundationSection from '@/components/publisher/FoundationSection';
import MandateSection from '@/components/publisher/MandateSection';
import ArchiveSection from '@/components/publisher/ArchiveSection';
import GateSection from '@/components/publisher/GateSection';
import LedgerSection from '@/components/publisher/LedgerSection';
import { Navigation } from '@/components/shared';

export const metadata: Metadata = {
  title: 'Throne Light Publishing | We Distribute Scrolls',
  description: 'Throne Light Publishing exists to enthrone voices, not just print them. We are not here to fill shelves. We are here to build altars in the form of words.',
  openGraph: {
    title: 'Throne Light Publishing',
    description: 'We don\'t distribute books. We distribute scrolls.',
    type: 'website',
  },
};

export default function PublisherPage() {
  return (
    <main className="relative">
      <Navigation currentSite="publisher" />
      
      {/* Section 1: The Foundation (Hero) */}
      <FoundationSection />
      
      {/* Section 2: The Mandate (Mission) */}
      <MandateSection />
      
      {/* Section 3: The Archive (Catalog) */}
      <ArchiveSection />
      
      {/* Section 4: The Gate (Submissions) */}
      <GateSection />
      
      {/* Section 5: The Ledger (Contact/Footer) */}
      <LedgerSection />
    </main>
  );
}
