/**
 * SPDX-FileCopyrightText: Copyright (c) 2026 Sergei Mukhin
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import '../src/components/edible-nav-dropdown.js';

/**
 * Creates an `<edible-nav-dropdown>` element with the given label and links,
 * appends it to `document.body`, and returns it.
 *
 * @param {string} label
 * @param {Array<{href: string, text: string}>} links
 * @param {boolean} [disabled]
 * @returns {HTMLElement}
 */
function createDropdown(label, links, disabled = false) {
  const el = document.createElement('edible-nav-dropdown');
  el.setAttribute('label', label);
  if (disabled) el.setAttribute('disabled', '');
  links.forEach(({ href, text }) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    el.append(a);
  });
  document.body.append(el);
  return el;
}

const LINKS = [
  { href: '/a', text: 'Alpha' },
  { href: '/b', text: 'Beta' },
  { href: '/c', text: 'Gamma' },
];

describe('edible-nav-dropdown', () => {
  /** @type {HTMLElement} */
  let el;

  afterEach(() => {
    el?.remove();
  });

  it('should be registered as a custom element', () => {
    el = createDropdown('Menu', LINKS);
    expect(customElements.get('edible-nav-dropdown')).toBeDefined();
  });

  it('should render a trigger button with the label text', () => {
    el = createDropdown('Products', LINKS);
    const btn = el.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn.textContent).toContain('Products');
  });

  it('should render a trigger button with aria-expanded="false" initially', () => {
    el = createDropdown('Menu', LINKS);
    const btn = el.querySelector('button');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('should move original child links into <li> elements inside a <ul>', () => {
    el = createDropdown('Menu', LINKS);
    const items = el.querySelectorAll('ul > li > a');
    expect(items.length).toBe(3);
    expect(items[0].textContent).toBe('Alpha');
    expect(items[2].textContent).toBe('Gamma');
  });

  it('should hide the dropdown list initially via the hidden attribute', () => {
    el = createDropdown('Menu', LINKS);
    const list = el.querySelector('ul');
    expect(list.hasAttribute('hidden')).toBe(true);
  });

  it('should wire aria-controls on the button to the list id', () => {
    el = createDropdown('Menu', LINKS);
    const btn = el.querySelector('button');
    const list = el.querySelector('ul');
    expect(btn.getAttribute('aria-controls')).toBe(list.id);
    expect(list.id).not.toBe('');
  });

  it('should include a decorative arrow span with aria-hidden="true"', () => {
    el = createDropdown('Menu', LINKS);
    const span = el.querySelector('button > span');
    expect(span).not.toBeNull();
    expect(span.getAttribute('aria-hidden')).toBe('true');
  });

  it('should open on click and set aria-expanded="true"', () => {
    el = createDropdown('Menu', LINKS);
    el.querySelector('button').click();
    expect(el.querySelector('button').getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('ul').hasAttribute('hidden')).toBe(false);
  });

  it('should close on second click and set aria-expanded="false"', () => {
    el = createDropdown('Menu', LINKS);
    const btn = el.querySelector('button');
    btn.click();
    btn.click();
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('ul').hasAttribute('hidden')).toBe(true);
  });

  it('should open on mouseenter', () => {
    el = createDropdown('Menu', LINKS);
    el.dispatchEvent(new MouseEvent('mouseenter'));
    expect(el.querySelector('button').getAttribute('aria-expanded')).toBe('true');
  });

  it('should close on mouseleave after the debounce delay', () => {
    vi.useFakeTimers();
    el = createDropdown('Menu', LINKS);
    el.dispatchEvent(new MouseEvent('mouseenter'));
    el.dispatchEvent(new MouseEvent('mouseleave'));
    // Before the timer fires the dropdown is still open.
    expect(el.querySelector('button').getAttribute('aria-expanded')).toBe('true');
    vi.runAllTimers();
    expect(el.querySelector('button').getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('ul').hasAttribute('hidden')).toBe(true);
    vi.useRealTimers();
  });

  it('should close on Escape key dispatched on the button', () => {
    el = createDropdown('Menu', LINKS);
    const btn = el.querySelector('button');
    btn.click();
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('should open and move focus to the first link on ArrowDown at the button', () => {
    el = createDropdown('Menu', LINKS);
    const btn = el.querySelector('button');
    btn.focus();
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    const links = el.querySelectorAll('ul a');
    expect(document.activeElement).toBe(links[0]);
  });

  it('should open and move focus to the last link on ArrowUp at the button', () => {
    el = createDropdown('Menu', LINKS);
    const btn = el.querySelector('button');
    btn.focus();
    btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    const links = el.querySelectorAll('ul a');
    expect(document.activeElement).toBe(links[links.length - 1]);
  });

  it('should move focus to the next link on ArrowDown inside the list', () => {
    el = createDropdown('Menu', LINKS);
    el.querySelector('button').click();
    const links = Array.from(el.querySelectorAll('ul a'));
    links[0].focus();
    links[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(links[1]);
  });

  it('should wrap focus from the last link to the first on ArrowDown', () => {
    el = createDropdown('Menu', LINKS);
    el.querySelector('button').click();
    const links = Array.from(el.querySelectorAll('ul a'));
    links[links.length - 1].focus();
    links[links.length - 1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(links[0]);
  });

  it('should move focus to the previous link on ArrowUp inside the list', () => {
    el = createDropdown('Menu', LINKS);
    el.querySelector('button').click();
    const links = Array.from(el.querySelectorAll('ul a'));
    links[2].focus();
    links[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement).toBe(links[1]);
  });

  it('should close and return focus to button when ArrowUp on the first link', () => {
    el = createDropdown('Menu', LINKS);
    const btn = el.querySelector('button');
    btn.click();
    const links = Array.from(el.querySelectorAll('ul a'));
    links[0].focus();
    links[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(btn);
  });

  it('should move focus to the first link on Home key', () => {
    el = createDropdown('Menu', LINKS);
    el.querySelector('button').click();
    const links = Array.from(el.querySelectorAll('ul a'));
    links[2].focus();
    links[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(links[0]);
  });

  it('should move focus to the last link on End key', () => {
    el = createDropdown('Menu', LINKS);
    el.querySelector('button').click();
    const links = Array.from(el.querySelectorAll('ul a'));
    links[0].focus();
    links[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(links[links.length - 1]);
  });

  it('should close and return focus to button on Escape inside the list', () => {
    el = createDropdown('Menu', LINKS);
    const btn = el.querySelector('button');
    btn.click();
    const links = Array.from(el.querySelectorAll('ul a'));
    links[1].focus();
    links[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(btn);
  });

  it('should set disabled on the trigger button when disabled attribute is present', () => {
    el = createDropdown('Menu', LINKS, true);
    expect(el.querySelector('button').disabled).toBe(true);
  });

  it('should not open when disabled attribute is present', () => {
    el = createDropdown('Menu', LINKS, true);
    el.querySelector('button').removeAttribute('disabled'); // simulate click despite UI block
    el._open();
    expect(el.querySelector('button').getAttribute('aria-expanded')).toBe('false');
  });

  it('should set tabindex="-1" and aria-disabled="true" on links when disabled', () => {
    el = createDropdown('Menu', LINKS, true);
    const links = el.querySelectorAll('ul a');
    links.forEach((a) => {
      expect(a.getAttribute('tabindex')).toBe('-1');
      expect(a.getAttribute('aria-disabled')).toBe('true');
    });
  });

  it('should close the first dropdown when a second one is opened', () => {
    el = createDropdown('Menu A', LINKS);
    const el2 = createDropdown('Menu B', LINKS);
    el.querySelector('button').click();
    expect(el.querySelector('button').getAttribute('aria-expanded')).toBe('true');
    el2.querySelector('button').click();
    expect(el2.querySelector('button').getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('button').getAttribute('aria-expanded')).toBe('false');
    el2.remove();
  });

  it('should update button text when label attribute changes', () => {
    el = createDropdown('Old Label', LINKS);
    el.setAttribute('label', 'New Label');
    expect(el.querySelector('button').textContent).toContain('New Label');
  });
});
