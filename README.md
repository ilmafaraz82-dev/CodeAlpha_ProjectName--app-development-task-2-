# Luminary — Random Quote Generator

A production-quality, single-page quote generator with a glassmorphism UI,
animated gradient canvas backdrop, API integration, and keyboard support.

## 📁 File Structure

```
quote-generator/
├── index.html          — markup & semantic structure
├── css/
│   └── style.css       — all styling (glassmorphism, animations, responsive)
└── js/
    ├── quotes.js       — 20 curated local quotes with colour palettes
    ├── canvas.js       — animated gradient background (canvas API)
    └── app.js          — all application logic
```

## 🚀 Running Locally

### Option 1 — VS Code Live Server (recommended)
1. Open the `quote-generator/` folder in VS Code
2. Install the **Live Server** extension
3. Right-click `index.html` → **Open with Live Server**

### Option 2 — Python HTTP server
```bash
cd quote-generator
python3 -m http.server 8080
# Open http://localhost:8080
```

### Option 3 — Node.js / npx serve
```bash
cd quote-generator
npx serve .
```

> **Note**: Opening `index.html` directly as a `file://` URL works for most
> features, but the Clipboard API requires a secure context (localhost or HTTPS).
> The app falls back to `execCommand` automatically if needed.

## ✨ Features

| Feature | Detail |
|---------|--------|
| Local quote library | 20 curated quotes, each with a unique colour palette |
| API integration | Fetches 50 additional quotes from `api.quotable.io` silently on load |
| Animated backdrop | Two drifting radial gradient "orbs" painted on a `<canvas>` |
| Per-quote theming | Background hue, accent colour, and button colour all shift per quote |
| Glassmorphism card | `backdrop-filter: blur` + translucent border + inner highlight |
| Smooth transitions | Quote text cross-fades on change; page elements animate on load |
| Tweet button | Opens Twitter/X compose with pre-filled quote text |
| Copy to clipboard | Copies `"quote" — author` with visual "Copied!" feedback |
| Keyboard shortcuts | `Space` → new quote · `C` → copy |
| Responsive | Works on mobile (380 px) through desktop |
| Accessible | `aria-live` region, `aria-label` on all buttons, reduced-motion support |

## 🎨 Design Decisions

- **Cormorant Garamond** — elegant serif for quote text; feels literary
- **Jost** — geometric sans for UI labels; crisp and modern
- **Canvas backdrop** — avoids CSS gradient limitations; enables real-time hue animation
- **Grain overlay** — adds tactile depth without heavy textures
- **No frameworks** — pure HTML + CSS + Vanilla JS; zero build step required
