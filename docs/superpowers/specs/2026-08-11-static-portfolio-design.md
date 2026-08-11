# Static Portfolio — Md. Shohag Mia

**Date:** 2026-08-11
**Status:** Approved for implementation

## Goal

Reproduce the Claude Design artifact (`329dbf7a-1381-4f17-9519-5393a227b33f`) as a
plain, self-contained static website. The artifact is built on Claude Design's
proprietary `x-dc` / `DCLogic` component runtime, which cannot run as a plain
static site. This project translates it to standard HTML/CSS/JS with zero build
step and zero runtime dependencies, deployable to any static host.

## Decisions

- **Stack:** Plain HTML/CSS/JS. No framework, no build step.
- **Content:** Verbatim from the artifact — copy, projects, experience, stats, links.
- **Fonts:** Self-hosted Archivo woff2 (weights 400/600/800), bundled in `fonts/`.
- **Dark mode:** Light only (matches the artifact, which ships light-only).
- **Setup:** Full repo — README with deploy instructions + initial git commit.

## File Structure

```
portfolio/
├── index.html      # Semantic markup: all sections + inline SVG diagrams
├── styles.css      # :root design tokens + component classes (from the artifact)
├── script.js       # Vanilla JS: mobile menu, scroll-reveal, active-nav highlight
├── fonts/          # Self-hosted Archivo woff2 (400/600/800)
└── README.md       # Deploy instructions
```

## Design System (tokens lifted from the artifact)

- **Background:** `#f3f2f2` (warm off-white); **surface:** `#eae9e9`
- **Text (ink):** `#201e1d`
- **Accent (red-orange):** `#ec3013`; accent-2 `#e15b47`; `--color-accent-700: #ae1800`
- **Divider:** `color-mix(in srgb, #201e1d 40%, transparent)`, rendered as 2px rules
- **Radius:** 0px everywhere (sharp, Modernist/Swiss-brutalist)
- **Neutral & accent ramps:** full 100–900 OKLCH-derived scales (copied verbatim)
- **Elevation:** soft ink-tinted shadows (`--shadow-sm/md/lg`)
- **Type:** Archivo. Headings weight 800, `letter-spacing: -0.015em`, `line-height: 1.12`.
  Fluid sizing via `clamp()` exactly as specced in the artifact.
- **Base:** `font-size: 16px`, `line-height: 1.55`, `text-wrap: pretty`.

## Sections (in order)

1. **Sticky header** — brand "Shohag", desktop nav (Work/Experience/About/Contact),
   pulsing "Available for opportunities" indicator. Mobile: "Menu" button →
   full-width dropdown nav.
2. **Hero** — "I build cloud systems that stream, scale, and stay up.", subhead,
   tech line ("7+ years · AWS · Python · Node.js · Terraform"), two CTA buttons.
3. **Work pipeline SVG** — abstract clients→API→services→data→infrastructure diagram
   with an animated dashed flow line.
4. **Selected Work** — heading + 4 case-study `<article>`s, each with a bespoke inline
   SVG architecture diagram:
   - 01 **Shop 360** — SaaS retail platform; 5-tier stack diagram; problem/solution/contribution.
   - 02 **Cloud video streaming infrastructure** — MediaConnect→MediaLive→MediaPackage→CDN chain.
   - 03 **Orchestration engine** — PRE-TX / TX / POST-TX phase diagram.
   - 04 **PlantViewer** — 3D viewport / point-cloud / measurement / markup diagram.
5. **Experience** — 6-role timeline (2018→present) with dates, titles, companies, blurbs.
6. **Problem solving** — competitive-programming stats: 351 UVa · 1438 Codeforces · 1726 CodeChef.
7. **About** — "Engineer by profession. Builder by curiosity." + three paragraphs.
8. **Contact** — full-bleed red block, "Have a difficult system to build?", Email/GitHub/LinkedIn.
9. **Footer** — name, role, links, © 2026.

### Content facts (verbatim)

- Name: **Md. Shohag Mia** — Software Engineer · Cloud & Backend
- Email: `shohagsiraj.ru@gmail.com`
- GitHub: `https://github.com/arshomashohag`
- LinkedIn: `https://www.linkedin.com/in/shohag-sarkar/`
- Meta description / OG tags: copied from the artifact's `<helmet>`.

## Behavior (vanilla JS, replacing DCLogic)

- **Responsive nav:** `resize` listener; below 860px collapse to a "Menu" toggle;
  above, show inline nav. Menu closes on link click and on resize to wide.
- **Scroll-reveal:** elements marked `data-reveal` start faded/translated-down and
  animate in via `IntersectionObserver`. Elements already in view on load are not hidden.
- **Active-nav highlight:** `IntersectionObserver` on `#work/#experience/#about/#contact`
  sets the accent color + `aria-current` on the matching nav link.
- **Diagram flow animation:** dashed SVG lines animate via CSS `@keyframes dcflow`.
- **`prefers-reduced-motion: reduce`:** disables all animation and smooth scroll.

The `<sc-if>` conditionals in the artifact gate optional content behind editor props,
all defaulting to shown — so that content (case-study detail blocks, competitive-programming
section, "available" indicator) is rendered directly in the static HTML.

## Dropped from the artifact

- Claude Design branding badge (bottom-right) — runtime chrome, not content.
- The proprietary frame runtime, bundler, and `x-dc`/`DCLogic` scripts.

## Fonts

Download Archivo woff2 (weights 400/600/800, latin + latin-ext subsets) from Google's
static font host into `fonts/`, wired with local `@font-face` rules and
`font-display: swap`. Fallback: `system-ui, sans-serif`. This download is the only
network access needed at build time; the shipped site makes no external requests.

## Verification

Open `index.html` in the browser and screenshot at desktop and mobile widths.
Compare against the artifact for: layout, colors, typography, the four SVG diagrams,
sticky header, scroll-reveal, active-nav, and mobile menu. Confirm no console errors
and no external network requests.
