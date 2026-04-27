# Axumpulse theming

This document covers **two codebases**: the **Next.js web app** (this folder, `axumpulse/`), which centralizes design tokens in `globals.css` and Tailwind; and the **Expo React Native mobile app** (`../axumpulse-mobile/`), which uses a small TypeScript token module plus `StyleSheet` and navigator options. There is **no shared CSS file** between them; brand colors are kept in sync manually (both use the same EthioTells lemon `#B5F127` / `#b5f127` and deep blue `#0082C6`).

---

## Web app (Next.js)

### Single entry: `src/app/globals.css`

The root layout imports the global stylesheet once, so every route inherits the same design tokens and base rules.

- **File:** `src/app/layout.tsx` imports `./globals.css` on the root `<body>` alongside Google fonts (Geist, Archivo) exposed as CSS variables (`--font-geist-sans`, `--font-landing`, etc.).
- **shadcn/ui:** `components.json` sets `"css": "src/app/globals.css"`, so CLI-generated components expect tokens defined there.

Nothing in a feature folder needs to import `globals.css` again; components only use class names or `var(...)` that resolve against these globals.

### Stack: Tailwind CSS v4 + CSS variables

`globals.css` starts with:

- `@import "tailwindcss"` — Tailwind v4 processes this file as the CSS-first config surface.
- `@import "tw-animate-css"` — shared animation utilities.
- `@custom-variant dark (&:is(.dark *))` — the `dark:` variant applies when an ancestor has the `dark` class (not only on the same element).

Theming is mostly **CSS custom properties** (`:root` and `.dark`) plus an **`@theme inline`** block that maps those properties into Tailwind theme keys (for example `--color-background` → `bg-background`).

### Three conceptual layers in `globals.css`

#### 1. `@theme inline { ... }` — Tailwind-facing tokens

This block declares design tokens Tailwind understands: semantic colors (`--color-primary`, `--color-card`, …), radii (`--radius-*`), fonts, chart colors, sidebar colors, and the **neumorphic** palette (cyber blue, neon magenta, lime pulse, shadows, glows).

Many entries **bridge** to runtime variables, for example:

- `--color-background: var(--background);`

So when you write `className="bg-background"`, Tailwind emits something that ultimately reads `--background` from the document.

Fixed hex/oklch-style tokens in `@theme` (for example neumorphic accent colors) are static unless overridden elsewhere.

#### 2. `:root` and `.dark` — values that actually swap for light/dark

Semantic tokens used across shadcn-style components are reassigned per mode:

- **`:root`** — light mode defaults (`--background`, `--foreground`, `--primary`, `--card`, …) using `oklch(...)`.
- **`.dark`** — dark mode overrides for the same names.

Brand-specific variables also live here, for example:

- `--ethio-lemon`, `--ethio-deep-blue`, `--ethio-rail`, `--ethio-pill`, and related `color-mix(...)` helpers.
- Neumorphic surface tokens: `--neumorphic-bg`, `--neumorphic-surface`, `--neumorphic-text`, `--neumorphic-muted` (light vs dark blocks).

Changing light/dark behavior for the whole app is done by editing these blocks, not by hunting through individual components.

#### 3. `@layer base` and `@layer utilities` — global behavior and scoped utilities

**Base (`@layer base`)**

- Universal border/outline defaults: `* { @apply border-border outline-ring/50; }`
- **Body:** `body { @apply bg-background text-foreground; }` so the default page chrome follows semantic background and text colors.

**Utilities:**

- **Marketing shell:** `.landing-ethio` defines local HSL variables (`--landing-ink`, `--landing-lemon`, …) and sets background/text for anything wrapped in that class.
- **Trainee app shell:** `.user-app-ethio` sets font stack and default text color; `.dark .user-app-ethio` adjusts for dark mode.
- **Trainee utility classes** (prefixed `user-app-*`): composed with `@apply` and/or raw `var(--ethio-…)` — for example `user-app-page`, `user-app-ink`, `user-app-muted`, `user-app-surface`, `user-app-btn-primary`, `user-app-sidebar-rail`, gradient/active states, info banners, subscription panels. These are the main way `/user/*` layouts and pages get a consistent EthioTells lime + blue language without repeating long class strings.

