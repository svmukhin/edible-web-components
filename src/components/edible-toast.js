/**
 * SPDX-FileCopyrightText: Copyright (c) 2026 Sergei Mukhin
 * SPDX-License-Identifier: MIT
 */

const SHEET = new CSSStyleSheet();
SHEET.replaceSync(`
  edible-toast {
    display: none;
  }
  [data-edible-toast-region] {
    position: fixed;
    bottom: var(--space-lg, 1.5rem);
    right: var(--space-lg, 1.5rem);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 0.5rem);
    z-index: 9999;
    pointer-events: none;
  }
  [data-edible-toast-region] [role="status"] {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm, 0.5rem);
    padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-left: 4px solid var(--accent);
    border-radius: 6px;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--text-primary) 10%, transparent);
    pointer-events: all;
    min-width: 240px;
    max-width: 400px;
    animation: edible-toast-in 0.2s ease-out;
  }
  [data-edible-toast-region] [role="status"][data-removing] {
    animation: edible-toast-out 0.2s ease-in forwards;
  }
  [data-edible-toast-region] [role="status"][data-type="success"] {
    border-left-color: #22863a;
  }
  [data-edible-toast-region] [role="status"][data-type="warning"] {
    border-left-color: #b08800;
  }
  [data-edible-toast-region] [role="status"][data-type="error"] {
    border-left-color: #cf222e;
  }
  [data-edible-toast-region] [data-message] {
    flex: 1;
    font-size: var(--font-md, 1rem);
    color: var(--text-primary);
    line-height: 1.4;
  }
  [data-edible-toast-region] [data-dismiss] {
    all: unset;
    cursor: pointer;
    font-size: var(--font-lg, 1.125rem);
    color: var(--text-secondary);
    line-height: 1;
    padding: 0 var(--space-xs, 0.25rem);
    flex-shrink: 0;
  }
  [data-edible-toast-region] [data-dismiss]:hover {
    color: var(--text-primary);
  }
  @keyframes edible-toast-in {
    from { opacity: 0; transform: translateX(1rem); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes edible-toast-out {
    from { opacity: 1; transform: translateX(0); }
    to   { opacity: 0; transform: translateX(1rem); }
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

/** @type {HTMLElement|null} */
let _region = null;

/**
 * Returns the shared toast region element, creating and appending it to
 * `<body>` on the first call.
 *
 * @returns {HTMLElement}
 */
function getRegion() {
  if (_region && _region.isConnected) return _region;
  _region = document.createElement('div');
  _region.dataset.edibleToastRegion = '';
  _region.setAttribute('aria-live', 'polite');
  _region.setAttribute('aria-atomic', 'false');
  _region.setAttribute('aria-label', 'Notifications');
  document.body.append(_region);
  return _region;
}

/**
 * Programmatic notification toast component. Declare once in your HTML and
 * call `.show()` from JavaScript to display stacked, auto-dismissing messages.
 * A single `aria-live` region is shared across all instances on the page.
 *
 * @element edible-toast
 *
 * @example
 * <edible-toast id="notifications"></edible-toast>
 *
 * @example
 * document.getElementById('notifications').show('Saved!');
 * document.getElementById('notifications').show('Failed.', 'error');
 */
export class EdibleToast extends HTMLElement {
  connectedCallback() {
    adoptSheet();
  }

  /**
   * Displays a toast notification in the shared region.
   * The toast auto-dismisses after `duration` milliseconds.
   * The dismiss animation takes an additional 200 ms before the element is removed.
   *
   * @param {string} message - The text to display inside the toast.
   * @param {'info'|'success'|'warning'|'error'} [type='info'] - Visual style variant.
   * @param {number} [duration=4000] - Time in ms before the toast begins dismissing.
   * @returns {void}
   */
  show(message, type = 'info', duration = 4000) {
    const region = getRegion();
    const toast = this._createToast(message, type);
    region.append(toast);
    const autoTimer = setTimeout(() => this._dismiss(toast), duration);
    toast.querySelector('[data-dismiss]').addEventListener('click', () => {
      clearTimeout(autoTimer);
      this._dismiss(toast);
    });
  }

  /**
   * Creates the toast DOM element for a given message and type.
   *
   * @param {string} message
   * @param {string} type
   * @returns {HTMLElement}
   */
  _createToast(message, type) {
    const el = document.createElement('div');
    el.setAttribute('role', 'status');
    el.dataset.type = type;
    const msg = document.createElement('span');
    msg.dataset.message = '';
    msg.textContent = message;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.dismiss = '';
    btn.setAttribute('aria-label', 'Dismiss');
    btn.textContent = '×';
    el.append(msg, btn);
    return el;
  }

  /**
   * Triggers the exit animation on a toast, then removes it from the DOM
   * after the animation duration (200 ms).
   *
   * @param {HTMLElement} toast
   * @returns {void}
   */
  _dismiss(toast) {
    if (!toast.isConnected) return;
    toast.dataset.removing = '';
    setTimeout(() => toast.remove(), 200);
  }
}

customElements.define('edible-toast', EdibleToast);
