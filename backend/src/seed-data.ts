/* eslint-disable no-console */
import type { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from './users/users.service';
import { Publisher, PublisherDocument } from './publishers/publisher.schema';
import { Calendar, CalendarDocument } from './calendars/calendar.schema';
import { Listing, ListingDocument } from './listings/listing.schema';
import { ScheduleEntry, ScheduleEntryDocument } from './schedule/schedule-entry.schema';
import { slugify } from './common/slug.util';

interface StopSeed {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  locationName: string;
  address?: string;
  notes?: string;
  lat?: number;
  lng?: number;
}
interface TruckSeed {
  name: string;
  ownerEmail: string;
  description: string;
  cuisineType: string;
  phone?: string;
  featured?: boolean;
  schedule?: StopSeed[];
}
interface AccountSeed {
  name: string;
  ownerEmail: string;
  city: string;
  state: string;
  primaryColor: string;
  secondaryColor: string;
  calendarName: string;
  calendarSubdomain: string;
  trucks: TruckSeed[];
}

const ACCOUNTS: AccountSeed[] = [
  {
    name: 'North Port Matters',
    ownerEmail: 'publisher@northportmatters.com',
    city: 'North Port',
    state: 'FL',
    primaryColor: '#dc2626',
    secondaryColor: '#1f3559',
    calendarName: 'North Port Food Trucks',
    calendarSubdomain: 'northportfoodtrucks',
    trucks: [
      {
        name: "Rosie's Red Truck",
        ownerEmail: 'rosie@example.com',
        description:
          "Authentic Mexican street tacos, burritos, quesadillas and homemade salsa made fresh daily!",
        cuisineType: 'Mexican',
        phone: '(941) 555-0101',
        featured: true,
        schedule: [
          { dayOfWeek: 'Monday', startTime: '11:00', endTime: '14:00', locationName: 'City Hall Parking Lot', address: '4970 City Hall Blvd, North Port, FL', notes: 'Lunch only', lat: 27.0809, lng: -82.236 },
          { dayOfWeek: 'Wednesday', startTime: '17:00', endTime: '20:00', locationName: 'Home Depot', lat: 27.0456, lng: -82.1995 },
          { dayOfWeek: 'Friday', startTime: '17:00', endTime: '21:00', locationName: 'North Port Brewing Co.', notes: 'Outdoor seating!', lat: 27.044, lng: -82.236 },
        ],
      },
      {
        name: 'Big Daddy BBQ',
        ownerEmail: 'bigdaddy@example.com',
        description: 'Low-and-slow smoked brisket, pulled pork, ribs and classic Southern sides.',
        cuisineType: 'BBQ',
        phone: '(941) 555-0102',
        schedule: [
          { dayOfWeek: 'Monday', startTime: '11:00', endTime: '15:00', locationName: 'Walmart Parking Lot', lat: 27.0461, lng: -82.1991 },
          { dayOfWeek: 'Saturday', startTime: '11:00', endTime: '16:00', locationName: 'Farmers Market', lat: 27.0625, lng: -82.201 },
        ],
      },
      {
        name: 'Kona Ice',
        ownerEmail: 'kona@example.com',
        description: 'Tropical shaved ice and sweet treats — perfect for a hot Florida afternoon.',
        cuisineType: 'Dessert',
        phone: '(941) 555-0103',
        schedule: [
          { dayOfWeek: 'Monday', startTime: '15:00', endTime: '19:00', locationName: 'Community Park', lat: 27.053, lng: -82.236 },
          { dayOfWeek: 'Sunday', startTime: '12:00', endTime: '17:00', locationName: 'Butler Park', lat: 27.047, lng: -82.232 },
        ],
      },
    ],
  },
  {
    name: 'West Valley Shoutouts',
    ownerEmail: 'publisher@westvalley.com',
    city: 'Buckeye',
    state: 'AZ',
    primaryColor: '#0d9488',
    secondaryColor: '#0f3d3a',
    calendarName: 'West Valley Food Trucks',
    calendarSubdomain: 'westvalleyfoodtrucks',
    trucks: [
      {
        name: 'Sonoran Dogs AZ',
        ownerEmail: 'sonoran@example.com',
        description: 'Bacon-wrapped Sonoran hot dogs, street corn, and aguas frescas.',
        cuisineType: 'Mexican',
        phone: '(623) 555-0201',
        featured: true,
        schedule: [
          { dayOfWeek: 'Tuesday', startTime: '17:00', endTime: '21:00', locationName: 'Verrado Main Street', lat: 33.452, lng: -112.555 },
          { dayOfWeek: 'Friday', startTime: '17:00', endTime: '22:00', locationName: 'Sundance Plaza', lat: 33.434, lng: -112.583 },
        ],
      },
      {
        name: 'Desert Smoke BBQ',
        ownerEmail: 'desertsmoke@example.com',
        description: 'Texas-style brisket and ribs smoked over mesquite.',
        cuisineType: 'BBQ',
        phone: '(623) 555-0202',
        schedule: [
          { dayOfWeek: 'Saturday', startTime: '11:00', endTime: '16:00', locationName: 'Buckeye Farmers Market', lat: 33.37, lng: -112.583 },
        ],
      },
    ],
  },
];

export async function seedDatabase(app: INestApplicationContext): Promise<void> {
  const config = app.get(ConfigService);
  const users = app.get(UsersService);
  const publisherModel = app.get<Model<PublisherDocument>>(getModelToken(Publisher.name));
  const calendarModel = app.get<Model<CalendarDocument>>(getModelToken(Calendar.name));
  const listingModel = app.get<Model<ListingDocument>>(getModelToken(Listing.name));
  const scheduleModel = app.get<Model<ScheduleEntryDocument>>(getModelToken(ScheduleEntry.name));

  // 1. Master admin
  const adminName = config.get<string>('ADMIN_SEED_NAME') ?? 'Master Admin';
  const adminEmail = config.get<string>('ADMIN_SEED_EMAIL') ?? 'admin@onthespot.com';
  const adminPassword = config.get<string>('ADMIN_SEED_PASSWORD') ?? 'ChangeMe123!';
  if (await users.findByEmail(adminEmail)) {
    console.log(`• Master admin exists (${adminEmail})`);
  } else {
    await users.createMasterAdmin(adminName, adminEmail, adminPassword);
    console.log(`✓ Created master admin ${adminEmail} / ${adminPassword}`);
  }

  // 2. Accounts -> Calendar -> Listings -> Schedules
  for (const a of ACCOUNTS) {
    let owner = await users.findByEmail(a.ownerEmail);
    if (!owner) {
      owner = await users.create(a.name, a.ownerEmail, 'ChangeMe123!', 'publisher');
      console.log(`✓ Account owner ${a.ownerEmail} / ChangeMe123!`);
    }

    let account = await publisherModel.findOne({ userId: owner._id }).exec();
    const accProfile = {
      userId: owner._id,
      name: a.name,
      city: a.city,
      state: a.state,
      country: 'USA',
      primaryColor: a.primaryColor,
      secondaryColor: a.secondaryColor,
      contactEmail: a.ownerEmail,
      status: 'approved' as const,
    };
    if (!account) {
      account = await publisherModel.create(accProfile);
      console.log(`✓ Account ${a.name}`);
    } else {
      await publisherModel.updateOne({ _id: account._id }, accProfile).exec();
    }

    let calendar = await calendarModel.findOne({ subdomain: a.calendarSubdomain }).exec();
    const calProfile = {
      publisherId: account._id,
      type: 'food_truck',
      name: a.calendarName,
      subdomain: a.calendarSubdomain,
      tagline: `Find local food trucks in ${a.city} this week`,
      primaryColor: a.primaryColor,
      secondaryColor: a.secondaryColor,
      accentColor: '#f59e0b',
      active: true,
    };
    if (!calendar) {
      calendar = await calendarModel.create(calProfile);
      console.log(`  ✓ Calendar /${a.calendarSubdomain}`);
    } else {
      await calendarModel.updateOne({ _id: calendar._id }, calProfile).exec();
    }

    for (const t of a.trucks) {
      let truckOwner = await users.findByEmail(t.ownerEmail);
      if (!truckOwner) {
        truckOwner = await users.create(t.name, t.ownerEmail, 'ChangeMe123!', 'listing_owner');
      }
      const slug = slugify(t.name);
      const listingProfile = {
        publisherId: account._id,
        calendarId: calendar._id,
        ownerUserId: truckOwner._id,
        type: 'food_truck',
        name: t.name,
        slug,
        description: t.description,
        category: t.cuisineType,
        cuisineType: t.cuisineType,
        phone: t.phone ?? '',
        email: t.ownerEmail,
        status: 'approved' as const,
        featured: t.featured ?? false,
      };
      let listing = await listingModel
        .findOne({ calendarId: calendar._id, slug })
        .exec();
      if (!listing) {
        listing = await listingModel.create(listingProfile);
        console.log(`    ✓ ${t.name}`);
      } else {
        await listingModel.updateOne({ _id: listing._id }, listingProfile).exec();
      }

      await scheduleModel.deleteMany({ listingId: listing._id }).exec();
      if (t.schedule?.length) {
        await scheduleModel.insertMany(
          t.schedule.map((s) => ({
            publisherId: account!._id as Types.ObjectId,
            calendarId: calendar!._id as Types.ObjectId,
            listingId: listing!._id,
            title: '',
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            locationName: s.locationName,
            address: s.address ?? '',
            city: a.city,
            state: a.state,
            latitude: s.lat ?? null,
            longitude: s.lng ?? null,
            externalLink: '',
            notes: s.notes ?? '',
            status: 'active',
            date: null,
          })),
        );
      }
    }
  }

  console.log('\nSeed complete:');
  console.log(`  ${ACCOUNTS.length} accounts, each with a Food Truck calendar`);
  console.log('  Public sites: /northportfoodtrucks  /westvalleyfoodtrucks');
}
