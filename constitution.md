# `edible-web-components` Constitution

## Purpose

`edible-web-components` is a companion package to EdibleCSS. It extends the
"just add HTML" philosophy into territory where CSS alone cannot go: interactive
components that require JavaScript by nature (filtering, notifications, drag and
drop). Every component must feel like a native HTML5 element — an extension of
the platform, not a framework on top of it.

## Core Principles

### I. No Classes

**Custom elements are configured through HTML attributes, never CSS classes.**

Every component must be usable without a single class attribute. Configuration
is expressed via standard HTML attributes (`name`, `placeholder`, `disabled`,
`multiple`, etc.) or component-specific attributes. Class-based APIs are
prohibited.

**Rationale**: Mirrors EdibleCSS Principle I. Preserves the "just write HTML"
developer experience throughout the ecosystem.

### II. Single `<script>` Tag Activation

**One script tag. Nothing else required beyond EdibleCSS itself.**

The entire library registers all components when the script is included. No
`import`, no `customElements.define()` call, no initialization function
required from the consumer.

```html
<link rel="stylesheet" href="edible.css" />
<script src="edible-wc.js"></script>
<!-- done -->
```

**Rationale**: Mirrors EdibleCSS Principle III. Zero barrier to entry.

### III. Inherits EdibleCSS Design Tokens

**Components MUST consume EdibleCSS CSS custom properties. No hardcoded values.**

All colors, spacing, typography, and border values must reference EdibleCSS
tokens (`--accent`, `--border`, `--font-md`, `--space-sm`, etc.) from the host
document via `var()`. Components must never hardcode design values.

Consequence: dark mode, custom token overrides, and future EdibleCSS theme
updates propagate to components automatically.

**Rationale**: Components and the page they live in must look like one coherent
system, not two overlapping design languages.

### IV. Graceful Degradation

**A page with `edible-wc.js` blocked or disabled must not break.**

If JavaScript is unavailable or the script fails to load, unknown custom
elements must not crash the page or produce visible errors. Where possible,
provide a `<noscript>` fallback recommendation in documentation.

**Rationale**: Reliability over features. EdibleCSS targets environments where
JS may be restricted (intranets, hardened browsers, email previews).

### V. Light DOM First, Shadow DOM When Necessary

**Prefer light DOM rendering. Use Shadow DOM only when encapsulation is
unavoidable.**

Light DOM components allow EdibleCSS styles to cascade naturally without any
`::part()` gymnastics. Shadow DOM may be used for components that require true
style isolation (e.g. a sandboxed preview), but must expose `::part()` hooks for
all major sub-elements.

**Rationale**: Shadow DOM breaks style inheritance. Since EdibleCSS delivers all
its value through inherited styles and cascaded custom properties, shadow DOM is
the enemy of integration unless handled carefully.

### VI. Fill Native Gaps Only

**A component may only exist if the equivalent native HTML5 element cannot
accomplish the same use case with CSS alone.**

Before adding any component, the decision checklist must be applied:

1. Can EdibleCSS style a native element to achieve this? →
   **Use native, reject component**
2. Can a CSS-only pattern (`<details>`, `<dialog>`, `:has()`) solve it? →
   **Use CSS, reject component**
3. Does the interaction genuinely require JavaScript? →
   **Candidate for a component**
4. Is this a common enough use case to justify the maintenance burden? →
   **Proceed**

**Rationale**: Component libraries rot. Every component added is a maintenance
liability. Ship only what truly cannot exist as styled HTML.

## Immutable Laws

1. **No CSS classes in the public API.** Attributes only.
2. **No design values hardcoded.** All values via EdibleCSS tokens.
3. **No peer dependencies beyond EdibleCSS.** Zero external runtime libraries.
4. **No component framework required** (no React, Vue, Angular wrappers in core).
5. **Every component must be documented with a plain HTML copy-paste example.**
6. **Breaking changes require a MAJOR version bump.**
7. **MIT licensed. Always free and open source.**

## Versioning Policy

- **MAJOR**: Breaking API changes, dropped component support, token contract changes
- **MINOR**: New components, new optional attributes, non-breaking enhancements
- **PATCH**: Bug fixes, accessibility patches, documentation clarifications

Version compatibility is declared per EdibleCSS major version:

```text
edible-web-components@1.x → requires edible-css@1.x
```

## Governance

Amendments to this constitution follow the same procedure as EdibleCSS:

1. Document the proposed change with rationale
2. Assess impact on existing consumers
3. Require explicit MAJOR bump if an Immutable Law is modified

**Version**: 0.1.0 | **Created**: 2026-03-13
