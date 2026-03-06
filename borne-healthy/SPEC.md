# Borne Healthy — Product Spec

**Version:** 0.1 (MVP)
**Author:** Geele Evans / Borne Systems
**Date:** 2026-03-05
**Status:** Draft

---

## Product Overview

Borne Healthy is a mobile-first web app that lets users scan a bottled water barcode and instantly see what's in it — brand, source type, mineral content, pH — with a simple Good/Okay/Bad rating. It also looks up tap water quality by zip code so users can compare what's in their bottle vs. what's coming out of the faucet.

**One-liner:** _"Know your water."_

**Target user:** Health-conscious consumers, parents, fitness people, anyone who's ever stared at a wall of water bottles wondering which one to buy.

---

## MVP Features (v0.1)

### 1. Barcode Scanner
- Camera-based barcode scanning using **html5-qrcode** library
- Supports UPC-A, EAN-13 (standard bottle barcodes)
- Manual barcode entry fallback (type the number)
- Works on mobile browsers (Chrome, Safari) — no app install needed

### 2. Water Product Lookup
- Hits **Open Food Facts API** with scanned barcode
- Displays:
  - Brand name
  - Product name
  - Source type (spring / mineral / purified / tap-sourced)
  - Mineral content (calcium, magnesium, sodium, potassium, bicarbonate) if available
  - pH level if listed
  - Nutri-Score if available
- Graceful fallback: "Product not found — help us add it!"

### 3. Water Rating System
Simple 3-tier rating based on available data:

| Rating | Criteria |
|--------|----------|
| 🟢 **Good** | Spring/mineral source, low sodium (<20mg/L), minerals present |
| 🟡 **Okay** | Filtered/purified, adequate mineral content |
| 🔴 **Bad** | High sodium, unknown source, no mineral data, or flagged additives |

Rating logic is basic for MVP — improves with more data over time.

### 4. Tap Water Quality Lookup
- User enters zip code
- Queries **EPA SDWIS** data via Envirofacts API (`https://enviro.epa.gov/enviro/efservice/`)
- Shows:
  - Water system name serving that area
  - Number of violations (last 3 years)
  - Types of violations (health-based vs. monitoring)
  - Contaminants detected above guidelines
- Links to EWG Tap Water Database (`ewg.org/tapwater`) for detailed report

### 5. Favorites (Local Storage)
- Save scanned products to a local favorites list
- No account needed — uses `localStorage`
- Future: sync across devices with account

---

## NOT in MVP (Future Features)

| Feature | Priority | Notes |
|---------|----------|-------|
| User accounts & cloud sync | Medium | Auth, database, more infra |
| Community ratings/reviews | Medium | User-generated content moderation |
| Comparison mode (side-by-side) | Medium | Compare 2+ waters |
| Filter recommendations | Low | "Best water for your area" |
| Push notifications | Low | Recall alerts, quality changes |
| Shopping integration | Low | "Buy on Amazon" affiliate links |
| AI-powered analysis | Low | Natural language water quality explanations |
| Native app (iOS/Android) | Low | PWA covers 90% of use cases |
| Water filter recommendations | Medium | Based on local tap quality |
| Hydration tracking | Low | Separate product concern |
| Price comparison | Medium | Requires scraping/partnerships |

---

## Tech Stack

### Frontend
- **HTML5 + CSS3 + Vanilla JS** (MVP — no framework overhead)
- **html5-qrcode** (`npm: html5-qrcode`) — barcode scanning via camera
  - Supports UPC-A, EAN-13, CODE-128
  - Built-in camera UI, works on mobile
  - ~50KB gzipped
- **PWA** — `manifest.json` + service worker for installability
- Mobile-first responsive design

