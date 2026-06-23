import { DAYS_OF_WEEK } from '~/types';

/** Format a 24h "HH:MM" string as "h:MM AM/PM". */
export function formatTime(value?: string): string {
  if (!value) return '';
  const [hStr, mStr] = value.split(':');
  let h = Number(hStr);
  const m = mStr ?? '00';
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
}

/** "11:00" + "14:00" -> "11:00 AM - 2:00 PM" */
export function formatRange(start?: string, end?: string): string {
  return [formatTime(start), formatTime(end)].filter(Boolean).join(' - ');
}

/** Today's weekday name, Monday-first (matches the calendar tabs). */
export function todayName(): string {
  const jsDay = new Date().getDay(); // 0=Sun
  return DAYS_OF_WEEK[(jsDay + 6) % 7];
}

/** Short label e.g. "Mon". */
export function shortDay(day: string): string {
  return day.slice(0, 3);
}
