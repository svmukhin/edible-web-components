# edible-web-components

Interactive web components for [EdibleCSS](https://github.com/svmukhin/edible-css).
Same philosophy — just add HTML, get styled components. No classes. No configuration.

## Features

- **Zero Classes** — Attribute-based API only, no CSS classes required
- **Single Script Tag** — Add `<script src="edible-wc.js" defer></script>` and
  all components activate
- **EdibleCSS Tokens** — Colors, spacing, and dark mode work automatically via
  inherited custom properties
- **Accessible** — Full ARIA wiring, keyboard navigation, and focus management
  built in
- **Form-ready** — Form components participate in `FormData` natively
- **Tiny** — Under 6 KB gzipped for the full component set
- **No Shadow DOM** — Light DOM first; EdibleCSS styles cascade in naturally
- **Modern Browsers** — Chrome, Firefox, Safari, Edge (last 2 versions)

## What Is This?

EdibleCSS styles native HTML5 elements automatically. But some UI patterns
genuinely require JavaScript — a searchable dropdown, a multi-tag input, a
toast notification. Native HTML has no equivalent elements for these.

`edible-web-components` fills that gap with custom elements that:

- look and feel like native HTML5 tags
- inherit EdibleCSS design tokens automatically (colors, spacing, dark mode)
- require zero CSS classes
- activate with a single `<script>` tag

## Installation

### CDN

```html
<!-- 1. EdibleCSS (required peer) -->
<link
  rel="stylesheet"
  href="https://unpkg.com/@svmukhin/edible-css@latest/dist/edible.css"
/>

<!-- 2. Web components -->
<script
  src="https://unpkg.com/@svmukhin/edible-web-components@latest/dist/edible-wc.js"
  defer
></script>
```

That's it. All components are now available as HTML tags.

> **Always use `defer`** when loading the script in `<head>`. Without it the
> custom element is defined before the browser has parsed the component's child
> elements (e.g. `<option>` inside `<edible-combobox>`), so `connectedCallback`
> fires on an empty element. `defer` makes the script run after the full HTML
> document is parsed, ensuring children are available on first connect.
> If you load the script at the end of `<body>` instead, `defer` is not needed.

### npm

```sh
npm install @svmukhin/edible-web-components
```

```js
import "@svmukhin/edible-web-components";
```

## Components

### `<edible-combobox>` — Searchable dropdown

Replaces `<select>` when the list is long enough to need filtering.

```html
<label for="city">City</label>
<edible-combobox id="city" name="city" placeholder="Select a city…">
  <option value="ams">Amsterdam</option>
  <option value="ber">Berlin</option>
  <option value="par">Paris</option>
  <option value="rom">Rome</option>
  <option value="vie">Vienna</option>
</edible-combobox>
```

| Attribute     | Type    | Description                                |
| ------------- | ------- | ------------------------------------------ |
| `name`        | string  | Field name submitted with the form         |
| `placeholder` | string  | Placeholder text shown in the search input |
| `disabled`    | boolean | Disables the component                     |
| `required`    | boolean | Marks the field as required                |

**Keyboard**: `Arrow Down/Up` navigate options · `Enter` selects
· `Escape`/`Tab` closes.

**JavaScript**: `.value` getter/setter to read or set the selected value.

### `<edible-tags-input>` — Multi-value tag input

For entering multiple values as removable pill tags (skills, recipients,
labels).

```html
<label for="skills">Skills</label>
<edible-tags-input id="skills" name="skills" placeholder="Add a skill…">
</edible-tags-input>
```

| Attribute     | Type    | Description                           |
| ------------- | ------- | ------------------------------------- |
| `name`        | string  | Field name submitted with the form    |
| `placeholder` | string  | Placeholder shown while no tags exist |
| `disabled`    | boolean | Disables all interaction              |

**Keyboard**: `Enter` or `,` commits a tag · `Backspace` on empty input removes
the last tag.

**JavaScript**: `.value` (array getter) · `.add(tag)` · `.remove(tag)`.

Submits as a comma-separated hidden field under `name`.

### `<edible-file-drop>` — Drag-and-drop file upload

A styled drop target that wraps `<input type="file">`.

```html
<edible-file-drop name="attachment" accept=".pdf,.docx" multiple>
</edible-file-drop>
```

| Attribute  | Type    | Description                        |
| ---------- | ------- | ---------------------------------- |
| `name`     | string  | Field name submitted with the form |
| `accept`   | string  | MIME types or extensions to accept |
| `multiple` | boolean | Allow selecting multiple files     |
| `disabled` | boolean | Disables interaction               |

**Keyboard**: `Enter` or `Space` opens the file picker.

**JavaScript**: `.files` getter returns the current `FileList`.

### `<edible-toast>` — Notification message

Programmatically triggered notification that auto-dismisses.

```html
<!-- Declare the outlet once, anywhere on the page -->
<edible-toast id="notifications"></edible-toast>
```

```js
const t = document.getElementById("notifications");
t.show("File saved successfully.");
t.show("Something went wrong.", "error");
t.show("Session expiring soon.", "warning", 8000);
```

**Method**: `.show(message, type = 'info', duration = 4000)`

| `type`    | Description      |
| --------- | ---------------- |
| `info`    | Default (accent) |
| `success` | Green            |
| `warning` | Yellow           |
| `error`   | Red              |

Toasts stack in the bottom-right corner and auto-dismiss after `duration` ms.
A shared region element is reused across all `<edible-toast>` instances.

### `<edible-tooltip>` — Styled tooltip

Replaces the browser's unstyled `title` attribute with a consistent popover.
Place it as the last child of any interactive element.

```html
<button>
  Delete
  <edible-tooltip>This action cannot be undone.</edible-tooltip>
</button>

<a href="/docs">
  Learn more
  <edible-tooltip>Opens the documentation page.</edible-tooltip>
</a>
```

Tooltip text comes from the element's `textContent`. Shows on hover and
keyboard focus; `aria-describedby` is wired automatically.

### `<edible-badge>` — Status badge

A pill-style inline badge. The element itself is the badge surface.

```html
<edible-badge>New</edible-badge>
<edible-badge type="success">Active</edible-badge>
<edible-badge type="warning">Pending</edible-badge>
<edible-badge type="error">Failed</edible-badge>
```

| `type`    | Color  |
| --------- | ------ |
| _(none)_  | Accent |
| `success` | Green  |
| `warning` | Yellow |
| `error`   | Red    |

### `<edible-tabs>` — Tab panel

Accessible tab interface. Declare `<edible-tab>` children with a `label`
attribute — the tablist is built automatically.

```html
<edible-tabs>
  <edible-tab label="Overview">
    <p>Content for the Overview tab.</p>
  </edible-tab>
  <edible-tab label="Details">
    <p>Content for the Details tab.</p>
  </edible-tab>
  <edible-tab label="History">
    <p>Content for the History tab.</p>
  </edible-tab>
</edible-tabs>
```

**Keyboard**: `Arrow Left/Right` moves between tabs · `Home`/`End` jumps to
first/last.

Full ARIA wiring: `role="tablist"`, `role="tab"`, `role="tabpanel"`,
`aria-selected`, `aria-controls`, `aria-labelledby`, roving `tabindex`.

### `<edible-nav-dropdown>` — Navigation dropdown

Groups navigation links under a labelled trigger. Wrap it in a `<li>` and
place it inside a `<nav><ul>`. Child `<a>` or `<button>` elements become the
dropdown items — the trigger button is built automatically.

```html
<nav>
  <ul>
    <li><a href="/">Home</a></li>

    <li>
      <edible-nav-dropdown label="Products">
        <a href="/products/basic">Basic</a>
        <a href="/products/pro">Pro</a>
        <a href="/products/enterprise">Enterprise</a>
      </edible-nav-dropdown>
    </li>

    <li>
      <edible-nav-dropdown label="Resources">
        <a href="/docs">Documentation</a>
        <a href="/blog">Blog</a>
      </edible-nav-dropdown>
    </li>

    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
```

| Attribute  | Type    | Description                                    |
| ---------- | ------- | ---------------------------------------------- |
| `label`    | string  | **Required.** Text shown on the trigger button |
| `disabled` | boolean | Disables the trigger and all child links       |

**Hover**: opens on `mouseenter`, closes on `mouseleave` (with a brief delay so
the cursor can travel to the dropdown list without it closing).

**Keyboard on trigger**: `Arrow Down` opens and focuses the first item ·
`Arrow Up` opens and focuses the last item · `Escape` closes.

**Keyboard inside list**: `Arrow Down/Up` cycle through items (wrapping) ·
`Arrow Up` on the first item closes and returns focus to the trigger ·
`Home`/`End` jump to first/last · `Escape` closes and returns focus to the
trigger.

Opening one `<edible-nav-dropdown>` automatically closes all others on the
page. Uses the WAI-ARIA APG _Disclosure Navigation Menu_ pattern.

## Design Tokens

All components inherit EdibleCSS custom properties. Override at `:root` level
to affect both EdibleCSS and the components simultaneously:

```css
:root {
  --accent: #7c3aed; /* purple — applied everywhere automatically */
}
```

No component-specific CSS variables needed.

## Browser Support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge).
Custom Elements v1 and `adoptedStyleSheets` are required — both supported
natively in all target browsers.

## Relationship to EdibleCSS

|                    | EdibleCSS             | edible-web-components           |
| ------------------ | --------------------- | ------------------------------- |
| Requires JS        | No                    | Yes                             |
| Activation         | `<link>`              | `<script>`                      |
| Uses classes       | Never                 | Never                           |
| Covers             | Native HTML5 elements | Interactive custom elements     |
| Versioned together | —                     | Tracks EdibleCSS major versions |

## Development

```bash
# Install dependencies
npm install

# Build (outputs dist/edible-wc.js and dist/edible-wc.esm.js)
npm run build

# Run tests
npm test
```

## Contributing

Contributions are welcome! Please note that edible-web-components is intentionally
minimal and opinionated. New components must align with the
[EdibleCSS constitution](docs/constitution.md) principles.

### Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/)
for automated versioning and changelog generation. Please format your commit
messages as:

```text
<type>(<scope>): <description>

[optional body]
[optional footer]
```

**Types:**

- `feat:` - New feature (bumps minor version)
- `fix:` - Bug fix (bumps patch version)
- `docs:` - Documentation only changes
- `style:` - Code style changes (formatting, missing semi-colons, etc)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**

```bash
git commit -m "feat: add print stylesheet"
git commit -m "fix(forms): correct input border radius"
git commit -m "docs: update CDN installation instructions"
```

## License

MIT — see [LICENSE.txt](LICENSE.txt) for details.

## Credits

Created by [Sergei Mukhin](https://github.com/svmukhin).
Built for use with [EdibleCSS](https://github.com/svmukhin/edible-css).
