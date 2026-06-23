/* eslint-disable no-console */
import type { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from './users/users.service';
import { Publisher, PublisherDocument } from './publishers/publisher.schema';
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

interface ListingSeed {
  type: string;
  name: string;
  ownerEmail: string;
  description: string;
  category?: string;
  cuisineType?: string;
  phone?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  featured?: boolean;
  schedule?: StopSeed[];
}

interface PublisherSeed {
  name: string;
  subdomain: string;
  city: string;
  state: string;
  primaryColor: string;
  secondaryColor: string;
  ownerEmail: string;
  listings: ListingSeed[];
}

const PUBLISHERS: PublisherSeed[] = [
  {
    name: 'North Port Matters',
    subdomain: 'northport',
    city: 'North Port',
    state: 'FL',
    primaryColor: '#dc2626',
    secondaryColor: '#1f3559',
    ownerEmail: 'publisher@northportmatters.com',
    listings: [
      {
        type: 'food_truck',
        name: "Rosie's Red Truck",
        ownerEmail: 'rosie@example.com',
        description:
          "Rosie's Red Truck serves authentic Mexican street tacos, burritos, quesadillas and homemade salsa made fresh daily!",
        category: 'Mexican',
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
        type: 'food_truck',
        name: 'Big Daddy BBQ',
        ownerEmail: 'bigdaddy@example.com',
        description: 'Low-and-slow smoked brisket, pulled pork, ribs and classic Southern sides.',
        category: 'BBQ',
        cuisineType: 'BBQ',
        phone: '(941) 555-0102',
        schedule: [
          { dayOfWeek: 'Monday', startTime: '11:00', endTime: '15:00', locationName: 'Walmart Parking Lot', lat: 27.0461, lng: -82.1991 },
          { dayOfWeek: 'Saturday', startTime: '11:00', endTime: '16:00', locationName: 'Farmers Market', lat: 27.0625, lng: -82.201 },
        ],
      },
      {
        type: 'food_truck',
        name: 'Kona Ice',
        ownerEmail: 'kona@example.com',
        description: 'Tropical shaved ice and sweet treats — perfect for a hot Florida afternoon.',
        category: 'Dessert',
        cuisineType: 'Dessert',
        phone: '(941) 555-0103',
        schedule: [
          { dayOfWeek: 'Monday', startTime: '15:00', endTime: '19:00', locationName: 'Community Park', lat: 27.053, lng: -82.236 },
          { dayOfWeek: 'Sunday', startTime: '12:00', endTime: '17:00', locationName: 'Butler Park', lat: 27.047, lng: -82.232 },
        ],
      },
      {
        type: 'business',
        name: 'North Port Coffee Co.',
        ownerEmail: 'npcoffee@example.com',
        description: 'Locally roasted coffee, pastries, and a cozy spot to work or meet friends.',
        category: 'Restaurant',
        phone: '(941) 555-0110',
        featured: true,
      },
      {
        type: 'business',
        name: 'Gulfshore Hardware',
        ownerEmail: 'gulfshore@example.com',
        description: 'Family-owned hardware store serving North Port since 1998.',
        category: 'Home & Garden',
        phone: '(941) 555-0111',
      },
    ],
  },
  {
    name: 'West Valley Shoutouts',
    subdomain: 'westvalley',
    city: 'Buckeye',
    state: 'AZ',
    primaryColor: '#0d9488',
    secondaryColor: '#0f3d3a',
    ownerEmail: 'publisher@westvalley.com',
    listings: [
      {
        type: 'food_truck',
        name: 'Sonoran Dogs AZ',
        ownerEmail: 'sonoran@example.com',
        description: 'Bacon-wrapped Sonoran hot dogs, street corn, and aguas frescas.',
        category: 'Mexican',
        cuisineType: 'Mexican',
        phone: '(623) 555-0201',
        featured: true,
        schedule: [
          { dayOfWeek: 'Tuesday', startTime: '17:00', endTime: '21:00', locationName: 'Verrado Main Street', lat: 33.452, lng: -112.555 },
          { dayOfWeek: 'Friday', startTime: '17:00', endTime: '22:00', locationName: 'Sundance Plaza', lat: 33.434, lng: -112.583 },
        ],
      },
      {
        type: 'food_truck',
        name: 'Desert Smoke BBQ',
        ownerEmail: 'desertsmoke@example.com',
        description: 'Texas-style brisket and ribs smoked over mesquite.',
        category: 'BBQ',
        cuisineType: 'BBQ',
        phone: '(623) 555-0202',
        schedule: [
          { dayOfWeek: 'Saturday', startTime: '11:00', endTime: '16:00', locationName: 'Buckeye Farmers Market', lat: 33.37, lng: -112.583 },
        ],
      },
      {
        type: 'business',
        name: 'Cactus Bloom Boutique',
        ownerEmail: 'cactusbloom@example.com',
        description: 'Southwest-inspired clothing, gifts, and handmade jewelry.',
        category: 'Retail',
        phone: '(623) 555-0210',
        featured: true,
      },
    ],
  },
];

export async function seedDatabase(app: INestApplicationContext): Promise<void> {
  const config = app.get(ConfigService);
  const users = app.get(UsersService);
  const publisherModel = app.get<Model<PublisherDocument>>(getModelToken(Publisher.name));
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

  // 2. Publishers + their listings + schedules
  for (const p of PUBLISHERS) {
    let pubUser = await users.findByEmail(p.ownerEmail);
    if (!pubUser) {
      pubUser = await users.create(p.name, p.ownerEmail, 'ChangeMe123!', 'publisher');
      console.log(`✓ Created publisher user ${p.ownerEmail} / ChangeMe123!`);
    }

    let publisher = await publisherModel.findOne({ subdomain: p.subdomain }).exec();
    const pubProfile = {
      userId: pubUser._id,
      name: p.name,
      slug: p.subdomain,
      subdomain: p.subdomain,
      city: p.city,
      state: p.state,
      country: 'USA',
      primaryColor: p.primaryColor,
      secondaryColor: p.secondaryColor,
      contactEmail: p.ownerEmail,
      status: 'approved' as const,
    };
    if (!publisher) {
      publisher = await publisherModel.create(pubProfile);
      console.log(`✓ Created hub ${p.name} (${p.subdomain})`);
    } else {
      await publisherModel.updateOne({ _id: publisher._id }, pubProfile).exec();
      console.log(`• Updated hub ${p.name}`);
    }

    for (const l of p.listings) {
      let owner = await users.findByEmail(l.ownerEmail);
      if (!owner) {
        owner = await users.create(l.name, l.ownerEmail, 'ChangeMe123!', 'listing_owner');
        console.log(`  ✓ Owner ${l.ownerEmail} / ChangeMe123!`);
      }

      const slug = slugify(l.name);
      const listingProfile = {
        publisherId: publisher._id,
        ownerUserId: owner._id,
        type: l.type,
        name: l.name,
        slug,
        description: l.description,
        category: l.category ?? '',
        cuisineType: l.cuisineType ?? '',
        phone: l.phone ?? '',
        email: l.ownerEmail,
        websiteUrl: l.websiteUrl ?? '',
        facebookUrl: l.facebookUrl ?? '',
        instagramUrl: l.instagramUrl ?? '',
        status: 'approved' as const,
        featured: l.featured ?? false,
      };
      let listing = await listingModel
        .findOne({ publisherId: publisher._id, slug })
        .exec();
      if (!listing) {
        listing = await listingModel.create(listingProfile);
        console.log(`  ✓ Listing ${l.name} [${l.type}]`);
      } else {
        await listingModel.updateOne({ _id: listing._id }, listingProfile).exec();
      }

      // Reset + reseed schedule
      await scheduleModel.deleteMany({ listingId: listing._id }).exec();
      if (l.schedule?.length) {
        await scheduleModel.insertMany(
          l.schedule.map((s) => ({
            publisherId: publisher!._id as Types.ObjectId,
            listingId: listing!._id,
            title: '',
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            locationName: s.locationName,
            address: s.address ?? '',
            city: p.city,
            state: p.state,
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

  console.log('\nSeed summary:');
  console.log(`  ${PUBLISHERS.length} hubs, ${PUBLISHERS.reduce((n, p) => n + p.listings.length, 0)} listings`);
}
