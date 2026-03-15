/**
 * @module edible-web-components
 * @description
 * Entry point for the edible-web-components library.
 * Importing this module registers all custom elements on `customElements`.
 * No further initialization is required by the consumer.
 *
 * Component imports are added here as each component is implemented.
 * Token utilities are also re-exported for advanced consumers.
 */

export { token, clearTokenCache } from './tokens.js';
import './components/edible-combobox.js';
