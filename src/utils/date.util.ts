/**
 * Formats a Date object into YYYY-MM-DD string format.
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/**
 * Returns a timestamp string for unique naming.
 */
export function getTimestamp(): string {
  return Date.now().toString();
}
