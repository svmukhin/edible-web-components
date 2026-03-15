/** @type {Record<string, string>} */
const _cache = {};

/**
 * Reads an EdibleCSS design token value from the host document's `:root`.
 * Results are memoized after the first read per property name.
 *
 * @param {string} name - CSS custom property name, e.g. `'--accent'`.
 * @param {Element} [element=document.documentElement] - Element whose computed
 *   style is read. Override in tests to pass a mock element.
 * @returns {string} The trimmed property value, or an empty string if unset.
 */
export function token(name, element = document.documentElement) {
  if (!(name in _cache)) {
    _cache[name] = getComputedStyle(element).getPropertyValue(name).trim();
  }
  return _cache[name];
}

/**
 * Clears the internal token cache.
 * Call after a dynamic theme change to force re-reads from `:root` on the
 * next `token()` call.
 *
 * @returns {void}
 */
export function clearTokenCache() {
  Object.keys(_cache).forEach((k) => delete _cache[k]);
}
