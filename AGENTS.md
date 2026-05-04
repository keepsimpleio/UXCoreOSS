# AGENTS.md — UXCoreOSS

How to work in this codebase. Read this before writing code.

For visual / styling work, defer to the **uxcore-style skill** at `.claude/skills/uxcore-style/SKILL.md`. It auto-loads in Claude Code; in other agents (Cursor), open it manually whenever you write or modify styles.

---

## Stack

- **Next.js 15.0.5** — Pages Router (`src/pages/`), not App Router
- **React 19**, **TypeScript 5.2** (`strict: false`, `noImplicitAny: false`)
- **Sass + CSS Modules** (`*.module.scss`). No Tailwind, no CSS-in-JS, no styled-components.
- **yarn** is the package manager. Never use npm.
- **No state library** — global state lives in custom listener-based hooks (`useGlobals`, `useUXCoreGlobals`, `useUXCatGlobals`, `useUXCGGlobals`) and `GlobalContext`.
- **No data-fetching library** — plain `fetch` in `src/api/`.
- **Cypress 14** for E2E. No unit tests, no Jest, no Vitest.
- **i18n is custom** — Next.js built-in locales (`en`, `ru`, `hy`), no next-i18next or react-intl.
- **SVGs are written manually as `.tsx` components** in `src/assets/icons/`. No `@svgr/webpack`.

---

## Folder structure

```
src/
├── pages/          # Next.js routes (Pages Router)
├── components/     # PascalCase dirs, one component per dir
│   ├── _biases/    # bias-feature-only components
│   ├── _uxcp/      # UXCP-feature-only components
│   └── uxcg/       # UXCG-feature-only components
├── layouts/        # page-level layout wrappers (PascalCase dirs)
├── data/           # i18n static content (TS only, never JSON)
├── hooks/          # flat list of custom hooks (use*.ts)
├── lib/            # shared utilities by domain
├── utils/          # additional utilities (same conventions as lib/)
├── api/            # API clients (one file per domain)
├── constants/      # app-wide constants — NOTE: this folder may not exist; see "Path aliases" below
├── local-types/    # shared TS types
├── styles/         # globals.scss, _variables.scss, _animations.scss
└── assets/icons/   # SVG icon components written as .tsx
```

**Underscore / lowercase prefix:** Components used by only one feature go in `components/_biases/`, `components/_uxcp/`, or `components/uxcg/`. Shared components stay flat in `components/`. Convention, not lint-enforced — follow it anyway.

---

## Component pattern

Every component is its own folder with:

```
ComponentName/
├── index.ts                  # barrel
├── ComponentName.tsx
└── ComponentName.module.scss
```

`index.ts` is always:

```ts
import ComponentName from './ComponentName';
export default ComponentName;
```

### Hard rules

1. **Default export only.** Named exports break the barrel pattern.
2. **Props type is `ComponentNameProps` interface**, declared inline above the component. No `T`-prefix. No `.types.ts` file unless the type is large (10+ fields) or shared across files.
3. **Styles colocated** as `ComponentName.module.scss`, imported as `import styles from './ComponentName.module.scss'`.
4. **Use `cn` (classnames)** for conditional classes: `cn(styles.Button, { [styles.Primary]: variant === 'primary' })`.
5. **Sub-components nest** with the same structure: `Table/TableSearch/TableSearch.tsx`.
6. **Function components only.** No class components.
7. **`data-cy` attributes** on interactive elements for Cypress (`data-cy="open-close-accordion-button"`).

### Skeleton

```tsx
import cn from 'classnames';

import styles from './ComponentName.module.scss';

interface ComponentNameProps {
  label: string;
  variant?: 'primary' | 'secondary';
}

const ComponentName = ({ label, variant = 'primary' }: ComponentNameProps) => {
  return (
    <div
      className={cn(styles.ComponentName, {
        [styles.Primary]: variant === 'primary',
      })}
      data-cy="component-name"
    >
      {label}
    </div>
  );
};

export default ComponentName;
```

> The codebase has **35 components still using `T`-prefix** (`TButton`, `TInput`, `TTooltip`, etc.). That is legacy. New components and modifications use `ComponentNameProps` interface.

---

## Layouts

Layouts live in `src/layouts/` (PascalCase dirs, same structure as components). They receive data from a page and compose components.

