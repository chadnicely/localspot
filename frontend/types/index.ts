export type Role = 'master_admin' | 'publisher' | 'listing_owner';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role | string;
}

/** Publisher == the customer Account (white-label brand owner). */
export interface Account {
  _id: string;
  userId: string;
  name: string;
  city: string;
  state: string;
  country: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  websiteUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  contactEmail: string;
  status: 'approved' | 'suspended' | 'pending';
  createdAt?: string;
}

export type CalendarType = 'food_truck' | 'musician' | 'vendor' | 'farmers_market' | 'event';

export interface Calendar {
  _id: string;
  publisherId: string;
  type: CalendarType;
  name: string;
  subdomain: string;
  active: boolean;
  createdAt?: string;
}

/** Public hub payload (GET /public/:calendar): the calendar + its account branding. */
export interface CalendarHub {
  calendar: { id: string; name: string; type: CalendarType; subdomain: string };
  brand: {
    accountName: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    websiteUrl: string;
    facebookUrl: string;
    instagramUrl: string;
    city: string;
    state: string;
  };
}

export type ListingType =
  | 'food_truck'
  | 'business'
  | 'musician'
  | 'vendor'
  | 'event_organizer';

export interface Listing {
  _id: string;
  publisherId: string;
  calendarId: string;
  ownerUserId: string;
  type: ListingType;
  name: string;
  slug: string;
  description: string;
  category: string;
  cuisineType: string;
  logoUrl: string;
  coverImageUrl: string;
  phone: string;
  email: string;
  websiteUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  menuUrl: string;
  address: string;
  city: string;
  state: string;
  status: 'pending' | 'approved' | 'suspended';
  featured: boolean;
  createdAt?: string;
}

export interface ListingSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  type: ListingType;
  category: string;
  cuisineType: string;
  featured: boolean;
}

export interface ScheduleEntry {
  id?: string;
  _id?: string;
  listingId: string;
  calendarId: string;
  publisherId: string;
  title: string;
  date: string | null;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  locationName: string;
  address: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  externalLink: string;
  notes: string;
  status: 'active' | 'cancelled' | 'pending';
}

export interface CalendarStop extends ScheduleEntry {
  listing: ListingSummary;
}

export interface PublicProfile {
  listing: Listing;
  schedule: ScheduleEntry[];
}

export interface MasterDashboard {
  totalAccounts: number;
  totalCalendars: number;
  activeCalendars: number;
  totalListings: number;
  pendingListings: number;
  calendarsByType: Record<string, number>;
  recentAccounts: Array<{ id: string; name: string; status: string }>;
  recentCalendars: Array<{ id: string; name: string; type: string; subdomain: string; active: boolean }>;
}

export interface CalendarDashboard {
  totalListings: number;
  pendingListings: number;
  approvedListings: number;
  featuredListings: number;
  scheduleStops: number;
  recentListings: Array<{ id: string; name: string; type: string; status: string; slug: string }>;
}

export const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
] as const;

export const CALENDAR_TYPES: { value: CalendarType; label: string; icon: string; listingsLabel: string }[] = [
  { value: 'food_truck', label: 'Food Trucks', icon: 'heroicons:truck', listingsLabel: 'Food Trucks' },
  { value: 'musician', label: 'Live Music', icon: 'heroicons:musical-note', listingsLabel: 'Musicians' },
  { value: 'vendor', label: 'Vendors', icon: 'heroicons:shopping-bag', listingsLabel: 'Vendors' },
  { value: 'farmers_market', label: 'Farmers Markets', icon: 'heroicons:building-storefront', listingsLabel: 'Markets' },
  { value: 'event', label: 'Events', icon: 'heroicons:calendar', listingsLabel: 'Events' },
];

export function calendarTypeLabel(type: string): string {
  return CALENDAR_TYPES.find((t) => t.value === type)?.label ?? type;
}
export function calendarListingsLabel(type: string): string {
  return CALENDAR_TYPES.find((t) => t.value === type)?.listingsLabel ?? 'Listings';
}

const LISTING_TYPE_LABELS: Record<string, string> = {
  food_truck: 'Food Truck',
  business: 'Business',
  musician: 'Musician',
  vendor: 'Vendor',
  event_organizer: 'Event',
};
export function listingTypeLabel(type: string): string {
  return LISTING_TYPE_LABELS[type] ?? type;
}

export const FOOD_CATEGORIES = [
  'BBQ', 'Tacos', 'Burgers', 'Pizza', 'Coffee', 'Dessert', 'Ice Cream',
  'Seafood', 'Asian', 'Mediterranean', 'Vegan', 'Breakfast', 'Comfort Food',
  'Mexican', 'Other',
] as const;
