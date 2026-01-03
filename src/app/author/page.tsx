import { Metadata } from 'next';
import VoiceSection from '@/components/author/VoiceSection';
import DispatchSection from '@/components/author/DispatchSection';
import FrequencySection from '@/components/author/FrequencySection';
import GatheringSection from '@/components/author/GatheringSection';
import RemnantSection from '@/components/author/RemnantSection';
import { Navigation, Footer } from '@/components/shared';

export const metadata: Metadata = {
  title: 'Light of Eolles | Prophetic Scribe. Sovereign Voice.',
  description: 'Eolles is a sovereign voice forged in the fire of silence. She carries the ancestral roar of bold women and the sacred hush of divine downloads. A soul appointed not by algorithms, but by assignment.',
  icons: {
    icon: '/images/CROWN-favicon.ico',
  },
  openGraph: {
    title: 'Light of Eolles',
    description: 'Appointed by assignment. Forged in silence. A voice for the women who are ready to reign.',
    type: 'website',
  },
};

export default function AuthorPage() {
  return (
    <main className="relative">
      <Navigation currentSite="author" />
      
      {/* Section 1: The Voice (Hero) */}
      <VoiceSection />
      
      {/* Section 2: The Dispatch (Biography) */}
      <DispatchSection />
      
      {/* Section 3: The Frequency (Music/Soundtrack) */}
      <FrequencySection />
      
      {/* Section 4: The Gathering (Events/Tour) */}
      <GatheringSection />
      
      {/* Section 5: The Remnant (Newsletter) */}
      <RemnantSection />
      
      <Footer variant="author" />
    </main>
  );
}
