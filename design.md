---
name: Nocturnal Observatory
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#cfc6ab'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#989177'
  outline-variant: '#4c4732'
  surface-tint: '#e6c500'
  primary: '#fff8ec'
  on-primary: '#393000'
  primary-container: '#ffdb00'
  on-primary-container: '#716000'
  inverse-primary: '#6e5e00'
  secondary: '#c1c7cc'
  on-secondary: '#2a3135'
  secondary-container: '#434a4e'
  on-secondary-container: '#b2b9bd'
  tertiary: '#f8fafb'
  on-tertiary: '#2e3132'
  tertiary-container: '#dbddde'
  on-tertiary-container: '#5e6162'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe25c'
  primary-fixed-dim: '#e6c500'
  on-primary-fixed: '#221b00'
  on-primary-fixed-variant: '#534600'
  secondary-fixed: '#dde3e8'
  secondary-fixed-dim: '#c1c7cc'
  on-secondary-fixed: '#161d20'
  on-secondary-fixed-variant: '#41484b'
  tertiary-fixed: '#e1e3e4'
  tertiary-fixed-dim: '#c4c7c8'
  on-tertiary-fixed: '#191c1d'
  on-tertiary-fixed-variant: '#444748'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: 0em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: 0em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  metric-xl:
    fontFamily: JetBrains Mono
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  metric-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.06em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.08em
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system targets astronomical researchers, astrophysicists, and deep-sky observational teams operating in darkened control rooms and field environments. The visual language evokes precision instrumentation, nocturnal clarity, and deep-space telemetry.

The aesthetic fuses **Technical Minimalism** with **Instrumental High-Contrast**:
- **Zero Ambiguity:** Eliminates atmospheric diffusion or decorative haze to preserve dark-adapted vision and prioritize razor-sharp legibility.
- **Instrument Precision:** Surfaces emulate optical instrument housings, machined beryllium-aluminum frames, and luminous focal-plane metrics.
- **Visual Stance:** Ultra-deep base voids, razor-thin metallic framing, bright amber-yellow targeting points, and sterile white numerical readouts.

## Colors

The palette balances low-light preservation with high-contrast critical telemetry:

- **Deep Void Base (`#040404`):** Canvas grounding to prevent retina fatigue during low-lux operations.
- **Celestial Primary Accent (`#ffdb00`):** Reserved for focal points, active target locks, calibrated parameters, and operational warnings.
- **Metallic Neutral Secondary (`#b9c0c4`):** Cool anodized metallic tone for structural dividing lines, muted axis indicators, and secondary parameters.
- **Metallic Neutral Tertiary (`#ebedee`):** Brushed aluminum tint for non-critical labels, structural frames, and inactive icon buttons.
- **Pure Metric White (`#ffffff`):** Dedicated to essential data readouts, real-time telemetry metrics, and primary section headers.
- **Sub-surface Tiers:** Derived using low-alpha steps of metallic silver over `#040404` (e.g., surface-card at `rgba(185, 192, 196, 0.04)` to `rgba(185, 192, 196, 0.08)`) to maintain contrast ratios without elevating back-light bleed.

## Typography

The type system prioritizes structural cadence and monospaced telemetry:

- **Display & Headlines (`Space Grotesk`):** Technical, geometric grotesk reflecting astronomical observation hardware, aperture dimensions, and sector classifications.
- **Narrative & System Copy (`Geist`):** Crisp, neutral, developer-grade legibility for logs, observational abstracts, and interface prompts.
- **Telemetry & Labels (`JetBrains Mono`):** Dedicated to equatorial coordinates (RA/Dec), epoch tags, sensor temperatures, filter wavelengths, and status badges.
- **Casing Rules:** Labels and status tags are strictly uppercase with widened letter-spacing (`0.06em` to `0.08em`) to mimic instrumentation panel engravings.

## Layout & Spacing

A modular fluid-grid system structured around dense technical readouts and multi-pane telescope instrumentation:

