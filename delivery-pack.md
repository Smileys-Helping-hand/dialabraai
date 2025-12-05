# Dial-A-Braai Delivery Pack (Copy-Ready)

## 1) Client Presentation Pack
Use these slides directly in Google Slides/PowerPoint.

**Slide 1 — Title**
- Dial-A-Braai Web & Mobile Ordering Platform
- Designed for fast, reliable real-world braai operations.

**Slide 2 — Project Purpose**
- Showcase food beautifully
- Easy customer ordering
- Fast staff order management
- Track payments, collections, and production workflow
- Works on web and Android APK

**Slide 3 — The Problem**
- No website; only Instagram presence
- Orders captured manually
- No real-time tracking
- No structured payment state
- Customers unsure about wait times

**Slide 4 — The Solution**
- Full customer ordering site + admin dashboard
- Menu with categories and photos
- Cart + order submission
- Live order tracking
- Admin status workflow: Pending → Preparing → Ready → Completed
- Payment toggle
- Sales dashboard & analytics
- Admin APK experience

**Slide 5 — Customer Experience Flow**
- Home page → branded and welcoming
- Menu → browse categories, beautiful images
- Add to basket
- Checkout (name, phone, notes)
- Order submitted
- Live order tracking page
- "Ready for collection" notice
- Payment confirmed at pickup

**Slide 6 — Admin Dashboard**
- Order feed (real-time)
- Live status update buttons
- Payment marking
- Full order details
- Menu management (CRUD)
- Daily and monthly statistics
- Best sellers and category performance

**Slide 7 — Tech Stack**
- Next.js 14 (App Router)
- Supabase (DB, Auth, Realtime, Storage)
- TailwindCSS
- Capacitor Android APK
- Vercel deployment

**Slide 8 — Business Benefits**
- Shorter waiting times
- More accurate orders
- Real-time production overview
- Better stock/menu management
- Visual branding uplift
- Clear income record
- Easy for teams to use

**Slide 9 — Future Enhancements (Optional)**
- WhatsApp notifications
- Customer accounts
- Delivery support
- Payment integration (Yoco/Paystack)
- Promotions/combos automation

**Slide 10 — Conclusion**
- Dial-A-Braai now has a modern, reliable digital ordering system that makes operations faster, clearer, and more profitable.

## 2) Deployment Readiness (Vercel)
- **Environment variables** (Vercel → Project → Environment Variables):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- **Build command:** `npm run build`
- **Warnings:** Supabase cannot fully execute during static build; this is expected.
- **If build warnings persist**, add `export const dynamic = "force-dynamic";` to pages such as `app/menu/page.js`, `app/order/page.js`, and admin routes.
- **Launch steps:** push to GitHub → create Vercel project → add env vars → deploy → attach custom domain (optional).

## 3) Practical APK Build Guide
Follow exactly for the Capacitor Android package:
1. Install dependencies: `npm install`
2. Export Next.js site:
   - `npm run build`
   - `npm run export`
3. Build Android project:
   - `npx cap sync android`
   - `npx cap open android`
4. In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK** (or use `./gradlew assembleDebug`).
5. Install on a device via USB or share the generated APK.

**Start URL**
- Boots directly to `/admin/orders`.

**Persistent Login**
- LocalStorage + cookies are already implemented to keep admin sessions inside the WebView.

## 4) Polished Wording Pack (Final Copy)
- **Customer Buttons:** "Add to Order", "View Cart", "Place My Order", "Back to Menu", "Order Ready for Collection", "Thank You — Your Order Is In!"
- **Status Labels:** Pending — "Order Received"; Preparing — "We’re Preparing Your Meal"; Ready — "Ready for Collection"; Completed — "Order Completed".
- **Admin Labels:** "Mark as Paid", "Mark as Ready", "Mark as Completed", "Remove Item", "Add New Menu Item", "Sales Today", "Top Sellers", "Category Overview".
- **Home Page Copy:** "Welcome to Dial-A-Braai! Freshly prepared on real fire, made with care, and served with that true Cape Town braai flavour. Browse our menu, place your order, and collect when your meal is ready."

## 5) Visual QA Pass (Highlights)
- Base font tuned for readability (15–16px+), gold highlights for active states, and max-width ~620px on narrow layouts.
- Navbar: increased padding/tap targets and bolder brand weight.
- Menu cards: taller images, soft shadow, rounded corners, and flame-toned pricing.
- Order page: sticky footer "Place Order" button, larger inputs, clearer labels.
- Admin: larger badges, separators on cards, shadowed analytics cards, elevated chart labels.

## 6) Pre-Launch Checklist
**Customer**
- Menu loads on slow networks
- Category tabs filter correctly
- Add-to-cart works and persists on refresh
- Order form validates phone number
- Order submits to Supabase
- Redirect to success works
- Tracking updates in real time with correct status colors
- Mobile and desktop responsive

**Admin**
- Login authentication + middleware guard
- Orders feed updates in real time
- Status buttons flow correctly
- Mark-paid toggles work
- Order detail page loads and deletes/archive as expected
- Menu CRUD works (including image upload)
- Stats calculations render correctly

**APK**
- Boots to `/admin/orders`
- Navigation works and login persists
- Reload does not reset state

**General**
- Env vars set
- No console errors
- Responsive layout
- Supabase RLS verified

## 7) Sora Image Prompts (Optional Enhancers)
Use these prompts with the indicated filenames:
1. **diala-home-hero.png** — "Beautiful overhead cinematic shot of South African braai meat sizzling on a fire grill, warm sunset lighting, deep oranges and golds, charcoal textures, smoke rising softly, styled for a restaurant hero banner, rich details, inviting and authentic."
2. **diala-seafood-banner.png** — "Crisp close-up of grilled prawns glazed in golden garlic butter, lemon slices, flame-kissed shells, glittering highlights, appetizing, high-resolution food photography for a seafood menu section."
3. **diala-chicken-banner.png** — "Cape Town style grilled chicken pieces coated in sticky braai sauce, beautifully charred edges, glossy texture, shot on a rustic wooden board, dramatic warm lighting."
4. **diala-combos-display.png** — "Multiple combo trays arranged neatly: chicken, chops, sausage, garlic roll, salads, shot top-down in a clean commercial kitchen style, bright, colourful, appetizing."
5. **diala-admin-splash.png** — "Minimalistic modern splash screen for a food business app: Dial-A-Braai logo centered, charcoal background (#1A1715), flame and gold accents, soft glow, elegant but bold."

