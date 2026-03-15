/**
 * SPDX-FileCopyrightText: Copyright (c) 2026 Sergei Mukhin
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, afterEach } from 'vitest';
import '../src/components/edible-tags-input.js';

/**
 * Creates an `<edible-tags-input>` element, appends it to `document.body`,
 * and returns it.
 *
 * @param {Record<string, string>} [attrs={}] - Attributes to set on the element.
 * @returns {HTMLElement}
 */
function createTagsInput(attrs = {}) {
  const el = document.createElement('edible-tags-input');
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  document.body.append(el);
  return el;
}

describe('edible-tags-input', () => {
  /** @type {HTMLElement} */
  let el;

  afterEach(() => {
    el?.remove();
  });

  it('should be registered as a custom element', () => {
    expect(customElements.get('edible-tags-input')).toBeDefined();
  });

  it('should render a text input and a hidden field', () => {
    el = createTagsInput();
    expect(el.querySelector('[data-text-input]')).toBeTruthy();
    expect(el.querySelector('input[type="hidden"]')).toBeTruthy();
  });

  it('should forward the name attribute to the hidden field', () => {
    el = createTagsInput({ name: 'skills' });
    expect(el.querySelector('input[type="hidden"]').name).toBe('skills');
  });

  it('should forward the placeholder attribute to the text input', () => {
    el = createTagsInput({ placeholder: 'Add a skill…' });
    expect(el.querySelector('[data-text-input]').placeholder).toBe('Add a skill…');
  });

  it('should disable the text input when the disabled attribute is present', () => {
    el = createTagsInput({ disabled: '' });
    expect(el.querySelector('[data-text-input]').disabled).toBe(true);
  });

  it('should add a tag and render a pill when add() is called', () => {
    el = createTagsInput();
    el.add('javascript');
    expect(el.querySelector('[data-tag="javascript"]')).toBeTruthy();
  });

  it('should expose the current tags via the value getter', () => {
    el = createTagsInput();
    el.add('javascript');
    el.add('css');
    expect(el.value).toEqual(['javascript', 'css']);
  });

  it('should not add duplicate tags', () => {
    el = createTagsInput();
    el.add('javascript');
    el.add('javascript');
    expect(el.value.length).toBe(1);
  });

  it('should not add a tag that is empty or whitespace-only', () => {
    el = createTagsInput();
    el.add('');
    el.add('   ');
    expect(el.value.length).toBe(0);
  });

  it('should remove a tag and its pill when remove() is called', () => {
    el = createTagsInput();
    el.add('javascript');
    el.remove('javascript');
    expect(el.querySelector('[data-tag="javascript"]')).toBeNull();
    expect(el.value).toEqual([]);
  });

  it('should update the hidden field value to a comma-separated string after adding tags', () => {
    el = createTagsInput({ name: 'skills' });
    el.add('javascript');
    el.add('css');
    expect(el.querySelector('input[type="hidden"]').value).toBe('javascript,css');
  });

  it('should commit a tag on Enter keydown and clear the text input', () => {
    el = createTagsInput();
    const input = el.querySelector('[data-text-input]');
    input.value = 'typescript';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(el.value).toContain('typescript');
    expect(input.value).toBe('');
  });

  it('should commit a tag on comma keydown and clear the text input', () => {
    el = createTagsInput();
    const input = el.querySelector('[data-text-input]');
    input.value = 'typescript,';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: ',', bubbles: true }));
    expect(el.value).toContain('typescript');
    expect(input.value).toBe('');
  });

  it('should remove the last tag on Backspace when the text input is empty', () => {
    el = createTagsInput();
    el.add('javascript');
    el.add('css');
    const input = el.querySelector('[data-text-input]');
    input.value = '';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    expect(el.value).toEqual(['javascript']);
  });

  it('should not remove a tag on Backspace when the text input has content', () => {
    el = createTagsInput();
    el.add('javascript');
    const input = el.querySelector('[data-text-input]');
    input.value = 'cs';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    expect(el.value).toEqual(['javascript']);
  });

  it('should remove a tag when its remove button is clicked', () => {
    el = createTagsInput();
    el.add('javascript');
    const btn = el.querySelector('[data-tag="javascript"] button');
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(el.querySelector('[data-tag="javascript"]')).toBeNull();
    expect(el.value).toEqual([]);
  });

  it('should clear the placeholder after the first tag is added', () => {
    el = createTagsInput({ placeholder: 'Add a skill…' });
    el.add('javascript');
    expect(el.querySelector('[data-text-input]').placeholder).toBe('');
  });

  it('should restore the placeholder when all tags are removed', () => {
    el = createTagsInput({ placeholder: 'Add a skill…' });
    el.add('javascript');
    el.remove('javascript');
    expect(el.querySelector('[data-text-input]').placeholder).toBe('Add a skill…');
  });
});
