/**
 * SPDX-FileCopyrightText: Copyright (c) 2026 Sergei Mukhin
 * SPDX-License-Identifier: MIT
 */

const SHEET = new CSSStyleSheet();
SHEET.replaceSync(`
  edible-badge {
    display: inline-flex;
    align-items: center;
    padding: 1px var(--space-sm, 0.5rem);
    font-size: var(--font-sm, 0.875rem);
    font-weight: 600;
    line-height: 1.6;
    border-radius: 999px;
    border: 1px solid currentColor;
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }
  edible-badge[type="success"] {
    color: #22863a;
    background: color-mix(in srgb, #22863a 12%, transparent);
  }
  edible-badge[type="warning"] {
    color: #b08800;
    background: color-mix(in srgb, #b08800 12%, transparent);
  }
  edible-badge[type="error"] {
    color: #cf222e;
    background: color-mix(in srgb, #cf222e 12%, transparent);
  }
`);

/** @type {boolean} */
let _sheetAdopted = false;

/**
 * Ensures the component stylesheet is adopted into the document exactly once.
 *
 * @returns {void}
 */
function adoptSheet() {
  if (_sheetAdopted) return;
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, SHEET];
  _sheetAdopted = true;
}

/**
 * Pill-style status badge component. The element itself is the badge; no
 * inner DOM is rendered. The `type` attribute controls the colour variant.
 * Default (no type) uses the EdibleCSS `--accent` token.
 *
 * @element edible-badge
 *
 * @attr {'success'|'warning'|'error'} [type] - Colour variant. Omit for the default accent style.
 *
 * @example
 * <edible-badge>New</edible-badge>
 * <edible-badge type="success">Active</edible-badge>
 * <edible-badge type="warning">Pending</edible-badge>
 * <edible-badge type="error">Failed</edible-badge>
 */
export class EdibleBadge extends HTMLElement {
  static get observedAttributes() {
    return ['type'];
  }

  connectedCallback() {
    adoptSheet();
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'status');
    }
  }

  /**
   * Reflects the `type` attribute so CSS attribute selectors pick it up.
   * No DOM manipulation needed — the element itself is the badge surface.
   *
   * @param {string} _name
   * @param {string|null} _old
   * @param {string|null} _next
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  attributeChangedCallback(_name, _old, _next) {
    // Intentionally empty: CSS [type="…"] selectors update appearance automatically.
    // This callback exists solely to satisfy observedAttributes contract and
    // to confirm the attribute is live-reflected by the browser.
  }
}

customElements.define('edible-badge', EdibleBadge);
