// Seed reviews data - 127 reviews from Nov 11, 2025 to Jan 2, 2026
// Average rating: 4.9, ~30% contain emojis, no Oxford commas

import { Review } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Country data with flags
const countries = [
  { code: 'US', flag: '🇺🇸', name: 'United States' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'NG', flag: '🇳🇬', name: 'Nigeria' },
  { code: 'GH', flag: '🇬🇭', name: 'Ghana' },
  { code: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  { code: 'KE', flag: '🇰🇪', name: 'Kenya' },
  { code: 'JM', flag: '🇯🇲', name: 'Jamaica' },
  { code: 'TT', flag: '🇹🇹', name: 'Trinidad & Tobago' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: 'FR', flag: '🇫🇷', name: 'France' },
  { code: 'BR', flag: '🇧🇷', name: 'Brazil' },
  { code: 'MX', flag: '🇲🇽', name: 'Mexico' },
  { code: 'PH', flag: '🇵🇭', name: 'Philippines' },
  { code: 'IN', flag: '🇮🇳', name: 'India' },
  { code: 'AE', flag: '🇦🇪', name: 'UAE' },
  { code: 'NL', flag: '🇳🇱', name: 'Netherlands' },
  { code: 'IE', flag: '🇮🇪', name: 'Ireland' },
  { code: 'NZ', flag: '🇳🇿', name: 'New Zealand' },
];

// Women's names from various cultures
const names = [
  'Aaliyah Johnson', 'Blessing Okonkwo', 'Chioma Eze', 'Destiny Williams', 'Ebony Davis',
  'Fatima Hassan', 'Grace Mensah', 'Hannah Roberts', 'Imani Jackson', 'Jasmine Brown',
  'Keisha Thompson', 'Latoya Mitchell', 'Monique Taylor', 'Nia Anderson', 'Olivia Chen',
  'Priya Sharma', 'Queen Adeyemi', 'Rashida Ali', 'Simone Clarke', 'Tasha Moore',
  'Uchenna Nwosu', 'Victoria James', 'Whitney Harris', 'Xena Martin', 'Yolanda Garcia',
  'Zara Mohammed', 'Amara Diallo', 'Bianca Rodriguez', 'Camille Dubois', 'Diana Müller',
  'Elena Petrova', 'Fiona O\'Brien', 'Gabrielle Laurent', 'Hailey Kim', 'Isabella Santos',
  'Jade Thompson', 'Khadija Ibrahim', 'Lydia Owusu', 'Maya Patel', 'Naomi Osei',
  'Opeyemi Bakare', 'Patricia Reyes', 'Quiana Lewis', 'Raven Scott', 'Shaniqua White',
  'Tamara Jones', 'Ursula Green', 'Vivian Adebayo', 'Winnie Acheng', 'Xiomara Cruz',
  'Yetunde Afolabi', 'Zainab Osman', 'Adaeze Chukwu', 'Brenda Oguike', 'Crystal Washington',
  'Desiree Phillips', 'Esther Asante', 'Faith Okoro', 'Giselle Beaumont', 'Hope Turner',
  'Iris Nakamura', 'Janelle Baptiste', 'Kayla Edwards', 'Lola Adekunle', 'Michelle Wright',
  'Nadia El-Amin', 'Oluchi Ibe', 'Pamela Richards', 'Queenie Okafor', 'Regina Campbell',
  'Sandra Nguyen', 'Tiffany Adams', 'Unity Mbeki', 'Veronica Silva', 'Wendy Chen',
  'Ximena Vargas', 'Yasmin Rahman', 'Zuri Kimani', 'Abigail Foster', 'Beyonce Thompson',
  'Candice Morgan', 'Darlene Hughes', 'Eugenia Asamoah', 'Francesca De Luca', 'Gloria Martinez',
  'Helena Johansson', 'Ingrid Larsen', 'Joyce Onyekachi', 'Kenya Robinson', 'Latifah King',
  'Marissa Collins', 'Nicole Fraser', 'Ophelia Brown', 'Pauline Koffi', 'Rosa Fernandez',
  'Selena Gomez-Ruiz', 'Tanisha Reed', 'Uche Amadi', 'Valerie Dupont', 'Wanda Smith',
  'Yemi Adeleke', 'Zola Ndlovu', 'Akua Mensah', 'Briana Carter', 'Cynthia Obeng',
  'Danielle Yeboah', 'Ebere Obi', 'Felicia Asare', 'Geraldine Boateng', 'Harriet Adjei',
  'Ifunanya Agu', 'Jennifer Quartey', 'Keturah Mensah', 'Lilian Tetteh', 'Magdalene Ansah',
  'Nkechi Uzo', 'Oreoluwa Balogun', 'Precious Akinwale', 'Quincy Barnes', 'Rita Darkwa',
  'Stella Gyamfi', 'Thelma Frimpong', 'Urenna Okeke', 'Vera Asiedu', 'Winifred Oppong',
];

// Review templates - no Oxford commas, authentic voices
const reviewTemplates = [
  // 5-star reviews (majority)
  "This book changed my entire perspective on relationships. I finally understand why I was settling for less.",
  "I couldn't put it down. Every chapter felt like the author was speaking directly to my soul.",
  "Required reading for every woman who has ever questioned her worth in a relationship.",
  "The truth in these pages is uncomfortable but necessary. I've recommended it to all my sisters.",
  "Finally someone said what we've all been thinking but were afraid to admit.",
  "I highlighted almost every page. This is the book I wish I had 10 years ago.",
  "Eolles writes with such clarity and conviction. This book is a wake-up call.",
  "My therapist recommended this and I'm so grateful. Life-changing doesn't even cover it.",
  "I read this in one sitting. Cried and laughed and cried some more.",
  "This book should be mandatory reading before entering any relationship.",
  "The chapter on self-worth alone is worth the price. Absolute masterpiece.",
  "I've bought 5 copies to give to friends. Everyone needs to read this.",
  "Raw and honest truth-telling. Eolles doesn't sugarcoat anything.",
  "This book helped me finally walk away from a situation that was draining me.",
  "Every woman I know needs this book on her nightstand.",
  "The metaphors are so powerful. The empty throne imagery stays with you.",
  "I felt seen and understood for the first time. Thank you Eolles.",
  "Bought the kindle version and then immediately ordered the hardcover.",
  "My book club read this together and every single one of us was transformed.",
  "The writing is beautiful and the message is even more so.",
  "I wasn't ready for how deeply this would cut. In the best way possible.",
  "This is the conversation our mothers should have had with us.",
  "Prophetic is the only word that fits. Eolles is speaking truth to power.",
  "I've read hundreds of self-help books but this one actually helped.",
  "The audiobook is incredible but I needed the physical copy to highlight.",
  "My daughter is only 12 but I'm saving this for when she's ready.",
  "Best purchase I've made all year. My mindset has completely shifted.",
  "Eolles put into words what I've felt my entire dating life.",
  "This book is a mirror and a map. It shows you where you are and where to go.",
  "I started setting boundaries immediately after finishing chapter 3.",
  "The section on rotation vs reign was the gut punch I needed.",
  "I've been in therapy for years but this book accelerated my healing.",
  "My ex called me asking what happened to me. This book happened.",
  "Finally a book that doesn't blame women but empowers us to choose better.",
  "I felt like Eolles reached through the pages and shook me awake.",
  "This isn't just a book. It's a movement. I'm telling everyone.",
  "The cover alone makes a statement. The contents deliver on the promise.",
  "I wasn't going to buy it but something told me I needed it. I was right.",
  "Reading this felt like having coffee with a wise older sister.",
  "The biblical references add such depth. Faith-based but not preachy.",
  "I've never felt so validated and challenged at the same time.",
  "My whole friend group is reading it now. The conversations are incredible.", // Will be 5-star (Iris Nakamura)
  "I'm on my second read-through and finding new gems each time.",
  "This book made me uncomfortable in all the right ways.",
  "Eolles has a gift for cutting through the noise and speaking truth.",
  "I wasn't expecting to cry this much but I wasn't expecting to heal either.",
  "The writing style is conversational but hits like poetry.",
  "I'm buying this for every woman in my family this Christmas.",
  "This book deserves every bit of hype it's receiving.",
  "I had to put it down multiple times to process. So powerful.",
  "The throne metaphor will stay with me forever. I'm claiming my crown.",
  "Worth every penny. Actually priceless. Changed how I see myself.",
  "My husband noticed the change in me within days of finishing this.",
  "Eolles writes like she knows my story. Universal truths delivered personally.",
  "I feel like a different woman after reading this. More whole.",
  "This book is the intervention some of us desperately needed.",
  "The chapter titles alone are quotable. The content exceeds expectations.",
  "I've never left a review before but this book deserved one.",
  "Bought this on a whim and it turned out to be exactly what I needed.",
  "The vulnerability in this writing is rare and refreshing.",
  "I recommended this to my cousin going through a divorce. She thanked me.",
  "Reading this felt like finally getting permission to choose myself.",
  "Eolles doesn't just identify the problem. She shows you the way out.",
  "I highlighted so much the book looks like a coloring project now.",
  "This book is a gift to womankind. I mean that sincerely.",
  "My standards have elevated and my peace has returned.",
  "The way Eolles breaks down relationship dynamics is masterful.",
  "I've been sleeping better since I finished this book. Less anxiety.",
  "Every page drips with wisdom. There's no filler here.",
  "I went from victim to victor in my own story. This book did that.",
  "The honesty is brutal but the hope is beautiful.",
  "I wish I could give this more than 5 stars. It deserves 10.",
  "This book found me at the perfect time. Divine timing is real.",
  "My therapist asked what I've been reading. Now she recommends it too.",
  "I've been healed from wounds I didn't even know I had.",
  "The strength I found in these pages surprised even me.",
  "Eolles writes with authority because she's lived it.",
  "This isn't advice from the sidelines. It's wisdom from the trenches.",
  "I gave my crown away for years. This book helped me take it back.",
  "The transformation in my self-talk has been remarkable.",
  "Reading this was like having scales fall from my eyes.",
  "I've stopped making excuses for men who don't deserve my energy.",
  "This book is the friend who tells you what you need to hear.",
  "My relationship with myself has improved dramatically.",
  "The empowerment I feel is hard to put into words.",
  "Eolles has created something truly special with this book.",
  // 4-star reviews (some)
  "Really powerful message. A few chapters felt repetitive but overall excellent.",
  "Great book that challenged me. Wished it was a bit longer.",
  "Solid read with important insights. Some parts resonated more than others.",
  "Important message that more women need to hear. Well written overall.",
  "Good book with genuine wisdom. The pacing slowed in the middle.",
  "Helpful and eye-opening. Would have liked more practical exercises.",
  "Strong content throughout. A few sections felt like they covered similar ground.",
  "Valuable perspective on relationships. The ending felt a bit abrupt.", // Will be 4-star (Danielle Yeboah)
];

// Emoji review additions (for ~30%)
const emojiAdditions = [
  " 🙌",
  " 💯",
  " ❤️",
  " 👏",
  " ✨",
  " 🔥",
  " 💪",
  " 🙏",
  " 👑",
  " 😭❤️",
  " 🎯",
  " 💕",
  " 🌟",
  " ❤️‍🔥",
];

// Generate random date between Nov 11, 2025 and Jan 2, 2026
function randomDate(): string {
  const start = new Date('2025-11-11T00:00:00Z');
  const end = new Date('2026-01-02T23:59:59Z');
  const diff = end.getTime() - start.getTime();
  const randomTime = start.getTime() + Math.random() * diff;
  return new Date(randomTime).toISOString();
}

// Generate seed reviews with proper rating distribution for 4.9 average
// To get 4.9 average with 127 reviews: need ~115 five-stars and ~12 four-stars
// (115 * 5 + 12 * 4) / 127 = (575 + 48) / 127 = 623 / 127 ≈ 4.906
export function generateSeedReviews(): Review[] {
  const reviews: Review[] = [];
  
  // Specific assignments for requested changes
  const specificReviews = [
    {
      name: 'Iris Nakamura',
      rating: 5,
      content: 'My whole friend group is reading it now. The conversations are incredible.',
      country: 'JM',
      countryFlag: '🇯🇲',
    },
    {
      name: 'Danielle Yeboah',
      rating: 4,
      content: 'Valuable perspective on relationships. The ending felt a bit abrupt.',
      country: 'PH',
      countryFlag: '🇵🇭',
    },
  ];
  
  // Shuffle names and templates
  const shuffledNames = [...names].sort(() => Math.random() - 0.5);
  const shuffledTemplates = [...reviewTemplates].sort(() => Math.random() - 0.5);
  
  // Track which names have been used for specific reviews
  const usedSpecificNames = new Set(specificReviews.map(r => r.name));
  
  for (let i = 0; i < 127; i++) {
    let review: Review;
    
    // Check if this should be a specific review
    const specificReview = specificReviews.find(sr => sr.name === shuffledNames[i % shuffledNames.length]);
    
    if (specificReview && !reviews.some(r => r.name === specificReview.name)) {
      // Use the specific review
      const device = Math.random() > 0.5 ? 'mobile' : 'desktop';
      review = {
        id: uuidv4(),
        name: specificReview.name,
        email: `${specificReview.name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8)}${Math.floor(Math.random() * 99)}@email.com`,
        rating: specificReview.rating,
        content: specificReview.content,
        country: specificReview.country,
        countryFlag: specificReview.countryFlag,
        device,
        hasEmoji: false,
        status: 'APPROVED',
        isVerifiedPurchase: true,
        createdAt: randomDate(),
        approvedAt: randomDate(),
      };
    } else {
      // Generate random review
      const name = shuffledNames[i % shuffledNames.length];
      const country = countries[Math.floor(Math.random() * countries.length)];
      const device = Math.random() > 0.5 ? 'mobile' : 'desktop';
      const hasEmoji = Math.random() < 0.30; // 30% have emojis
      const rating = i < 115 ? 5 : 4; // First 115 get 5 stars, rest get 4
      
      let content = shuffledTemplates[i % shuffledTemplates.length];
      if (hasEmoji && device === 'mobile') {
        const emoji = emojiAdditions[Math.floor(Math.random() * emojiAdditions.length)];
        content = content + emoji;
      }
      
      review = {
        id: uuidv4(),
        name,
        email: `${name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8)}${Math.floor(Math.random() * 99)}@email.com`,
        rating,
        content,
        country: country.code,
        countryFlag: country.flag,
        device,
        hasEmoji: hasEmoji && device === 'mobile',
        status: 'APPROVED',
        isVerifiedPurchase: true,
        createdAt: randomDate(),
        approvedAt: randomDate(),
      };
    }
    
    reviews.push(review);
  }
  
  // Sort by date, newest first
  return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const seedReviews = generateSeedReviews();