Existing layouts: `UXCoreLayout`, `UXCatLayout`, `UXCGLayout`, `UXCPLayout`, `CoreViewLayout`, `FolderViewLayout`, `OngoingLayout`, `StartTestLayout`, `TestResult`, `UserProfile`, `ApiLayout`, `CertificateLayout`, `CalculatingResults`, `Layout`.

The root `Layout` at `src/layouts/Layout.tsx` wraps all pages (rendered in `_app.tsx`). It provides Header, cookie box, and app-wide chrome. Feature layouts nest inside it.

Layouts use `ComponentName.types.ts` more often than components do, because their props tend to be large page-data shapes.

---

## Static data (i18n content)

All static content lives in `src/data/` as TypeScript. **Never JSON, never MDX.**

```
src/data/featureName/
├── en.ts
├── ru.ts
├── hy.ts          # optional — see locales below
└── index.ts
```

### Barrel

```ts
import en from './en';
import hy from './hy';
import ru from './ru';

const locales = { en, ru, hy } as const satisfies {
  en: typeof en;
  ru: typeof ru;
  hy: typeof hy;
};

export default locales;
```

### Consumption

```ts
import biasesLocalization from '@data/biases';
const { locale } = useRouter() as TRouter;
const { heading, mainTitle } = biasesLocalization[locale];
```

---

## Locales

Three locales: `en` (default), `ru`, `hy`.

**Armenian (`hy`) is treated as an English fallback** at the application level. 12 of 44 data directories are missing `hy.ts` entirely (`completionBar`, `downloadButton`, `formPopup`, `fullscreenButton`, `genderModalData`, `imageModule`, `leaderboard`, `seo`, `startTest`, `statistics`, `uxcgQuestions`, `uxcoreApi`).

**Don't require `hy.ts` in new data dirs** — if missing, the runtime falls back to `en`. If you do create `hy.ts`, copy from `en.ts` so the shape matches and add a `// TODO HY translation` comment.

**Two cross-module shims exist** (`completionBar/index.ts` and `formPopup/index.ts` import `hy` from unrelated modules). Don't add new shims — just omit `hy.ts`.

**Strapi-fetched data uses field-per-locale columns** (`titleEn`, `titleRu`, `titleHy`), not the locale-keyed object pattern. Don't mix the two models.

---

## Path aliases

Use these instead of relative imports past one level:

| Alias            | Path                 |
| ---------------- | -------------------- |
| `@components/*`  | `src/components/*`   |
| `@data/*`        | `src/data/*`         |
| `@hooks/*`       | `src/hooks/*`        |
| `@layouts/*`     | `src/layouts/*`      |
| `@lib/*`         | `src/lib/*`          |
| `@api/*`         | `src/api/*`          |
| `@styles/*`      | `src/styles/*`       |
| `@local-types/*` | `src/local-types/*`  |
| `@icons/*`       | `src/assets/icons/*` |

> **Mismatch warning:** `@constants` appears in the ESLint import-sort config but is **not defined in `tsconfig.json`**. Do not use `@constants/*` imports. If you need a constants folder, define the alias in `tsconfig.json` first. `@utils` is in neither — also unavailable.

**Import order is auto-fixed** by `eslint-plugin-simple-import-sort` on commit:

side effects → node builtins → third-party → `@styles` → `@constants` → `@local-types` → `@hooks` → `@lib` → `@api` → `@data` → `@icons` → `@components` → `@layouts` → relative → `.scss` style imports.

**Only 3 deep relative imports exist** in the codebase. Don't add more — always use aliases.

---

## Pages & routing

- **Pages Router only** (`src/pages/`). Never add App Router files (`app/`, `'use client'`, `next/navigation`).
- **Adding a page:** create `src/pages/{path}.tsx` or `src/pages/{path}/index.tsx`. The root `<Layout>` from `_app.tsx` applies automatically.
- **Data fetching:** prefer `getStaticProps` with ISR (`revalidate: 5` or `revalidate: 10`). The site is statically generated. Don't introduce `getServerSideProps` unless data must be fresh per-request.
- **Dynamic routes:** `[slug].tsx` for biases/UXCG, `[userId]` for profiles, `[name]/[hash]/[isTeamMember]` for UXCP personas. Use `getStaticPaths` with `fallback: 'blocking'`.
- **SEO:** use the existing `SeoGenerator` component. Don't add `next-seo`.