**Misc:** helper classes like `.no-scrollbar` live outside layers as plain CSS.

### How dark mode is turned on

Runtime theme is **class-based** on the document root:

- `src/lib/app-theme.ts` exports `applyAppTheme(theme)` which sets `document.documentElement.classList` to add or remove `dark` for `'dark'`, `'light'`, or `'system'` (system uses `prefers-color-scheme`).
- `src/components/theme-provider.tsx` is a client component that, when the user is known, merges **cached** `localStorage` theme with **`getUserSettings()`** from the API, then calls `applyAppTheme` and subscribes to `matchMedia` changes when the preference is `system`.

Because of `@custom-variant dark (&:is(.dark *))`, any `dark:` utility anywhere under `<html class="dark">` resolves correctly.

### How web components use all of this

#### A. shadcn / semantic Tailwind classes

UI primitives under `src/components/ui/` use tokens wired in `@theme` + `:root`/`.dark`, for example:

- `bg-primary`, `text-primary-foreground`, `bg-background`, `text-foreground`, `border-border`, `ring-ring`, `bg-destructive`, etc.

Those classes map to CSS variables, so they **automatically** follow light/dark when the root class toggles.

#### B. Trainee “Ethio” utilities

Layouts and pages under `src/app/user/` combine a wrapper like `user-app-ethio` with utilities such as:

- `user-app-page` — page background (light grey / neumorphic dark background variable).
- `user-app-ink` / `user-app-muted` — hierarchy text colors with `dark:` variants.
- `user-app-surface`, `user-app-border`, `user-app-link`, `user-app-btn-primary`, rail/sidebar classes, banners, etc.

These utilities are **defined only in `globals.css`**; components just add the class names.

#### C. Direct `var(--token)` in JSX or CSS

Where needed, components use arbitrary values, for example `text-[var(--ethio-lemon)]` or styles referencing `--neumorphic-bg`. That still depends on `globals.css` having defined the variable on `:root` or `.dark`.

#### D. Scoped marketing theme

Pages that wrap content in `.landing-ethio` get a self-contained palette (`--landing-*` HSL variables) without changing global shadcn tokens for the rest of the app.

#### E. Trainer public sites (separate from `globals.css` user tokens)

`src/components/trainer-site/ThemeProvider.tsx` injects **trainer-specific** CSS variables (`--trainer-primary`, `--trainer-secondary`, …) on `document.documentElement` and on a wrapper `div`. That is a **per-tenant** overlay for trainer-branded sites, not the main app light/dark system.

### Web practical checklist

| Goal | Where to look |
|------|----------------|
| Change default light/dark colors for shadcn-style UI | `:root` and `.dark` in `globals.css` |
| Add a new Tailwind color name (e.g. `bg-foo`) | `@theme inline` + underlying `--foo` in `:root`/`.dark` if it should theme |
| Change trainee dashboard look without touching every page | `@layer utilities` (`user-app-*`) in `globals.css` |
| Change how dark mode is chosen | `ThemeProvider` + `applyAppTheme` in `src/lib/app-theme.ts` |
| Trainer storefront colors | `trainer-site/ThemeProvider` + components using `--trainer-*` |

---

## Mobile app (Expo / React Native)

The mobile project lives in the sibling folder **`axumpulse-mobile/`** (same repository root as this Next app). React Native does not use `globals.css`; styling is **JavaScript objects** (`StyleSheet.create`) and inline style props, with shared colors centralized in one module.

### Token module: `src/theme/ethio.ts`

This is the mobile equivalent of the web brand block in `globals.css` (`--ethio-lemon`, `--ethio-deep-blue`, etc.). It exports:

| Export | Purpose |
|--------|---------|
| `brand` | `lemon`, `lemonCard`, `deepBlue`, `black`, `white`, `bodyBg`, `footerBg` — hex strings aligned with Ethio / Telebirr guidelines |
| `text` | `onBrand`, `primary`, `secondary`, `muted` — typography on light surfaces |
| `tabBar` | `active` / `inactive` colors for icons and labels on the **lemon** bottom bar |
| `statusBar` | `style` (`'dark'` content on light chrome) and `background` for `expo-status-bar` |

