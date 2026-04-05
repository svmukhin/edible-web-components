/**
 * SPDX-FileCopyrightText: Copyright (c) 2026 Sergei Mukhin
 * SPDX-License-Identifier: MIT
 */

const SHEET = new CSSStyleSheet();
SHEET.replaceSync(`
  edible-tags-input {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 4px;
    cursor: text;
  }
  edible-tags-input:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
  }
  edible-tags-input [data-tag] {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: 1px var(--space-xs);
    font-size: var(--font-sm);
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    border-radius: 3px;
  }
  edible-tags-input [data-tag] button {
    all: unset;
    display: inline-flex;
    align-items: center;
    line-height: 1;
    cursor: pointer;
    color: var(--accent);
    font-size: var(--font-md);
  }
  edible-tags-input [data-tag] button:hover {
    color: var(--text-primary);
  }
  edible-tags-input [data-text-input] {
    flex: 1;
    min-width: 8ch;
    border: none;
    outline: none;
    background: transparent;
    font-size: var(--font-md);
    color: var(--text-primary);
    padding: 2px 0;
  }
  edible-tags-input [data-text-input]::placeholder {
    color: var(--text-secondary);
  }
  form edible-tags-input {
    margin-bottom: var(--space-sm);
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
 * Multi-value tag input component. Users type a value and confirm it with
 * Enter or comma; values render as removable pill tags. Participates in forms
 * via a hidden comma-separated field and ElementInternals.
 *
 * @element edible-tags-input
 *
 * @attr {string}  name        - Field name submitted with the form.
 * @attr {string}  placeholder - Placeholder shown while no tags exist.
 * @attr {boolean} disabled    - Disables all interaction.
 *
 * @prop {string[]} value - Array of current tag values (readonly via getter).
 *
 * @example
 * <edible-tags-input name="skills" placeholder="Add a skill…"></edible-tags-input>
 */
export class EdibleTagsInput extends HTMLElement {
  static formAssociated = true;

  static get observedAttributes() {
    return ['placeholder', 'disabled'];
  }

  constructor() {
    super();
    this._internals = typeof this.attachInternals === 'function'
      ? this.attachInternals()
      : null;
    /** @type {string[]} */
    this._tags = [];
  }

  connectedCallback() {
    adoptSheet();
    this._render();
    this._bindEvents();
  }

  /**
   * @param {string} name
   * @param {string} _old
   * @param {string|null} next
   */
  attributeChangedCallback(name, _old, next) {
    if (!this._input) return;
    if (name === 'placeholder') this._updatePlaceholder();
    if (name === 'disabled') {
      this._input.disabled = next !== null;
      this.querySelectorAll('[data-tag] button').forEach(
        (btn) => (btn.disabled = next !== null),
      );
    }
  }

  /** @returns {string[]} */
  get value() {
    return [...this._tags];
  }

  /**
   * Adds a tag if it is non-empty and not already present.
   *
   * @param {string} tag
   * @returns {void}
   */
  add(tag) {
    const normalized = tag.trim();
    if (!normalized || this._tags.includes(normalized)) return;
    this._tags.push(normalized);
    this._renderTag(normalized);
    this._syncHidden();
    this._updatePlaceholder();
  }

  /**
   * Removes all tags matching the given value.
   *
   * @param {string} tag
   * @returns {void}
   */
  remove(tag) {
    this._tags = this._tags.filter((t) => t !== tag);
    this.querySelectorAll(`[data-tag="${CSS.escape(tag)}"]`).forEach((el) => el.remove());
    this._syncHidden();
    this._updatePlaceholder();
  }

  /**
   * Builds the internal DOM: the visible text input and the hidden form field.
   *
   * @returns {void}
   */
  _render() {
    this._input = document.createElement('input');
    this._input.setAttribute('data-text-input', '');
    this._input.type = 'text';
    this._input.placeholder = this.getAttribute('placeholder') ?? '';
    this._input.disabled = this.hasAttribute('disabled');
    this._input.setAttribute('aria-label', this.getAttribute('placeholder') ?? 'Add tag');
    this.append(this._input);
  }

  /**
   * Attaches keydown, click (for tag removal), and wrapper click listeners.
   *
   * @returns {void}
   */
  _bindEvents() {
    this._input.addEventListener('keydown', (e) => this._onKeydown(e));
    this.addEventListener('click', (e) => this._onWrapperClick(e));
  }

  /**
   * Handles Enter and comma to commit a tag; Backspace to remove the last tag.
   *
   * @param {KeyboardEvent} e
   * @returns {void}
   */
  _onKeydown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      this.add(this._input.value.replace(',', ''));
      this._input.value = '';
    } else if (e.key === 'Backspace' && this._input.value === '' && this._tags.length > 0) {
      this.remove(this._tags[this._tags.length - 1]);
    }
  }

  /**
   * Delegates clicks on tag remove buttons to `remove()`.
   *
   * @param {MouseEvent} e
   * @returns {void}
   */
  _onWrapperClick(e) {
    const btn = e.target.closest('[data-tag] button');
    if (!btn) return;
    const tag = btn.closest('[data-tag]').dataset.tag;
    this.remove(tag);
    this._input.focus();
  }

  /**
   * Inserts a pill element for the given tag before the text input.
   *
   * @param {string} tag
   * @returns {void}
   */
  _renderTag(tag) {
    const span = document.createElement('span');
    span.dataset.tag = tag;
    const label = document.createTextNode(tag + '\u00A0');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', `Remove ${tag}`);
    btn.disabled = this.hasAttribute('disabled');
    btn.textContent = '×';
    span.append(label, btn);
    this._input.before(span);
  }

  /**
   * Writes the current tag array to the hidden field and ElementInternals.
   *
   * @returns {void}
   */
  _syncHidden() {
    const csv = this._tags.join(',');
    this._internals?.setFormValue(csv);
  }

  /**
   * Shows the placeholder only when there are no tags; clears it otherwise.
   *
   * @returns {void}
   */
  _updatePlaceholder() {
    this._input.placeholder = this._tags.length === 0
      ? (this.getAttribute('placeholder') ?? '')
      : '';
  }
}

customElements.define('edible-tags-input', EdibleTagsInput);
