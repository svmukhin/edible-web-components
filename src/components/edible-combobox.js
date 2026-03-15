/**
 * SPDX-FileCopyrightText: Copyright (c) 2026 Sergei Mukhin
 * SPDX-License-Identifier: MIT
 */

const SHEET = new CSSStyleSheet();
SHEET.replaceSync(`
  edible-combobox {
    display: block;
    position: relative;
  }
  edible-combobox input[role="combobox"] {
    width: 100%;
    box-sizing: border-box;
    padding: var(--space-sm);
    font-size: var(--font-md);
    color: var(--text-primary);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 4px;
    outline: none;
  }
  edible-combobox input[role="combobox"]:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
  }
  edible-combobox [role="listbox"] {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin: 2px 0 0;
    padding: var(--space-xs) 0;
    list-style: none;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 4px;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--text-primary) 10%, transparent);
    z-index: 100;
    max-height: 240px;
    overflow-y: auto;
  }
  edible-combobox [role="option"] {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--font-md);
    color: var(--text-primary);
    cursor: pointer;
  }
  edible-combobox [role="option"][aria-selected="true"] {
    background: var(--bg-tertiary);
    color: var(--accent);
  }
  edible-combobox [role="option"]:hover {
    background: var(--bg-secondary);
  }
  edible-combobox [role="listbox"][hidden] {
    display: none;
  }
  edible-combobox [data-empty] {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--font-sm);
    color: var(--text-secondary);
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
 * Searchable dropdown component that replaces `<select>` when the option list
 * is long enough to require filtering. Participates in forms via ElementInternals.
 *
 * @element edible-combobox
 *
 * @attr {string} name        - Field name submitted with the form.
 * @attr {string} placeholder - Placeholder text shown in the search input.
 * @attr {boolean} disabled   - Disables the component.
 * @attr {boolean} required   - Marks the field as required for form validation.
 *
 * @prop {string} value - The currently selected option value.
 *
 * @example
 * <edible-combobox name="city" placeholder="Select a city…">
 *   <option value="ams">Amsterdam</option>
 *   <option value="ber">Berlin</option>
 * </edible-combobox>
 */
export class EdibleCombobox extends HTMLElement {
  static formAssociated = true;

  static get observedAttributes() {
    return ['placeholder', 'disabled', 'required'];
  }

  constructor() {
    super();
    this._internals = typeof this.attachInternals === 'function'
      ? this.attachInternals()
      : null;
    /** @type {Array<{value: string, label: string}>} */
    this._options = [];
    /** @type {string} */
    this._value = '';
    /** @type {number} */
    this._activeIndex = -1;
    this._onDocClick = this._onDocClick.bind(this);
  }

  connectedCallback() {
    adoptSheet();
    this._parseOptions();
    this._render();
    this._bindEvents();
    document.addEventListener('click', this._onDocClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick);
  }

  /**
   * @param {string} name
   * @param {string} _old
   * @param {string} next
   */
  attributeChangedCallback(name, _old, next) {
    if (!this._input) return;
    if (name === 'placeholder') this._input.placeholder = next ?? '';
    if (name === 'disabled') this._input.disabled = next !== null;
    if (name === 'required') this._internals.ariaRequired = next !== null ? 'true' : 'false';
  }

  /** @returns {string} */
  get value() {
    return this._value;
  }

  /** @param {string} val */
  set value(val) {
    const match = this._options.find((o) => o.value === val);
    if (!match) return;
    this._value = match.value;
    this._input.value = match.label;
    this._hidden.value = match.value;
    this._internals?.setFormValue(match.value);
    this._close();
  }

  /**
   * Reads child `<option>` elements into `_options` and removes them from the DOM.
   *
   * @returns {void}
   */
  _parseOptions() {
    this._options = Array.from(this.querySelectorAll('option')).map((el) => ({
      value: el.value,
      label: el.textContent.trim(),
    }));
    this.querySelectorAll('option').forEach((el) => el.remove());
  }

  /**
   * Builds the internal DOM: search input, listbox, and hidden form field.
   *
   * @returns {void}
   */
  _render() {
    const id = this.id || `edible-combobox-${Math.random().toString(36).slice(2, 7)}`;
    const listboxId = `${id}-listbox`;
    this._input = document.createElement('input');
    this._input.setAttribute('role', 'combobox');
    this._input.setAttribute('aria-expanded', 'false');
    this._input.setAttribute('aria-autocomplete', 'list');
    this._input.setAttribute('aria-controls', listboxId);
    this._input.setAttribute('autocomplete', 'off');
    this._input.placeholder = this.getAttribute('placeholder') ?? '';
    this._input.disabled = this.hasAttribute('disabled');
    this._listbox = document.createElement('ul');
    this._listbox.setAttribute('role', 'listbox');
    this._listbox.id = listboxId;
    this._listbox.hidden = true;
    this._hidden = document.createElement('input');
    this._hidden.type = 'hidden';
    this._hidden.name = this.getAttribute('name') ?? '';
    this.append(this._input, this._listbox, this._hidden);
    this._renderOptions(this._options);
  }

  /**
   * Populates the listbox with the given option set, or a "no results" message.
   *
   * @param {Array<{value: string, label: string}>} options
   * @returns {void}
   */
  _renderOptions(options) {
    this._listbox.innerHTML = '';
    if (options.length === 0) {
      const empty = document.createElement('li');
      empty.dataset.empty = '';
      empty.textContent = 'No results';
      this._listbox.append(empty);
      return;
    }
    options.forEach(({ value, label }, i) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.dataset.value = value;
      li.id = `${this._listbox.id}-opt-${i}`;
      li.textContent = label;
      this._listbox.append(li);
    });
  }

  /**
   * Attaches input, keydown, and listbox click event listeners.
   *
   * @returns {void}
   */
  _bindEvents() {
    this._input.addEventListener('input', () => this._onInput());
    this._input.addEventListener('keydown', (e) => this._onKeydown(e));
    this._listbox.addEventListener('click', (e) => this._onListClick(e));
    this._input.addEventListener('focus', () => this._open());
  }

  /**
   * Filters the option list based on the current input value and opens the listbox.
   *
   * @returns {void}
   */
  _onInput() {
    const q = this._input.value.toLowerCase();
    const filtered = this._options.filter((o) => o.label.toLowerCase().includes(q));
    this._renderOptions(filtered);
    this._activeIndex = -1;
    this._open();
  }

  /**
   * Handles ArrowDown, ArrowUp, Enter, Escape, and Tab key presses.
   *
   * @param {KeyboardEvent} e
   * @returns {void}
   */
  _onKeydown(e) {
    const items = this._listbox.querySelectorAll('[role="option"]');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._open();
      this._setActive(Math.min(this._activeIndex + 1, items.length - 1), items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._setActive(Math.max(this._activeIndex - 1, 0), items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this._activeIndex >= 0) this._selectItem(items[this._activeIndex]);
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      this._close();
    }
  }

  /**
   * Selects the clicked `[role="option"]` element, ignoring other clicks.
   *
   * @param {MouseEvent} e
   * @returns {void}
   */
  _onListClick(e) {
    const li = e.target.closest('[role="option"]');
    if (li) this._selectItem(li);
  }

  /**
   * Closes the listbox when a click is detected outside the component.
   *
   * @param {MouseEvent} e
   * @returns {void}
   */
  _onDocClick(e) {
    if (!this.contains(e.target)) this._close();
  }

  /**
   * Marks an option as active (keyboard focus) and updates aria-activedescendant.
   *
   * @param {number} index
   * @param {NodeList} items
   * @returns {void}
   */
  _setActive(index, items) {
    items.forEach((el) => el.setAttribute('aria-selected', 'false'));
    this._activeIndex = index;
    if (index < 0) {
      this._input.removeAttribute('aria-activedescendant');
      return;
    }
    const active = items[index];
    active.setAttribute('aria-selected', 'true');
    this._input.setAttribute('aria-activedescendant', active.id);
    active.scrollIntoView({ block: 'nearest' });
  }

  /**
   * Commits the selection from the given `[role="option"]` element.
   *
   * @param {Element} li
   * @returns {void}
   */
  _selectItem(li) {
    this._value = li.dataset.value;
    this._input.value = li.textContent;
    this._hidden.value = this._value;
    this._internals?.setFormValue(this._value);
    this._close();
  }

  /**
   * Opens the listbox and sets aria-expanded to true.
   *
   * @returns {void}
   */
  _open() {
    this._listbox.hidden = false;
    this._input.setAttribute('aria-expanded', 'true');
  }

  /**
   * Closes the listbox, resets active state, and sets aria-expanded to false.
   *
   * @returns {void}
   */
  _close() {
    this._listbox.hidden = true;
    this._input.setAttribute('aria-expanded', 'false');
    this._activeIndex = -1;
    this._input.removeAttribute('aria-activedescendant');
    const items = this._listbox.querySelectorAll('[role="option"]');
    items.forEach((el) => el.setAttribute('aria-selected', 'false'));
  }
}

customElements.define('edible-combobox', EdibleCombobox);
