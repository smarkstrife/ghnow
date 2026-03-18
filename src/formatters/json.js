/**
 * Format data as pretty-printed JSON to stdout.
 * @param {Array<object>} data - repos or developers
 * @returns {string}
 */
export function formatJson(data) {
  return JSON.stringify(data, null, 2);
}
