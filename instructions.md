# Eastern Extinguishers Cost Savings Calculator
## Project Instructions

### What This Is
A web app for Eastern Extinguishers to use at trade conventions (HSE 2025). Visitors enter their current fire extinguisher inventory and instantly see how much they'd save by switching to Eastern's P50 composite extinguishers. Email capture at the end builds a lead list for Craig.

### Tech Stack
- **Framework:** Next.js (React) — App Router
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (free tier)
- **Email capture (Phase 2):** Vercel API route → Resend

### App Structure
```
/
├── app/
│   ├── page.tsx              ← Screen 1: Welcome + industry select
│   ├── calculator/
│   │   └── page.tsx          ← Screen 2: Inventory input
│   ├── results/
│   │   └── page.tsx          ← Screen 3: Results display
│   └── api/
│       └── submit/route.ts   ← Phase 2: Email capture endpoint
├── lib/
│   └── calculations.ts       ← ALL calculation logic (see calculations.md)
├── data/
│   └── extinguishers.ts      ← Extinguisher type data and pricing constants
└── components/
    └── ...                   ← Shared UI components
```

### User Flow
1. **Screen 1 — Welcome**
   - Eastern Extinguishers logo + headline
   - Company name field (optional, used on results screen)
   - Industry dropdown (Banking / Catering / Education / Food / Health / Industrial / Residential Care / Retail / Other)
   - "Calculate My Savings" CTA

2. **Screen 2 — Inventory Input**
   - Two sections: Steel Extinguishers (what they have now) | P50 Equivalents (what EE recommends)
   - Each row: extinguisher type name + quantity input
   - "I don't know — use 0" is fine, inputs default to 0
   - P50 section is pre-filled based on Steel inputs using the mapping table (see calculations.md)
   - User can override P50 quantities manually
   - "Calculate" button → Screen 3

3. **Screen 3 — Results**
   - Hero: "You could save £X over 8 years"
   - Breakdown table: Current 8yr cost vs P50 8yr cost vs Saving vs % Saving
   - CO2 reduction badge
   - "Recalculate" button → back to Screen 2
   - "Get your full report" CTA → email capture form (Phase 2, can be stub for now)

### Phase 1 (Build Now)
- Screens 1, 2, 3
- All calculations in-browser (no backend)
- No email capture yet — results screen CTA can say "Coming soon" or just be hidden

### Phase 2 (Add Later)
- Email capture form on Screen 3
- Vercel API route POSTs submission data to Craig's email via Resend
- Resend free tier = 100 emails/day, plenty for a convention

### State Management
Pass data between screens using URL query params or React context. For simplicity, URL params work fine for a convention tool (no login, no persistence needed).

Suggested approach: store the full inventory as a JSON-encoded URL param or use a simple React context/provider wrapping the layout.

### Mobile First
This will be used on tablets and phones at a convention. Design for touch — large inputs, big tap targets, readable at arm's length.

### Key Constraints
- No backend needed for calculations (all JS)
- No database
- Keep it fast — loads from Vercel CDN instantly
- Inputs should never produce errors — default to 0 if blank