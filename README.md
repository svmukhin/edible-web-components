# edible-web-components

Interactive web components for [EdibleCSS](https://github.com/svmukhin/edible-css).
Same philosophy — just add HTML, get styled components. No classes. No configuration.

> **Status**: Planning phase. Not yet published.

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

```html
<!-- 1. EdibleCSS (required peer) -->
<link
  rel="stylesheet"
  href="https://unpkg.com/@svmukhin/edible-css@latest/dist/edible.css"
/>

<!-- 2. Web components -->
<script src="https://unpkg.com/@svmukhin/edible-web-components@latest/dist/edible-wc.js" defer></script>
```

That's it. All components are now available as HTML tags.

> **Always use `defer`** when loading the script in `<head>`. Without it the
> custom element is defined before the browser has parsed the component's child
> elements (e.g. `<option>` inside `<edible-combobox>`), so `connectedCallback`
> fires on an empty element. `defer` makes the script run after the full HTML
> document is parsed, ensuring children are available on first connect.
> If you load the script at the end of `<body>` instead, `defer` is not needed.

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

### `<edible-tags-input>` — Multi-value text input

For entering multiple values as removable tags (skills, recipients, labels).

```html
<label for="skills">Skills</label>
<edible-tags-input id="skills" name="skills" placeholder="Add a skill…">
</edible-tags-input>
```

Renders typed values as pill-style tags. Press `Enter` or `,` to confirm each tag.
Submits as a comma-separated hidden field.

### `<edible-file-drop>` — Drag-and-drop file upload

A styled drop target that wraps `<input type="file">`.

```html
<edible-file-drop name="attachment" accept=".pdf,.docx" multiple>
</edible-file-drop>
```

Shows file name(s) after selection. Falls back to a standard file picker on click.

### `<edible-toast>` — Notification message

Programmatically triggered notification that auto-dismisses.

```html
<!-- Declare the outlet once -->
<edible-toast id="notifications"></edible-toast>
```

```js
document.getElementById("notifications").show("File saved successfully.");
document.getElementById("notifications").show("Something went wrong.", "error");
```

### `<edible-tooltip>` — Styled tooltip

Replaces the browser's unstyled `title` attribute with a consistent popover.

```html
<button>
  Delete
  <edible-tooltip>This action cannot be undone.</edible-tooltip>
</button>
```

### `<edible-tabs>` — Tab panel

Native HTML has no tab element. This fills the gap with minimal markup.

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

Same as EdibleCSS: modern evergreen browsers (Chrome, Firefox, Safari, Edge).
Custom Elements v1 is required — supported natively in all target browsers.

## Relationship to EdibleCSS

|                    | EdibleCSS             | edible-web-components           |
| ------------------ | --------------------- | ------------------------------- |
| Requires JS        | No                    | Yes                             |
| Activation         | `<link>`              | `<script>`                      |
| Uses classes       | Never                 | Never                           |
| Covers             | Native HTML5 elements | Interactive custom elements     |
| Versioned together | —                     | Tracks EdibleCSS major versions |

---

## License

MIT © Sergei Mukhin
