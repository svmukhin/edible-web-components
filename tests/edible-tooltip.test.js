/**
 * SPDX-FileCopyrightText: Copyright (c) 2026 Sergei Mukhin
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, afterEach } from 'vitest';
import '../src/components/edible-tooltip.js';

/**
 * Creates a parent `<button>` containing an `<edible-tooltip>`, appends
 * it to `document.body`, and returns both elements.
 *
 * @param {string} [text='Tooltip text'] - The tooltip message.
 * @returns {{ parent: HTMLElement, tooltip: HTMLElement }}
 */
function createTooltip(text = 'Tooltip text') {
  const parent = document.createElement('button');
  parent.textContent = 'Trigger';
  const tooltip = document.createElement('edible-tooltip');
  tooltip.textContent = text;
  parent.append(tooltip);
  document.body.append(parent);
  return { parent, tooltip };
}

/**
 * Returns the current `[data-edible-tooltip-popup]` element from the body,
 * if present.
 *
 * @returns {HTMLElement|null}
 */
function getPopup() {
  return document.querySelector('[data-edible-tooltip-popup]');
}

describe('edible-tooltip', () => {
  /** @type {HTMLElement} */
  let parent;

  afterEach(() => {
    parent?.remove();
    document.querySelector('[data-edible-tooltip-popup]')?.remove();
  });

  it('should be registered as a custom element', () => {
    ({ parent } = createTooltip());
    expect(customElements.get('edible-tooltip')).toBeDefined();
  });

  it('should assign a unique id to the tooltip element if it has none', () => {
    ({ parent } = createTooltip());
    const tooltip = parent.querySelector('edible-tooltip');
    expect(tooltip.id).toMatch(/^edible-tooltip-\d+$/);
  });

  it('should set aria-describedby on the parent element pointing to the tooltip id', () => {
    ({ parent } = createTooltip());
    const tooltip = parent.querySelector('edible-tooltip');
    expect(parent.getAttribute('aria-describedby')).toBe(tooltip.id);
  });

  it('should show a popup with role="tooltip" on parent mouseenter', () => {
    ({ parent } = createTooltip());
    parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(getPopup()).toBeTruthy();
    expect(getPopup().getAttribute('role')).toBe('tooltip');
  });

  it('should show a popup on parent focus', () => {
    ({ parent } = createTooltip());
    parent.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    expect(getPopup()).toBeTruthy();
  });

  it('should display the tooltip textContent inside the popup', () => {
    ({ parent } = createTooltip('Cannot be undone.'));
    parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(getPopup().textContent).toBe('Cannot be undone.');
  });

  it('should hide the popup on parent mouseleave', () => {
    ({ parent } = createTooltip());
    parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    parent.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    expect(getPopup()).toBeNull();
  });

  it('should hide the popup on parent blur', () => {
    ({ parent } = createTooltip());
    parent.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    parent.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    expect(getPopup()).toBeNull();
  });

  it('should not create a second popup if show is triggered while one is already visible', () => {
    ({ parent } = createTooltip());
    parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(document.querySelectorAll('[data-edible-tooltip-popup]').length).toBe(1);
  });

  it('should remove aria-describedby from the parent when disconnected', () => {
    ({ parent } = createTooltip());
    parent.remove();
    expect(parent.hasAttribute('aria-describedby')).toBe(false);
  });

  it('should remove the popup from the DOM when disconnected while visible', () => {
    ({ parent } = createTooltip());
    parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    parent.remove();
    expect(getPopup()).toBeNull();
  });
});
