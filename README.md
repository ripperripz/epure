# ÉPURE — Bespoke atelier

The existing static homepage clone has been transformed in place into a four-page atelier for watches, rings and leather straps. It retains the original Sunlight/Theinhardt fonts, Bootstrap navigation/modal system, Splide carousel and observer-driven reveal runtime.

## Run and edit

```sh
npm start
```

Open http://127.0.0.1:4173. Serving requires only Node.js; no build or package installation is needed for the checked-in pages.

```sh
npm run build
npm run check
```

`build.cjs` assembles all pages from shared sections. `atelier.css` defines the new visual system, and `atelier.js` handles product/form behavior; `motion.js` coordinates locally hosted GSAP 3.13.0 (ScrollTrigger and SplitText) with Lenis 1.3.17. Edit `site.config.json` for brand, products, purchase links, contact details and endpoint; then rebuild.

## Pages and interactions

- `/`: cinematic watch hero, three category editorials, workshop-to-ring scroll reveal and inherited Splide carousel.
- `/gallery/`: shareable category filters, editorial grid, fullscreen product viewer, zoom, arrow-key navigation and enquiry links.
- `/about/`: philosophy, material imagery and an explicit concept/provenance note.
- `/contact/`: required-field/email validation and a downloadable local enquiry draft.
- Shared: animated menu, visible keyboard focus, Escape/focus handling, responsive footer and system/manual reduced motion.

## Motion edition

The opening uses a GSAP timeline for the photograph, masked heading, navigation and CTA. SplitText reveals selected editorial headings, image masks open as the content enters, and ScrollTrigger drives the workshop-to-ring transition. Lenis shares GSAP’s ticker; smoothing pauses for menus and product overlays, while nested content scrolls natively. Fine pointers receive contextual image affordances and subtle link magnetism. A short curtain accompanies internal document navigation. System/manual reduced motion disables smoothing and choreography.

The closing wordmark, Time / Form / Texture directory, type spacing and caption hierarchy were refined in the same pass. All library files are local; runtime does not require a CDN. See `assets/vendor/` for versioned distributions and notices.

## Client inputs still needed

ÉPURE is a temporary working identity. All four photographs are **AI-generated development concepts**, and the three named studies are illustrative rather than actual inventory. `ASSETS.json` records the exact generation prompts, retained asset origins, files and hashes. The images were generated with the built-in ImageGen tool and copied into `assets/atelier/` as responsive WebP files.

Supply the final brand, approved product/workshop photography, actual product information, availability, contact email, social URLs and supported enquiry endpoint before a real launch. No prices, technical specifications, workshop location, heritage, testimonials or purchase URLs were invented.

Product `purchaseUrl` values default to null. A supplied valid HTTPS/HTTP URL produces an external Buy Now link; otherwise the viewer offers an enquiry. There is no internal cart, checkout or payment processing.

`formEndpoint` defaults to null. The contact form prepares a draft and explicitly states that nothing was sent. A configured endpoint must accept JSON and return a successful HTTP status plus `{ "success": true }` before receipt is confirmed. Unconfirmed/error responses preserve the entered text.

## Build and browser checks

```sh
npm run build
npm run check
```

With the server running, repeat browser verification using:

```sh
npm install
npx playwright install chromium
npm run verify
npm run verify:motion
```

The completed pass used the bundled Playwright Chromium runtime. All four pages passed at desktop (1440 × 1000), mobile (390 × 844), and tablet (820 × 1180) sizes. It checked console/resource errors, nonlocal requests, document/heading overflow, menus/Escape, filters, viewer/zoom/fullscreen, required form fields, draft download, and system reduced motion.

`VERIFY.json` and `verification/QA.json` contain the results. `verification/MOTION.json` checks actual wheel interpolation, scroll progress, the page handoff and live motion toggling. `verification/atelier-motion.webm` is a recorded walkthrough. `verification/` contains every page and key interaction screenshots. `DESIGN.md` and `.impeccable/design.json` record the implemented design system.

The prior homepage and its original assets/captures are archived outside the served project in the workspace's `work/atelier-redesign/original/`. Obsolete product images, logos, videos, trackers, shopping bag fallback and old live-service form were removed from the serving directory. The unchanged original CSS/JS bundles retain some unused generic modules to preserve their working integration.
