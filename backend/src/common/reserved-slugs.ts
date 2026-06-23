/** Subdomains/slugs that cannot be claimed by a publisher (they collide with app routes). */
export const RESERVED_SLUGS = new Set([
  'admin',
  'publisher',
  'dashboard',
  'login',
  'signup',
  'claim',
  'api',
  'www',
  'app',
  'uploads',
  'docs',
  'health',
  'public',
  'me',
  'auth',
  'assets',
  '_nuxt',
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}
