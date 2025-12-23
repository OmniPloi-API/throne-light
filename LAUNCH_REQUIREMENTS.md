# Throne Light Platform - Launch Requirements

## ✅ Completed

### Purchase Flow
- ✅ Digital edition pricing: $9.99
- ✅ Physical edition pricing: $35.99 (10% off $39.99 retail)
- ✅ Purchase modal with format selection
- ✅ Reader preview page at `/reader/preview`
- ✅ Stripe checkout API routes (placeholders ready)

### Manuscript Submissions
- ✅ Vault gate submission form
- ✅ Admin panel at `/admin/submissions`
- ✅ Submission storage in `data/submissions.json`

---

## 🚨 Required Before Launch (Tomorrow)

### 1. Stripe Integration (CRITICAL)

**What you need to do:**

1. **Create a Stripe account** at https://stripe.com if you don't have one
2. **Get your API keys:**
   - Go to Stripe Dashboard → Developers → API keys
   - Copy your **Secret key** (starts with `sk_live_` for production or `sk_test_` for testing)
3. **Add to your environment variables:**
   - Create/edit `.env.local` in the project root
   - Add: `STRIPE_SECRET_KEY=your_secret_key_here`
   - Add: `NEXT_PUBLIC_BASE_URL=https://yourdomain.com` (or `http://localhost:3000` for testing)
4. **Install Stripe package:**
   ```bash
   npm install stripe
   ```
5. **Uncomment the Stripe code** in these files:
   - `src/app/api/checkout/digital/route.ts`
   - `src/app/api/checkout/physical/route.ts`

**Current behavior without Stripe:**
- Digital purchase → Opens reader preview (no payment)
- Buy Direct → Redirects to Amazon (fallback)

---

### 2. Book Content for Digital Reader

**You mentioned you have the PDF. Here's what to do:**

#### Option A: Quick Launch (Recommended for tomorrow)
1. **Convert PDF to images:**
   - Use a tool like https://pdf2png.com or Adobe Acrobat
   - Export each page as a high-quality PNG/JPG
   - Name them: `page-001.jpg`, `page-002.jpg`, etc.

2. **Upload images:**
   - Create folder: `public/books/crowded-bed-empty-throne/`
   - Place all page images there

3. **I'll create a simple image-based reader** that displays these pages

#### Option B: Full Text Reader (Better long-term)
1. **Extract text from PDF:**
   - Use Adobe Acrobat or https://pdftotext.com
   - Save as plain text or JSON with chapter breaks

2. **I'll create a proper text reader** with:
   - Searchable text
   - Adjustable font sizes
   - Better accessibility
   - Smaller file sizes

**For tomorrow's launch, I recommend Option A** (images) since it's faster and guaranteed to look exactly like your PDF.

---

### 3. Success Pages

**Need to create:**
- `/reader/success` - After successful digital purchase
- `/book/order-success` - After successful physical purchase

These pages should:
- Thank the customer
- For digital: Provide immediate access to the reader
- For physical: Show order confirmation and shipping info
- Send confirmation emails (via Stripe webhooks)

---

### 4. Email Notifications

**Set up Stripe webhooks** to send emails when:
- Digital purchase complete → Send reader access link
- Physical purchase complete → Send order confirmation
- Manuscript submitted → Notify admin

**Recommended email service:**
- Resend (https://resend.com) - Free tier, easy setup
- Or use Stripe's built-in email receipts

---

### 5. Domain & Deployment

**If not already done:**
- Deploy to Vercel/Netlify
- Set up custom domain
- Add SSL certificate (automatic on Vercel)
- Update `NEXT_PUBLIC_BASE_URL` to your live domain

---

## 📋 Testing Checklist Before Launch

### Purchase Flow
- [ ] Click "Claim Your Crown" button
- [ ] Select Digital edition → See $9.99 price
- [ ] Select Physical edition → See $35.99 discounted price
- [ ] Test Stripe checkout (use test mode first)
- [ ] Verify reader preview loads at `/reader/preview`
- [ ] Test dark/light mode toggle
- [ ] Test page navigation

### Manuscript Submissions
- [ ] Go to `/publisher` page
- [ ] Hover over vault handle → See "Click to submit"
- [ ] Click vault → Modal opens
- [ ] Fill out submission form
- [ ] Submit → Success message appears
- [ ] Check `/admin/submissions` → Submission appears
- [ ] Test status updates in admin panel

### Mobile Responsiveness
- [ ] Test on phone/tablet
- [ ] Check purchase modal doesn't cut off
- [ ] Verify reader is readable on mobile
- [ ] Test submission form on mobile

---

## 🎯 Post-Launch Improvements

### Phase 2 (Week 1-2)
- Full Stripe webhook integration
- Automated email confirmations
- User accounts & login
- Digital library dashboard
- Order tracking for physical books

### Phase 3 (Month 1)
- Partner portal for affiliates
- Advanced reader features (highlights, notes)
- Multi-device sync
- Bonus content delivery
- Analytics dashboard

---

## 📞 Support & Questions

**If you encounter issues:**

1. **Stripe errors:** Check your API keys are correct in `.env.local`
2. **Reader 404:** Make sure the page file exists at `src/app/reader/preview/page.tsx`
3. **Purchase not working:** Check browser console for errors
4. **Submissions not saving:** Verify `data/` folder exists and is writable

**Quick fixes:**
```bash
# Restart dev server after adding .env.local
npm run dev

# Create data folder if missing
mkdir -p data

# Check for errors
npm run build
```

---

## 🚀 Launch Day Checklist

**Morning of launch:**
1. [ ] Test all purchase flows one final time
2. [ ] Verify Stripe is in **live mode** (not test mode)
3. [ ] Check all prices are correct ($9.99 digital, $35.99 direct physical)
4. [ ] Test reader preview loads
5. [ ] Verify submission form works
6. [ ] Check mobile experience
7. [ ] Have customer support email ready
8. [ ] Monitor Stripe dashboard for first purchases
9. [ ] Check admin panel for submissions

**You're ready to launch!** 🎉

The platform is built and functional. Once you add Stripe keys and book content, everything will work seamlessly.
