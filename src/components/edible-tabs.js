/**
 * SPDX-FileCopyrightText: Copyright (c) 2026 Sergei Mukhin
 * SPDX-License-Identifier: MIT
 */

const SHEET = new CSSStyleSheet();
SHEET.replaceSync(`
  edible-tabs {
    display: block;
  }
  edible-tabs [role="tablist"] {
    display: flex;
    border-bottom: 1px solid var(--border);
  }
  edible-tabs button[role="tab"] {
    padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
    font-size: var(--font-sm, 0.875rem);
    color: var(--text-secondary);
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    cursor: pointer;
    background: none;
    border-top: none;
    border-left: none;
    border-right: none;
    transition: color 0.15s, border-color 0.15s;
  }
  edible-tabs button[role="tab"]:hover {
    color: var(--text-primary);
  }
  edible-tabs button[role="tab"][aria-selected="true"] {
    color: var(--accent);
    border-bottom-color: var(--accent);
    font-weight: 600;
  }
  edible-tabs button[role="tab"]:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
    border-radius: 2px 2px 0 0;
  }
  edible-tab[role="tabpanel"] {
    display: block;
    padding: var(--space-md, 1rem) 0;
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
 * Tab panel container. Discovers its `<edible-tab>` children and builds an
 * accessible tablist with roving tabindex keyboard navigation.
 *
 * @element edible-tabs
 *
 * @example
 * <edible-tabs>
 *   <edible-tab label="Overview">Content A</edible-tab>
 *   <edible-tab label="Details">Content B</edible-tab>
 * </edible-tabs>
 */
export class EdibleTabs extends HTMLElement {
  /** @type {HTMLElement[]} */
  #panels = [];
  /** @type {HTMLButtonElement[]} */
  #buttons = [];
  /** @type {HTMLDivElement|null} */
  #tablist = null;
  /** @type {boolean} */
  #initialized = false;

  connectedCallback() {
    if (this.#initialized) return;
    this.#initialized = true;
    adoptSheet();
    this.#panels = Array.from(this.querySelectorAll(':scope > edible-tab'));
    this.#tablist = this.#buildTablist();
    this.prepend(this.#tablist);
    this.#activate(0);
  }

  disconnectedCallback() {
    this.#tablist?.remove();
    this.#initialized = false;
    this.#panels = [];
    this.#buttons = [];
    this.#tablist = null;
  }

  /**
   * Builds the `div[role="tablist"]` with one `button[role="tab"]` per panel.
   *
   * @returns {HTMLDivElement}
   */
  #buildTablist() {
    const tablist = document.createElement('div');
    tablist.setAttribute('role', 'tablist');
    this.#panels.forEach((panel, i) => {
      const tabId = `tab-${this._uid}-${i}`;
      const panelId = `tab-panel-${this._uid}-${i}`;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('id', panelId);
      panel.setAttribute('aria-labelledby', tabId);
      const btn = document.createElement('button');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('id', tabId);
      btn.setAttribute('aria-controls', panelId);
      btn.textContent = panel.getAttribute('label') ?? `Tab ${i + 1}`;
      btn.addEventListener('click', () => this.#activate(i));
      btn.addEventListener('keydown', (e) => this.#onKeydown(e, i));
      tablist.append(btn);
      this.#buttons.push(btn);
    });
    return tablist;
  }

  /**
   * Activates the tab at `index` and hides all other panels.
   *
   * @param {number} index
   * @returns {void}
   */
  #activate(index) {
    this.#buttons.forEach((btn, i) => {
      const active = i === index;
      btn.setAttribute('aria-selected', String(active));
      btn.setAttribute('tabindex', active ? '0' : '-1');
    });
    this.#panels.forEach((panel, i) => {
      if (i === index) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  }

  /**
   * Handles ArrowLeft / ArrowRight / Home / End keyboard navigation within
   * the tablist using the roving tabindex pattern.
   *
   * @param {KeyboardEvent} e
   * @param {number} currentIndex
   * @returns {void}
   */
  #onKeydown(e, currentIndex) {
    const count = this.#buttons.length;
    let next;
    if (e.key === 'ArrowRight') {
      next = (currentIndex + 1) % count;
    } else if (e.key === 'ArrowLeft') {
      next = (currentIndex - 1 + count) % count;
    } else if (e.key === 'Home') {
      next = 0;
    } else if (e.key === 'End') {
      next = count - 1;
    } else {
      return;
    }
    e.preventDefault();
    this.#activate(next);
    this.#buttons[next].focus();
  }

  /**
   * Unique ID suffix used to generate stable tab/panel id pairs.
   *
   * @returns {string}
   */
  get _uid() {
    if (!this.__uid) {
      this.__uid = Math.random().toString(36).slice(2, 8);
    }
    return this.__uid;
  }
}

/**
 * Individual tab panel managed by `<edible-tabs>`. Used as a semantic
 * content container; the parent `<edible-tabs>` assigns ARIA attributes.
 *
 * @element edible-tab
 *
 * @attr {string} label - Tab button label shown in the tablist.
 */
export class EdibleTab extends HTMLElement {}

customElements.define('edible-tabs', EdibleTabs);
customElements.define('edible-tab', EdibleTab);
