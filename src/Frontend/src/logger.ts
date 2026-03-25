// Centralised logger — the only place in the codebase that touches `console` directly.
// Using this wrapper keeps ESLint's no-console rule satisfied everywhere else and gives
// a single point of control if log behaviour ever needs to change (e.g. send errors to
// a remote service, suppress output in specific environments, etc.).

/* eslint-disable no-console */
const logger = {
  error: ((...args) => console.error(...args)) as typeof console.error,
  warn: ((...args) => console.warn(...args)) as typeof console.warn,
};
/* eslint-enable no-console */

export default logger;
