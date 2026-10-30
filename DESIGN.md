---
name: ÉPURE Atelier
description: An object-led editorial world for personal commissions.
colors:
  paper: "#f3f0e9"
  ink: "#25251f"
  muted: "#67655e"
  line: "#c9c5bb"
  night: "#191917"
  accent: "#6c4135"
typography:
  display:
    fontFamily: "Sunlight, Georgia, serif"
    fontSize: "clamp(64px, 8vw, 128px)"
    fontWeight: 400
    lineHeight: 0.93
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Sunlight, Georgia, serif"
    fontSize: "clamp(48px, 5.5vw, 88px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Theinhardt, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Theinhardt, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  flat: "0px"
spacing:
  page: "clamp(24px, 5.55vw, 100px)"
  mobile-page: "22px"
  section: "135px"
  mobile-section: "75px"
components:
  text-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.flat}"
    padding: "12px 0"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.flat}"
    padding: "12px 0"
---

# Design System: ÉPURE

## Overview

**Creative North Star: "The personal object"**

Photography leads; the interface gives it space. The original Sunlight and Theinhardt pairing is retained, with dramatic serif display type and restrained functional text. A warm paper ground alternates with near-black photographic scenes.

**Key Characteristics:**
- Monumental product imagery and asymmetric editorial composition.
- High-contrast serif type with occasional italic emphasis.
- Flat controls, fine rules and generous separation.
- One authored scroll scene, supported by GSAP masked typography, image reveals and Lenis continuity.

## Colors

Paper and ink carry ordinary reading surfaces. Night grounds cinematic imagery and the footer. Muted text supplies secondary hierarchy; line supplies quiet structural separation. The accent is used for selection and caret treatment rather than large decorative fills.

**The Material Colour Rule.** Let product photographs supply the expressive colour; keep navigation and reading surfaces quiet.

## Typography

Sunlight carries headings and the wordmark; Theinhardt carries paragraphs, metadata and controls. Italic Sunlight emphasizes a phrase rather than introducing a second display family. Hero sizing is deliberately larger than the general display role. At small widths, headline spans remain block-level and the type scale contracts to preserve complete words.

**The Complete Phrase Rule.** Headlines must remain fully visible at every viewport; adjust their scale or line breaks before accepting clipping or a stranded article.

## Layout

Use broad margins, generous section separation and uneven editorial columns. Desktop compositions commonly pair a larger image with a smaller text region. Mobile becomes a single reading column while retaining deliberate inset and offset relationships. Contact stacks at tablet widths to keep inputs usable. Gallery filters remain shareable in the URL.

## Elevation & Depth

There are no decorative card shadows. Depth comes from real photographic material, image scale, cropping and layering. The workshop-to-ring transition uses a horizontal clipping reveal inside a sticky section. Text remains on a solid contrast-safe surface.

**The Quiet Motion Rule.** Lenis and ScrollTrigger share the GSAP ticker. Keep touch scrolling native, use one authored sticky scene, and pause smoothing while overlays are open. System and manual reduced-motion settings remove choreography and pinning.

## Shapes

Images, fields and primary actions have square geometry. One-pixel rules define boundaries. Circular carousel controls and the fine-pointer image affordance are small functional exceptions. SVG arrows use a consistent fine stroke; no emoji or icon-font substitutions are added.

## Components

Text links combine an underlined baseline, a fine arrow, and subtle pointer magnetism. Form fields are transparent line fields with visible placeholders, text and focus outlines. Gallery tiles are unboxed image-and-caption compositions, not raised containers. Metadata follows the product heading. The original Bootstrap runtime manages menu/modal focus and Escape behavior; the viewer adds full-image, zoom and arrow-key controls. The original Splide runtime powers the studies carousel. A short curtain maintains visual continuity between documents; it is omitted for reduced motion, modified clicks and external destinations.

The closing signature is a large serif wordmark rather than a watermark. The Time / Form / Texture directory expresses the three product categories through typography. GSAP SplitText masks lines in selected editorial headings while preserving accessible labels; body text stays quiet. CSS retains a readable fallback when the motion runtime is unavailable.

**The Honest State Rule.** Display real availability and endpoint state. A local draft is never described as a sent enquiry, and an unavailable purchase destination is never invented.

## Do's and Don'ts

### Do:
- **Do** retain the local Sunlight and Theinhardt font files.
- **Do** use actual client images and product information when available.
- **Do** keep keyboard focus visible and support reduced motion.
- **Do** label illustrative imagery and concept products honestly.

### Don't:
- **Don't** introduce rounded commerce cards, checkout controls or additional animation frameworks beyond the approved GSAP/Lenis integration.
- **Don't** place pale type across pale photographs without a solid reading surface.
- **Don't** invent heritage, product specifications, prices or external purchase URLs.
