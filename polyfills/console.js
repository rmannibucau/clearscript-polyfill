globalThis.console = globalThis.console || {
  log(...args) {
    Console.WriteLine(...args);
  },
  warn(...args) {
    Console.WriteLine(...args);
  },
  error(...args) {
    Console.Error.WriteLine(...args);
  },
};