### SSR-safety

Anything that touches `localStorage`, `sessionStorage`, or `window` at module top level will break SSR with hydration mismatches. Wrap with `dynamic(() => import('...'), { ssr: false })` or move into `useEffect`.

The codebase uses `dynamic(..., { ssr: false })` extensively (18 instances across 10 files, mostly in `_app.tsx`, `UXCoreLayout.tsx`, `UXCPLayout.tsx`, and achievement components). Match those patterns.

---

## Styling

**Source of truth:**

1. If the user gives explicit visual instructions (colors, spacing, sizes), follow them exactly.
2. If they don't, defer to the **uxcore-style skill** (`.claude/skills/uxcore-style/SKILL.md`) and read it before writing styles.
3. **Do not invent values. Do not copy hardcoded hex / px from neighboring components just because they exist.**

The codebase has hardcoded colors, breakpoints, and spacing scattered across SCSS files. That is legacy, not a pattern to extend. New code aligns to the design skill; old code stays as-is until touched.

### Code-side notes

- CSS Modules + SCSS, colocated per component.
- `_variables.scss` contains only `@font-face` declarations — no color or spacing tokens.
- `_uxcore-labels.scss` is the only SCSS partial with reusable color variables (4 bias-category color pairs).
- Dark theme: toggled by adding `darkTheme` class to `document.body` via `useGlobals()`. Components apply `{ [styles.darkTheme]: isDarkTheme }`.
- Animations live in `_animations.scss` as utility classes (`.animate-fadeIn`, `.animate-slideDown`, etc.) and 13 keyframe animations.
- Responsive design: per-component media queries in each `.module.scss`. Not centralized.
- **SCSS class naming:** PascalCase (`.PreloaderContainer`, `.Accordion`, `.Title`). The codebase mixes PascalCase and camelCase — prefer PascalCase for new code.

---

## State

- No Redux, Zustand, Jotai, SWR, React Query. Don't add one.
- **Global state hooks:** `useGlobals` (dark theme, sidebar, fullscreen), `useUXCoreGlobals`, `useUXCatGlobals`, `useUXCGGlobals`. Each returns a `[actions, state]` tuple.
- **App-level state:** managed in `_app.tsx` via `useState`, passed through `GlobalContext` (from `src/components/Context/GlobalContext`).
- **Authentication:** `next-auth` `SessionProvider` wraps the app.

---

## Testing

- **Cypress E2E only.** Specs in `cypress/e2e/{feature}/`.
- Naming: `{feature}.cy.ts`, `{feature}-mobile.cy.ts`, `{feature}-{locale}.cy.ts`, special tests as `.spec.cy.ts`.
- **Use existing custom commands** from `cypress/support/commands.ts` before writing new ones:

| Command                       | Purpose                                                 |
| ----------------------------- | ------------------------------------------------------- |
| `loginBySession`              | Authenticates test user via POST, stores session cookie |
| `checkExternalLinks`          | Validates external URL format and reachability          |
| `checkAllLinks`               | Validates all links across multiple routes              |
| `checkSocialMediaLink`        | Validates social link domain/href/target                |
| `checkH1`                     | Asserts H1 contains expected text                       |
| `validateAllImages`           | Validates images return successful status codes         |
| `scrollToSection`             | Scrolls via button click, verifies position             |
| `uxcoreSearchBehavior`        | Tests UX Core search input + results                    |
| `uxcgTestSearchBehavior`      | Tests UXCG search with valid/invalid words              |
| `uxcpSearchBehavior`          | Tests UXCP search with valid/invalid words              |
| `uxcpAddBiases`               | Tests adding/removing biases in UXCP                    |
| `openLoginModalByButtonClick` | Opens login modal, closes by clicking outside           |
| `showCopiedTooltip`           | Tests copy button → "Copied!" tooltip                   |
| `showMoreAndLess`             | Tests expand/collapse buttons                           |
| `playAudio`                   | Plays/pauses audio via pyramid play icon                |
| `checkPyramidChange`          | Tests pyramid color changes on click                    |
| `checkSwiperSlide`            | Tests swiper navigation arrows                          |
| `clickArrowWhenReady`         | Clicks nav arrows when enabled, verifies URL change     |

