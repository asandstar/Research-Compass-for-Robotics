# Dark Mode Consistency Audit

## Executive Summary

The dark mode implementation uses Tailwind CSS `darkMode: 'class'` with a ThemeContext that manages theme state and applies the `dark` class to `document.documentElement`. While the infrastructure is in place, there are significant gaps in component-level dark mode styling.

**Overall Assessment**: Incomplete - Theme switching works correctly, but many components lack proper dark mode styling.

---

## 1. Theme Infrastructure

### 1.1 ThemeContext.tsx

| Check | Status | Details |
|-------|--------|---------|
| HTML element dark class | ✅ | `document.documentElement.classList.add/remove('dark')` |
| localStorage persistence | ✅ | `research-compass-theme` key |
| System preference detection | ✅ | `prefers-color-scheme: dark` |
| Server-side default | ⚠️ | Returns 'light' on SSR, causing potential flash |

**Issue**: Hydration mismatch risk. Server renders with light theme, client switches to dark after hydration → **light flash on first load**.

### 1.2 tailwind.config.js

| Check | Status | Details |
|-------|--------|---------|
| darkMode: 'class' | ✅ | Configured correctly |
| Dark color palette | ✅ | Complete: `dark.bg`, `dark.bg2`, `dark.ink`, `dark.muted`, `dark.surface`, `dark.border-*`, `dark.accent*` |

### 1.3 globals.css

| Check | Status | Details |
|-------|--------|---------|
| `.dark body` selector | ❌ | Incorrect selector - should be `body.dark` or rely on Tailwind |
| `.dark .text-ink` | ✅ | Maps to `#e7e5e4` |
| `.dark .text-muted` | ✅ | Maps to `#a8a29e` |
| `.dark .text-accent` | ✅ | Maps to `#2dd4bf` |
| `.dark .bg-bg` | ❌ | **Missing** - custom bg color won't switch automatically |
| `.dark .bg-bg2` | ❌ | **Missing** |
| `.dark .bg-surface` | ❌ | **Missing** |
| `.dark .border-border-subtle` | ❌ | **Missing** |

**Root Cause**: Tailwind's arbitrary properties like `bg-bg` do NOT automatically map to `dark:bg-dark-bg`. Each component must explicitly use `dark:` variants.

---

## 2. Component-level Issues

### 2.1 Navbar.tsx

| Issue | Location | Actual | Expected | Priority |
|-------|----------|--------|----------|----------|
| nav background | L69 | `bg-surface/80` | `bg-surface/80 dark:bg-dark-surface/80` | High |
| nav border | L69 | `border-border-subtle` | `border-border-subtle dark:border-dark-border-subtle` | High |
| brand text | L76 | `text-ink` | `text-ink dark:text-dark-ink` | High |
| divider | L83 | `bg-border-subtle` | `bg-border-subtle dark:bg-dark-border-subtle` | Medium |
| search button | L116 | `bg-bg2/70 text-muted border-border-subtle hover:text-ink` | Add `dark:bg-dark-bg2/70 dark:text-dark-muted dark:border-dark-border-subtle dark:hover:text-dark-ink` | High |
| theme toggle | L135 | `text-muted hover:text-ink hover:bg-bg2` | Add `dark:text-dark-muted dark:hover:text-dark-ink dark:hover:bg-dark-bg2` | High |
| mobile menu overlay | L155 | `bg-ink/20` | `bg-ink/20 dark:bg-dark-ink/20` | Medium |
| mobile menu | L156 | `bg-surface border-border-subtle` | Add `dark:bg-dark-surface dark:border-dark-border-subtle` | High |
| mobile nav links | L170 | `text-ink hover:bg-bg2` | Add `dark:text-dark-ink dark:hover:bg-dark-bg2` | High |

### 2.2 Dashboard (app/page.tsx)

| Issue | Location | Actual | Expected | Priority |
|-------|----------|--------|----------|----------|
| Hero section | L82 | `bg-gradient-to-br from-accent/5 via-white to-accent2/5` | Add `dark:via-dark-bg` | High |
| Hero text | L92 | `text-ink` | Add `dark:text-dark-ink` | High |
| Stats cards | L164-L199 | Various | Multiple `text-ink`, `text-muted`, `bg-bg2` need dark variants | High |
| Card headers | L213, L259, L309 | `text-ink` | Add `dark:text-dark-ink` | Medium |
| ScoreBar background | L379 | `bg-bg2` | Add `dark:bg-dark-bg2` | Medium |
| ScoreBar text | L385 | `text-ink` | Add `dark:text-dark-ink` | Medium |

