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
// Distribution: 70% single sentence, 30% longer (2-6 sentences)
// Of the 30% longer: equal 2&3 sentence, equal 4&5 sentence, 5% are 6 sentences
const shortReviewTemplates = [
  // 5-star reviews (majority) - single sentence
  "This book changed my entire perspective on relationships.",
  "Required reading for every woman who has ever questioned her worth.",
  "Finally someone said what we've all been thinking but were afraid to admit.",
  "Eolles writes with such clarity and conviction.",
  "My therapist recommended this and I'm so grateful.",
  "I read this in one sitting.",
  "This book should be mandatory reading before entering any relationship.",
  "The chapter on self-worth alone is worth the price.",
  "I've bought 5 copies to give to friends.",
  "Raw and honest truth telling.",
  "Every woman I know needs this book on her nightstand.",
  "The metaphors are so powerful.",
  "I felt seen and understood for the first time.",
  "Bought the kindle version and then immediately ordered the hardcover.",
  "The writing is beautiful and the message is even more so.",
  "This is the conversation our mothers should have had with us.",
  "Prophetic is the only word that fits.",
  "I've read hundreds of self help books but this one actually helped.",
  "The audiobook is incredible.",
  "My daughter is only 12 but I'm saving this for when she's ready.",
  "Best purchase I've made all year.",
  "This book is a mirror and a map.",
  "I started setting boundaries immediately after finishing chapter 3.",
  "The section on rotation vs reign was the gut punch I needed.",
  "My ex called me asking what happened to me.",
  "Finally a book that doesn't blame women but empowers us to choose better.",
  "This isn't just a book.",
  "The cover alone makes a statement.",
  "Reading this felt like having coffee with a wise older sister.",
  "The biblical references add such depth.",
  "I've never felt so validated and challenged at the same time.",
  "I'm on my second read through and finding new gems each time.",
  "This book made me uncomfortable in all the right ways.",
  "The writing style is conversational but hits like poetry.",
  "I'm buying this for every woman in my family this Christmas.",
  "This book deserves every bit of hype it's receiving.",
  "The throne metaphor will stay with me forever.",
  "Worth every penny.",
  "My husband noticed the change in me within days of finishing this.",
  "I feel like a different woman after reading this.",
  "The chapter titles alone are quotable.",
  "I've never left a review before but this book deserved one.",
  "Bought this on a whim and it turned out to be exactly what I needed.",
  "The vulnerability in this writing is rare and refreshing.",
  "Reading this felt like finally getting permission to choose myself.",
  "I highlighted so much the book looks like a coloring project now.",
  "This book is a gift to womankind.",
  "My standards have elevated and my peace has returned.",
  "Every page drips with wisdom.",
  "The honesty is brutal but the hope is beautiful.",
  "I wish I could give this more than 5 stars.",
  "This book found me at the perfect time.",
  "My therapist asked what I've been reading.",
  "The strength I found in these pages surprised even me.",
  "Eolles writes with authority because she's lived it.",
  "I gave my crown away for years.",
  "Reading this was like having scales fall from my eyes.",
  "This book is the friend who tells you what you need to hear.",
  "The empowerment I feel is hard to put into words.",
  "Eolles has created something truly special with this book.",
  // 4-star short
  "Really powerful message overall.",
  "Great book that challenged me.",
  "Solid read with important insights.",
  "Important message that more women need to hear.",
  "Good book with genuine wisdom.",
  "Helpful and eye opening.",
];

// 2-sentence reviews
const twoSentenceTemplates = [
  "I couldn't put it down. Every chapter felt like the author was speaking directly to my soul.",
  "The truth in these pages is uncomfortable but necessary. I've recommended it to all my sisters.",
  "I highlighted almost every page. This is the book I wish I had 10 years ago.",
  "Life changing doesn't even cover it. My whole mindset has shifted.",
  "Cried and laughed and cried some more. This book gets it.",
  "Absolute masterpiece. Everyone needs to read this.",
  "This book helped me finally walk away from a situation that was draining me. I feel free now.",
  "The empty throne imagery stays with you. I can't stop thinking about it.",
  "My book club read this together. Every single one of us was transformed.",
  "I wasn't ready for how deeply this would cut. In the best way possible.",
  "Eolles is speaking truth to power. This message needs to spread.",
  "My mindset has completely shifted. I see everything differently now.",
];

