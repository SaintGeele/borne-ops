Command Center — Design Specification
A comprehensive visual design guide for implementation. Every decision here is deliberate. Default theme: Dark. Light mode available via toggle.

1. Design Philosophy
The visual language draws from Linear's precision and restraint, but with a warmer, more human touch. The goal is a dashboard that feels like a luxury instrument panel — every element earns its place, nothing is decorative. Data is the hero.
Core principles:
Quiet confidence — no flashy gradients, no glow effects, no visual noise
Information density without clutter — achieved through whitespace and hierarchy, not by removing data
Every pixel of color has meaning — green means up/good, red means down/bad, accent means interactive
The interface should feel "fast" visually — sharp type, crisp borders, no rounded-to-oblivion pill shapes

2. Color System
All colors are defined as CSS custom properties on :root and [data-theme="light"]. The app defaults to dark. Use oklch() color space for perceptual uniformity where possible, with hex fallbacks.
2.1 Dark Theme (Default)
:root, [data-theme="dark"] {
  /* Backgrounds — a 5-step grayscale ladder */
  --bg-base:        #09090B;    /* App background, deepest layer */
  --bg-raised:      #111113;    /* Sidebar background */
  --bg-surface:     #18181B;    /* Cards, panels, main content area */
  --bg-overlay:     #1F1F23;    /* Dropdowns, modals, popovers */
  --bg-hover:       #27272A;    /* Hover state on interactive surfaces */

  /* Borders — barely visible, just enough structure */
  --border-subtle:  #1E1E22;    /* Card edges, dividers between sections */
  --border-default: #27272A;    /* Input borders, table dividers */
  --border-strong:  #3F3F46;    /* Focused inputs, active states */

  /* Text — 4-level hierarchy */
  --text-primary:   #FAFAFA;    /* Headlines, metric values, primary labels */
  --text-secondary: #A1A1AA;    /* Body text, descriptions, secondary labels */
  --text-tertiary:  #71717A;    /* Timestamps, captions, disabled text */
  --text-ghost:     #52525B;    /* Placeholder text, very low emphasis */

  /* Accent — a cool violet, used ONLY for interactive elements */
  --accent:         #8B5CF6;    /* Primary buttons, active nav items, links */
  --accent-hover:   #7C3AED;    /* Button hover */
  --accent-muted:   rgba(139, 92, 246, 0.12);  /* Accent backgrounds (active nav pill) */

  /* Semantic — meaning-carrying colors */
  --positive:       #22C55E;    /* Revenue up, subscribers gained, tasks completed */
  --positive-muted: rgba(34, 197, 94, 0.12);   /* Positive badge background */
  --negative:       #EF4444;    /* Churn, revenue down, overdue tasks */
  --negative-muted: rgba(239, 68, 68, 0.12);   /* Negative badge background */
  --warning:        #EAB308;    /* Approaching limits, sync issues */
  --warning-muted:  rgba(234, 179, 8, 0.12);
  --info:           #3B82F6;    /* Neutral informational */
  --info-muted:     rgba(59, 130, 246, 0.12);

  /* Chart palette — 7 distinct colors for multi-series charts */
  --chart-1:        #8B5CF6;    /* Violet (primary/accent) */
  --chart-2:        #3B82F6;    /* Blue */
  --chart-3:        #22C55E;    /* Green */
  --chart-4:        #F59E0B;    /* Amber */
  --chart-5:        #EC4899;    /* Pink */
  --chart-6:        #06B6D4;    /* Cyan */
  --chart-7:        #F97316;    /* Orange */

  /* Shadows — very subtle, mainly for overlays */
  --shadow-sm:      0 1px 2px rgba(0,0,0,0.3);
  --shadow-md:      0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg:      0 8px 24px rgba(0,0,0,0.5);
}

