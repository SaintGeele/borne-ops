# AI Co-pilot MVP — Design Spec
**Date:** 2026-04-08
**Status:** Approved

---

## 1. Concept & Vision

AI Co-pilot is a conversational startup wingman for solo founders and first-time entrepreneurs. It guides users through business formation, pitch building, idea validation, and marketing copy — one step at a time — motivating them to take action instead of staying stuck. The feel is sharp, modern, and warm — a tool that looks like it was built by someone who ships.

---

## 2. Design Language

### Aesthetic Direction
Dark, minimal, high-contrast. Think Linear meets a warm mentorship app — premium dark UI with orange action signals. Not another purple-gradient AI product.

### Color Palette
| Role | Hex | Usage |
|------|-----|-------|
| Background | `#0F0F0F` | Page base |
| Surface | `#18181B` | Cards, panels |
| Border | `#27272A` | Dividers, outlines |
| Primary Accent | `#F97316` | CTAs, highlights, active states |
| Text Primary | `#FAFAFA` | Headings, body |
| Text Muted | `#71717A` | Secondary text, labels |
| Success | `#22C55E` | Confirmations, completions |
| Warning | `#EAB308` | Cautions |

### Typography
- **Font:** Inter (Google Fonts) — clean, modern, readable
- **Weights:** 400 (body), 500 (labels), 600 (subheadings), 700 (headings)
- **Scale:** 12px (caption) → 14px (body) → 16px (large body) → 20px (h3) → 24px (h2) → 32px (h1)

### Spatial System
- Base unit: 4px
- Common spacing: 8, 12, 16, 24, 32, 48px
- Border radius: 6px (buttons), 8px (cards), 12px (panels)
- Max content width: 480px (chat), 640px (onboarding)

### Motion Philosophy
- Subtle only — no decorative animation
- Transitions: 150ms ease for hover states, 200ms for panel changes
- Typing indicator (three dots) for AI responses
- No page transitions — single-page app feel via React state

### Visual Assets
- Icons: Lucide React (consistent, minimal)
- No stock photos
- Minimal decorative elements — content is the UI

---

## 3. Layout & Structure

### Page Architecture
```
/ (landing)         → Hero + CTA → /app
/app (onboarding)   → Feature selection → chat
/app (chat)         → Active feature conversation
```

### Landing Page (`/`)
- Dark background (`#0F0F0F`)
- Centered hero: Headline + subheadline + primary CTA
- Minimal — single conversion path

### Onboarding (`/app` — unauthenticated or first visit)
- Full-screen dark card (`#18181B`) centered
- Large featured card with primary question: "What do you want to work on today?"
- Four pill-style quick links below: LLC Formation · Pitch Deck · Idea Validator · Marketing Copy
- Optional: brief one-liner under each feature
- Auth prompt appears after selecting first feature (Google OAuth or email magic link)

### Chat Interface (`/app` — authenticated)
- AI Persona Card at top: name ("Borne AI"), status line, current feature context
- Chat message area: user + AI messages, styled distinctly
- Progress indicator: steps remaining for current feature
- Sticky input bar at bottom with send button
- Output blocks: formatted, copyable — appear inline in chat when AI delivers

### Responsive Strategy
- Mobile-first: single column throughout
- Desktop: same layout, slightly wider max-width (640px instead of 480px)
- No desktop-specific layouts

---

## 4. Features & Interactions

### Feature Set

#### A. LLC Formation
**Goal:** Guide user from business name to filed LLC
**Intake questions (in chat):**
1. Business name — validate uniqueness
2. State of formation
3. Registered agent (yes/no — explain what it is)
4. Members / ownership structure

**Delivery:** Step-by-step checklist, downloadable as text
**Export:** Copy to clipboard

#### B. Pitch Deck Builder
**Goal:** Generate a text-based pitch from user input
**Intake questions:**
1. What problem does your business solve?
2. Who is your customer?
3. How big is your market? (optional)
4. What makes your solution different?

**Delivery:** Slide-by-slide text output (Problem, Solution, Market, Traction, Ask)
**Export:** Copy all, or email to self