### 2.3 Button.tsx

| Variant | Dark Support | Issues | Priority |
|---------|-------------|--------|----------|
| primary | ✅ | Works (uses accent colors) | - |
| secondary | ⚠️ | Has dark variants but incomplete | Medium |
| danger | ❌ | No dark variants | Medium |
| hero | ✅ | Works (uses accent colors) | - |
| ghost | ⚠️ | Has partial dark variants | Medium |
| focus | ✅ | Works (uses accent colors) | - |

### 2.4 Card.tsx

| Check | Status | Details |
|-------|--------|---------|
| Dark background | ✅ | `bg-surface dark:bg-dark-surface` |
| Dark border | ✅ | `border-border-subtle dark:border-dark-border-subtle` |
| Dark shadow | ✅ | `shadow-card dark:shadow-none` |

### 2.5 Tag.tsx

| Variant | Dark Support | Issues | Priority |
|---------|-------------|--------|----------|
| secondary | ✅ | Has dark variants | - |
| solid | ❌ | Uses inline styles with custom colors, no dark support | High |
| outline | ❌ | Same issue | High |
| soft | ❌ | Same issue | High |

---

## 3. Pages to Verify

### 3.1 Dashboard (`/`)

**Issues Found**:
- Hero section has white background in dark mode
- Stats cards use `text-ink` without dark variants
- Active ideas list uses `text-ink`, `text-muted`, `bg-bg2` without dark variants
- Score bar uses `bg-bg2` without dark variant

### 3.2 Focus (`/focus`)

**Not inspected** - likely has similar issues with text and background colors.

### 3.3 Ideas (`/ideas`)

**Not inspected** - likely has similar issues.

### 3.4 Papers (`/papers`)

**Not inspected** - likely has similar issues.

### 3.5 MVEs (`/mves`)

**Not inspected** - likely has similar issues.

---

## 4. Key Problems & Fix Recommendations

### Problem 1: Global Color Mapping Missing

**Root Cause**: Custom colors like `bg-bg`, `text-ink`, `bg-surface` don't auto-map to dark variants.

**Fix**: Add global overrides in globals.css:
```css
.dark .bg-bg { background-color: #1c1917; }
.dark .bg-bg2 { background-color: #292524; }
.dark .bg-surface { background-color: #292524; }
.dark .text-ink { color: #e7e5e4; }
.dark .text-muted { color: #a8a29e; }
.dark .border-border-subtle { border-color: rgba(255,255,255,0.06); }
.dark .border-border-default { border-color: rgba(255,255,255,0.09); }
.dark .border-border-strong { border-color: rgba(255,255,255,0.15); }
```

### Problem 2: Navbar Missing Dark Variants

**Root Cause**: Navbar uses many custom colors without `dark:` variants.

**Fix**: Add `dark:` variants to all color classes in Navbar.tsx.

### Problem 3: Light Flash on First Load

**Root Cause**: Server renders light theme, client switches to dark after hydration.

**Fix**: Implement `next-themes` or add inline script in layout to detect theme before hydration.

### Problem 4: body Background Not Switching

**Root Cause**: `.dark body` selector may not work correctly depending on how classes are applied.

**Fix**: Change to `body.dark` or use `bg-bg dark:bg-dark-bg` on AppShell wrapper.

---

## 5. Priority Ranking

| Priority | Issues | Components |
|----------|--------|------------|
| 🔴 Critical | Background colors not switching, text unreadable in dark mode | Navbar, Dashboard |
| 🟡 High | Missing dark variants for custom colors | Globally |
| 🟢 Medium | Light flash on first load, incomplete component dark support | ThemeContext, Button, Tag |

---

## 6. Testing Recommendations

1. **Manual Testing**: Verify dark mode on all pages
2. **Automated Testing**: Add tests for ThemeContext state transitions
3. **Linting**: Add ESLint rule to enforce `dark:` variants for custom colors

---

## 7. Files to Modify

| File | Changes |
|------|---------|
| `app/globals.css` | Add global `.dark` overrides for custom colors |
| `components/Navbar.tsx` | Add `dark:` variants to all color classes |
| `app/page.tsx` | Add `dark:` variants to Hero section and cards |
| `components/ui/Button.tsx` | Complete dark variants for all variants |
| `components/ui/Tag.tsx` | Add dark support for solid/outline/soft variants |
| `context/ThemeContext.tsx` | Add anti-flash script |