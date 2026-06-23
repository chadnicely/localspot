import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publisher, PublisherDocument } from '../publishers/publisher.schema';
import { Listing, ListingDocument } from '../listings/listing.schema';
import { ListingsService } from '../listings/listings.service';
import { ScheduleService } from '../schedule/schedule.service';
import { LISTING_TYPES } from '../common/food-categories';

@Injectable()
export class DashboardsService {
  constructor(
    @InjectModel(Publisher.name) private readonly publisherModel: Model<PublisherDocument>,
    @InjectModel(Listing.name) private readonly listingModel: Model<ListingDocument>,
    private readonly listings: ListingsService,
    private readonly schedule: ScheduleService,
  ) {}

  // ---- Master admin ----

  async master() {
    const [publishers, listings] = await Promise.all([
      this.publisherModel.find().sort({ createdAt: -1 }).exec(),
      this.listingModel.find().sort({ createdAt: -1 }).exec(),
    ]);

    const byType: Record<string, number> = {};
    for (const t of LISTING_TYPES) byType[t] = 0;
    for (const l of listings) byType[l.type] = (byType[l.type] ?? 0) + 1;

    return {
      totalPublishers: publishers.length,
      pendingPublishers: publishers.filter((p) => p.status === 'pending').length,
      approvedPublishers: publishers.filter((p) => p.status === 'approved').length,
      totalListings: listings.length,
      pendingListings: listings.filter((l) => l.status === 'pending').length,
      approvedListings: listings.filter((l) => l.status === 'approved').length,
      listingsByType: byType,
      recentPublishers: publishers.slice(0, 6).map((p) => ({
        id: p._id.toString(),
        name: p.name,
        subdomain: p.subdomain,
        status: p.status,
      })),
      recentListings: listings.slice(0, 6).map((l) => ({
        id: l._id.toString(),
        name: l.name,
        type: l.type,
        status: l.status,
      })),
    };
  }

  // ---- Publisher (within tenant) ----

  async publisher(publisherId: string) {
    const listings = await this.listings.findByPublisher(publisherId);
    const stops = await this.schedule.allForPublisher(publisherId);
    return {
      totalListings: listings.length,
      pendingListings: listings.filter((l) => l.status === 'pending').length,
      approvedListings: listings.filter((l) => l.status === 'approved').length,
      featuredListings: listings.filter((l) => l.featured).length,
      scheduleStops: stops.filter((s) => s.status !== 'cancelled').length,
      recentListings: listings.slice(0, 6).map((l) => ({
        id: l._id.toString(),
        name: l.name,
        type: l.type,
        status: l.status,
        slug: l.slug,
      })),
    };
  }
}
