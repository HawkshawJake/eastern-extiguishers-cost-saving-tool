# Eastern Extinguishers — Design System
## Styles Reference for Vibe Coding

Based on the live Eastern Extinguishers website branding.

---

## Logo

- **File:** Eastern Extinguishers wordmark (white, text-only with flame icon)
- **ALWAYS** place the logo on a **red background** — never on white, cream, or dark. The logo is designed for the red header bar only.
- Use SVG if available, PNG fallback.
- In the app: header bar is full-width red (`--color-red`), logo sits left-aligned with padding.

```html
<!-- Always wrap in red container -->
<header class="bg-brand-red px-6 py-4">
  <img src="/logo-white.svg" alt="Eastern Extinguishers" class="h-10" />
</header>
```

---

## Colour Palette

Extracted from the live Eastern Extinguishers site:

```css
:root {
  /* Primary brand */
  --color-red:        #B8241C;   /* Header red — primary brand colour */
  --color-red-dark:   #8F1C15;   /* Hover states, pressed */
  --color-red-light:  #D63028;   /* Accent, highlights */

  /* Event/accent colours (from HS Event banner) */
  --color-yellow:     #FFD600;   /* Accent highlight — use sparingly */
  --color-black:      #0A0A0A;   /* Headlines, dark sections */

  /* Neutrals */
  --color-dark:       #1A1A1A;   /* Dark containers / results hero */
  --color-mid:        #4A4A4A;   /* Body text */
  --color-grey:       #8E8E8E;   /* Secondary text, placeholders */
  --color-border:     #E4E4E4;   /* Input borders, dividers */
  --color-bg:         #FAFAFA;   /* Page background */
  --color-white:      #FFFFFF;   /* Cards, inputs */

  /* Functional */
  --color-green:      #2E7D32;   /* CO2 / environmental metric */
  --color-green-light:#E8F5E9;   /* CO2 badge background */
}
```

### Usage Rules
- **Red (`#B8241C`):** Header bar, primary CTA buttons, hero saving number
- **Black (`#0A0A0A`):** Headlines (uppercase, bold)
- **Yellow (`#FFD600`):** Use sparingly ◆ only for accent callouts or event-style graphics. Not for primary UI.
- **White:** Body background, cards, inputs
- **Dark (`#1A1A1A`):** Only for the results hero card background (dramatic reveal)

---

## Typography

Their site uses a **bold, condensed sans-serif for headlines** and a clean humanist sans-serif for body text. Closest Google Fonts match:

```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-heading: 'Barlow Condensed', sans-serif;   /* Headlines, CTAs, nav */
  --font-body:    'Inter', sans-serif;               /* Body, inputs, labels */
}
```

### Type Scale

```css
/* Headlines — always UPPERCASE */
.hero-title    { font: 900 3.5rem/0.95 var(--font-heading); text-transform: uppercase; letter-spacing: -0.01em; color: var(--color-black); }
.page-title    { font: 800 2.25rem/1.05 var(--font-heading); text-transform: uppercase; color: var(--color-black); }
.section-title { font: 700 1.25rem/1.2 var(--font-heading); text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-black); }

/* Body */
.body-large    { font: 400 1.125rem/1.6 var(--font-body); color: var(--color-mid); }
.body          { font: 400 1rem/1.6 var(--font-body); color: var(--color-mid); }
.body-small    { font: 400 0.875rem/1.5 var(--font-body); color: var(--color-grey); }
.label         { font: 600 0.75rem/1 var(--font-body); text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-grey); }

/* Nav / buttons use heading font */
.nav-link      { font: 600 0.95rem/1 var(--font-body); color: var(--color-white); }
.btn-text      { font: 700 0.95rem/1 var(--font-heading); text-transform: uppercase; letter-spacing: 0.06em; }
```

---

## Tailwind Config

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      brand: {
        red:        '#B8241C',
        'red-dark': '#8F1C15',
        'red-light':'#D63028',
        yellow:     '#FFD600',
        black:      '#0A0A0A',
        dark:       '#1A1A1A',
      },
      eco: {
        green:      '#2E7D32',
        light:      '#E8F5E9',
      }
    },
    fontFamily: {
      heading: ['Barlow Condensed', 'sans-serif'],
      body:    ['Inter', 'sans-serif'],
    },
  }
}
```

---

## Header Bar

The signature element of Eastern's brand ◆ full-width red bar with white logo.

```tsx
<header className="bg-brand-red">
  <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
    <img src="/logo-white.svg" alt="Eastern Extinguishers" className="h-9" />
    <span className="text-white/70 font-body text-sm">Step 2 of 3</span>
  </div>
</header>
```

---

## Component Patterns

### Primary Button (Red)
```tsx
<button className="
  bg-brand-red hover:bg-brand-red-dark
  text-white font-heading font-bold uppercase tracking-wider
  py-4 px-8 rounded-sm
  transition-colors duration-150
  w-full md:w-auto
">
  Calculate My Savings