- **Grid Architecture:** 12-column dynamic grid on desktop (`>1024px`) collapsing to 8 columns on tablet (`768px - 1023px`) and 4 columns on mobile (`<768px`).
- **Dense Structural Rhythms:** Compact 8px base rhythm (`space-sm`) optimized for high-density information displays.
- **Telemetry Tile Layouts:** Sensor matrices and telemetry feeds align to modular bounding boxes separated by strict 1px hairpins rather than large floating voids.
- **Responsive Stacking:** On viewports below 1024px, dual-axis telemetry panels snap into vertical diagnostic stacks while the primary viewfinder preserves a locked 16:9 or 1:1 focal aspect ratio.

## Elevation & Depth

To avoid light bleed in dark environments, traditional drop shadows are prohibited:

- **Pure Planar Segmentation:** Depth is achieved through precise `1px` structural borders (`#b9c0c4` at 15% to 30% alpha) on top of layered solid surfaces.
- **Base Substrates:**
  - `Level 0 (Canvas):` Solid `#040404`.
  - `Level 1 (Module/Panel):` Solid `#0c0d0e` bordered with `rgba(185, 192, 196, 0.18)`.
  - `Level 2 (Popovers/Overlays):` Solid `#131516` bordered with `rgba(235, 237, 238, 0.35)`.
- **Glow & Reticle Signals:** Primary accent elements (`#ffdb00`) utilize a constrained, non-diffuse focal perimeter (`box-shadow: 0 0 0 1px #ffdb00`) during targeted or error states.

## Shapes

The shape architecture is strictly **Sharp (`0`)**:
- All UI containers, buttons, indicators, inputs, and chips possess `0px` border radii.
- Corners are surgically angular, mimicking industrial rack-mounted optical consoles, focal plane arrays, and scientific analytical gear.
- Decorative cut-corners (chamfered 45-degree notches of 4px) may be applied selectively to primary operational badges and status tags.

## Components

### Buttons
- **Primary:** Filled `#ffdb00` with text in `#040404`, font `JetBrains Mono` bold uppercase. Hover shifts to `#ffffff` with `#040404` text.
- **Secondary:** Surface `#040404`, outline `1px solid #b9c0c4`, text `#ebedee`. Hover shifts outline to `#ffffff` and text to `#ffffff`.
- **Tertiary / Action Ghost:** Borderless `#040404`, text `#b9c0c4`, hover text `#ffdb00`.

### Chips & Status Indicators
- **Telemetry Badges:** 0px radius, `1px solid rgba(185, 192, 196, 0.25)`, background `rgba(185, 192, 196, 0.05)`, text `#ffffff`, font `JetBrains Mono` uppercase.
- **Target Lock / Calibrated Chip:** `1px solid #ffdb00`, background `rgba(255, 219, 0, 0.1)`, text `#ffdb00`. Includes a preceding filled `4px` square pip.

### Lists & Telemetry Feeds
- **Data Grids:** Monospaced tabular figures with alternating background bars (`#040404` to `#090a0b`). Dividers are hairline `1px solid rgba(185, 192, 196, 0.12)`.
- **Key-Value Pairs:** Labels set in `label-sm` (`#b9c0c4`), values aligned right set in `JetBrains Mono` (`#ffffff`).

### Checkboxes & Radio Buttons
- **Checkbox:** `14px x 14px` square, `1px solid #b9c0c4`, background `#040404`. When selected, fills `#ffdb00` with an inner `#040404` square.
- **Radio:** `14px x 14px` square (sharply defined outer ring), `1px solid #b9c0c4`. When active, centers a `#ffdb00` solid square pip.

### Input Fields
- **Text & Numerical Inputs:** Height `36px`, sharp rectangle, background `#090a0b`, border `1px solid #b9c0c4`, text `#ffffff`, typography `JetBrains Mono`. Focus state replaces border with `1px solid #ffdb00` without blur rings.

### Cards & Telemetry Panels
- Surface `#0c0d0e`, bound by `1px solid rgba(185, 192, 196, 0.18)`.
- Header bars are partitioned by a horizontal `1px` rule, displaying section breadcrumbs in `#b9c0c4` and active telescope state in `#ffdb00`.

### Specialized Observatory Modules
- **Coordinate Reticle:** Optical crosshairs drafted with `1px` dashed `#b9c0c4` lines, displaying dynamic coordinates at the intersection using `#ffdb00`.
- **Aperture & Exposure Sliders:** Track height `2px` in `#b9c0c4`, filled track `#ffdb00`, thumb `10px x 10px` sharp `#ffffff` block.