// 3-sentence reviews
const threeSentenceTemplates = [
  "Eolles put into words what I've felt my entire dating life. I finally have language for what I was experiencing. This book validates what so many of us go through.",
  "I've been in therapy for years but this book accelerated my healing. The insights are profound. My therapist even asked for the title.",
  "This book happened to me at the perfect moment. I was about to make a terrible decision. Now I'm on a completely different path.",
  "I felt like Eolles reached through the pages and shook me awake. The metaphors hit hard. I've been sharing quotes with everyone I know.",
  "It's a movement and I'm telling everyone. My whole friend group is reading it now. The conversations we're having are incredible.",
  "I wasn't going to buy it but something told me I needed it. I was right. Divine timing is absolutely real.",
  "Faith based but not preachy at all. It speaks to your spirit without being judgmental. Exactly what I needed.",
  "Eolles has a gift for cutting through the noise. She speaks truth in a way that actually lands. I've never felt so understood.",
  "I wasn't expecting to cry this much. I also wasn't expecting to heal. Both happened.",
  "I had to put it down multiple times to process. So powerful. Some chapters wrecked me in the best way.",
  "Actually priceless. Changed how I see myself completely. My whole self image has transformed.",
  "Universal truths delivered personally. Eolles writes like she knows my story. How is that even possible.",
];

// 4-sentence reviews
const fourSentenceTemplates = [
  "This book is the intervention some of us desperately needed. The content exceeds expectations at every turn. I came in skeptical but left completely changed. My friends keep asking what happened to me.",
  "I recommended this to my cousin going through a divorce. She called me crying and thanking me. This book gives you the tools to see your worth. It also gives you permission to walk away.",
  "Eolles doesn't just identify the problem. She shows you the way out step by step. The practical wisdom is just as strong as the emotional insights. You leave with a real plan.",
  "The way Eolles breaks down relationship dynamics is masterful. I've been sleeping better since I finished this book. Less anxiety about everything. My nervous system finally calmed down.",
  "I went from victim to victor in my own story. This book did that in ways I can't fully explain. I speak differently now. I carry myself differently.",
  "Now she recommends it to all her clients too. It spreads because it works. The message resonates across backgrounds. Every woman who reads it passes it on.",
];

// 5-sentence reviews
const fiveSentenceTemplates = [
  "I've been healed from wounds I didn't even know I had. The layers this book peels back are incredible. You think you understand the message and then another chapter hits different. I'm on my third read through. Each time I catch something new.",
  "This isn't advice from the sidelines. It's wisdom from the trenches. Eolles has clearly lived what she teaches. That authenticity comes through on every page. You can't fake this kind of insight.",
  "This book helped me take my crown back after years of giving it away. The transformation in my self talk has been remarkable. I catch myself now when old patterns try to creep in. The awareness alone is worth everything. I feel like I have armor now.",
  "I've stopped making excuses for men who don't deserve my energy. My relationship with myself has improved dramatically. My relationship with everyone else followed. It's like I finally learned to value myself. Everything else shifted from there.",
];

// 6-sentence reviews (only 5% of the 30%)
const sixSentenceTemplates = [
  "My whole friend group is reading it now. The conversations are incredible and we meet weekly to discuss it. We've all made changes in our lives because of this book. Boundaries we never thought we'd set are now firm. Relationships that were draining us are over. We're all becoming the women we were meant to be.",
  "Valuable perspective on relationships. The ending felt a bit abrupt but the journey to get there was worth it. I've gone back and reread certain chapters multiple times. The wisdom keeps revealing itself. I've started a journal just to process all the thoughts this book brings up. It's genuinely changing how I move through the world.",
];

// One super long 14-sentence review for the middle
const superLongReview = "I need to talk about this book because it genuinely altered the course of my life. I picked it up on a random Tuesday when I was at my lowest point. I had just discovered some things about my situation that broke me. I almost didn't buy it because I thought what can another book really do. But something made me grab it and I started reading that same night. By chapter three I was sobbing on my couch. By chapter five I was angry at myself for all the years I wasted. By the middle of the book I had a plan forming in my mind. I finished it at 4am and I couldn't sleep after because my whole brain was rewired. The next morning I made phone calls I'd been avoiding for months. Within two weeks my entire life looked different. I'm writing this review three months later and I am not the same woman. If you're on the fence about buying this please just do it. It might just save your life like it saved mine.";

