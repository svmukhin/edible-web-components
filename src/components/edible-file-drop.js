/**
 * SPDX-FileCopyrightText: Copyright (c) 2026 Sergei Mukhin
 * SPDX-License-Identifier: MIT
 */

const SHEET = new CSSStyleSheet();
SHEET.replaceSync(`
  edible-file-drop {
    display: block;
  }
  edible-file-drop [data-dropzone] {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    padding: var(--space-xl);
    background: var(--bg-secondary);
    border: 2px dashed var(--border);
    border-radius: 6px;
    cursor: pointer;
    text-align: center;
    transition: border-color 0.15s, background 0.15s;
  }
  edible-file-drop [data-dropzone]:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
  }
  edible-file-drop[data-dragging] [data-dropzone] {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 8%, var(--bg-secondary));
  }
  edible-file-drop [data-icon] {
    font-size: var(--font-2xl);
    line-height: 1;
    color: var(--text-secondary);
  }
  edible-file-drop [data-label] {
    font-size: var(--font-md);
    color: var(--text-secondary);
  }
  edible-file-drop [data-label] u {
    color: var(--accent);
    text-decoration-color: var(--accent);
  }
  edible-file-drop [data-filenames] {
    font-size: var(--font-sm);
    color: var(--text-primary);
    font-weight: 600;
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
 * Drag-and-drop file upload component that wraps `<input type="file">`.
 * Supports click-to-browse, drag-and-drop, keyboard activation, and
 * forwards `name`, `accept`, and `multiple` attributes to the native input.
 * The inner file input participates in form submission natively.
 *
 * @element edible-file-drop
 *
 * @attr {string}  name     - Field name submitted with the form.
 * @attr {string}  accept   - MIME types or extensions accepted (forwarded to input).
 * @attr {boolean} multiple - Allows selecting multiple files.
 * @attr {boolean} disabled - Disables interaction.
 *
 * @prop {FileList|null} files - The currently selected FileList, or null if none.
 *
 * @example
 * <edible-file-drop name="attachment" accept=".pdf,.docx" multiple></edible-file-drop>
 */
export class EdibleFileDrop extends HTMLElement {
  static get observedAttributes() {
    return ['accept', 'multiple', 'disabled'];
  }

  constructor() {
    super();
    this._onDragOver = this._onDragOver.bind(this);
    this._onDragLeave = this._onDragLeave.bind(this);
    this._onDrop = this._onDrop.bind(this);
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
    if (!this._fileInput) return;
    if (name === 'accept') this._fileInput.accept = next ?? '';
    if (name === 'multiple') this._fileInput.multiple = next !== null;
    if (name === 'disabled') {
      this._dropzone.setAttribute('tabindex', next !== null ? '-1' : '0');
      this._dropzone.style.pointerEvents = next !== null ? 'none' : '';
      this._dropzone.style.opacity = next !== null ? '0.5' : '';
    }
  }

  /** @returns {FileList|null} */
  get files() {
    return this._fileInput?.files ?? null;
  }

  /**
   * Builds the dropzone UI and the hidden native file input.
   *
   * @returns {void}
   */
  _render() {
    this._dropzone = document.createElement('div');
    this._dropzone.dataset.dropzone = '';
    this._dropzone.setAttribute('tabindex', this.hasAttribute('disabled') ? '-1' : '0');
    this._dropzone.setAttribute(
      'aria-label',
      'Drop files here or click to browse',
    );
    this._dropzone.setAttribute('role', 'button');
    const icon = document.createElement('span');
    icon.dataset.icon = '';
    icon.textContent = '↑';
    const label = document.createElement('span');
    label.dataset.label = '';
    label.innerHTML = 'Drop files here or <u>click to browse</u>';
    this._filenameDisplay = document.createElement('span');
    this._filenameDisplay.dataset.filenames = '';
    this._filenameDisplay.hidden = true;
    this._dropzone.append(icon, label, this._filenameDisplay);
    this._fileInput = document.createElement('input');
    this._fileInput.type = 'file';
    this._fileInput.name = this.getAttribute('name') ?? '';
    this._fileInput.accept = this.getAttribute('accept') ?? '';
    this._fileInput.multiple = this.hasAttribute('multiple');
    this._fileInput.hidden = true;
    this._fileInput.setAttribute('aria-hidden', 'true');
    this._fileInput.tabIndex = -1;
    this.append(this._dropzone, this._fileInput);
  }

  /**
   * Attaches all event listeners for click, keyboard, drag, and file change.
   *
   * @returns {void}
   */
  _bindEvents() {
    this._dropzone.addEventListener('click', () => this._openPicker());
    this._dropzone.addEventListener('keydown', (e) => this._onKeydown(e));
    this._dropzone.addEventListener('dragover', this._onDragOver);
    this._dropzone.addEventListener('dragleave', this._onDragLeave);
    this._dropzone.addEventListener('drop', this._onDrop);
    this._fileInput.addEventListener('change', () => this._onFilesSelected(this._fileInput.files));
  }

  /**
   * Programmatically triggers the native file picker.
   *
   * @returns {void}
   */
  _openPicker() {
    if (this.hasAttribute('disabled')) return;
    this._fileInput.click();
  }

  /**
   * Opens the file picker on Enter or Space keydown.
   *
   * @param {KeyboardEvent} e
   * @returns {void}
   */
  _onKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._openPicker();
    }
  }

  /**
   * Adds the `[data-dragging]` attribute to activate CSS drag-over styles.
   *
   * @param {DragEvent} e
   * @returns {void}
   */
  _onDragOver(e) {
    e.preventDefault();
    this.dataset.dragging = '';
  }

  /**
   * Removes the `[data-dragging]` attribute when the drag leaves the dropzone.
   *
   * @returns {void}
   */
  _onDragLeave() {
    delete this.dataset.dragging;
  }

  /**
   * Reads dropped files, assigns them to the native input where possible,
   * and updates the filename display.
   *
   * @param {DragEvent} e
   * @returns {void}
   */
  _onDrop(e) {
    e.preventDefault();
    delete this.dataset.dragging;
    if (this.hasAttribute('disabled')) return;
    const droppedFiles = e.dataTransfer?.files;
    if (!droppedFiles?.length) return;
    try {
      const dt = new DataTransfer();
      const limit = this._fileInput.multiple ? droppedFiles.length : 1;
      for (let i = 0; i < limit; i++) dt.items.add(droppedFiles[i]);
      this._fileInput.files = dt.files;
    } catch {
      // DataTransfer assignment not supported in this environment — display only
    }
    this._onFilesSelected(droppedFiles);
  }

  /**
   * Updates the filename display after files are selected via picker or drop.
   *
   * @param {FileList} files
   * @returns {void}
   */
  _onFilesSelected(files) {
    if (!files?.length) return;
    this._filenameDisplay.hidden = false;
    if (files.length === 1) {
      this._filenameDisplay.textContent = files[0].name;
    } else {
      this._filenameDisplay.textContent = `${files[0].name} + ${files.length - 1} more`;
    }
  }
}

customElements.define('edible-file-drop', EdibleFileDrop);
