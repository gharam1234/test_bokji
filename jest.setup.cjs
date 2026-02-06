require('@testing-library/jest-dom');

// Suppress React Router v7 deprecation warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('React Router Future Flag Warning')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};