</button>
```

### Secondary Button (Ghost)
```tsx
<button className="
  bg-transparent hover:bg-brand-red hover:text-white
  text-brand-red border-2 border-brand-red
  font-heading font-bold uppercase tracking-wider
  py-4 px-8 rounded-sm
  transition-colors duration-150
">
  Recalculate
</button>
```

### Input Field
```tsx
<input className="
  w-full bg-white
  border border-gray-300 focus:border-brand-red
  rounded-sm px-4 py-3
  font-body text-base
  focus:outline-none focus:ring-2 focus:ring-brand-red/20
  transition-colors
" />
```

### Number Input (Quantity)
- `type="number"` with `min="0"`
- `inputMode="numeric"` for mobile number keypad
- Width: fixed 88px on desktop, full-width on mobile
- Right-align the value
- On focus, select all text so user types over "0"

### Card
```tsx
<div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
  {/* content */}
</div>
```

### Results Hero Card
```tsx
<div className="bg-brand-dark rounded-md p-8 text-center">
  <p className="font-body text-white/60 uppercase tracking-widest text-sm mb-4">
    You Could Save
  </p>
  <p className="font-heading font-black text-6xl text-brand-red-light leading-none">
    £130,829
  </p>
  <p className="font-body text-white/80 mt-3">over 8 years</p>
</div>
```

### CO2 Badge
```tsx
<div className="bg-eco-light border border-eco-green/30 rounded-md p-5 flex items-start gap-3">
  <LeafIcon className="text-eco-green flex-shrink-0" />
  <div>
    <p className="font-heading font-bold uppercase text-eco-green text-sm tracking-wide">
      CO2 Reduction
    </p>
    <p className="font-body text-2xl font-semibold text-brand-black mt-1">
      2,988 kg CO2e saved
    </p>
    <p className="body-small mt-1">71.6% reduction vs Steel</p>
  </div>
</div>
```

---

## Layout

### Container
```css
.container { max-width: 720px; margin: 0 auto; padding: 0 1.25rem; }
```

### Page Structure
```tsx
<div className="min-h-screen bg-gray-50">
  <Header />                       {/* red bar with logo */}
  <main className="container py-8 md:py-12">
    {/* screen content */}
  </main>
</div>
```

### Spacing Scale
Use Tailwind's default (multiples of 4px). Common values: 2, 3, 4, 6, 8, 12, 16.

---

## Screen-Specific Layouts

### Screen 1 — Welcome
```tsx
<main className="container py-12 md:py-20">
  {/* Black headline, matching the P50 FIRE EXTINGUISHERS style on their site */}
  <h1 className="font-heading font-black text-4xl md:text-5xl uppercase text-center text-brand-black mb-4">
    Cost Savings Calculator
  </h1>
  <p className="body-large text-center max-w-xl mx-auto mb-10">
    See how much your business could save by switching to our P50 fire extinguishers.
  </p>

  <div className="bg-white rounded-md border border-gray-200 p-6 md:p-8 max-w-lg mx-auto">
    <label className="label block mb-2">Company Name</label>
    <input type="text" className="input mb-5" />

    <label className="label block mb-2">Your Industry</label>
    <select className="input mb-6">...</select>

    <button className="btn-primary w-full">Get Started</button>
  </div>
</main>
```

### Screen 2 — Inventory Input
- White card containing two columns: Steel (left) | P50 (right)
- On mobile, stack: Steel section first (full inventory), then P50 section
- Group rows by category with `section-title` dividers: CO2 / Water / Foam / Powder / Wet Chemical / Water Mist
- Row layout: `[Type label][quantity input]`
- Sticky footer with "Calculate Savings" red button

### Screen 3 — Results
- Dark hero card at top with huge red saving number
- Below: 3-row breakdown table (white card)
  - Current 8-year cost
  - P50 8-year cost
  - Total saving + % saving
- CO2 green badge
- Two CTAs stacked on mobile: "Recalculate" (ghost) + "Get My Report" (primary red)

---

## Icons

Use [Lucide React](https://lucide.dev):
- `<Flame />` ◆ branding accent
- `<TrendingDown />` ◆ savings
- `<Leaf />` ◆ CO2 badge
- `<Calculator />` ◆ calculate CTA
- `<ArrowLeft />` ◆ back navigation

Always match icon colour to text colour in context.

---

## Mobile Considerations

- Min tap target: 44px
- Input font-size: 16px+ (prevents iOS zoom)
- Quantity inputs: `inputMode="numeric"` for the number keypad
- Stack everything vertically below 768px
- Results hero number: minimum 2.5rem on mobile, 4rem on desktop
- Header stays full-width red on all sizes

---

## Don'ts

- Don't put the logo on any background other than red
- Don't use purple, blue, or cool colours ◆ stay within the red/black/white/yellow palette
- Don't use gradient backgrounds ◆ Eastern's brand is flat, solid colour
- Don't soften the red with transparency on primary elements ◆ it's a confident, bold red
- Don't use emojis in the UI (except the `<Flame />` icon sparingly)
- Don't use lowercase headlines ◆ always UPPERCASE in heading font