/**
 * SPDX-FileCopyrightText: Copyright (c) 2026 Sergei Mukhin
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, afterEach } from 'vitest';
import '../src/components/edible-combobox.js';

/**
 * Creates an `<edible-combobox>` element with the given options, appends it to
 * `document.body`, and returns it.
 *
 * @param {Record<string, string>} options - Map of value → label.
 * @param {Record<string, string>} [attrs={}] - Additional attributes to set.
 * @returns {HTMLElement}
 */
function createCombobox(options = {}, attrs = {}) {
  const el = document.createElement('edible-combobox');
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  Object.entries(options).forEach(([value, label]) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    el.append(opt);
  });
  document.body.append(el);
  return el;
}

describe('edible-combobox', () => {
  /** @type {HTMLElement} */
  let el;

  afterEach(() => {
    el?.remove();
  });

  it('should be registered as a custom element', () => {
    expect(customElements.get('edible-combobox')).toBeDefined();
  });

  it('should remove child <option> elements after parsing', () => {
    el = createCombobox({ ams: 'Amsterdam', ber: 'Berlin' });
    expect(el.querySelectorAll('option').length).toBe(0);
  });

  it('should render a combobox input and a listbox without a hidden field', () => {
    el = createCombobox({ ams: 'Amsterdam' });
    expect(el.querySelector('input[role="combobox"]')).toBeTruthy();
    expect(el.querySelector('ul[role="listbox"]')).toBeTruthy();
    expect(el.querySelector('input[type="hidden"]')).toBeNull();
  });

  it('should forward the placeholder attribute to the inner input', () => {
    el = createCombobox({}, { placeholder: 'Pick one…' });
    expect(el.querySelector('input[role="combobox"]').placeholder).toBe('Pick one…');
  });

  it('should expose the name attribute for form participation', () => {
    el = createCombobox({}, { name: 'city' });
    expect(el.getAttribute('name')).toBe('city');
  });

  it('should disable the inner input when the disabled attribute is present', () => {
    el = createCombobox({}, { disabled: '' });
    expect(el.querySelector('input[role="combobox"]').disabled).toBe(true);
  });

  it('should render one listbox option per <option> child', () => {
    el = createCombobox({ ams: 'Amsterdam', ber: 'Berlin', par: 'Paris' });
    expect(el.querySelectorAll('[role="option"]').length).toBe(3);
  });

  it('should open the listbox when the input receives focus', () => {
    el = createCombobox({ ams: 'Amsterdam' });
    const input = el.querySelector('input[role="combobox"]');
    input.dispatchEvent(new Event('focus'));
    expect(el.querySelector('[role="listbox"]').hidden).toBe(false);
    expect(input.getAttribute('aria-expanded')).toBe('true');
  });

  it('should filter options to those matching the typed query', () => {
    el = createCombobox({ ams: 'Amsterdam', ber: 'Berlin', par: 'Paris' });
    const input = el.querySelector('input[role="combobox"]');
    input.value = 'am';
    input.dispatchEvent(new Event('input'));
    expect(el.querySelectorAll('[role="option"]').length).toBe(1);
    expect(el.querySelector('[role="option"]').textContent).toBe('Amsterdam');
  });

  it('should show a "No results" message when no options match the query', () => {
    el = createCombobox({ ams: 'Amsterdam' });
    const input = el.querySelector('input[role="combobox"]');
    input.value = 'zzz';
    input.dispatchEvent(new Event('input'));
    expect(el.querySelector('[data-empty]')).toBeTruthy();
  });

  it('should move aria-selected to the next option on ArrowDown', () => {
    el = createCombobox({ ams: 'Amsterdam', ber: 'Berlin' });
    const input = el.querySelector('input[role="combobox"]');
    input.dispatchEvent(new Event('focus'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    const options = el.querySelectorAll('[role="option"]');
    expect(options[0].getAttribute('aria-selected')).toBe('true');
  });

  it('should move aria-selected to the previous option on ArrowUp', () => {
    el = createCombobox({ ams: 'Amsterdam', ber: 'Berlin' });
    const input = el.querySelector('input[role="combobox"]');
    input.dispatchEvent(new Event('focus'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    const options = el.querySelectorAll('[role="option"]');
    expect(options[0].getAttribute('aria-selected')).toBe('true');
    expect(options[1].getAttribute('aria-selected')).toBe('false');
  });

  it('should select the active option on Enter and close the listbox', () => {
    el = createCombobox({ ams: 'Amsterdam', ber: 'Berlin' });
    const input = el.querySelector('input[role="combobox"]');
    input.dispatchEvent(new Event('focus'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(el.value).toBe('ams');
    expect(el.querySelector('[role="listbox"]').hidden).toBe(true);
  });

  it('should close the listbox on Escape without changing the value', () => {
    el = createCombobox({ ams: 'Amsterdam' });
    const input = el.querySelector('input[role="combobox"]');
    input.dispatchEvent(new Event('focus'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(el.querySelector('[role="listbox"]').hidden).toBe(true);
    expect(el.value).toBe('');
  });

  it('should select an option when it is clicked', () => {
    el = createCombobox({ ams: 'Amsterdam', ber: 'Berlin' });
    el.querySelector('input[role="combobox"]').dispatchEvent(new Event('focus'));
    const option = el.querySelectorAll('[role="option"]')[1];
    option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(el.value).toBe('ber');
    expect(el.querySelector('input[role="combobox"]').value).toBe('Berlin');
  });

  it('should update the value when the value setter is called with a valid value', () => {
    el = createCombobox({ ams: 'Amsterdam', ber: 'Berlin' });
    el.value = 'ber';
    expect(el.value).toBe('ber');
    expect(el.querySelector('input[role="combobox"]').value).toBe('Berlin');
  });

  it('should ignore a value setter call with an unknown value', () => {
    el = createCombobox({ ams: 'Amsterdam' });
    el.value = 'xyz';
    expect(el.value).toBe('');
  });

  it('should include a CSS rule applying margin-bottom of --space-sm inside a form', () => {
    el = createCombobox({});
    const allRules = document.adoptedStyleSheets.flatMap((s) => [...s.cssRules]);
    const rule = allRules.find((r) => r.selectorText === 'form edible-combobox');
    expect(rule).toBeDefined();
    expect(rule.style.getPropertyValue('margin-bottom')).toBe('var(--space-sm)');
  });
});
