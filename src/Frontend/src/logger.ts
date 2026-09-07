// Centralised logger — the only place in the codebase that touches `console` directly.
// Using this wrapper keeps ESLint's no-console rule satisfied everywhere else and gives
// a single point of control if log behaviour ever needs to change (e.g. send errors to
// a remote service, suppress output in specific environments, etc.).

function consoleMethod(method: "error" | "warn") {
  return ((...args: Parameters<Console[typeof method]>) => globalThis.console[method](...args)) as Console[typeof method];
}

const logger = {
  error: consoleMethod("error"),
  warn: consoleMethod("warn"),
};

export default logger;
