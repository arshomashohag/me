# Portfolio — Md. Shohag Mia

A static personal portfolio for **Md. Shohag Mia** — Software Engineer · Cloud & Backend.

This is a plain, self-contained reproduction of a
[Claude Design](https://claude.com/product/design) artifact, rebuilt as
standard HTML/CSS/JS with **no build step** and **no runtime dependencies**.
The original artifact runs on a proprietary component runtime; this version
ports that behavior to vanilla JavaScript so it deploys to any static host and
makes **zero external network requests** at runtime (fonts are self-hosted).

## File structure

```
portfolio/
├── index.html      # All sections + inline SVG architecture diagrams
├── styles.css      # Design-system tokens (:root) + component classes
├── script.js       # Responsive nav, scroll-reveal, active-nav highlight
├── fonts/          # Self-hosted Archivo (variable woff2, latin + latin-ext)
└── README.md
```

## Run locally

No build or install is needed. Either open the file directly:

```bash
open index.html
```

…or serve it over a local HTTP server (recommended, so fonts load with the
right headers):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

The site is fully static — no server-side code, no build pipeline.

### GitHub Pages

1. Push this repository to GitHub.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*,
   pick your branch (e.g. `main`) and the `/ (root)` folder, then **Save**.
4. Your site publishes at `https://<username>.github.io/<repo>/`.

### Netlify

- **Drag-and-drop:** open <https://app.netlify.com/drop> and drop this folder.
- **Git-based:** connect the repository in Netlify. Leave the *build command*
  empty and set the *publish directory* to the project root (`.`).

## Notes

- **Fonts:** Archivo is bundled locally in `fonts/` and wired via `@font-face`
  with `font-display: swap`; the fallback is `system-ui, sans-serif`.
- **Accessibility:** respects `prefers-reduced-motion` — animations and smooth
  scrolling are disabled for users who ask for reduced motion.
- **Light mode only**, matching the original design.
