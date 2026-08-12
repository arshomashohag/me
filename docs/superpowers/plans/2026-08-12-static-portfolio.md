# Static Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproduce the Claude Design artifact (`329dbf7a-1381-4f17-9519-5393a227b33f`) as a plain, self-contained static website (HTML/CSS/JS, zero build step, zero runtime dependencies).

**Architecture:** Single `index.html` with semantic sections and inline SVG diagrams; one `styles.css` holding the `:root` token system and component classes lifted verbatim from the artifact; one `script.js` porting the artifact's `DCLogic` runtime behaviors (responsive nav, scroll-reveal, active-nav highlight) to vanilla JS. Self-hosted Archivo woff2 fonts in `fonts/`. No external network requests at runtime.

**Tech Stack:** HTML5, CSS3 (custom properties, `color-mix`, `clamp`), vanilla JavaScript (IntersectionObserver), self-hosted Archivo (Google Fonts woff2).

## Global Constraints

- Stack: plain HTML/CSS/JS. No framework, no build step, no runtime dependencies.
- Content verbatim from the artifact — copy, projects, experience, stats, links unchanged.
- Name: **Md. Shohag Mia** — Software Engineer · Cloud & Backend.
- Email: `shohagsiraj.ru@gmail.com`; GitHub: `https://github.com/arshomashohag`; LinkedIn: `https://www.linkedin.com/in/shohag-sarkar/`.
- Fonts self-hosted in `fonts/` (Archivo 400/600/800), `@font-face` with `font-display: swap`, fallback `system-ui, sans-serif`.
- Light mode only. Radius 0px everywhere. Dividers rendered as 2px rules.
- Shipped site makes **zero** external network requests; no console errors.
- Source of truth for exact markup/tokens/SVG: the extracted reference template on disk at `/private/tmp/claude-502/-Users-shohag-Desktop-Development-portfolio/59a4de6c-b8bf-4621-b915-84346b2cb7ec/scratchpad/template.html`. Copy structure and tokens from it; strip the `x-dc`/`DCLogic`/bundler runtime and resolve `<sc-if>` conditionals to their shown (default) state.
- Verification is visual (browser screenshots vs. artifact) — there is no unit-test harness for a static site. Each task's "test" is a concrete browser/inspection check.

---

### Task 1: Repository skeleton + self-hosted fonts

**Files:**
- Create: `fonts/` (directory with Archivo woff2 files)
- Create: `.gitignore`

**Interfaces:**
- Produces: Archivo woff2 files on disk at `fonts/archivo-{weight}-{subset}.woff2` for weights 400/600/800, subsets latin + latin-ext, referenced by `styles.css` in Task 2.

- [ ] **Step 1: Create the fonts directory and download Archivo woff2**

The artifact `@font-face` blocks reference Google's Archivo woff2 for weights 400/600/800 across latin, latin-ext, and vietnamese subsets. Download latin + latin-ext for each weight (vietnamese is not needed for this content). Fetch the current URLs from the Google Fonts CSS API, then download each woff2.

Run:
```bash
cd /Users/shohag/Desktop/Development/portfolio
mkdir -p fonts
CSS=$(curl -s -H "User-Agent: Mozilla/5.0" \
  "https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800&display=swap")
echo "$CSS" | grep -oE "https://[^) ]+\.woff2" | sort -u
```
This prints the woff2 URLs. Download the latin and latin-ext ones for each weight (the API groups blocks by subset with a comment above each `@font-face`; the last block per weight is `latin`, the one before it `latin-ext`). Save as:
`fonts/archivo-400-latin.woff2`, `fonts/archivo-400-latin-ext.woff2`,
`fonts/archivo-600-latin.woff2`, `fonts/archivo-600-latin-ext.woff2`,
`fonts/archivo-800-latin.woff2`, `fonts/archivo-800-latin-ext.woff2`.

- [ ] **Step 2: Verify the font files exist and are valid woff2**

