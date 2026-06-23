export type Role = 'master_admin' | 'publisher' | 'listing_owner';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role | string;
}

export interface Publisher {
  _id: string;
  userId: string;
  name: string;
  slug: string;
  subdomain: string;
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
  status: 'pending' | 'approved' | 'suspended';
  createdAt?: string;
}

/** Public branding payload (GET /public/:publisher). */
export interface HubBranding {
  id: string;
  name: string;
  subdomain: string;
  city: string;
  state: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  websiteUrl: string;
  facebookUrl: string;
  instagramUrl: string;
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

/** A schedule entry joined with its listing — returned by the public calendar. */
export interface CalendarStop extends ScheduleEntry {
  listing: ListingSummary;
}

export interface PublicProfile {
  listing: Listing;
  schedule: ScheduleEntry[];
}

export interface MasterDashboard {
  totalPublishers: number;
  pendingPublishers: number;
  approvedPublishers: number;
  totalListings: number;
  pendingListings: number;
  approvedListings: number;
  listingsByType: Record<string, number>;
  recentPublishers: Array<{ id: string; name: string; subdomain: string; status: string }>;
  recentListings: Array<{ id: string; name: string; type: string; status: string }>;
}

export interface PublisherDashboard {
  totalListings: number;
  pendingListings: number;
  approvedListings: number;
  featuredListings: number;
  scheduleStops: number;
  recentListings: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    slug: string;
  }>;
}

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const LISTING_TYPES: { value: ListingType; label: string; icon: string }[] = [
  { value: 'food_truck', label: 'Food Truck', icon: 'heroicons:truck' },
  { value: 'business', label: 'Business', icon: 'heroicons:building-storefront' },
  { value: 'musician', label: 'Musician / Band', icon: 'heroicons:musical-note' },
  { value: 'vendor', label: 'Vendor', icon: 'heroicons:shopping-bag' },
  { value: 'event_organizer', label: 'Event Organizer', icon: 'heroicons:calendar' },
];

export function listingTypeLabel(type: string): string {
  return LISTING_TYPES.find((t) => t.value === type)?.label ?? type;
}

export const FOOD_CATEGORIES = [
  'BBQ', 'Tacos', 'Burgers', 'Pizza', 'Coffee', 'Dessert', 'Ice Cream',
  'Seafood', 'Asian', 'Mediterranean', 'Vegan', 'Breakfast', 'Comfort Food',
  'Mexican', 'Other',
] as const;

export const BUSINESS_CATEGORIES = [
  'Restaurant', 'Retail', 'Services', 'Health & Wellness', 'Beauty', 'Fitness',
  'Entertainment', 'Professional', 'Home & Garden', 'Automotive', 'Other',
] as const;