- **Don't add Jest, Vitest, or component tests.** Not wired up.
- CI only runs `tsc --noEmit` on PRs — Cypress is not gated. Run E2E locally before pushing.

---

## Naming conventions

- **Components / files / folders:** PascalCase (`Accordion`, `Modal`, `Spinner/Spinner.tsx`).
- **Feature groupings:** lowercase or underscore-prefixed (`uxcg/`, `_biases/`, `_uxcp/`).
- **Hooks:** `use*` prefix, one hook per file, `src/hooks/` flat.
- **Event handlers:** `handle*` prefix (`handleClick`, `handleMouseEnter`).
- **Boolean props:** `is*`, `has*`, `show*` (`isOpen`, `isDarkTheme`, `hasBorder`, `showLeftIcon`).
- **Props types:** `ComponentNameProps` interface (no `I` prefix, no `T` prefix for new code).
- **API files:** lowercase (`biases.ts`, `strapi.ts`).
- **Lib / utils files:** lowercase (`helpers.ts`, `cookies.ts`, `uxcat-helpers.ts`).

---

## Generated files — do not edit by hand

| File                                                 | Generated by                     | Trigger                                                                                            |
| ---------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------- |
| `public/uxcore_/llms.txt`                            | `scripts/generate-llms.ts`       | `yarn generate:llms`                                                                               |
| `public/uxcore_/llms-full.txt`                       | `scripts/generate-llms-full.ts`  | `yarn generate:llms:full`                                                                          |
| `public/uxcore_/llms-full-pages/**/*.md` (168 files) | `scripts/generate-llms-pages.ts` | `yarn generate:llms:pages`; CI: `.github/workflows/generate-llms.yml` (manual `workflow_dispatch`) |

Edit the generator scripts, not the output.

---

## Environment variables

`.env.example` is the contributor-facing template (with inline comments). Copy to `.env.local` before running `yarn dev`.

**Client-side (`NEXT_PUBLIC_*`):** `NEXT_PUBLIC_ENV`, `NEXT_PUBLIC_INDEXING`, `NEXT_PUBLIC_MIXPANEL_TOKEN`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_AHREFS_ANALYTICS_KEY`, `NEXT_PUBLIC_DOMAIN`, `NEXT_PUBLIC_STRAPI`, `NEXT_PUBLIC_UXCAT_API`.

**Server-only:** `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `STRAPI_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`.

`NEXT_PUBLIC_INDEXING` toggles GA tracking. `NEXT_PUBLIC_ENV` is `local` / `staging` / `prod`.

---

## next.config.js notes

- **`assetPrefix`:** `''` in dev, `/uxcore_next` otherwise. Affects Next.js internal assets only — not files in `public/`.
- **Rewrites:** `/assets/*`, `/fonts/*`, `/audio/*`, `/static/*`, `/robots.txt`, `/llms.txt`, `/llms-full.txt`, `/llms-full-pages/*` all map to `/uxcore_/...`. Both paths work; canonical form is `/uxcore_/`.
- **`images.domains`:** `lh3.googleusercontent.com`, `cdn.discordapp.com`, `strapi.keepsimple.io`, `staging-strapi.keepsimple.io`. To allow new image hosts, add here.
- **i18n:** locales `['en', 'ru', 'hy']`, default `en`.
- **Production builds strip `console.*`** (except `console.error`) via `compiler.removeConsole`. Don't rely on logs in prod.

---

## Things to never do

- ❌ Use npm (use yarn)
- ❌ Add App Router files (`app/`, `'use client'`, `next/navigation`)
- ❌ Add a state library (Redux, Zustand, Jotai, SWR, React Query)
- ❌ Use named exports for components / layouts
- ❌ Use `T`-prefix for new prop types (use `ComponentNameProps` interface)
- ❌ Use JSON or MDX for static content (TS only)
- ❌ Use `@svgr/webpack` or `<img src={svg}>` — SVGs are hand-written `.tsx` components
- ❌ Use `@constants/*` or `@utils/*` aliases — not defined in `tsconfig.json`
- ❌ Copy hardcoded hex / px from neighboring components — defer to the uxcore-style skill
- ❌ Add Jest, Vitest, `next-i18next`, `next-seo`
- ❌ Read `localStorage` / `sessionStorage` / `window` at module top level
- ❌ Skip the `index.ts` barrel when creating a component
- ❌ Add cross-module `hy.ts` shims (`import hy from '@data/otherFeature/hy'`) — just omit `hy.ts`
- ❌ Edit `public/uxcore_/llms*.txt` or `llms-full-pages/*` by hand

