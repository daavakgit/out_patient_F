# Aura — AI-Native Email Client Landing Page

A premium, cinematic, dark-mode landing page for **Aura**, the AI-native email client.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite**
- **Tailwind CSS**
- **motion** (`motion/react` v12+)
- **lucide-react**

## Design Features

1. **Global Background Video**: Looping fullscreen CloudFront MP4 with dark overlay (`#0c0c0c`).
2. **Fixed Guide Lines**: 36rem container edge markers on desktop (`inset-y-0 left-1/2 ± 36rem`).
3. **SVG Noise Filters (`#c3-noise`)**: Dual noise filters for the shiny text gradient and pricing watermark.
4. **Shiny Headline**: 6s infinite background-position shift with animated cyan-to-navy gradient.
5. **macOS-Style Menu Bar**: Realistic OS strip with Apple logo, Aura title, menus, and system clock.
6. **Interactive Inbox Mockup**:
   - macOS traffic lights (red, yellow, green)
   - Sidebar with "Compose with Aura" and color-coded labels
   - Real-time clickable message list (6 items)
   - Dynamic message reader with "Summary by Aura" AI badges
7. **Feature Triage**: 2-column showcase with real-time status pill and categorized sub-cards (Priority, Follow-up, Updates, Archived).
8. **Logo Cloud**: Linear, Vercel, Figma, Stripe, Ramp, Notion, Loom, Arc.
9. **Testimonials**: 3-column liquid-glass quotes from Mercury, Cohere, and Lunar.
10. **Pricing Matrix**:
    - Giant SVG watermark backdrop
    - Monthly / Yearly pricing toggle
    - Free ($0), Standard ($9.99/m or $99.99/y), and Pro ($19.99/m or $199.99/y) tiers
11. **Final Call-to-Action**: Liquid-glass card with radial glow overlay and Apple download button.

## Getting Started

```bash
cd aura
npm install
npm run dev
```

Server will run at `http://localhost:5173`.