#### C. Idea Validator
**Goal:** Help users stress-test a business idea
**Intake:** Conversational — "What's the idea? What's your background? Who pays for this?"
**Delivery:** Feasibility score (1-10), strengths, risks, next steps
**Export:** Copy summary

#### D. Marketing Copy Generator
**Goal:** Produce marketing text from brief
**Intake:** Business type, channel (email/subject line/social post), tone preference
**Delivery:** 3 variants of copy
**Export:** Copy best option

### Interaction Details

| Action | Behavior |
|--------|----------|
| User submits message | Input clears, user bubble appears, typing indicator shows |
| AI is thinking | Three-dot animation in AI bubble area |
| AI delivers response | Output block styled differently from chat text |
| Feature selected | Onboarding card swaps to chat, AI persona updates context |
| Copy button clicked | Button text changes to "Copied!" for 2s |
| User finishes a feature | AI congratulates, suggests next step or feature |

### Error Handling
- API failure: "Had a hiccup — let me try that again." + retry button
- Empty input: Send button disabled
- Rate limit: "Taking a breather — try again in a moment."

### Edge Cases
- User switches feature mid-chat: AI acknowledges, saves progress, starts new flow
- User asks off-topic: "I'm focused on helping you ship [current feature]. Want to continue there?"
- Long response: Delivered as single block, not streamed token-by-token (simpler MVP)

---

## 5. Component Inventory

### LandingHero
- States: default only
- Contains: headline, subheadline, CTA button

### FeatureCard (onboarding)
- States: default, hover (slight lift + orange border)
- Contains: icon, feature name, brief description

### AIPersonaCard
- States: idle, active (with feature name)
- Contains: avatar icon, name, status line, current feature badge

### ChatBubble (user)
- States: default only
- Appearance: right-aligned, dark surface, white text

### ChatBubble (AI)
- States: default, thinking (with typing indicator)
- Appearance: left-aligned, slightly lighter surface, ai text

### OutputBlock
- States: default, copied
- Appearance: distinct border, code-block style, copy button top-right
- Contains: feature name, formatted output text

### MessageInput
- States: default, focused, disabled (during AI thinking)
- Contains: text input, send button (disabled when empty)

### ProgressIndicator
- States: per-feature step count
- Appearance: small pill row showing completed / remaining steps

---

## 6. Technical Approach

### Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js — Google OAuth + Email Magic Link
- **LLM:** OpenRouter API — `gpt-4o-mini` (cost-efficient, fast)
- **State:** React Context + `useState` (no Redux needed for MVP)
- **Database:** None for MVP — all state in memory during session
- **Hosting:** Vercel (native Next.js support)

### API Design

#### `POST /api/chat`
**Request:**
```json
{
  "message": "string",
  "feature": "llc | pitch | idea | marketing",
  "history": [{ "role": "user" | "assistant", "content": "string" }]
}
```
**Response:**
```json
{
  "reply": "string",
  "output": { "type": "checklist" | "pitch" | "score" | "copy", "content": "string" } | null,
  "nextQuestion": "string" | null,
  "stepComplete": "boolean"
}
```

### Data Model
```
User {
  id, email, name, createdAt
  subscription: "free" | "pro"
}

Session {
  id, userId, feature, history[], currentStep, createdAt
}
```

### MVP Scope — Out of Scope
- Persistent database (sessions in memory only)
- Real legal filing or EIN lookup (text guidance only)
- PDF/DOCX export (copy + email-to-self only)
- Streaming responses
- Payment processing (Pro tier)

---

## Design Decisions Locked

| Decision | Choice |
|----------|--------|
| Onboarding layout | Option C — Featured Card with bold question |
| Chat interface | Option B — AI Persona Card |
| Color scheme | Dark + Bold Orange (`#0F0F0F` / `#18181B` / `#F97316`) |
| Auth | Google OAuth + Email Magic Link |
| Free features | LLC Formation, Idea Validator, 3 marketing copies |
| Pro features | Pitch Deck, unlimited marketing, email export |
| Export | Copy to clipboard + email-to-self |
