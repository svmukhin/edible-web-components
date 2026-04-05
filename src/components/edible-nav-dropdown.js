/**
 * SPDX-FileCopyrightText: Copyright (c) 2026 Sergei Mukhin
 * SPDX-License-Identifier: MIT
 */

const SHEET = new CSSStyleSheet();
SHEET.replaceSync(`
  edible-nav-dropdown {
    display: inline-flex;
    align-items: center;
    position: relative;
    vertical-align: middle;
  }
  edible-nav-dropdown > button {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs, 0.25rem);
    appearance: none;
    -webkit-appearance: none;
    background: none;
    border: none;
    box-shadow: none;
    margin: 0;
    padding: 0;
    font: inherit;
    font-size: var(--font-md, 1rem);
    line-height: inherit;
    color: var(--text-primary);
    cursor: pointer;
    border-radius: 4px;
    text-decoration: none;
  }
  edible-nav-dropdown > button:hover,
  edible-nav-dropdown > button:focus-visible {
    color: var(--accent);
  }
  edible-nav-dropdown > button[aria-expanded="true"] {
    color: var(--accent);
  }
  edible-nav-dropdown > button > span {
    display: inline-block;
    font-size: 0.75em;
    line-height: 1;
    transition: transform 0.15s;
  }
  edible-nav-dropdown > button[aria-expanded="true"] > span {
    transform: rotate(180deg);
  }
  edible-nav-dropdown > button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  edible-nav-dropdown > ul {
    display: block;
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 180px;
    margin: 2px 0 0;
    padding: var(--space-xs, 0.25rem) 0;
    list-style: none;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 4px;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--text-primary) 10%, transparent);
    z-index: 200;
  }
  edible-nav-dropdown > ul > li {
    display: block;
  }
  edible-nav-dropdown > ul > li > a,
  edible-nav-dropdown > ul > li > button {
    display: block;
    width: 100%;
    padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
    font: inherit;
    font-size: var(--font-md, 1rem);
    color: var(--text-primary);
    text-decoration: none;
    white-space: nowrap;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    box-sizing: border-box;
  }
  edible-nav-dropdown > ul > li > a:hover,
  edible-nav-dropdown > ul > li > button:hover,
  edible-nav-dropdown > ul > li > a:focus-visible,
  edible-nav-dropdown > ul > li > button:focus-visible {
    background: var(--bg-secondary);
    color: var(--accent);
    outline: none;
  }
  edible-nav-dropdown > ul[hidden] {
    display: none;
  }
  edible-nav-dropdown[disabled] > button {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
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
 * Grouped navigation item with an accessible hover+keyboard dropdown.
 *
 * Uses the WAI-ARIA APG Disclosure Navigation Menu pattern:
 * the trigger is a plain `<button>` with `aria-expanded`/`aria-controls`;
 * the drop-down is an ordinary `<ul>` hidden with the `hidden` attribute.
 * No `role="menu"` — that pattern is reserved for application menus, not site
 * navigation.
 *
 * @element edible-nav-dropdown
 *
 * @attr {string}  label    - Required. Text shown on the trigger button.
 * @attr {boolean} disabled - Disables the trigger and all child links.
 *
 * @example
 * <nav>
 *   <ul>
 *     <li><a href="/">Home</a></li>
 *     <edible-nav-dropdown label="Products">
 *       <a href="/products/basic">Basic</a>
 *       <a href="/products/pro">Pro</a>
 *     </edible-nav-dropdown>
 *   </ul>
 * </nav>
 */
export class EdibleNavDropdown extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'disabled'];
  }

  constructor() {
    super();
    /** @type {HTMLButtonElement|null} */
    this._btn = null;
    /** @type {HTMLUListElement|null} */
    this._list = null;
    /** @type {number|null} */
    this._closeTimer = null;
    this._onDocClick = this._onDocClick.bind(this);
    this._onFocusOut = this._onFocusOut.bind(this);
  }

  connectedCallback() {
    adoptSheet();
    this._render();
    this._bindEvents();
  }

  disconnectedCallback() {
    clearTimeout(this._closeTimer);
    document.removeEventListener('click', this._onDocClick, true);
  }

  /**
   * @param {string} name
   * @param {string|null} _old
   * @param {string|null} next
   * @returns {void}
   */
  attributeChangedCallback(name, _old, next) {
    if (!this._btn) return;
    if (name === 'label') {
      this._btn.childNodes[0].textContent = next ?? '';
    }
    if (name === 'disabled') {
      const disabled = next !== null;
      this._btn.disabled = disabled;
      this._applyDisabledToLinks(disabled);
      if (disabled) this._close();
    }
  }

  /**
   * Builds the trigger button and dropdown list from the component's
   * original child elements.
   *
   * @returns {void}
   */
  _render() {
    const id = `ewc-dd-${++_idCounter}`;
    const label = this.getAttribute('label') ?? '';
    const disabled = this.hasAttribute('disabled');

    // Snapshot direct children before modifying the DOM.
    const items = Array.from(this.children);

    // Trigger button.
    this._btn = document.createElement('button');
    this._btn.type = 'button';
    this._btn.setAttribute('aria-expanded', 'false');
    this._btn.setAttribute('aria-controls', id);
    if (disabled) this._btn.disabled = true;
    this._btn.append(document.createTextNode(label));
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '▾';
    this._btn.append(arrow);

    // Dropdown list: move original children into <li> wrappers.
    this._list = document.createElement('ul');
    this._list.id = id;
    this._list.hidden = true;
    items.forEach((el) => {
      const li = document.createElement('li');
      li.append(el);
      this._list.append(li);
    });

    if (disabled) this._applyDisabledToLinks(true);

    this.append(this._btn, this._list);
  }

  /**
   * Attaches a11y-disabled attributes to all links/buttons inside the list.
   *
   * @param {boolean} disabled
   * @returns {void}
   */
  _applyDisabledToLinks(disabled) {
    this._list.querySelectorAll('a, button').forEach((el) => {
      if (disabled) {
        el.setAttribute('tabindex', '-1');
        el.setAttribute('aria-disabled', 'true');
      } else {
        el.removeAttribute('tabindex');
        el.removeAttribute('aria-disabled');
      }
    });
  }

  /** @returns {void} */
  _bindEvents() {
    this.addEventListener('mouseenter', () => {
      clearTimeout(this._closeTimer);
      this._open();
    });
    this.addEventListener('mouseleave', () => {
      this._closeTimer = setTimeout(() => this._close(), 150);
    });
    this._btn.addEventListener('click', () => this._toggle());
    this._btn.addEventListener('keydown', (e) => this._onBtnKeydown(e));
    this._list.addEventListener('keydown', (e) => this._onListKeydown(e));
    this.addEventListener('focusout', this._onFocusOut);
  }

  /** @returns {void} */
  _toggle() {
    if (this._isOpen()) {
      this._close();
    } else {
      this._open();
    }
  }

  /**
   * Opens the dropdown. Closes all other `edible-nav-dropdown` instances first.
   *
   * @returns {void}
   */
  _open() {
    if (this.hasAttribute('disabled')) return;
    if (this._isOpen()) return;
    document.querySelectorAll('edible-nav-dropdown').forEach((el) => {
      if (el !== this && typeof el._close === 'function') el._close();
    });
    this._list.hidden = false;
    this._btn.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', this._onDocClick, true);
  }

  /** @returns {void} */
  _close() {
    if (!this._isOpen()) return;
    this._list.hidden = true;
    this._btn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', this._onDocClick, true);
  }

  /** @returns {boolean} */
  _isOpen() {
    return this._btn.getAttribute('aria-expanded') === 'true';
  }

  /**
   * Returns all focusable items (links and non-disabled buttons) in the list.
   *
   * @returns {HTMLElement[]}
   */
  _links() {
    return Array.from(this._list.querySelectorAll('a, button'));
  }

  /**
   * Moves focus to a list item by index, wrapping cyclically.
   *
   * @param {number} index
   * @returns {void}
   */
  _focusLink(index) {
    const links = this._links();
    if (links.length === 0) return;
    const n = ((index % links.length) + links.length) % links.length;
    links[n].focus();
  }

  /**
   * Handles ArrowDown, ArrowUp, and Escape on the trigger button.
   *
   * @param {KeyboardEvent} e
   * @returns {void}
   */
  _onBtnKeydown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._open();
      this._focusLink(0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._open();
      this._focusLink(this._links().length - 1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this._close();
    }
  }

  /**
   * Handles ArrowDown/Up, Home, End, and Escape when focus is inside the list.
   *
   * @param {KeyboardEvent} e
   * @returns {void}
   */
  _onListKeydown(e) {
    const links = this._links();
    const current = links.indexOf(/** @type {HTMLElement} */ (document.activeElement));
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._focusLink(current + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (current === 0) {
        this._close();
        this._btn.focus();
      } else {
        this._focusLink(current - 1);
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      this._focusLink(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      this._focusLink(links.length - 1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this._close();
      this._btn.focus();
    }
  }

  /**
   * Closes the dropdown when focus leaves the host element entirely.
   *
   * @param {FocusEvent} e
   * @returns {void}
   */
  _onFocusOut(e) {
    if (!this.contains(/** @type {Node} */ (e.relatedTarget))) {
      this._close();
    }
  }

  /**
   * Closes the dropdown when a click is detected outside the component.
   *
   * @param {MouseEvent} e
   * @returns {void}
   */
  _onDocClick(e) {
    if (!this.contains(/** @type {Node} */ (e.target))) this._close();
  }
}

if (!customElements.get('edible-nav-dropdown')) {
  customElements.define('edible-nav-dropdown', EdibleNavDropdown);
}
