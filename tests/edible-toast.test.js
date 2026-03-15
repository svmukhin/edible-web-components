/**
 * SPDX-FileCopyrightText: Copyright (c) 2026 Sergei Mukhin
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import '../src/components/edible-toast.js';

/**
 * Creates an `<edible-toast>` element, appends it to `document.body`,
 * and returns it.
 *
 * @returns {HTMLElement}
 */
function createToast() {
  const el = document.createElement('edible-toast');
  document.body.append(el);
  return el;
}

/**
 * Returns the shared `[data-edible-toast-region]` element if it exists.
 *
 * @returns {HTMLElement|null}
 */
function getRegion() {
  return document.querySelector('[data-edible-toast-region]');
}

describe('edible-toast', () => {
  /** @type {HTMLElement} */
  let el;

  beforeEach(() => {
    vi.useFakeTimers();
    document.querySelector('[data-edible-toast-region]')?.remove();
  });

  afterEach(() => {
    el?.remove();
    document.querySelector('[data-edible-toast-region]')?.remove();
    vi.useRealTimers();
  });

  it('should be registered as a custom element', () => {
    el = createToast();
    expect(customElements.get('edible-toast')).toBeDefined();
  });

  it('should create the shared region on the first show() call', () => {
    el = createToast();
    el.show('Hello');
    expect(getRegion()).toBeTruthy();
  });

  it('should set aria-live="polite" on the region', () => {
    el = createToast();
    el.show('Hello');
    expect(getRegion().getAttribute('aria-live')).toBe('polite');
  });

  it('should append a toast element with role="status" to the region', () => {
    el = createToast();
    el.show('Hello');
    expect(getRegion().querySelector('[role="status"]')).toBeTruthy();
  });

  it('should display the provided message inside the toast', () => {
    el = createToast();
    el.show('File saved successfully.');
    expect(getRegion().querySelector('[data-message]').textContent).toBe('File saved successfully.');
  });

  it('should set data-type="info" by default', () => {
    el = createToast();
    el.show('Hello');
    expect(getRegion().querySelector('[role="status"]').dataset.type).toBe('info');
  });

  it('should set the correct data-type when a type is provided', () => {
    el = createToast();
    el.show('Error occurred.', 'error');
    expect(getRegion().querySelector('[role="status"]').dataset.type).toBe('error');
  });

  it('should render a dismiss button inside the toast', () => {
    el = createToast();
    el.show('Hello');
    expect(getRegion().querySelector('[data-dismiss]')).toBeTruthy();
  });

  it('should stack multiple toasts in the region', () => {
    el = createToast();
    el.show('First');
    el.show('Second');
    expect(getRegion().querySelectorAll('[role="status"]').length).toBe(2);
  });

  it('should add [data-removing] and remove the toast after the duration elapses', () => {
    el = createToast();
    el.show('Auto dismiss', 'info', 1000);
    const toast = getRegion().querySelector('[role="status"]');
    vi.advanceTimersByTime(1000);
    expect(toast.dataset.removing).toBe('');
    vi.advanceTimersByTime(200);
    expect(toast.isConnected).toBe(false);
  });

  it('should dismiss the toast immediately when the dismiss button is clicked', () => {
    el = createToast();
    el.show('Manual dismiss', 'info', 5000);
    const toast = getRegion().querySelector('[role="status"]');
    toast.querySelector('[data-dismiss]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(toast.dataset.removing).toBe('');
    vi.advanceTimersByTime(200);
    expect(toast.isConnected).toBe(false);
  });

  it('should reuse the same region element across multiple show() calls', () => {
    el = createToast();
    el.show('A');
    el.show('B');
    expect(document.querySelectorAll('[data-edible-toast-region]').length).toBe(1);
  });
});