// Combine all templates with type markers
const reviewTemplates = [
  ...shortReviewTemplates.map(t => ({ content: t, type: 'short' })),
  ...twoSentenceTemplates.map(t => ({ content: t, type: '2sentence' })),
  ...threeSentenceTemplates.map(t => ({ content: t, type: '3sentence' })),
  ...fourSentenceTemplates.map(t => ({ content: t, type: '4sentence' })),
  ...fiveSentenceTemplates.map(t => ({ content: t, type: '5sentence' })),
  ...sixSentenceTemplates.map(t => ({ content: t, type: '6sentence' })),
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
// Distribution: 70% short, 30% longer (of which: equal 2&3, equal 4&5, 5% 6-sentence)
export function generateSeedReviews(): Review[] {
  const reviews: Review[] = [];
  
  // Shuffle names
  const shuffledNames = [...names].sort(() => Math.random() - 0.5);
  
  // Create distribution of review lengths for 127 reviews
  // 70% short (~89), 30% longer (~38)
  // Of the 38 longer: 12 two-sentence, 12 three-sentence, 6 four-sentence, 6 five-sentence, 2 six-sentence
  const reviewLengthAssignments: string[] = [];
  for (let i = 0; i < 89; i++) reviewLengthAssignments.push('short');
  for (let i = 0; i < 12; i++) reviewLengthAssignments.push('2sentence');
  for (let i = 0; i < 12; i++) reviewLengthAssignments.push('3sentence');
  for (let i = 0; i < 6; i++) reviewLengthAssignments.push('4sentence');
  for (let i = 0; i < 6; i++) reviewLengthAssignments.push('5sentence');
  for (let i = 0; i < 2; i++) reviewLengthAssignments.push('6sentence');
  
  // Shuffle the assignments
  const shuffledAssignments = reviewLengthAssignments.sort(() => Math.random() - 0.5);
  
  // Place the super long review in the middle (around position 63)
  const superLongPosition = 63;
  
  // Track used templates per type to avoid duplicates
  const usedTemplates: Record<string, Set<number>> = {
    'short': new Set(),
    '2sentence': new Set(),
    '3sentence': new Set(),
    '4sentence': new Set(),
    '5sentence': new Set(),
    '6sentence': new Set(),
  };
  
  // Get templates by type
  const templatesByType: Record<string, string[]> = {
    'short': shortReviewTemplates,
    '2sentence': twoSentenceTemplates,
    '3sentence': threeSentenceTemplates,
    '4sentence': fourSentenceTemplates,
    '5sentence': fiveSentenceTemplates,
    '6sentence': sixSentenceTemplates,
  };
  
  for (let i = 0; i < 127; i++) {
    const name = shuffledNames[i % shuffledNames.length];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const device = Math.random() > 0.5 ? 'mobile' : 'desktop';
    const hasEmoji = Math.random() < 0.30; // 30% have emojis
    const rating = i < 115 ? 5 : 4; // First 115 get 5 stars, rest get 4
    
    let content: string;
    
    // Check if this is the super long review position
    if (i === superLongPosition) {
      content = superLongReview;
    } else {
      // Get the assigned length type
      const lengthType = shuffledAssignments[i] || 'short';
      const templates = templatesByType[lengthType];
      
      // Find an unused template
      let templateIndex = Math.floor(Math.random() * templates.length);
      let attempts = 0;
      while (usedTemplates[lengthType].has(templateIndex) && attempts < templates.length) {
        templateIndex = (templateIndex + 1) % templates.length;
        attempts++;
      }
      usedTemplates[lengthType].add(templateIndex);
      
      content = templates[templateIndex];
    }
    
    // Add emoji for mobile users (30% chance)
    if (hasEmoji && device === 'mobile' && content.length < 200) {
      const emoji = emojiAdditions[Math.floor(Math.random() * emojiAdditions.length)];
      content = content + emoji;
    }
    
    const review: Review = {
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
    
    reviews.push(review);
  }
  
  // Sort by date, newest first
  return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const seedReviews = generateSeedReviews();
