# CUR Website — Agent Guide

## Stack & Guardrails
- **Framework:** Plain Astro static site (`output: "static"`).
- **Styling:** Vanilla CSS using design tokens in `src/styles/cur-tokens.css` and shared band utilities in `src/styles/cur-components.css`. Do not add Tailwind, Sass, React/Vue/Svelte, or extra npm dependencies.
- **Typography:** Managed via Astro's built-in `<Font />` API in `astro.config.mjs` and `src/layouts/BaseLayout.astro` (`--font-heading`, `--font-body`, `--font-display`). Do not manually redefine those font variables in `cur-tokens.css`.
- **Content & CMS:** YAML and Markdown files under `src/content/` are parsed by `src/lib/content.js` and edited via Pages CMS configured in `.pages.yml`.

## Architecture

### Navigation & Site Structure
- Top-level navigation in `src/components/Navbar.astro` consists of `Home`, `Rockets ▾`, `Projects ▾`, `Papers`, and `Sponsors` (there is no blog).
- `Rockets` (`src/content/rockets/*.md` -> `/rockets/[slug]`) filter by `featured !== false` and sort by `year` descending with `title` as a tiebreaker.
- `Projects` (`src/content/projects/*.md` -> `/projects/[slug]`) filter by `featured !== false` and sort by `order` ascending (default `99`) with `title` as a tiebreaker.

### Band Themes, Dividers & `nextTheme`
- All full-width page sections use `.cur-band` plus a semantic theme class: `.cur-band--white`, `.cur-band--warm-light`, `.cur-band--warm-dark`, or `.cur-band--green`.
- Each theme class sets `--band-accent`, `--band-border`, and `--band-muted` in `src/styles/cur-components.css` so components adapt automatically without hardcoded theme overrides.
- `src/components/Divider.astro` renders an SVG transition at the bottom of a band. Because the SVG fills the bottom wedge with the *next* section's background color, every band component (`Hero`, `ContentBand`, `SubteamAccordion`, `Eboard`, `PdfViewer`, `SponsorMarquee`) accepts `{ theme = "white", divider, nextTheme = "white" }` and adds `.cur-band--has-divider` when `divider.style !== "none"`.
- `src/components/SectionRenderer.astro` automatically computes `nextTheme = sections[index + 1]?.theme || footerTheme` (defaulting `footerTheme` to `"green"`).

### Pages CMS Mapping (`.pages.yml`)
- Shared `components:` in `.pages.yml` define `bandTheme`, `divider`, and the five section blocks:
  - `splitBand` -> `ContentBand.astro`
  - `textBand` -> `ContentBand.astro`
  - `accordion` -> `SubteamAccordion.astro`
  - `peopleGrid` -> `Eboard.astro`
  - `pdfEmbed` -> `PdfViewer.astro`
- Every page and collection (`settings`, `sponsors`, `papers`, `rockets`, `projects`) supports arbitrary CMS-editable `sections` (`type: block`, `blockKey: type`), which `SectionRenderer.astro` dispatches directly with `nextTheme` chaining.

### CSS Scoping Rules
- Astro scopes `<style>` blocks per component. Never put component-specific responsive rules (such as `.cur-split` or `.cur-header__inner`) into `src/styles/cur-components.css` — keep them inside the owning component's `<style>` block.

## Development

```sh
npm install
npm run dev
npm run build
npm run preview
```

When starting the dev server from an agent session, use background mode:

```sh
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.