2.2 Light Theme
[data-theme="light"] {
  --bg-base:        #FAFAFA;
  --bg-raised:      #F4F4F5;
  --bg-surface:     #FFFFFF;
  --bg-overlay:     #FFFFFF;
  --bg-hover:       #F4F4F5;

  --border-subtle:  #E4E4E7;
  --border-default: #D4D4D8;
  --border-strong:  #A1A1AA;

  --text-primary:   #09090B;
  --text-secondary: #52525B;
  --text-tertiary:  #71717A;
  --text-ghost:     #A1A1AA;

  --accent:         #7C3AED;
  --accent-hover:   #6D28D9;
  --accent-muted:   rgba(124, 58, 237, 0.08);

  --positive:       #16A34A;
  --positive-muted: rgba(22, 163, 74, 0.08);
  --negative:       #DC2626;
  --negative-muted: rgba(220, 38, 38, 0.08);
  --warning:        #CA8A04;
  --warning-muted:  rgba(202, 138, 4, 0.08);
  --info:           #2563EB;
  --info-muted:     rgba(37, 99, 235, 0.08);

  --chart-1:        #7C3AED;
  --chart-2:        #2563EB;
  --chart-3:        #16A34A;
  --chart-4:        #D97706;
  --chart-5:        #DB2777;
  --chart-6:        #0891B2;
  --chart-7:        #EA580C;

  --shadow-sm:      0 1px 2px rgba(0,0,0,0.05);
  --shadow-md:      0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg:      0 8px 24px rgba(0,0,0,0.12);
}

