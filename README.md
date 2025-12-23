# Throne Light Publishing - Digital Constellation

A prophetic digital altar built with Next.js 14, TailwindCSS, and Framer Motion. This project houses three interconnected sites that share "Design DNA" while serving distinct purposes.

## The Constellation

### Site 1: The Book (`/book`)
**The Crowded Bed & The Empty Throne**
- Primary conversion engine - long-form sales page
- 6 sections: Hero, Mirror, Confrontation, Scroll, Witnesses, Altar
- Goal: Recognition → Confrontation → Coronation (Purchase)

### Site 2: The Author (`/author`)
**Light of Eolles**
- Personal brand / portfolio site
- 5 sections: Voice, Dispatch, Frequency (Music), Gathering (Events), Remnant (Newsletter)
- Goal: Connection → Authority → Email List

### Site 3: The Publisher (`/publisher`)
**Throne Light Publishing**
- Corporate/institutional presence
- 5 sections: Foundation, Mandate, Archive, Gate, Ledger
- Goal: Legitimacy → Brand Mythos → Catalog

## Design Philosophy

**"The Digital Altar"**
- **Vibe**: High-Church Minimalism meets Editorial Vogue
- **Physics**: Heavy, deliberate scrolling with reveal animations
- **Palette**: Onyx, Parchment/Cream, Metallic Gold
- **Typography**: Playfair Display (headers), Inter (body), Cormorant Garamond (display)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Playfair Display, Inter, Cormorant Garamond)

## Getting Started

```bash
# Install dependencies
npm install --ignore-scripts

# Run development server
./node_modules/.bin/next dev

# Or use npx
npx next dev
```

Open [http://localhost:3000](http://localhost:3000) - redirects to `/book` by default.

## Project Structure

```
src/
├── app/
│   ├── book/          # Book site
│   ├── author/        # Author site
│   ├── publisher/     # Publisher site
│   ├── layout.tsx     # Root layout with fonts
│   ├── globals.css    # Design system styles
│   └── page.tsx       # Redirects to /book
├── components/
│   ├── shared/        # Navigation, Footer, AudioToggle, etc.
│   ├── book/          # Book site sections
│   ├── author/        # Author site sections
│   └── publisher/     # Publisher site sections
public/
├── audio/             # Soundtrack files (add ambient.mp3)
└── images/            # Book cover, author photo, etc.
```

## Assets Needed

To complete the site, add these files to `/public`:

1. **Book Cover**: `/images/book-cover.jpg` (replace placeholder in components)
2. **Author Photo**: `/images/eolles-portrait.jpg`
3. **Ambient Audio**: `/audio/ambient.mp3` (for AudioToggle)

## Key Features

- **Global Navigation**: Constellation menu connecting all three sites
- **Audio Toggle**: Ambient soundscape (bottom-right corner)
- **Scroll Animations**: Fade-in, unblur, typewriter effects
- **Crown Ratings**: Custom crown icons replace star ratings
- **Email Capture**: "Enter The Gates" styled subscription forms
- **Mobile-First**: Optimized for Instagram/TikTok traffic

## Customization

### Colors
Edit `tailwind.config.ts` to modify the throne palette:
- `onyx` - Primary dark background
- `parchment` - Light text/accents
- `gold` - Accent color
- `charcoal` - Secondary backgrounds

### Animations
Custom animations defined in `tailwind.config.ts`:
- `fade-in`, `fade-in-up`, `unblur`
- `float`, `breathe`, `pulse-glow`
- `text-reveal`, `slide-in-left/right`

## Deployment

Deploy to Vercel, Netlify, or any Next.js-compatible host:

```bash
npm run build
npm start
```

## Links

- **Amazon**: Update Amazon FBA link in CTA buttons
- **Social**: @lightofeolles on all platforms
- **Contact**: info@thronelightpublishing.com

---

*Sovereignty in every word.*
