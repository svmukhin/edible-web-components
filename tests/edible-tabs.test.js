/**
 * SPDX-FileCopyrightText: Copyright (c) 2026 Sergei Mukhin
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, afterEach } from 'vitest';
import '../src/components/edible-tabs.js';

/**
 * Creates an `<edible-tabs>` element with the given tab labels and contents,
 * appends it to `document.body`, and returns it.
 *
 * @param {Array<{label: string, content: string}>} tabs
 * @returns {HTMLElement}
 */
function createTabs(tabs) {
  const el = document.createElement('edible-tabs');
  tabs.forEach(({ label, content }) => {
    const tab = document.createElement('edible-tab');
    tab.setAttribute('label', label);
    tab.textContent = content;
    el.append(tab);
  });
  document.body.append(el);
  return el;
}

describe('edible-tabs', () => {
  /** @type {HTMLElement} */
  let el;

  afterEach(() => {
    el?.remove();
  });

  it('should be registered as a custom element', () => {
    el = createTabs([{ label: 'A', content: 'Content A' }]);
    expect(customElements.get('edible-tabs')).toBeDefined();
  });

  it('should register edible-tab as a custom element', () => {
    el = createTabs([{ label: 'A', content: 'Content A' }]);
    expect(customElements.get('edible-tab')).toBeDefined();
  });

  it('should render a div[role="tablist"] as the first child', () => {
    el = createTabs([
      { label: 'One', content: 'Content 1' },
      { label: 'Two', content: 'Content 2' },
    ]);
    const tablist = el.firstElementChild;
    expect(tablist?.getAttribute('role')).toBe('tablist');
  });

  it('should render one button[role="tab"] per edible-tab child', () => {
    el = createTabs([
      { label: 'One', content: 'Content 1' },
      { label: 'Two', content: 'Content 2' },
      { label: 'Three', content: 'Content 3' },
    ]);
    const buttons = el.querySelectorAll('button[role="tab"]');
    expect(buttons.length).toBe(3);
  });

  it('should use the label attribute as the button text content', () => {
    el = createTabs([
      { label: 'Overview', content: 'Content A' },
      { label: 'Details', content: 'Content B' },
    ]);
    const buttons = el.querySelectorAll('button[role="tab"]');
    expect(buttons[0].textContent).toBe('Overview');
    expect(buttons[1].textContent).toBe('Details');
  });

  it('should set aria-selected="true" on the first tab button by default', () => {
    el = createTabs([
      { label: 'First', content: 'A' },
      { label: 'Second', content: 'B' },
    ]);
    const buttons = el.querySelectorAll('button[role="tab"]');
    expect(buttons[0].getAttribute('aria-selected')).toBe('true');
    expect(buttons[1].getAttribute('aria-selected')).toBe('false');
  });

  it('should show the first panel and hide the rest by default', () => {
    el = createTabs([
      { label: 'First', content: 'A' },
      { label: 'Second', content: 'B' },
    ]);
    const panels = el.querySelectorAll('edible-tab');
    expect(panels[0].hasAttribute('hidden')).toBe(false);
    expect(panels[1].hasAttribute('hidden')).toBe(true);
  });

  it('should set role="tabpanel" on each edible-tab element', () => {
    el = createTabs([
      { label: 'A', content: 'Content A' },
      { label: 'B', content: 'Content B' },
    ]);
    const panels = el.querySelectorAll('edible-tab');
    panels.forEach((panel) => {
      expect(panel.getAttribute('role')).toBe('tabpanel');
    });
  });

  it('should wire aria-controls on each button to the corresponding panel id', () => {
    el = createTabs([
      { label: 'A', content: 'Content A' },
      { label: 'B', content: 'Content B' },
    ]);
    const buttons = el.querySelectorAll('button[role="tab"]');
    const panels = el.querySelectorAll('edible-tab');
    expect(buttons[0].getAttribute('aria-controls')).toBe(panels[0].id);
    expect(buttons[1].getAttribute('aria-controls')).toBe(panels[1].id);
  });

  it('should wire aria-labelledby on each panel to the corresponding button id', () => {
    el = createTabs([
      { label: 'A', content: 'Content A' },
      { label: 'B', content: 'Content B' },
    ]);
    const buttons = el.querySelectorAll('button[role="tab"]');
    const panels = el.querySelectorAll('edible-tab');
    expect(panels[0].getAttribute('aria-labelledby')).toBe(buttons[0].id);
    expect(panels[1].getAttribute('aria-labelledby')).toBe(buttons[1].id);
  });

  it('should activate a tab and show its panel when clicked', () => {
    el = createTabs([
      { label: 'A', content: 'Content A' },
      { label: 'B', content: 'Content B' },
    ]);
    const buttons = el.querySelectorAll('button[role="tab"]');
    const panels = el.querySelectorAll('edible-tab');
    buttons[1].click();
    expect(buttons[1].getAttribute('aria-selected')).toBe('true');
    expect(buttons[0].getAttribute('aria-selected')).toBe('false');
    expect(panels[1].hasAttribute('hidden')).toBe(false);
    expect(panels[0].hasAttribute('hidden')).toBe(true);
  });

  it('should set tabindex="0" on the active button and tabindex="-1" on others', () => {
    el = createTabs([
      { label: 'A', content: 'Content A' },
      { label: 'B', content: 'Content B' },
    ]);
    const buttons = el.querySelectorAll('button[role="tab"]');
    expect(buttons[0].getAttribute('tabindex')).toBe('0');
    expect(buttons[1].getAttribute('tabindex')).toBe('-1');
  });

  it('should move focus to the next tab on ArrowRight keydown', () => {
    el = createTabs([
      { label: 'A', content: 'Content A' },
      { label: 'B', content: 'Content B' },
    ]);
    const buttons = el.querySelectorAll('button[role="tab"]');
    buttons[0].focus();
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(buttons[1].getAttribute('aria-selected')).toBe('true');
  });

  it('should move focus to the previous tab on ArrowLeft keydown', () => {
    el = createTabs([
      { label: 'A', content: 'Content A' },
      { label: 'B', content: 'Content B' },
    ]);
    const buttons = el.querySelectorAll('button[role="tab"]');
    buttons[1].click();
    buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(buttons[0].getAttribute('aria-selected')).toBe('true');
  });

  it('should wrap ArrowRight from the last tab to the first', () => {
    el = createTabs([
      { label: 'A', content: 'Content A' },
      { label: 'B', content: 'Content B' },
    ]);
    const buttons = el.querySelectorAll('button[role="tab"]');
    buttons[1].click();
    buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(buttons[0].getAttribute('aria-selected')).toBe('true');
  });

  it('should wrap ArrowLeft from the first tab to the last', () => {
    el = createTabs([
      { label: 'A', content: 'Content A' },
      { label: 'B', content: 'Content B' },
    ]);
    const buttons = el.querySelectorAll('button[role="tab"]');
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(buttons[1].getAttribute('aria-selected')).toBe('true');
  });

  it('should activate the first tab on Home keydown', () => {
    el = createTabs([
      { label: 'A', content: 'Content A' },
      { label: 'B', content: 'Content B' },
      { label: 'C', content: 'Content C' },
    ]);
    const buttons = el.querySelectorAll('button[role="tab"]');
    buttons[2].click();
    buttons[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(buttons[0].getAttribute('aria-selected')).toBe('true');
  });

  it('should activate the last tab on End keydown', () => {
    el = createTabs([
      { label: 'A', content: 'Content A' },
      { label: 'B', content: 'Content B' },
      { label: 'C', content: 'Content C' },
    ]);
    const buttons = el.querySelectorAll('button[role="tab"]');
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(buttons[2].getAttribute('aria-selected')).toBe('true');
  });
});
