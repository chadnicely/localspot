export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'truck_owner' | string;
}

export interface FoodTruck {
  _id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  logoUrl: string;
  mainImageUrl: string;
  description: string;
  foodCategories: string[];
  websiteUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  menuUrl: string;
  phone: string;
  email: string;
  isActive: boolean;
  isFeatured: boolean;
  paymentStatus: 'paid' | 'unpaid' | 'trial' | 'comped';
  plan: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleEntry {
  id?: string;
  _id?: string;
  foodTruckId: string;
  date: string | null;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  locationName: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  notes: string;
  status: 'scheduled' | 'canceled' | 'updated';
}

export interface TruckSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  foodCategories: string[];
  isFeatured: boolean;
}

/** A schedule entry joined with its truck — returned by the public calendar. */
export interface CalendarStop extends ScheduleEntry {
  truck: TruckSummary;
}

export interface PublicProfile {
  truck: FoodTruck;
  schedule: ScheduleEntry[];
}

export interface AdminDashboard {
  totalTrucks: number;
  activeTrucks: number;
  pendingTrucks: number;
  paidTrucks: number;
  weeklyRevenue: number;
  recentTrucks: Array<{
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    paymentStatus: string;
    updatedAt: string;
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