2.3 Color Rules (Non-Negotiable)
Never use pure black (#000) or pure white (#FFF) for backgrounds or text. The darkest bg is #09090B, the lightest text is #FAFAFA. This avoids harsh vibration between elements.
Accent violet is reserved for interactivity. If something is violet, it must be clickable. Never use it for decoration.
Semantic colors only appear next to data. Green/red trend indicators are always paired with a number. Never use them as decorative accents.
Chart colors are assigned in order and remain consistent across all pages. Stripe is always chart-1 (violet), YouTube is always chart-2 (blue), etc.

3. Typography
Two fonts only. No exceptions.
3.1 Font Stack
/* Body / UI — clean, professional, slightly geometric */
--font-sans: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

/* Metrics / Numbers / Code — monospaced for alignment */
--font-mono: "Geist Mono", "JetBrains Mono", "SF Mono", "Fira Code", monospace;

Why Geist? Created by Vercel — built specifically for developer tools and dashboards. It has the geometric precision of Inter but with more personality in its curves. It pairs perfectly with its monospace sibling, and since we're deploying on Vercel, it's already optimized.
Load via next/font/google or the Geist npm package for zero-layout-shift loading.
3.2 Type Scale (8px baseline grid)
Every font size and line height snaps to a 4px increment.
Token
Size
Weight
Line Height
Letter Spacing
Usage
display
36px
600
40px
-0.02em
Page titles ("Overview", "Revenue")
heading-1
24px
600
32px
-0.015em
Section headings
heading-2
18px
600
24px
-0.01em
Card titles, subsection heads
heading-3
14px
600
20px
0
Table column headers, small headings
body
14px
400
20px
0
Default body text, descriptions
body-small
13px
400
18px
0
Secondary descriptions, help text
caption
12px
500
16px
0.01em
Timestamps, badges, labels
overline
11px
600
16px
0.06em
Uppercase section labels ("REVENUE", "AUDIENCE") — always text-transform: uppercase
metric-lg
32px
700
36px
-0.02em
Hero KPI values (MRR, subscriber count) — uses --font-mono
metric-md
24px
600
28px
-0.01em
Secondary KPI values — uses --font-mono
metric-sm
18px
600
24px
-0.01em
Inline metric values — uses --font-mono

3.3 Type Rules
Metric values always use --font-mono. Numbers must align vertically in tables and cards. Monospace guarantees this.
Use tabular numerals (font-variant-numeric: tabular-nums) on all number displays so digits don't jump when values change.
Trend percentages ("+12.4%") inherit the semantic color of their direction — green for positive, red for negative.
Never bold body text for emphasis. Use color hierarchy or layout position instead. Bold is reserved for headings and metric values.
Truncate, don't wrap on card labels. Use text-overflow: ellipsis on any label that might exceed its container.

4. Spacing & Grid System
4.1 Spacing Scale (4px base)
4px   — micro: gap between icon and label
8px   — tight: padding inside badges, inline spacing
12px  — compact: gap between related items in a group
16px  — default: padding inside cards, gap between form fields
20px  — comfortable: gap between card sections
24px  — spacious: gap between cards in a grid
32px  — section: gap between major page sections
48px  — page: top/bottom page padding

4.2 Layout Grid
The overall page uses a fixed sidebar + fluid main content area:
┌────────────────────────────────────────────────────┐
│ 240px fixed  │  Fluid (min 720px, max 1440px)      │
│  sidebar     │  with 32px horizontal padding        │
│              │                                      │
│              │  Content area uses a 12-column        │
│              │  CSS grid with 24px gap               │
│              │                                      │
│              │  KPI cards:  span 3 cols (4 per row)  │
│              │  Charts:     span 6 cols (2 per row)  │
│              │  Full-width: span 12 cols              │
│              │  Tables:     span 12 cols              │
└────────────────────────────────────────────────────┘

4.3 Card Grid
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

.kpi-card    { grid-column: span 3; }    /* 4 across */
.chart-card  { grid-column: span 6; }    /* 2 across */
.wide-card   { grid-column: span 8; }    /* Chart + sidebar stat */
.full-card   { grid-column: span 12; }   /* Tables, timelines */

Responsive breakpoints:
≥1280px — Full 12-column grid
1024–1279px — KPI cards become span 4 (3 per row), charts span 12
768–1023px — Sidebar collapses to 56px (icons only), KPI cards span 6 (2 per row)
<768px — Sidebar becomes bottom nav, everything stacks to single column

5. Component Specifications
5.1 Sidebar Navigation
Width:           240px (expanded), 56px (collapsed on tablet)
Background:      var(--bg-raised)
Border right:    1px solid var(--border-subtle)
Padding:         16px vertical, 12px horizontal

Structure (top to bottom):
Logo area (48px height) — "◆ albertolgaard.com" in heading-3 weight, --text-primary
8px spacer
Primary nav items — grouped logically:
Overview
Divider (1px --border-subtle, 8px margin top/bottom)
Revenue (Stripe icon)
Content (expandable: YouTube, Instagram, X)
Ads (Meta icon)
Community (expandable: Skool Free, Skool Paid)
Tasks (ClickUp icon)
Calendar (Google Calendar icon)
Finances (expandable: Mercury, Revolut)
Health (Whoop icon)
Support (expandable: BuildMyAgent, The 1 Percent)
Email (Kit / ConvertKit)
Partnerships (manual)
Coach (AI — Claude Opus + Sonnet)
Bottom section (pinned to bottom):
Divider
⌘K Query
Settings
Theme toggle (sun/moon icon)
Nav item styling:
Height:          36px
Padding:         8px 12px
Border radius:   6px
Font:            body (14px/400)
Color:           var(--text-secondary)
Icon size:       16px, 8px gap to label
Transition:      background 150ms ease, color 150ms ease

Hover:           background: var(--bg-hover), color: var(--text-primary)
Active/Current:  background: var(--accent-muted), color: var(--accent), font-weight: 500

Expandable sections: Caret icon rotates 90° on expand. Children indent 28px (icon width + gap). Use max-height transition for smooth open/close (200ms ease-out).
5.2 Page Header
Height:          64px
Background:      var(--bg-surface)
Border bottom:   1px solid var(--border-subtle)
Padding:         0 32px
Display:         flex, align-items: center, justify-content: space-between

Left side:
Page title: display (36px/600) in --text-primary
Right side:
Sync status: caption (12px) in --text-tertiary — "Last synced 3 min ago"
Sync button: ghost button with refresh icon, 32px height
The sync icon subtly rotates (1 full turn, 800ms ease) when a sync is in progress
5.3 KPI Metric Card
The most important component. This is what the user sees 90% of the time.
Background:      var(--bg-surface)
Border:          1px solid var(--border-subtle)
Border radius:   8px
Padding:         20px
Min height:      120px
Transition:      border-color 150ms ease

Hover:           border-color: var(--border-default)

Internal layout (stacked):
┌──────────────────────────────────┐
│  OVERLINE LABEL          ○ icon  │  ← 11px uppercase, --text-tertiary, icon 16px --text-ghost
│                                  │  ← 8px gap
│  $4,218                          │  ← metric-lg (32px mono 700), --text-primary
│                                  │  ← 8px gap
│  ▲ +12.4% vs last month         │  ← caption (12px), positive green or negative red
│                                  │     Arrow is a 10px inline SVG icon
│  ───── sparkline ─────           │  ← Optional: 32px tall sparkline, --chart-1 stroke, no axes
└──────────────────────────────────┘

Trend indicator behavior:
Up + good (revenue grows): ▲ icon + --positive color
Down + good (churn drops): ▼ icon + --positive color
Up + bad (churn increases): ▲ icon + --negative color
Down + bad (revenue drops): ▼ icon + --negative color
Flat (< 0.5% change): → icon + --text-tertiary color
Number formatting:
Currency: $4,218 (no cents unless < $100, then show $42.18)
Large numbers: 12.4K (over 10,000), 1.2M (over 1,000,000)
Percentages: 2.1% (1 decimal)
Counts: 142 (comma-separated at thousands)
All numbers use tabular-nums for alignment
Loading state: Pulsing skeleton. Replace the value area with a rounded rect (--bg-hover) that pulses opacity between 0.5 and 1.0 on a 1.5s ease-in-out loop. Skeleton shape should match the approximate size of the content (wider for values, narrower for labels).
5.4 Chart Card
Background:      var(--bg-surface)
Border:          1px solid var(--border-subtle)
Border radius:   8px
Padding:         24px

Header row:
┌──────────────────────────────────────────────────────┐
│  Revenue Over Time                    ○ 7d ○ 30d ●90d│
│                                                       │
│  Chart area (Recharts)                                │
│  - Area fill: var(--chart-1) at 8% opacity            │
│  - Line stroke: var(--chart-1) at 2px                 │
│  - Grid lines: var(--border-subtle), dashed           │
│  - Axis labels: caption (12px), var(--text-ghost)     │
│  - Tooltip: var(--bg-overlay) bg, --shadow-md         │
│  - Dot on hover: 4px radius, var(--chart-1) fill      │
│  - Crosshair: 1px dashed var(--border-default)        │
│                                                       │
│  Height: 240px (fixed)                                │
└──────────────────────────────────────────────────────┘

Time range pills:
Height:          28px
Padding:         4px 10px
Border radius:   6px
Font:            caption (12px/500)
Gap:             4px between pills

Default:         color: var(--text-tertiary), bg: transparent
Hover:           bg: var(--bg-hover)
Active:          bg: var(--accent-muted), color: var(--accent)

Recharts theme overrides:
All cartesian grids use strokeDasharray="4 4" with --border-subtle
Hide X/Y axis lines, keep only tick labels
Tooltip has 8px border radius, 12px padding, --shadow-md
Area charts use a gradient fill that fades from 12% opacity at top to 0% at bottom
Line charts use 2px stroke width
Animate on mount: isAnimationActive={true} with 800ms duration and ease-out easing
5.5 Data Table
Background:      var(--bg-surface)
Border:          1px solid var(--border-subtle)
Border radius:   8px
Overflow:        hidden (so border-radius clips the table edges)

Table structure:
Header row:      bg: var(--bg-raised)
                 height: 40px
                 font: heading-3 (14px/600), var(--text-tertiary), uppercase? No — sentence case
                 padding: 0 16px
                 border-bottom: 1px solid var(--border-subtle)
                 Sortable columns: show ▲▼ icon (12px, --text-ghost) on hover

Body rows:       height: 48px
                 padding: 0 16px
                 font: body (14px/400), var(--text-secondary)
                 border-bottom: 1px solid var(--border-subtle)
                 LAST row: no border-bottom

                 Hover: bg: var(--bg-hover)
                 Transition: background 100ms ease

Number cells:    font: --font-mono, tabular-nums, text-align: right
                 color: var(--text-primary) for primary values

5.6 Theme Toggle
Located at the bottom of the sidebar. A simple icon button:
Size:            36px × 36px
Border radius:   6px
Background:      transparent
Color:           var(--text-secondary)
Hover:           bg: var(--bg-hover), color: var(--text-primary)

Dark mode active: Show a sun icon (☀️ lucide Sun, 16px)
Light mode active: Show a moon icon (🌙 lucide Moon, 16px)
On click: icon cross-fades (150ms) while data-theme attribute toggles on <html>
Persist preference to localStorage key theme
On initial load: check localStorage, then fall back to prefers-color-scheme media query
Transition the entire page: transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease on * (use will-change sparingly)
5.7 Command Bar (⌘K Query)
A centered modal overlay, inspired by Spotlight / Raycast / Linear's command palette.
Trigger:         Cmd+K (Mac) / Ctrl+K (Windows), or sidebar button
Overlay:         bg: rgba(0,0,0,0.5), backdrop-filter: blur(8px)
Modal:           width: 560px, max-height: 480px
                 bg: var(--bg-overlay)
                 border: 1px solid var(--border-default)
                 border-radius: 12px
                 shadow: var(--shadow-lg)
                 top: 20% of viewport

Animation:       Fade in overlay (150ms), scale modal from 0.98→1.0 + fade (150ms ease-out)

Input area:
┌──────────────────────────────────────────────┐
│  🔍  Ask anything about your business...     │  ← 48px height, 16px padding
│─────────────────────────────────────────────│     font: body (14px), --text-primary
│                                              │     placeholder: --text-ghost
│  Claude is thinking...                       │     icon: 18px, --text-ghost
│  ████████░░░░░░░░░░░░                        │  ← Animated progress bar (--accent)
│                                              │
│  [Response area — scrollable]                │  ← font: body, --text-secondary
│  Your MRR grew 12.4% month over month,       │     max-height: 320px, overflow-y: auto
│  driven primarily by 18 new subscriptions... │     Padding: 16px
│                                              │
│  ESC to close                   ⏎ to ask     │  ← caption (12px), --text-ghost
└──────────────────────────────────────────────┘

5.8 Buttons
Three tiers only:
Primary (one per page max):
bg: var(--accent)  →  hover: var(--accent-hover)
color: white
height: 36px, padding: 0 16px, border-radius: 6px
font: body (14px/500)
transition: background 150ms ease

Secondary/Ghost (most common):
bg: transparent  →  hover: var(--bg-hover)
color: var(--text-secondary)  →  hover: var(--text-primary)
border: 1px solid var(--border-default)
height: 36px, padding: 0 14px, border-radius: 6px

Danger (destructive actions):
bg: var(--negative-muted)  →  hover: var(--negative)
color: var(--negative)  →  hover: white
height: 36px, padding: 0 14px, border-radius: 6px

5.9 Badges / Status Chips
Used for sync status, platform indicators, trend labels.
height: 22px, padding: 0 8px, border-radius: 4px
font: caption (12px/500)
display: inline-flex, align-items: center, gap: 4px

Variants:
Success: bg: --positive-muted, color: --positive
Error: bg: --negative-muted, color: --negative
Warning: bg: --warning-muted, color: --warning
Neutral: bg: --bg-hover, color: --text-secondary
5.10 Platform Icons
Each platform gets a consistent 16px icon in the sidebar and a 20px version on their detail pages. Use official brand icons (from simple-icons or custom SVGs) rendered in --text-secondary in the sidebar (monochrome), and in their actual brand color on their detail page headers:
Stripe:       #635BFF
YouTube:      #FF0000
Instagram:    #E4405F
X:            var(--text-primary) (black in light, white in dark)
Meta/FB Ads:  #0081FB
ClickUp:      #7B68EE
Google Cal:   #4285F4
Mercury:      #6933FF
Revolut:      #0075EB
Whoop:        #44D62C
Help Scout:   #1292EE
Kit:          #FB6970
Skool:        #1D1D1F

5.11 Calendar Event Item (Overview Widget)
Used in the "Today's Schedule" section on the Overview page. A compact horizontal row for each event.
┌───────────────────────────────────────────────────────────┐
│  9:00 AM   ●  Team standup                30 min   Meet → │
└───────────────────────────────────────────────────────────┘

Height:          44px
Padding:         12px 16px
Border bottom:   1px solid var(--border-subtle)
LAST item:       no border
Display:         flex, align-items: center

Element breakdown:
Time:            font-mono, caption (12px/500), var(--text-tertiary), width: 72px fixed
Dot:             6px circle, var(--accent) or event color, 12px gap to title
Title:           body (14px/400), var(--text-primary), flex: 1, truncate with ellipsis
Duration:        caption (12px/400), var(--text-tertiary), 16px gap
Meet link:       caption (12px/500), var(--accent), hover: underline, only if event has meetLink

If event is happening NOW: the dot pulses (opacity animation), and the entire row gets a left border: 3px solid var(--accent) with left padding reduced by 3px to compensate
If event is past: title and time become --text-ghost (faded out)
Hover: background: var(--bg-hover), transition 100ms
5.12 Calendar Week View
Used on the dedicated Calendar page. A standard time-grid week view.
Background:      var(--bg-surface)
Border:          1px solid var(--border-subtle)
Border radius:   8px
Padding:         0 (edges handled by internal grid)

Structure:
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│      │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │ Sat  │ Sun  │  ← 40px header
│      │  24  │  25  │  26  │  27  │  28  │  1   │  2   │     caption, --text-secondary
├──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤     Today column: --text-primary + bold
│ 8 AM │      │      │      │      │      │      │      │     Today date: accent badge (circle)
│      │      │      │      │      │      │      │      │
│ 9 AM │      │ ████ │      │ ████ │      │      │      │  ← Event blocks
│      │      │ ████ │      │ ████ │      │      │      │     bg: var(--accent) at 15% opacity
│10 AM │      │      │      │      │      │      │      │     left border: 3px solid var(--accent)
│      │      │      │      │      │      │      │      │     border-radius: 4px
│11 AM │ ████ │      │      │      │      │      │      │     padding: 4px 8px
│      │ ████ │      │      │      │      │      │      │     font: caption (12px)
│12 PM │      │      │      │      │      │      │      │     title: --text-primary, truncate
└──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘     time: --text-secondary

Grid lines: 1px solid var(--border-subtle), horizontal hour lines only (no vertical lines between days — use padding/gap instead for cleaner look)
Time column: width: 56px, font-mono caption (12px), --text-ghost, right-aligned
Day columns: equal width (flex: 1), min-width 80px
Current time indicator: A horizontal line at the current time position — 2px solid var(--negative) (red) with a 6px dot on the left edge. Updates every minute.
Navigation bar (below the grid):
Height: 40px
Content: ← prev week | "Today" button (ghost) | next week →
Font: caption (12px/500)
"Today" resets to current week

5.13 Calendar Day Agenda
Used in the right panel of the Calendar page. A detailed list of today's events.
Date header:     heading-2 (18px/600), --text-primary
                 "Thursday, February 26"
                 margin-bottom: 16px

Event items (vertical list, more detail than overview widget):
┌──────────────────────────────────┐
│  9:00 AM – 9:30 AM              │  ← font-mono, caption, --text-tertiary
│  ● Team standup                  │  ← body (14px/500), --text-primary
│  30 min · Google Meet            │  ← body-small (13px/400), --text-secondary
│  Join →                          │  ← caption (12px/500), var(--accent), link
│                                  │  ← 12px gap to next event
│  11:00 AM – 12:00 PM            │
│  ● Client call — Acme           │
│  60 min · Zoom · 3 attendees    │
│  Join →                          │
└──────────────────────────────────┘

Each event block:
  padding: 12px 0
  border-bottom: 1px solid var(--border-subtle)
  Dot: 6px, colored by event calendar color (or --accent default)


6. Animation & Transitions
6.1 Principles
Every animation has a purpose. Transitions indicate state changes. Entrance animations establish context. Don't animate for fun.
Keep it fast. UI transitions: 100–200ms. Content animations: 300–500ms max. Nothing ever takes more than 800ms.
Easing: ease-out for entrances (elements arriving), ease-in for exits (elements leaving), ease for hover/state changes.
6.2 Specific Animations
Element
Trigger
Animation
Duration
Easing
KPI card values
Page load
Count up from 0 to value
600ms
ease-out
KPI sparklines
Page load
Draw stroke from left to right
800ms
ease-out
Chart lines/areas
Page load
Recharts default draw-in
800ms
ease-out
Page content
Route change
Fade in + 8px upward translate
200ms
ease-out
Sidebar nav hover
Hover
Background color fade
150ms
ease
Card hover
Hover
Border color lighten
150ms
ease
Modal
Open
Overlay fade + modal scale 0.98→1
150ms
ease-out
Modal
Close
Reverse of open
100ms
ease-in
Sync icon
Sync active
Rotate 360° continuous
800ms
linear, loop
Skeleton pulse
Loading
Opacity 0.5→1.0→0.5
1.5s
ease-in-out, loop
Theme switch
Toggle
Cross-fade icon + global bg/color transition
200ms
ease
Expandable nav
Click
Max-height from 0 to auto
200ms
ease-out
Tooltip
Hover (200ms delay)
Fade in + 4px upward translate
150ms
ease-out
Trend arrow
Value change
Subtle vertical bounce (2px)
300ms
ease-out

6.3 Staggered Entrance
On initial page load, KPI cards animate in with a stagger:
Card 1: 0ms delay
Card 2: 50ms delay
Card 3: 100ms delay
Card 4: 150ms delay
This creates a "cascade" effect that feels snappy but intentional. Use animation-delay or Framer Motion's staggerChildren.

7. Page Layouts
7.1 Overview Page (/)
This is the most important page — the daily glance.
┌─────────────────────────────────────────────────────────────────┐
│  Overview                                      Synced 3m ago ↻  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ☀️ Morning Brief — Feb 28, 2026              [Coach →]  │   │
│  │                                                           │   │
│  │  • MRR holding steady at $4,218 — 2 new customers        │   │
│  │  • 3 overdue ClickUp tasks — check VA assignments        │   │
│  │  • Yesterday's Insta reel is outperforming — repurpose   │   │
│  │    as a YouTube Short                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  REVENUE                                    ← overline label     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ $4,218   │  │ 2.1%     │  │ 142      │  │ $29.70   │        │
│  │ MRR      │  │ Churn    │  │ Customers │  │ ARPU     │        │
│  │ ▲ +12.4% │  │ ▼ -0.3%  │  │ ▲ +8     │  │ ▲ +$1.20 │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                     24px gap     │
│  AUDIENCE                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ 12.4K    │  │ 3,201    │  │ 8,442    │                      │
│  │ YouTube  │  │ Instagram│  │ X        │                      │
│  │ subs     │  │ followers│  │ followers│                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
│                                                                  │
│  CONTENT VELOCITY                                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Platform    Posts This Month    Avg/Week    Trend       │    │
│  │  YouTube     4 videos            1.0         → flat      │    │
│  │  Instagram   12 posts            3.0         ▲ +20%      │    │
│  │  X           31 tweets           7.8         ▲ +8%       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──── Revenue Trend (span 8) ─────┐  ┌── Quick Stats (4) ──┐  │
│  │  Area chart, 90 day MRR trend   │  │  FB Ads Spend: $1.2K│  │
│  │                                  │  │  ROAS: 3.2x         │  │
│  │                                  │  │  Skool Free: 2,340   │  │
│  │  Height: 280px                   │  │  Skool Paid: 186     │  │
│  │                                  │  │  My Tasks: 12        │  │
│  │                                  │  │  VA Tasks: 8         │  │
│  └──────────────────────────────────┘  │  Overdue: 3 ⚠        │  │
│                                         └─────────────────────┘  │
│                                                                  │
│  FINANCES                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ $24,180  │  │ $18,420  │  │ $12,840  │  │ $29,760  │        │
│  │ Mercury  │  │ Revolut  │  │ Expenses │  │ Income   │        │
│  │ balance  │  │ balance  │  │ (30d)    │  │ (30d)    │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                  │
│  SUPPORT                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                        │
│  │ 4        │  │ 2        │  │ 12 min   │                        │
│  │ Open     │  │ Pending  │  │ Avg Resp │                        │
│  │ tickets  │  │ tickets  │  │ Time     │                        │
│  └──────────┘  └──────────┘  └──────────┘                        │
│                                                                  │
│  HEALTH                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ 78%      │  │ 14.2     │  │ 7.4 hrs  │  │ 52ms     │        │
│  │ Recovery │  │ Strain   │  │ Sleep    │  │ HRV      │        │
│  │ 🟢 green │  │ today    │  │ last nite│  │          │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                  │
│  EMAIL MARKETING                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ 12,482   │  │ +318     │  │ 42.1%    │  │ 3.8%     │        │
│  │ Subscri- │  │ New subs │  │ Avg open │  │ Avg click│        │
│  │ bers     │  │ (30d)    │  │ rate     │  │ rate     │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                  │
│  PARTNERSHIPS                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ $2,450   │  │ 6        │  │ $408     │                      │
│  │ Revenue  │  │ Deals    │  │ Avg deal │                      │
│  │ this mo. │  │ this mo. │  │ size     │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
│                                                                  │
│  TODAY'S SCHEDULE (span 12)                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  9:00 AM  ● Team standup              30 min     Meet →   │  │
│  │ 11:00 AM  ● Client call — Acme        60 min     Zoom →   │  │
│  │  2:00 PM  ● Content review            45 min              │  │
│  │  4:30 PM  ● Investor prep             30 min     Meet →   │  │
│  │                                                            │  │
│  │  4 events · 2h 45m booked               View calendar →   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

7.2 Calendar Page (/dashboard/calendar)
A dedicated calendar view with a week overview and daily agenda.
┌─────────────────────────────────────────────────────────────────┐
│  📅 Calendar                                                     │
│  Google Calendar · your@email.com              ← body-small      │
│                                                                  │
│  ┌──── Week View (span 8) ──────────┐  ┌── Today (span 4) ──┐  │
│  │  Time column + 7 day columns     │  │  Day agenda list    │  │
│  │  Events as colored blocks        │  │  with full details  │  │
│  │  Height: 480px, scrollable       │  │                     │  │
│  │  ← prev    today    next →       │  │                     │  │
│  └───────────────────────────────────┘  └─────────────────────┘  │
│                                                                  │
│  ┌──── Upcoming (span 12) ──────────────────────────────────┐   │
│  │  Grouped by day, next 7 days                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

7.3 Platform Detail Page (e.g., /dashboard/revenue)
┌─────────────────────────────────────────────────────────────────┐
│  ● Revenue                                     Synced 3m ago ↻  │
│  Stripe data · MRR, churn, customers              ← body-small  │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ KPI 1    │  │ KPI 2    │  │ KPI 3    │  │ KPI 4    │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                  │
│  ┌───────────────────────── Chart ──────────────────────────┐   │
│  │  Full-width area chart, 280px tall                        │   │
│  │  Time range: 7d / 30d / 90d / 1y pills in top-right      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌───────────────────── History Table ──────────────────────┐   │
│  │  Date        MRR       Customers    Churn     Revenue     │   │
│  │  Feb 26      $4,218    142          2.1%      $180        │   │
│  │  Feb 25      $4,195    140          2.1%      $65         │   │
│  │  ...                                                       │   │
│  │                                     Show more ↓            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘


8. Iconography
Use Lucide React (lucide-react) exclusively. 16px default size, 1.5px stroke width.
Key icon mappings:
Overview:        LayoutDashboard
Revenue/Stripe:  CreditCard
YouTube:         Play (custom brand SVG preferred)
Instagram:       Camera (custom brand SVG preferred)
X:               AtSign (custom brand SVG preferred)
Facebook Ads:    Megaphone
ClickUp:         CheckSquare
Calendar:        CalendarDays
Finances:        Wallet
Mercury:         Building (or custom brand SVG)
Revolut:         Building2 (or custom brand SVG)
Health/Whoop:    Heart
Support:         Headphones
Email:           Mail
Partnerships:    Handshake
Coach:           Brain (or Sparkles)
Skool:           Users
Settings:        Settings
Query:           Search
Sync:            RefreshCw
Theme (dark):    Sun
Theme (light):   Moon
Trend up:        TrendingUp
Trend down:      TrendingDown
Trend flat:      ArrowRight
Expand:          ChevronRight (rotates to ChevronDown)

For platform brand icons in detail page headers, use custom SVGs from Simple Icons at 20px.

9. Implementation Notes
9.1 Tailwind Configuration
// tailwind.config.ts — extend with CSS variables
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: {
          base: 'var(--bg-base)',
          raised: 'var(--bg-raised)',
          surface: 'var(--bg-surface)',
          overlay: 'var(--bg-overlay)',
          hover: 'var(--bg-hover)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          DEFAULT: 'var(--border-default)',
          strong: 'var(--border-strong)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          ghost: 'var(--text-ghost)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          muted: 'var(--accent-muted)',
        },
        positive: { DEFAULT: 'var(--positive)', muted: 'var(--positive-muted)' },
        negative: { DEFAULT: 'var(--negative)', muted: 'var(--negative-muted)' },
        warning: { DEFAULT: 'var(--warning)', muted: 'var(--warning-muted)' },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        card: '8px',
        button: '6px',
        badge: '4px',
        modal: '12px',
      },
    },
  },
};