Run:
```bash
cd /Users/shohag/Desktop/Development/portfolio
ls -la fonts/
file fonts/*.woff2
```
Expected: 6 files present, each reported by `file` as "Web Open Font Format (Version 2)" data (non-empty, > 1KB each).

- [ ] **Step 3: Create .gitignore**

```
.DS_Store
node_modules/
*.log
```

- [ ] **Step 4: Commit**

```bash
cd /Users/shohag/Desktop/Development/portfolio
git add fonts/ .gitignore
git commit -m "Add self-hosted Archivo fonts and gitignore"
```

---

### Task 2: styles.css — design tokens + component classes

**Files:**
- Create: `styles.css`

**Interfaces:**
- Consumes: font files from Task 1 (`fonts/archivo-*.woff2`).
- Produces: all `:root` custom properties and component class names used by `index.html` in Task 3 (`.header`, `.nav`, `.hero`, `.kicker`, `.btn`, `.case`, `.timeline`, `.stat`, `.contact`, `.footer`, `[data-reveal]`, `.diagram`, etc. — exact names copied from the template).

- [ ] **Step 1: Port the `@font-face` block**

Copy the six `@font-face` rules (weights 400/600/800 × latin + latin-ext) from the template, replacing the opaque `url("<uuid>")` references with the local paths from Task 1 (e.g. `url("fonts/archivo-400-latin.woff2")`). Keep `font-display: swap`, `font-stretch: 100%`, and the `unicode-range` values verbatim. Drop the vietnamese blocks.

- [ ] **Step 2: Port the `:root` token system**

Copy the entire `:root { ... }` block from the template verbatim: `--color-bg/surface/text/accent/accent-2/divider`, the full `--color-neutral-100..900` and `--color-accent-100..900` ramps, `--color-accent-700`, `--font-heading` + weight, `--radius-sm/md/lg` (all 0px), and `--shadow-sm/md/lg`. Do not alter any hex value.

- [ ] **Step 3: Port base + component styles**

Copy the remaining CSS from the template's `<style>` block verbatim: base element styles (`body { font-size:16px; line-height:1.55; text-wrap:pretty }`, heading `clamp()` sizes, `letter-spacing:-0.015em`), and every component class (header/nav, hero, buttons, case articles, timeline, stats, about, contact, footer, diagram/SVG styling, the `data-reveal` initial state, `@keyframes dcflow`, and the `@media (prefers-reduced-motion: reduce)` and responsive `@media` blocks). Remove any selectors that only target `x-dc`/DCLogic runtime chrome.

- [ ] **Step 4: Verify CSS parses with no errors**

Open a temporary blank HTML file linking `styles.css` in the browser (or run a CSS linter if available). Confirm no parse errors in the console.

