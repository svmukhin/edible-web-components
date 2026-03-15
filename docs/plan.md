# `edible-web-components` — Package Plan

## Goal

Web components that feel like native HTML5 elements: drop them in, they look
styled, no classes required. They consume EdibleCSS tokens automatically.

## Principles

1. **No classes** — attributes only (e.g. `<edible-combobox name="city">`)
2. **No configuration** — sensible defaults, works out of the box
3. **Inherits EdibleCSS tokens** — `--accent`, `--border`, `--font-md`, etc.
   cascade in; dark mode works for free
4. **Single `<script>` tag** to activate — parallel to EdibleCSS's single
   `<link>` tag
5. **Degrades gracefully** — if JS is off, nothing crashes; elements are
   invisible or fallback to native equivalents

## Relationship to EdibleCSS

- Depends on EdibleCSS as a peer dependency (tokens must be loaded)
- Does **not** replace anything in EdibleCSS — purely additive
- Versioned independently; follows EdibleCSS major versions for compatibility

## Component Roadmap

### Phase 1 — Form enhancements (gap between native and practical)

| Component             | Replaces              | Reason                                |
| --------------------- | --------------------- | ------------------------------------- |
| `<edible-combobox>`   | `<select>` + search   | Native `<select>` not filterable      |
| `<edible-tags-input>` | multiple `<input>`    | No native multi-value text input      |
| `<edible-file-drop>`  | `<input type="file">` | Drag-and-drop area, no native styling |

### Phase 2 — Feedback & overlay

| Component          | Replaces          | Reason                                  |
| ------------------ | ----------------- | --------------------------------------- |
| `<edible-toast>`   | nothing           | No native notification element          |
| `<edible-tooltip>` | `title` attribute | Browser tooltips are unstyled           |
| `<edible-badge>`   | `<span>`          | Common UI pattern with no semantic elem |

### Phase 3 — Layout helpers

| Component            | Replaces               | Reason                               |
| -------------------- | ---------------------- | ------------------------------------ |
| `<edible-tabs>`      | `<details>` workaround | No native tab panel element          |
| `<edible-data-grid>` | `<table>`              | Sortable/filterable table beyond CSS |

## Package Structure

```text
edible-web-components/
  src/
    components/      — one file per component
    tokens.js        — reads EdibleCSS custom properties from host document
    index.js         — registers all custom elements
  dist/
    edible-wc.js     — single bundle, ESM + IIFE
  docs/
    examples/        — mirrors EdibleCSS docs structure
  package.json
  README.md
```

## Usage (target experience)

```html
<!-- Step 1: EdibleCSS (existing) -->
<link rel="stylesheet" href="edible.css" />

<!-- Step 2: Web components -->
<script src="edible-wc.js"></script>

<!-- Step 3: Just use the tag -->
<label for="city">City</label>
<edible-combobox id="city" name="city">
  <option value="ams">Amsterdam</option>
  <option value="ber">Berlin</option>
</edible-combobox>
```

No classes. No configuration. Dark mode included.

## Out of Scope

- No component framework (no React/Vue wrappers — those are downstream concerns)
- No icon library
- No layout system (CSS Grid/Flex via EdibleCSS is sufficient)
- No animation library
