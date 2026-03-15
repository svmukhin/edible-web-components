/**
 * SPDX-FileCopyrightText: Copyright (c) 2026 Sergei Mukhin
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, afterEach } from 'vitest';
import '../src/components/edible-file-drop.js';

/**
 * Creates an `<edible-file-drop>` element, appends it to `document.body`,
 * and returns it.
 *
 * @param {Record<string, string>} [attrs={}] - Attributes to set on the element.
 * @returns {HTMLElement}
 */
function createFileDrop(attrs = {}) {
  const el = document.createElement('edible-file-drop');
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  document.body.append(el);
  return el;
}

describe('edible-file-drop', () => {
  /** @type {HTMLElement} */
  let el;

  afterEach(() => {
    el?.remove();
  });

  it('should be registered as a custom element', () => {
    expect(customElements.get('edible-file-drop')).toBeDefined();
  });

  it('should render a dropzone and a hidden file input', () => {
    el = createFileDrop();
    expect(el.querySelector('[data-dropzone]')).toBeTruthy();
    expect(el.querySelector('input[type="file"]')).toBeTruthy();
  });

  it('should set the dropzone role to button', () => {
    el = createFileDrop();
    expect(el.querySelector('[data-dropzone]').getAttribute('role')).toBe('button');
  });

  it('should set tabindex 0 on the dropzone when not disabled', () => {
    el = createFileDrop();
    expect(el.querySelector('[data-dropzone]').getAttribute('tabindex')).toBe('0');
  });

  it('should forward the name attribute to the hidden file input', () => {
    el = createFileDrop({ name: 'attachment' });
    expect(el.querySelector('input[type="file"]').name).toBe('attachment');
  });

  it('should forward the accept attribute to the hidden file input', () => {
    el = createFileDrop({ accept: '.pdf,.docx' });
    expect(el.querySelector('input[type="file"]').accept).toBe('.pdf,.docx');
  });

  it('should forward the multiple attribute to the hidden file input', () => {
    el = createFileDrop({ multiple: '' });
    expect(el.querySelector('input[type="file"]').multiple).toBe(true);
  });

  it('should set tabindex -1 on the dropzone when disabled', () => {
    el = createFileDrop({ disabled: '' });
    expect(el.querySelector('[data-dropzone]').getAttribute('tabindex')).toBe('-1');
  });

  it('should add [data-dragging] on the host element during dragover', () => {
    el = createFileDrop();
    const dropzone = el.querySelector('[data-dropzone]');
    const event = new Event('dragover', { bubbles: true });
    event.preventDefault = () => {};
    dropzone.dispatchEvent(event);
    expect(el.dataset.dragging).toBe('');
  });

  it('should remove [data-dragging] from the host element on dragleave', () => {
    el = createFileDrop();
    const dropzone = el.querySelector('[data-dropzone]');
    el.dataset.dragging = '';
    dropzone.dispatchEvent(new Event('dragleave', { bubbles: true }));
    expect(el.dataset.dragging).toBeUndefined();
  });

  it('should show the filename display after a change event on the file input', () => {
    el = createFileDrop();
    const fileInput = el.querySelector('input[type="file"]');
    const display = el.querySelector('[data-filenames]');
    Object.defineProperty(fileInput, 'files', {
      value: [{ name: 'report.pdf' }],
      configurable: true,
    });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    expect(display.hidden).toBe(false);
    expect(display.textContent).toBe('report.pdf');
  });

  it('should show a count summary when multiple files are selected', () => {
    el = createFileDrop({ multiple: '' });
    const fileInput = el.querySelector('input[type="file"]');
    const display = el.querySelector('[data-filenames]');
    Object.defineProperty(fileInput, 'files', {
      value: [{ name: 'a.pdf' }, { name: 'b.pdf' }, { name: 'c.pdf' }],
      configurable: true,
    });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    expect(display.textContent).toBe('a.pdf + 2 more');
  });

  it('should expose a files getter that returns the file input FileList', () => {
    el = createFileDrop();
    expect(el.files).toBe(el.querySelector('input[type="file"]').files);
  });

  it('should not open the picker when disabled', () => {
    el = createFileDrop({ disabled: '' });
    let clicked = false;
    el.querySelector('input[type="file"]').addEventListener('click', () => { clicked = true; });
    el.querySelector('[data-dropzone]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(clicked).toBe(false);
  });
});
