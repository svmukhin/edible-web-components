/**
 * SPDX-FileCopyrightText: Copyright (c) 2026 Sergei Mukhin
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, afterEach } from 'vitest';
import '../src/components/edible-badge.js';

/**
 * Creates an `<edible-badge>` element, appends it to `document.body`,
 * and returns it.
 *
 * @param {string} [text=''] - The badge label text.
 * @param {Record<string, string>} [attrs={}] - Attributes to set on the element.
 * @returns {HTMLElement}
 */
function createBadge(text = '', attrs = {}) {
  const el = document.createElement('edible-badge');
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  el.textContent = text;
  document.body.append(el);
  return el;
}

describe('edible-badge', () => {
  /** @type {HTMLElement} */
  let el;

  afterEach(() => {
    el?.remove();
  });

  it('should be registered as a custom element', () => {
    el = createBadge();
    expect(customElements.get('edible-badge')).toBeDefined();
  });

  it('should set role="status" on the element when connected', () => {
    el = createBadge('New');
    expect(el.getAttribute('role')).toBe('status');
  });

  it('should not override an existing role attribute', () => {
    el = createBadge('New', { role: 'note' });
    expect(el.getAttribute('role')).toBe('note');
  });

  it('should render its text content as the badge label', () => {
    el = createBadge('Active');
    expect(el.textContent).toBe('Active');
  });

  it('should have no type attribute by default', () => {
    el = createBadge('New');
    expect(el.hasAttribute('type')).toBe(false);
  });

  it('should accept type="success" without throwing', () => {
    el = createBadge('Active', { type: 'success' });
    expect(el.getAttribute('type')).toBe('success');
  });

  it('should accept type="warning" without throwing', () => {
    el = createBadge('Pending', { type: 'warning' });
    expect(el.getAttribute('type')).toBe('warning');
  });

  it('should accept type="error" without throwing', () => {
    el = createBadge('Failed', { type: 'error' });
    expect(el.getAttribute('type')).toBe('error');
  });

  it('should reflect a dynamically set type attribute', () => {
    el = createBadge('Changed');
    el.setAttribute('type', 'success');
    expect(el.getAttribute('type')).toBe('success');
  });

  it('should render no child elements — the element itself is the badge surface', () => {
    el = createBadge('Label');
    expect(el.children.length).toBe(0);
  });
});
