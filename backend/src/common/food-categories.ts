/** The kinds of listing a hub can host. */
export const LISTING_TYPES = [
  'food_truck',
  'business',
  'musician',
  'vendor',
  'event_organizer',
] as const;

export type ListingTypeName = (typeof LISTING_TYPES)[number];

/** General business categories (used for non-food listings). */
export const BUSINESS_CATEGORIES = [
  'Restaurant',
  'Retail',
  'Services',
  'Health & Wellness',
  'Beauty',
  'Fitness',
  'Entertainment',
  'Professional',
  'Home & Garden',
  'Automotive',
  'Other',
] as const;

/** Canonical list of food categories trucks can pick from (from the build spec). */
export const FOOD_CATEGORIES = [
  'BBQ',
  'Tacos',
  'Burgers',
  'Pizza',
  'Coffee',
  'Dessert',
  'Ice Cream',
  'Seafood',
  'Asian',
  'Mediterranean',
  'Vegan',
  'Breakfast',
  'Comfort Food',
  'Mexican',
  'Other',
] as const;

/** Days of the week, Monday-first, matching the public calendar tabs. */
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

/** Map a JS Date.getDay() (0=Sun..6=Sat) to our Monday-first day name. */
export function dayNameFromDate(date: Date): DayOfWeek {
  const jsDay = date.getDay(); // 0=Sun
  const idx = (jsDay + 6) % 7; // 0=Mon
  return DAYS_OF_WEEK[idx];
}
