/**
 * SPDX-FileCopyrightText: Copyright (c) 2026 Sergei Mukhin
 * SPDX-License-Identifier: MIT
 */

const SHEET = new CSSStyleSheet();
SHEET.replaceSync(`
  edible-tooltip {
    display: none;
  }
  [data-edible-tooltip-popup] {
    position: fixed;
    z-index: 9998;
    padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
    font-size: var(--font-sm, 0.875rem);
    color: var(--bg-primary, #fff);
    background: var(--text-primary, #24292f);
    border-radius: 4px;
    max-width: 280px;
    line-height: 1.4;
    pointer-events: none;
    white-space: normal;
  }
  [data-edible-tooltip-popup]::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: var(--text-primary, #24292f);
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

/** @type {number} */
let _idCounter = 0;

/**
 * Styled tooltip component. Place it as the last child of any interactive
 * element; it registers on its parent and shows on hover or focus.
 * The tooltip text is the component's `textContent`.
 *
 * @element edible-tooltip
 *
 * @example
 * <button>
 *   Delete
 *   <edible-tooltip>This action cannot be undone.</edible-tooltip>
 * </button>
 */
export class EdibleTooltip extends HTMLElement {
  constructor() {
    super();
    /** @type {HTMLElement|null} */
    this._popup = null;
    this._show = this._show.bind(this);
    this._hide = this._hide.bind(this);
  }

  connectedCallback() {
    adoptSheet();
    if (!this.id) {
      this.id = `edible-tooltip-${++_idCounter}`;
    }
    const parent = this.parentElement;
    if (!parent) return;
    parent.setAttribute('aria-describedby', this.id);
    parent.addEventListener('mouseenter', this._show);
    parent.addEventListener('focus', this._show);
    parent.addEventListener('mouseleave', this._hide);
    parent.addEventListener('blur', this._hide);
  }

  disconnectedCallback() {
    const parent = this.parentElement;
    if (parent) {
      parent.removeEventListener('mouseenter', this._show);
      parent.removeEventListener('focus', this._show);
      parent.removeEventListener('mouseleave', this._hide);
      parent.removeEventListener('blur', this._hide);
      parent.removeAttribute('aria-describedby');
    }
    this._hide();
  }

  /**
   * Creates and positions the tooltip popup relative to the parent element.
   * Uses `getBoundingClientRect()` for fixed positioning to avoid overflow clipping.
   *
   * @returns {void}
   */
  _show() {
    if (this._popup) return;
    const parent = this.parentElement;
    if (!parent) return;
    this._popup = document.createElement('div');
    this._popup.setAttribute('role', 'tooltip');
    this._popup.setAttribute('id', `${this.id}-popup`);
    this._popup.dataset.edibleTooltipPopup = '';
    this._popup.textContent = this.textContent.trim();
    document.body.append(this._popup);
    const rect = parent.getBoundingClientRect();
    const popupRect = this._popup.getBoundingClientRect();
    const top = rect.top - popupRect.height - 10;
    const left = rect.left + rect.width / 2 - popupRect.width / 2;
    this._popup.style.top = `${top}px`;
    this._popup.style.left = `${left}px`;
  }

  /**
   * Removes the tooltip popup from the DOM.
   *
   * @returns {void}
   */
  _hide() {
    this._popup?.remove();
    this._popup = null;
  }
}

customElements.define('edible-tooltip', EdibleTooltip);
