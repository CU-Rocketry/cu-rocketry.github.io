---

## Phase 0: Discovery & Current-State Inspection
Before changing any files, read and note the current state of:
1. `.pages.yml` (check exact component names under `components:`, exact `select` option syntax, and current collections).
2. `src/content/projects/` (list all existing rocket `.md` files—there should be ~4—and inspect their frontmatter keys, especially `year`, `competition`, `featured`, `heroImage`, `sections`/`bands`).
3. `src/pages/projects/[slug].astro` (inspect how the user already modified the header/subtext and how `SectionRenderer` is invoked).
4. `src/components/Navbar.astro` (inspect both desktop links and mobile drawer markup, plus how the `Projects` dropdown is populated and sorted).
5. `src/components/SectionRenderer.astro` (note every `section.type` it currently supports and its props).
6. `src/pages/index.astro`, `src/pages/sponsors.astro`, `src/pages/papers.astro`, and `src/content/{settings,about,sponsors,papers}.yml` (note how `theme`, `divider`, and `nextTheme` are currently wired).
7. Search the whole repo for `/blog` and `/projects/` to find any internal links or documentation references that must be removed or updated.

---

## Phase 1: Remove the Blog Completely

1. **Delete blog files & directories:**
   - Delete `src/pages/blog/` (`index.astro`, `[slug].astro`, and the folder).
   - Delete `src/content/blog/` (all `.md` files and the folder).
2. **Update `.pages.yml`:**
   - Remove the `blog` collection entry under `content:`.
3. **Update `src/components/Navbar.astro` (and `Footer.astro` if applicable):**
   - Remove the `Blog` navigation link from both the desktop nav list and the mobile nav drawer (if present).
4. **Check CSS (`src/styles/cur-components.css`):**
   - Check if `.cur-prose` is used anywhere outside the deleted blog pages. If nothing references `.cur-prose`, remove it (or leave a brief note if kept for future long-form content).
5. **Verify:** Run `npm run build` and confirm `/blog` is no longer generated and no broken imports remain.

---

## Phase 2: Split `Projects` into `Rockets` and `Projects` + Clean Up Redundant Metadata

### 2.1 Move Existing Rockets Out of `projects`
1. Create `src/content/rockets/` and move **all existing `.md` files** currently in `src/content/projects/` into `src/content/rockets/`.
2. Create `src/pages/rockets/[slug].astro` based on the current `src/pages/projects/[slug].astro`, updating `loadMarkdownCollection("projects")` to `loadMarkdownCollection("rockets")`.
3. Keep `src/pages/projects/[slug].astro` loading `loadMarkdownCollection("projects")` for the new Projects section.

### 2.2 Remove Redundant `year` / Competition Metadata
1. **In every moved `.md` file in `src/content/rockets/`:**
   - Remove redundant `year` (and any `competition` / competition-year fields found in Phase 0) from frontmatter.
   - Optionally add an integer `order` field (e.g., `order: 1`, `order: 2`, ...) if you want deterministic dropdown ordering without displaying a year.