Run:
```bash
cd /Users/shohag/Desktop/Development/portfolio
npx --yes csstree-validator styles.css || echo "validator unavailable — will verify visually in Task 5"
```
Expected: no syntax errors reported (or graceful skip if the validator isn't installable offline).

- [ ] **Step 5: Commit**

```bash
cd /Users/shohag/Desktop/Development/portfolio
git add styles.css
git commit -m "Add design-system styles ported from artifact"
```

---

### Task 3: index.html — markup, all sections, inline SVG diagrams

**Files:**
- Create: `index.html`

**Interfaces:**
- Consumes: `styles.css` (Task 2), `script.js` (Task 4, linked with `defer`), `fonts/` (Task 1).
- Produces: DOM structure with section ids `#work`, `#experience`, `#about`, `#contact`; nav links pointing to those ids; `data-reveal` attributes on reveal targets; the four case-study SVG diagrams; consumed by `script.js` selectors in Task 4.

- [ ] **Step 1: Write the document head**

Create `index.html` with `<!DOCTYPE html>`, `<html lang="en">`, `<head>` containing charset, viewport, `<title>Md. Shohag Mia — Software Engineer · Cloud & Backend</title>`, the meta `description` and `og:*` tags copied verbatim from the template's `<helmet>`, `<link rel="stylesheet" href="styles.css">`, and `<script src="script.js" defer></script>`.

- [ ] **Step 2: Port the header + all body sections**

From the template's `<x-dc>` body, transcribe the markup into `<body>`, in order: sticky header (brand "Shohag", nav Work/Experience/About/Contact, "Available for opportunities" indicator, mobile "Menu" button + dropdown), hero, work-pipeline SVG, Selected Work (4 case-study `<article>`s each with its inline SVG diagram: 01 Shop 360, 02 Cloud video streaming, 03 Orchestration engine, 04 PlantViewer), Experience 6-role timeline, Problem-solving stats (351 UVa · 1438 Codeforces · 1726 CodeChef), About, Contact (full-bleed red block), Footer (© 2026). Replace `x-dc`/custom elements with standard semantic tags (`<header>`, `<section>`, `<article>`, `<nav>`, `<footer>`). Resolve every `<sc-if>` to its shown/default branch (render the gated content directly). Keep all inline SVG (diagrams + flow lines) verbatim. Preserve `data-reveal` attributes and section ids.

- [ ] **Step 3: Verify markup is well-formed and self-contained**

Run:
```bash
cd /Users/shohag/Desktop/Development/portfolio
grep -c "x-dc\|sc-if\|__bundler\|DCLogic" index.html
grep -oE "https?://[^\"' )]+" index.html | grep -v "linkedin.com/in/shohag-sarkar\|github.com/arshomashohag\|schema.org\|w3.org\|og:" | sort -u
```
Expected: first command prints `0` (no runtime remnants). Second lists only the two intended profile links (github/linkedin) plus any namespace URLs (`w3.org`, `schema.org`) — no font/CDN/asset URLs, confirming self-containment.

- [ ] **Step 4: Commit**

```bash
cd /Users/shohag/Desktop/Development/portfolio
git add index.html
git commit -m "Add portfolio markup and inline SVG diagrams"
```

---

### Task 4: script.js — vanilla-JS behaviors (DCLogic port)

**Files:**
- Create: `script.js`

**Interfaces:**
- Consumes: DOM from `index.html` (Task 3) — the header/menu elements, `[data-reveal]` nodes, sections `#work/#experience/#about/#contact`, nav links, and diagram flow SVGs.
- Produces: no exports (browser side-effect script loaded with `defer`).

- [ ] **Step 1: Implement responsive nav**

Add a `resize` listener with an 860px breakpoint: below it, collapse to the "Menu" toggle (wire the button to open/close the dropdown, toggling `aria-expanded`); at/above it, show inline nav and force the menu closed. Close the menu on any nav-link click. Guard against missing elements.

- [ ] **Step 2: Implement scroll-reveal**

Select all `[data-reveal]` elements. For any already within the viewport on load, reveal immediately (do not hide). For the rest, apply the hidden initial state and use an `IntersectionObserver` (`rootMargin: '0px 0px -12% 0px'`) that adds the revealed state and unobserves once each element enters. Skip entirely if `prefers-reduced-motion: reduce` matches — reveal all immediately.

- [ ] **Step 3: Implement active-nav highlight**

Create an `IntersectionObserver` over sections `['work','experience','about','contact']` (`rootMargin: '-84px 0px -70% 0px'`). When a section is the active intersecting one, set the matching nav link to the accent color and `aria-current="true"`; clear the others. Guard against missing sections/links.

- [ ] **Step 4: Implement diagram flow animation toggle**

Respect `prefers-reduced-motion: reduce`: when it matches, set `animationPlayState: 'paused'` on the dashed flow SVG lines (the `dcflow` animation); otherwise leave them running. (CSS drives the animation; JS only pauses it for reduced-motion.)

- [ ] **Step 5: Verify no console errors and behaviors work**

Open `index.html` in the browser. Confirm: no console errors/warnings; scrolling reveals sections; the active nav link highlights as you scroll through Work/Experience/About/Contact; resizing below 860px shows the Menu button and it opens/closes the dropdown; resizing back to wide restores inline nav.

- [ ] **Step 6: Commit**

```bash
cd /Users/shohag/Desktop/Development/portfolio
git add script.js
git commit -m "Add vanilla-JS behaviors replacing DCLogic runtime"
```

---

### Task 5: Visual verification against the artifact

**Files:**
- (No new files — inspection + fixes to existing files.)

**Interfaces:**
- Consumes: the full site (`index.html` + `styles.css` + `script.js` + `fonts/`).

- [ ] **Step 1: Load the site in the browser**

Open `index.html` via `file://` (or a quick static server) in Chrome. Capture full-page screenshots at desktop width (~1280px) and mobile width (~390px).

- [ ] **Step 2: Compare against the artifact**

Check layout, colors, typography (Archivo weights loading, not falling back to system-ui), the four SVG diagrams, sticky header, "Available" pulsing indicator, contact red block, and footer. Note any visual discrepancies.

- [ ] **Step 3: Confirm zero external requests**

Open DevTools Network tab, hard-reload. Confirm every request is same-origin (`file://` or localhost) — fonts load from `fonts/`, nothing hits Google/CDN. Confirm the Console tab is clean.

- [ ] **Step 4: Fix any discrepancies**

For each mismatch found in Steps 2–3, edit the relevant file (`styles.css`/`index.html`/`script.js`) against the template as source of truth, and re-verify.

- [ ] **Step 5: Commit any fixes**

```bash
cd /Users/shohag/Desktop/Development/portfolio
git add -A
git commit -m "Fix visual discrepancies against artifact"
```
(Skip if no fixes were needed.)

---

### Task 6: README + final commit

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: the finished site.

- [ ] **Step 1: Write README.md**

Include: project title/description, the fact that it's a static reproduction of the Claude Design artifact, file structure overview, how to run locally (`open index.html` or `python3 -m http.server`), and deploy instructions for GitHub Pages and Netlify (both trivial: push the repo / drag the folder — no build step).

- [ ] **Step 2: Verify README renders**

Run:
```bash
cd /Users/shohag/Desktop/Development/portfolio
grep -c "GitHub Pages\|Netlify\|http.server" README.md
```
Expected: ≥ 1 (deploy instructions present).

- [ ] **Step 3: Commit**

```bash
cd /Users/shohag/Desktop/Development/portfolio
git add README.md
git commit -m "Add README with deploy instructions"
```

---

## Self-Review

**1. Spec coverage:**
- File structure (index.html/styles.css/script.js/fonts/README.md) → Tasks 1–4, 6. ✓
- Design tokens + component classes → Task 2. ✓
- All 9 sections in order + verbatim content/links → Task 3. ✓
- Four inline SVG diagrams → Task 3. ✓
- Vanilla-JS behaviors (nav, scroll-reveal, active-nav, flow animation, reduced-motion) → Task 4. ✓
- Self-hosted Archivo fonts → Task 1 + Task 2 Step 1. ✓
- Dropped runtime chrome / `sc-if` resolution → Task 3 Step 2 + verify Step 3. ✓
- Verification (screenshots, no external requests, no console errors) → Task 5. ✓
- README + deploy instructions → Task 6. ✓
No gaps.

**2. Placeholder scan:** No "TBD/TODO", no "add error handling", no "similar to Task N". Steps that transcribe from the template point at the exact template path and name the exact elements/tokens to copy. ✓

**3. Type consistency:** Component class names and section ids are defined once (Task 2/Task 3) and consumed consistently by Task 4's selectors (`#work/#experience/#about/#contact`, `[data-reveal]`, 860px breakpoint, the documented `rootMargin` values). Font file naming (`fonts/archivo-{weight}-{subset}.woff2`) is consistent between Task 1 (produce) and Task 2 Step 1 (consume). ✓