Screens and components **import** these values and plug them into `StyleSheet` or props (for example `color={brand.deepBlue}`, `backgroundColor: brand.bodyBg`).

### Where tokens are applied globally

**`App.tsx`** (entry shell):

- Imports `brand`, `text`, `tabBar`, `statusBar` from `./src/theme/ethio`.
- **`SafeAreaView`** — `backgroundColor: brand.bodyBg` for the top safe area.
- **`StatusBar`** (`expo-status-bar`) — uses `statusBar.style` and `statusBar.background`.
- **Root `Stack.Navigator`** — `screenOptions.contentStyle.backgroundColor: brand.bodyBg` so stack screens share the light grey page background.
- **`WorkoutsStackNavigator`** — same `contentStyle` for nested stack.
- **Custom `ScrollableTabBar`** — `StyleSheet` uses `brand.lemon` for the bar container; `Ionicons` and labels use `tabBar.active` / `tabBar.inactive` for focus states.
- **Loading / unsupported-role** mini-layouts — `brand.bodyBg`, `text.primary`, `text.secondary`, `brand.lemon` for primary buttons.

There is no global CSS cascade: anything not wrapped by these navigators still must set its own `backgroundColor` per screen.

### How individual screens use theming

1. **Import tokens** — e.g. `import { brand, text } from '../theme/ethio';` then reference in `StyleSheet.create({ ... })` or inline `style={{ color: text.primary }}`.
2. **Local palettes** — some screens (e.g. `LoginScreen`, `SettingsScreen`) use **hard-coded** hex/rgba in their own `StyleSheet` for a specific visual (dark slate login, dark settings). Those are **not** wired to `ethio.ts` today; updating brand-wide mobile chrome means touching both `ethio.ts` and any screen-specific literals.
3. **Native shell config** — `app.json` sets `userInterfaceStyle: "light"`, splash `backgroundColor`, and Android adaptive icon `backgroundColor` to **`#B5F127`** so OS-level surfaces match the lemon brand.

### Dark mode on mobile

Unlike the web app, the Expo config opts into **light** UI at the OS level (`userInterfaceStyle: "light"`). There is **no** equivalent of `applyAppTheme` or a user-controlled light/dark switch in the mobile tree at the time of this doc. Individual dark-styled screens are a **local** `StyleSheet` choice, not a global theme context.

### Mobile practical checklist

| Goal | Where to look |
|------|----------------|
| Change brand lemon / blue / grey background for the whole app chrome | `src/theme/ethio.ts` + `App.tsx` (navigator + tab bar) + `app.json` splash/icon |
| Change tab bar appearance | `ScrollableTabBar` and `tabBarStyles` in `App.tsx`; `tabBar` in `ethio.ts` |
| Find screens already using shared tokens | Grep for `from '../theme/ethio'` or `from './src/theme/ethio'` |
| Align a screen with brand tokens | Replace hard-coded hex with `brand.*` / `text.*` imports |

---

## Related files (quick reference)

### Web (`axumpulse/`)

| File | Role |
|------|------|
| `src/app/globals.css` | Tailwind imports, `@theme`, tokens, base body styles, utilities |
| `src/app/layout.tsx` | Imports `globals.css`, font CSS variables on `<body>` |
| `src/lib/app-theme.ts` | `applyAppTheme` — toggles `dark` on `<html>` |
| `src/components/theme-provider.tsx` | Syncs user settings + cache to `applyAppTheme` |
| `components.json` | Points shadcn at `globals.css` |
| `src/styles/animations.css` | Extra animations (imported from layout, not theming tokens) |

### Mobile (`axumpulse-mobile/`)

| File | Role |
|------|------|
| `src/theme/ethio.ts` | Brand, text, tab bar, and status bar color tokens |
| `App.tsx` | Safe area, StatusBar, stack/tab navigators, custom tab bar — wires `ethio` tokens |
| `app.json` | Expo name, `userInterfaceStyle`, splash and adaptive icon colors |
| `scripts/build-brand-assets.mjs` | Optional asset pipeline notes (launcher/splash); theme constants for generated art |
