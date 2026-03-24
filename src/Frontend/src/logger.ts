// Centralised logger — the only place in the codebase that touches `console` directly.
// Using this wrapper keeps ESLint's no-console rule satisfied everywhere else and gives
// a single point of control if log behaviour ever needs to change (e.g. send errors to
// a remote service, suppress output in specific environments, etc.).

/* eslint-disable no-console */
const logger = {
  error: (...args: unknown[]) => console.error(...args),
  warn: (...args: unknown[]) => console.warn(...args),
};
/* eslint-enable no-console */

export default logger;