---

## Empty barrels (existing bugs — fix when touched)

These barrels are 0 bytes or missing the default re-export. If you touch any of these components, add the proper barrel:

- `src/components/_biases/BiasEnvironment/index.ts` (0 bytes)
- `src/components/CalculatingResults/index.ts` (0 bytes)
- `src/components/NewUpdateModal/index.ts` (0 bytes)
- `src/components/ContentGenerator/elements/index.ts` (no default export — re-exports multiple sub-components, intentional)
- `src/components/CustomModal/contentTypes/index.ts` (no default export — re-exports multiple sub-components, intentional)

`src/hooks/` has no `index.ts` files at all — that's the pattern, hooks are imported by full path.

---

## Known TODOs (don't accidentally "fix" these)

These are tracked. Don't refactor them away as part of unrelated work:

- `src/api/rating.ts:7` — keep data to avoid multiple requests
- `src/lib/helpers.ts:222` — passive VH functionality
- `src/layouts/FolderViewLayout/FolderViewLayout.tsx:121` — unnecessary state check
- `src/layouts/UXCatLayout/UXCatLayout.tsx:282` — Badge problem
- `src/layouts/TestResult/TestResultLayout.tsx:68` — incorrectAnswers type
- `src/layouts/UserProfile/UserProfile.types.ts:20` — add type
- `src/components/SelectImageModal/SelectImageModal.tsx:21` — handle images
- `src/components/UXCoreFeedbackModal/UXCoreFeedbackModal.tsx:38` — move to api page
- `src/components/Result/Result.tsx:93` — slug from backend
- `src/pages/user/[userId]/index.tsx:186` — stat error

**HYTranslation TODOs** (10 total — Armenian translation gaps): `src/local-types/data.ts:8,74,132`; `src/lib/helpers.ts:70`; `src/pages/uxcg/index.tsx:81`; `src/components/SeoGenerator/SeoGenerator.tsx:98,144`; `src/components/UXCGModalMobile/UXCGModalMobile.tsx:42`; `src/components/FormPopup/FormPopup.tsx:20`; `src/components/_biases/ZoomBox/ZoomBox.tsx:59`.

---

## Gotchas

1. **`_app.tsx` is a multi-hundred-line monolith** — handles SessionProvider, GlobalContext, account/biases/questions/settings fetching, GA + Mixpanel init, route-change spinner (500ms debounce), modal timing for feedback / share / help-to-help / new-update / christmas popups, cookie consent, body class theme toggling, scroll style toggling for articles. Any new global concern goes here. Touch carefully.
2. **`GlobalContext` lives at `src/components/Context/GlobalContext`** — not in a top-level `context/` folder. It's imported directly (bypassing barrels) in 8 files; that's the established pattern for context.
3. **55 imports bypass component barrels** (importing `.tsx` directly through aliases). Worst offenders: `@components/Context/GlobalContext` (8x), `UXCPLayout.tsx` (12 such imports). Use barrels for new imports.
4. **`forceConsistentCasingInFileNames`** — match existing casing exactly; case mistakes work locally but break Linux CI.
5. **`strict: false`** + **`noImplicitAny: false`** + **`@typescript-eslint/no-explicit-any: off`** — type safety is loose. `any` is allowed but discouraged for new code.
6. **`@ts-ignore` is allowed**; ESLint warns on `@ts-expect-error`.
7. **Asset paths:** prefer `/uxcore_/...` form. Both `/assets/foo.png` and `/uxcore_/assets/foo.png` work via rewrites, but the canonical form is the latter.

---

## When uncertain

- Find the closest existing component or layout and match its structure.
- If a pattern in this file conflicts with what you see in the codebase, **this file wins** for new code. Old code stays as-is until touched.
- If a pattern isn't covered here at all, stop and ask before inventing one.
