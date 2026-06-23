/**
 * Convert an arbitrary string into a URL-safe slug.
 * "Rosie's Red Truck" -> "rosies-red-truck"
 */
export function slugify(input: string): string {
  return (input || '')
    .toString()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritical marks
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '') // drop apostrophes so "Rosie's" -> "rosies"
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}
