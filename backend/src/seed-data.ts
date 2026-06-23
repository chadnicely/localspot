/* eslint-disable no-console */
import type { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from './users/users.service';
import { FoodTruck, FoodTruckDocument } from './trucks/food-truck.schema';
import { ScheduleEntry, ScheduleEntryDocument } from './schedule/schedule-entry.schema';
import { slugify } from './common/slug.util';

interface TruckSeed {
  name: string;
  ownerEmail: string;
  description: string;
  foodCategories: string[];
  phone?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  isFeatured?: boolean;
  schedule: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    locationName: string;
    address?: string;
    notes?: string;
  }>;
}

/** Approximate map coordinates for the demo stop locations (North Port, FL area). */
const LOCATION_COORDS: Record<string, [number, number]> = {
  'City Hall Parking Lot': [27.0809, -82.236],
  'Home Depot': [27.0456, -82.1995],
  'North Port Brewing Co.': [27.044, -82.236],
  'Farmers Market': [27.0625, -82.201],
  'Walmart Parking Lot': [27.0461, -82.1991],
  'Cocoplum Village Shops': [27.049, -82.184],
  'Community Park': [27.053, -82.236],
  'North Port High School': [27.066, -82.153],
  'Butler Park': [27.047, -82.232],
  'North Port Library': [27.054, -82.23],
  'Sumter Crossing': [27.041, -82.148],
  'Blue Ridge Park': [27.098, -82.185],
  'Warm Mineral Springs': [27.0593, -82.2606],
};

export const DEMO_TRUCKS: TruckSeed[] = [
  {
    name: "Rosie's Red Truck",
    ownerEmail: 'rosie@example.com',
    description:
      "Rosie's Red Truck serves authentic Mexican street tacos, burritos, quesadillas and homemade salsa made fresh daily!",
    foodCategories: ['Mexican', 'Tacos'],
    phone: '(941) 555-0101',
    websiteUrl: 'https://example.com/rosies',
    facebookUrl: 'https://facebook.com/rosiesredtruck',
    instagramUrl: 'https://instagram.com/rosiesredtruck',
    isFeatured: true,
    schedule: [
      { dayOfWeek: 'Monday', startTime: '11:00', endTime: '14:00', locationName: 'City Hall Parking Lot', address: '4970 City Hall Blvd, North Port, FL', notes: 'Lunch service only' },
      { dayOfWeek: 'Wednesday', startTime: '17:00', endTime: '20:00', locationName: 'Home Depot', address: '17000 Tamiami Trail, North Port, FL' },
      { dayOfWeek: 'Friday', startTime: '17:00', endTime: '21:00', locationName: 'North Port Brewing Co.', address: '1750 S. Biscayne Dr, North Port, FL', notes: 'Great spot — outdoor seating!' },
      { dayOfWeek: 'Saturday', startTime: '10:00', endTime: '14:00', locationName: 'Farmers Market' },
    ],
  },
  {
    name: 'Big Daddy BBQ',
    ownerEmail: 'bigdaddy@example.com',
    description: 'Low-and-slow smoked brisket, pulled pork, ribs and all the classic Southern sides.',
    foodCategories: ['BBQ', 'Comfort Food'],
    phone: '(941) 555-0102',
    schedule: [
      { dayOfWeek: 'Monday', startTime: '11:00', endTime: '15:00', locationName: 'Walmart Parking Lot', address: '17000 Tamiami Trail, North Port, FL' },
      { dayOfWeek: 'Thursday', startTime: '16:00', endTime: '20:00', locationName: 'Cocoplum Village Shops' },
      { dayOfWeek: 'Saturday', startTime: '11:00', endTime: '16:00', locationName: 'Farmers Market' },
    ],
  },
  {
    name: 'Kona Ice',
    ownerEmail: 'kona@example.com',
    description: 'Tropical shaved ice and sweet treats — perfect for a hot Florida afternoon.',
    foodCategories: ['Dessert', 'Ice Cream'],
    phone: '(941) 555-0103',
    schedule: [
      { dayOfWeek: 'Monday', startTime: '15:00', endTime: '19:00', locationName: 'Community Park' },
      { dayOfWeek: 'Wednesday', startTime: '15:00', endTime: '19:00', locationName: 'North Port High School' },
      { dayOfWeek: 'Sunday', startTime: '12:00', endTime: '17:00', locationName: 'Butler Park' },
    ],
  },
  {
    name: 'Café on Wheels',
    ownerEmail: 'cafe@example.com',
    description: 'Specialty espresso, cold brew, pastries and breakfast sandwiches on the go.',
    foodCategories: ['Coffee', 'Breakfast'],
    phone: '(941) 555-0104',
    schedule: [
      { dayOfWeek: 'Monday', startTime: '08:00', endTime: '12:00', locationName: 'North Port Library' },
      { dayOfWeek: 'Tuesday', startTime: '07:00', endTime: '11:00', locationName: 'City Hall Parking Lot' },
      { dayOfWeek: 'Friday', startTime: '07:00', endTime: '11:00', locationName: 'Cocoplum Village Shops' },
    ],
  },
  {
    name: 'Taco Express',
    ownerEmail: 'tacoexpress@example.com',
    description: 'Fast, fresh Mexican favorites — tacos, nachos, and loaded burritos.',
    foodCategories: ['Mexican', 'Tacos'],
    phone: '(941) 555-0105',
    schedule: [
      { dayOfWeek: 'Tuesday', startTime: '11:00', endTime: '14:00', locationName: 'Sumter Crossing' },
      { dayOfWeek: 'Thursday', startTime: '17:00', endTime: '20:00', locationName: 'North Port Brewing Co.' },
    ],
  },
  {
    name: 'The Pizza Spot',
    ownerEmail: 'pizza@example.com',
    description: 'Wood-fired Neapolitan pizzas made to order from a converted vintage truck.',
    foodCategories: ['Pizza'],
    phone: '(941) 555-0106',
    schedule: [
      { dayOfWeek: 'Wednesday', startTime: '16:00', endTime: '21:00', locationName: 'Blue Ridge Park' },
      { dayOfWeek: 'Friday', startTime: '16:00', endTime: '21:00', locationName: 'Warm Mineral Springs' },
      { dayOfWeek: 'Saturday', startTime: '16:00', endTime: '21:00', locationName: 'Farmers Market' },
    ],
  },
];

