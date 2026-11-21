/**
 * Inline script for <head>, run before first paint: marks the document with
 * data-js, which is what lets .reveal start hidden. Without scripting the
 * attribute is never set and all content stays visible.
 */
export const documentBootstrap = `document.documentElement.dataset.js=""`;
