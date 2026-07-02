# TerraReFlow, PBC — website

Single-page, cinematic marketing site for **TerraReFlow, PBC**, a planetary-regeneration
infrastructure company. Tagline: *We build the way back.*

## Stack

Zero-build static site — plain HTML, CSS, and vanilla JS. No framework, no bundler,
no dependencies. Deployable as-is to GitHub Pages, Netlify, Vercel, or any static host.

```
index.html        # all content & copy
css/styles.css    # design system ("cinematic earth-systems")
js/main.js        # boundaries ring, scroll reveals, transformation wipe, nav, contact
```

Fonts are loaded from Fontshare (Clash Display, Satoshi) and Google Fonts (JetBrains Mono).

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Key pieces

- **Planetary Boundaries Ring** — interactive SVG (built in `js/main.js`): nine wedges
  around a core-lit Earth; seven breached wedges push past the dashed safe-operating-space
  ring; the four land-and-life wedges turn verdant on hover/selection and reveal the
  TerraReFlow unit that answers them. Keyboard-navigable (Tab + Enter/Space), with a
  synced legend and an `aria-live` detail panel.
- **The Turn** — a single scroll-triggered transformation: dead ground wipes into a
  geothermal plant with living ground.
- **Motion discipline** — `prefers-reduced-motion` collapses all animation to static,
  fully legible states (the transformation strip defaults to the *restored* state).

## Editing notes

- Palette, type, and spacing tokens live at the top of `css/styles.css` (`:root`).
- Ring content (boundary names, descriptions, unit mappings) lives in the `BOUNDARIES`
  array at the top of the ring section in `js/main.js`.
- The contact form composes a `mailto:` to `hello@terrareflow.com` — swap in the real
  address (it appears in `index.html` twice and `js/main.js` once) or wire up a form
  backend.
- Honesty guardrail: all forward-looking numbers are labeled illustrative; unit statuses
  are marked active / next / planned. Keep it that way.