/**
 * Idempotently seed an admin user + the demo trucks with schedules.
 * Works against any connected Mongo (real or in-memory).
 */
export async function seedDatabase(app: INestApplicationContext): Promise<void> {
  const config = app.get(ConfigService);
  const users = app.get(UsersService);
  const truckModel = app.get<Model<FoodTruckDocument>>(getModelToken(FoodTruck.name));
  const scheduleModel = app.get<Model<ScheduleEntryDocument>>(getModelToken(ScheduleEntry.name));

  const adminName = config.get<string>('ADMIN_SEED_NAME') ?? 'Admin';
  const adminEmail = config.get<string>('ADMIN_SEED_EMAIL') ?? 'admin@example.com';
  const adminPassword = config.get<string>('ADMIN_SEED_PASSWORD') ?? 'ChangeMe123!';
  if (await users.findByEmail(adminEmail)) {
    console.log(`• Admin already exists (${adminEmail})`);
  } else {
    await users.createAdmin(adminName, adminEmail, adminPassword);
    console.log(`✓ Created admin ${adminEmail} / ${adminPassword}`);
  }

  for (const t of DEMO_TRUCKS) {
    let owner = await users.findByEmail(t.ownerEmail);
    if (!owner) {
      owner = await users.create(t.name, t.ownerEmail, 'ChangeMe123!', 'truck_owner');
      console.log(`✓ Created owner ${t.ownerEmail} / ChangeMe123!`);
    } else {
      console.log(`• Owner exists ${t.ownerEmail}`);
    }

    const slug = slugify(t.name);
    let truck = await truckModel.findOne({ slug }).exec();
    const profile = {
      ownerUserId: owner._id,
      name: t.name,
      slug,
      description: t.description,
      foodCategories: t.foodCategories,
      phone: t.phone ?? '',
      email: t.ownerEmail,
      websiteUrl: t.websiteUrl ?? '',
      facebookUrl: t.facebookUrl ?? '',
      instagramUrl: t.instagramUrl ?? '',
      isActive: true,
      isFeatured: t.isFeatured ?? false,
      paymentStatus: 'paid' as const,
      plan: t.isFeatured ? 'featured' : 'weekly',
    };
    if (!truck) {
      truck = await truckModel.create(profile);
      console.log(`✓ Created truck ${t.name}`);
    } else {
      await truckModel.updateOne({ _id: truck._id }, profile).exec();
      console.log(`• Updated truck ${t.name}`);
    }

    await scheduleModel.deleteMany({ foodTruckId: truck._id }).exec();
    await scheduleModel.insertMany(
      t.schedule.map((s) => {
        const coords = LOCATION_COORDS[s.locationName];
        return {
          ...s,
          address: s.address ?? '',
          city: 'North Port',
          latitude: coords ? coords[0] : null,
          longitude: coords ? coords[1] : null,
          notes: s.notes ?? '',
          status: 'scheduled',
          date: null,
          foodTruckId: truck!._id,
        };
      }),
    );
    console.log(`  ↳ ${t.schedule.length} schedule stops`);
  }
}