9.2 Theme Provider
// ThemeProvider.tsx — wraps the app
'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: 'dark', toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    const initial = stored || preferred;
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

9.3 Anti-Flash on Load
To prevent a white flash before the theme loads, add this <script> to <head> in your root layout (runs before React hydrates):
<script dangerouslySetInnerHTML={{ __html: `
  (function() {
    var t = localStorage.getItem('theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
  })();
`}} />


10. What to Avoid (Anti-Patterns)
These will make the dashboard look amateur instantly:
Colored card backgrounds. Cards are always --bg-surface with a subtle border. Never tint cards blue/green/purple.
Shadows on cards in dark mode. Shadows are invisible on dark backgrounds. Use 1px borders instead.
Rounded pill shapes everywhere. Max border-radius: 12px (modals). Cards are 8px, buttons 6px, badges 4px. Nothing more.
Gradient backgrounds. Zero gradients anywhere except chart area fills (which fade to transparent).
Emoji as icons. Use Lucide SVG icons exclusively. Emoji breaks the professional tone.
Thick borders. All borders are 1px. Never 2px+ unless it's a focus ring for accessibility.
More than 2 fonts. Geist + Geist Mono. That's it.
Saturated colors on large areas. Accent/semantic colors only appear on small elements (text, badges, chart lines). Never as card or section backgrounds.
Inconsistent number formatting. All numbers formatted identically across every page via shared utility functions.
Chart gridline clutter. Use dashed lines at low opacity. Never solid gridlines. Hide axis lines entirely.

