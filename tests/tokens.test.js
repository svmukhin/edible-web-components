/**
 * SPDX-FileCopyrightText: Copyright (c) 2026 Sergei Mukhin
 * SPDX-License-Identifier: MIT
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { token, clearTokenCache } from '../src/tokens.js';

describe('token()', () => {
  beforeEach(() => {
    clearTokenCache();
    document.documentElement.style.removeProperty('--test-prop');
  });

  it('should return an empty string for an unset property', () => {
    expect(token('--test-prop')).toBe('');
  });

  it('should read a CSS custom property set on :root', () => {
    document.documentElement.style.setProperty('--test-prop', '#ff0000');
    expect(token('--test-prop')).toBe('#ff0000');
  });

  it('should return the cached value on repeated calls without re-reading the DOM', () => {
    document.documentElement.style.setProperty('--test-prop', 'initial');
    const first = token('--test-prop');
    document.documentElement.style.setProperty('--test-prop', 'changed');
    const second = token('--test-prop');
    expect(first).toBe('initial');
    expect(second).toBe('initial');
  });
});

describe('clearTokenCache()', () => {
  it('should force the next token() call to re-read from the DOM', () => {
    document.documentElement.style.setProperty('--test-prop', 'before');
    token('--test-prop');
    clearTokenCache();
    document.documentElement.style.setProperty('--test-prop', 'after');
    expect(token('--test-prop')).toBe('after');
  });
});
