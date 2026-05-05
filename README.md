 <img src="public/uxcore_/assets/readme/cover.png" alt="warm welcome" width="1920" />

A first-of-its-kind free educational tool, UX Core quickly spread through global product management communities after its release in 2020.

Contains 1,000+ practical examples of cognitive biases applied to product design, software development, and team management.

Widely recognized by leading scholars in cognitive science and behavioral economics (Duke University, Harvard Business School, AUD, and others).

Actively used by managers, designers, and educators worldwide.

---

## 🛠 Tech stack

### The project is built using:

- React (via Next.js)

- TypeScript

- SCSS modules

- Node.js version: 18.18.0

### Additional tooling:

- ESLint – for consistent code quality

- Prettier – for automatic code formatting

- Husky – used to `run npx lint-staged` on pre-commit

  ***

## ⚙️ Install dependencies:

In this project we use Yarn, so make sure you have it installed.

```bash
yarn install
```

### Run the app locally:

```bash
yarn dev
```

**App runs at http://localhost:3005**

---

## 🔐 Environment variables

Copy the example file before your first run:

```bash
cp .env.example .env.local
```

The defaults in `.env.example` point at our public staging Strapi and UX Cat APIs, so most UI and feature work runs without any extra setup. Optional integrations (Mixpanel, Google Analytics, Ahrefs, OAuth providers) are left empty — the app no-ops when their keys aren't set.

If you want to work on **authentication**, you'll need your own OAuth apps and a real `NEXTAUTH_SECRET` (the example ships a clearly-labelled dev placeholder). Setup links for each provider are in the comments inside `.env.example`; generate a secret with:

```bash
openssl rand -base64 32
```

Never commit `.env.local` — it's gitignored on purpose.

---

## ✍️ Commit Rules & Branch Naming

We use <a href="https://www.conventionalcommits.org/en/v1.0.0/">Conventional Commits</a> to keep our history clean and readable.

Commit prefixes and branch names should be in the following format:

- `feat:` - ✨ A new feature
- `hotfix:` - 🚑 A critical fix
- `docs:` - 📝 Documentation only changes
- `style:` - 💅 Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor:` - 🔨 A code change that neither fixes a bug nor adds a feature
- `chore:` - 👷Dev setup, tooling, config or just some random task
- `bugfix:` - 🐛 A bug fix

Example commit message:

```
feat: added new button component
```

Example commit message with emoji, to make life easier and more fun:

```
✨ feat: added new button component
```

### 🌿 Branch Naming Rules

There are **two ways** of creating a branch:

| Case                                          | Rule                                                                              | Example                                                                                  |
| --------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **From an Issue (preferred if Issue exists)** | GitHub auto-adds the Issue number. **Always use this when related Issue exists.** | `feat/123-add-new-button-component`                                                      |
| **Without an Issue**                          | Use standard format with type/purpose.                                            | `feat/add-new-button-component`<br>`hotfix/fix-login-crash`<br>`bugfix/button-alignment` |

---

## 📝Folder Structure and Naming Conventions

- cypress - contains all the e2e tests
- public - contains static assets like images, icons, etc.
- src - contains the main application code
  - api - contains API requests and related code
  - data - contains static data in Russian, English and Armenian languages
  - assets - contains static assets like images, icons, etc.
  - components - reusable components
  - hooks - custom React hooks
  - layouts - layout components
  - lib - utility functions and libraries
  - local-types - local shareable types used in the project
  - pages - Next.js pages
  - styles - global styles and variables

---

## 📦 Import Order Guidelines

To keep the project structure consistent, please follow this import order in files:

- Third-party libraries (e.g., React, Next.js, lodash)

- Global styles (/src/styles)

- Constants (/src/constants)

- Helpers (/src/helpers)

- Types (/src/types)

- Hooks (/src/hooks)

- Lib (/src/lib)

- Api (/src/api)

- Components (/src/components)

- Layouts (/src/layouts)

- Features (/src/features)

- Assets (/public/images, SVGs, icons) - \*But in general we will be using Icon component

- Local styles

---

## ⚙️ Component Files

```
Each Component have its own folder with the following structure:
src/components/ComponentName/
src/components/ComponentName/index.tsx
src/components/ComponentName/ComponentName.tsx
src/components/ComponentName/ComponentName.module.scss
src/components/ComponentName/ComponentName.types.ts

Same approach applies to Layouts.
```

<p align="left">
  <strong style="font-size: 13px; vertical-align: middle;"> ❗️Some components don't have separate types, instead types are defined directly in the component file.
That's an old approach, but we will be moving to the new one gradually.</strong>
</p>

---

Thank you for reading! Be Kind. Do Good. 🍃
