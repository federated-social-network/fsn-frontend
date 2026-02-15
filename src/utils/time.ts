/**
 * Calculates the time elapsed since a given date and returns a human-readable string.
 * @param {string | Date | number | null} [input] - The date to calculate time from. Can be a string, Date object, or timestamp.
 * @returns {string} A string representing how long ago the date was (e.g., "5 mins ago"), or "unknown" if input is invalid.
 */
export function timeAgo(input?: string | Date | number | null): string {
  if (!input) return "unknown";
  const date = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
  if (isNaN(date.getTime())) return "unknown";

  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000; // in seconds
  if (diff < 10) return 'few sec ago';
  if (diff < 60) return `${Math.floor(diff)} sec ago`;

  const mins = Math.floor(diff / 60);
  if (mins < 60) return mins === 1 ? '1 min ago' : `${mins} mins ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? '1 hr ago' : `${hours} hrs ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? '1 day ago' : `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? '1 mo ago' : `${months} mos ago`;

  const years = Math.floor(days / 365);
  return years === 1 ? '1 yr ago' : `${years} yrs ago`;
}