2. **In `src/pages/rockets/[slug].astro` and `src/pages/projects/[slug].astro`:**
   - Confirm no `"Competition Year: ..."` or `data.year` subtext is rendered in the page header.
   - Keep the header clean (title + optional `subtitle` or `heroImage` if already in use—inspect Phase 0 findings and preserve the user's preferred header layout).
3. **In `.pages.yml`:**
   - Add a **`rockets`** collection (`path: src/content/rockets`, `filename: "{primary}.md"`).
   - Update the **`projects`** collection (`path: src/content/projects`, `filename: "{primary}.md"`).
   - On **both** `rockets` and `projects`:
     - Remove the `year` field (and any redundant competition-year field).
     - Update `view:` so it does NOT reference `year` (which would break CMS sorting/table display). Use:
       ```yaml
       view:
         fields: [title, featured, order]
         sort: [order, title]
         default: { sort: order, order: asc }
       ```
     - Include fields: `title` (required string), `order` (optional number, default `99`, description: `"Controls dropdown order (lower numbers appear first)"`), `featured` (boolean, default `true`, label `"Show in Dropdown"`), `heroImage` (optional image, `media: images`), and `sections` (`type: block`, `list: true`, `blockKey: type` — see Phase 3).
4. **Update `src/components/Navbar.astro`:**
   - Load both collections:
     ```js
     const sortByOrderThenTitle = (a, b) => {
       const orderDiff = (a.data.order ?? 99) - (b.data.order ?? 99);
       return orderDiff !== 0
         ? orderDiff
         : String(a.data.title || "").localeCompare(String(b.data.title || ""));
     };

     const rockets = loadMarkdownCollection("rockets")
       .filter((r) => r.data.featured !== false)
       .sort(sortByOrderThenTitle);

     const projects = loadMarkdownCollection("projects")
       .filter((p) => p.data.featured !== false)
       .sort(sortByOrderThenTitle);
     ```
   - Render **both** dropdowns in the desktop nav and mobile drawer (in this order):
     `Home` | `Rockets ▾` | `Projects ▾` | `Papers` | `Sponsors`
   - Guard against empty collections: if `projects.length === 0`, either hide the `Projects` dropdown or link cleanly without breaking (`projects[0] ? ... : "#"`).
   - Add `aria-current="page"` support when `currentPath.startsWith("/rockets/")` or `currentPath.startsWith("/projects/")`.
5. **Create Starter Pages in `src/content/projects/`:**
   - Create 1–2 clean placeholder project pages (e.g., `src/content/projects/air-brakes.md` and `src/content/projects/flight-computer.md`, or one `example-project.md`) using the exact new `sections` schema so `/projects/...` builds immediately and officers have a working example in Pages CMS.
6. **Update Internal Links:**
   - Update any existing links in `src/content/` or `src/` that pointed to `/projects/<rocket-slug>` so they now point to `/rockets/<rocket-slug>`.

---

## Phase 3: Enable Arbitrary CMS `sections` on Every Page

Every page on the site must allow editors to add, reorder, theme, and divide sections freely in Pages CMS using the shared block library.

### 3.1 Reusable `sections` Block List in `.pages.yml`
1. Under `components:` in `.pages.yml`, ensure all block components are defined (inspect Phase 0 to reuse what already exists without duplicating):
   - `bandTheme` (select: `white`, `light`, `grey`, `green`)
   - `divider` (object: `style`, `stroke`)
   - `splitBand` (Image + Text Band: `theme`, `imageSide`, `image`, `caption`, `heading`, `text`, `divider`)
   - `textBand` (Text-Only Band: `theme`, `heading`, `text`, `divider`)
   - `accordion` (Collapsible List: `theme`, `heading`, `items`, `divider`)
   - `peopleGrid` (People / E-Board Grid: `theme`, `heading`, `people`, `divider`)
   - `pdfEmbed` (PDF Viewer: `theme`, `title`, `summary`, `pdfUrl` as `type: file` with `media: docs`, `divider`)
2. Define a reusable `pageSections` block-list pattern (or attach the identical `sections` `type: block` field) to **every** page and collection in `.pages.yml`:
   - `settings` (`src/content/settings.yml` — Landing page extra sections)
   - `sponsors` (`src/content/sponsors.yml` — Sponsors page extra sections)
   - `papers` (`src/content/papers.yml` — Papers page extra sections)
   - `rockets` (`src/content/rockets/*.md` — Rocket page sections)
   - `projects` (`src/content/projects/*.md` — Project page sections)

   *(Note: Verify in `.pages.yml` that `select` options use `{ value: ..., label: ... }` consistently per Pages CMS docs, and verify whether Pages CMS supports referencing a `type: block` inside `components:`; if not, repeat the concise `sections` field block on each of the 5 entries.)*

### 3.2 Update Content Files & Astro Pages to Render `sections`
1. **Ensure `src/components/SectionRenderer.astro`:**
   - Supports every block type defined in `.pages.yml` (`splitBand`, `textBand`, `accordion`, `peopleGrid`, `pdfEmbed`).
   - Automatically calculates `nextTheme = sections[index + 1]?.theme || nextSectionTheme` (defaulting `nextSectionTheme` / `footerTheme` to `"green"`).
2. **Update every page template to render `<SectionRenderer />` cleanly with accurate `nextTheme` chaining:**
   - **`src/pages/index.astro`:**
     - Render `<SectionRenderer sections={settings.sections || []} footerTheme="green" />` (place it logically—e.g., between `Eboard` and `SponsorMarquee`, or between `SponsorMarquee` and `Footer`, passing the exact theme of whatever follows it so dividers blend seamlessly).
     - Ensure the section immediately preceding `<SectionRenderer>` sets its `nextTheme` to `settings.sections?.[0]?.theme || <fallbackTheme>`.
   - **`src/pages/sponsors.astro`:**
     - Render `<SectionRenderer sections={sponsors.sections || []} footerTheme="green" />` (and chain `nextTheme` from the brochure/last sponsor tier into `sponsors.sections?.[0]?.theme || "green"`).
   - **`src/pages/papers.astro`:**
     - Render `<SectionRenderer sections={papers.sections || []} footerTheme="green" />` (with `nextTheme` chaining).
   - **`src/pages/rockets/[slug].astro` and `src/pages/projects/[slug].astro`:**
     - Pass `sections={entry.data.sections || []}` into `<SectionRenderer sections={...} footerTheme="green" />`.
3. **Update existing `.yml` content files:**
   - Add `sections: []` to `src/content/settings.yml`, `src/content/sponsors.yml`, and `src/content/papers.yml` only if needed so Pages CMS initializes cleanly without overwriting existing content. Do NOT delete any existing real content (mission text, subteams, eboard roster, sponsor entries, or rocket writeups).

---

## Phase 4: Verification, Cleanup & Documentation

1. **Full Build & Route Check:**
   - Run `npm run build`.
   - Inspect `dist/` to confirm:
     - `/blog/` does NOT exist.
     - `/rockets/<each-rocket>/` exists for all moved rockets.
     - `/projects/<each-project>/` exists for the new starter project(s).
     - `/`, `/sponsors/`, and `/papers/` all build cleanly.
2. **Schema & Frontmatter Audit:**
   - Double-check that every field in `.pages.yml` matches the exact keys in `src/content/*.yml` and `src/content/{rockets,projects}/*.md`.
   - Confirm no leftover references to `blog`, `bands`, or `year` remain in `.pages.yml` or templates.
3. **Update `AGENTS.md` (and `README.md` if applicable):**
   - Document the new site structure (`Home`, `Rockets`, `Projects`, `Papers`, `Sponsors`—no blog), how `order` controls dropdown sorting, and how `sections` + `SectionRenderer.astro` work across all pages.
4. **Final Report:**
   - Summarize all deleted files, moved rocket files, newly created project files, `.pages.yml` changes, and any assumptions made during Phase 0 discovery.