### APIs (all free, no keys needed for MVP)
| API | Purpose | Auth | Rate Limit |
|-----|---------|------|------------|
| [Open Food Facts](https://world.openfoodfacts.org/data) | Product barcode lookup | None | Be reasonable (no hard limit) |
| [EPA Envirofacts](https://enviro.epa.gov/envirofacts/api) | Water system violations by location | None | No documented limit |
| [EWG Tap Water](https://www.ewg.org/tapwater/) | Deep-link for detailed reports | N/A (link only) | N/A |

### Storage
- **localStorage** for favorites & recent scans (MVP)
- Future: Supabase or Firebase for user accounts

### Hosting
- **GitHub Pages** or **Cloudflare Pages** (free, fast CDN)
- No backend needed for MVP — everything is client-side

---

## Data Sources Deep Dive

### Open Food Facts — Bottled Water Coverage
- **198+ bottled water products** currently indexed
- Categories available: `spring-waters`, `mineral-waters`, `natural-mineral-waters`, `low-mineral-bottled-waters`
- Mineral data varies by product (some have full mineral breakdown, others just basic nutrition)
- API endpoint: `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`
- **Gap:** US brands have lower coverage than European. Users can contribute missing products.

### EPA SDWIS (Safe Drinking Water Information System)
- Covers all ~150,000 public water systems in the US
- Violation data, contaminant monitoring results
- Envirofacts REST API: `https://enviro.epa.gov/enviro/efservice/WATER_SYSTEM/ZIP_CODE/{zip}/JSON`
- Includes: system name, population served, source type, violations
- **Gap:** Data can lag 6-12 months behind real-time. Link to EWG for more current analysis.

### EWG Tap Water Database
- Most consumer-friendly tap water data
- No public API, but zip code search links work: `https://www.ewg.org/tapwater/search-results.php?zip5={zip}`
- Use as supplementary deep-link, not primary data source

---

## Monetization Ideas (Post-MVP)

| Model | Effort | Revenue Potential |
|-------|--------|-------------------|
| **Affiliate links** — link to buy recommended waters | Low | $ per click/sale |
| **Water filter affiliate** — recommend filters based on local quality | Low | $$ per sale |
| **Premium tier** — detailed analysis, history, PDF reports | Medium | $5/mo subscription |
| **White label** — sell to gyms, wellness brands, doctors offices | High | $$$ per deal |
| **Ads** — non-intrusive banner | Low | $ passive |
| **Data licensing** — aggregated scan data to brands | Medium | $$$ B2B |
| **Local partnerships** — water delivery services | Medium | $$ per lead |

**MVP monetization: $0.** Build the audience first. Monetize when there's traction.

---

## User Flow (MVP)

```
[Open App] → [Camera viewfinder with "Scan Water Bottle" prompt]
                    ↓
            [Barcode detected]
                    ↓
        [Fetch from Open Food Facts API]
                    ↓
    ┌─── Product Found ───┐     ┌─── Not Found ───┐
    │                      │     │                   │
    │  Brand: Fiji         │     │  "Not in our     │
    │  Source: Spring      │     │   database yet"  │
    │  Minerals: Ca, Mg    │     │                   │
    │  Rating: 🟢 Good     │     │  [Add it link]   │
    │                      │     │                   │
    │  [Save to Favorites] │     └───────────────────┘
    │  [Check My Tap Water]│
    └──────────────────────┘
                    ↓
        [Enter Zip Code]
                    ↓
    ┌─── Tap Water Report ──────────┐
    │                                │
    │  System: NYC Water Board       │
    │  Violations: 2 (monitoring)    │
    │  Source: Surface water         │
    │                                │
    │  [View full EWG report →]      │
    └────────────────────────────────┘
```

---

## First Step: MVP Prototype

**File:** `index.html` (single-file, no build step)

**What it does:**
1. Opens camera → scans barcode
2. Calls Open Food Facts API
3. Shows product info + rating
4. Zip code input → shows EPA water system data
5. Save favorites to localStorage

**How to run:** Open in mobile browser. That's it.

**Tech decisions for prototype:**
- Single HTML file with inline CSS/JS
- CDN-loaded `html5-qrcode` library
- No build tools, no npm, no framework
- Deploy by dropping file on GitHub Pages

See `index.html` in this directory for the working prototype.

---

## Success Metrics

| Metric | Target (30 days) |
|--------|-------------------|
| Unique visitors | 500 |
| Scans completed | 1,000 |
| Tap water lookups | 200 |
| PWA installs | 50 |
| Return visitors (7-day) | 20% |

---

## Competitive Landscape

| App | What it does | Gap we fill |
|-----|-------------|-------------|
| **Yuka** | Food/cosmetics scanner | No water focus, no tap water |
| **EWG Healthy Living** | Product scanner | No barcode scanner for water specifically |
| **Waterlogic** | Water cooler company | B2B, not consumer |
| **Tap** | Find water refill stations | Location, not quality |
| **MyWater** | Hydration tracking | Tracking, not quality |

**Our angle:** First app focused specifically on _water quality intelligence_ — both bottled and tap, in one place.

---

## Timeline

| Week | Deliverable |
|------|-------------|
| 1 | Working prototype (`index.html`) — scan + lookup |
| 2 | PWA setup (manifest, service worker, offline) |
| 3 | Tap water lookup + rating system |
| 4 | Polish UI, favorites, share functionality |
| 5 | Deploy to production URL, begin user testing |
| 6 | Iterate based on feedback |

---

## Open Questions

1. **Domain:** `bornehealthy.com`? `borne.health`? Check availability.
2. **Data gap strategy:** What happens when Open Food Facts doesn't have a water brand? Manual curation? User submissions?
3. **Rating algorithm:** Simple rules vs. weighted scoring? Start simple, evolve.
4. **Legal:** Any disclaimers needed for health/water quality claims?
5. **Brand:** Logo, color scheme, tagline. Water blue? Health green?
