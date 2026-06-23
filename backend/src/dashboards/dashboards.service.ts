import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publisher, PublisherDocument } from '../publishers/publisher.schema';
import { Calendar, CalendarDocument } from '../calendars/calendar.schema';
import { Listing, ListingDocument } from '../listings/listing.schema';
import { ListingsService } from '../listings/listings.service';
import { ScheduleService } from '../schedule/schedule.service';

@Injectable()
export class DashboardsService {
  constructor(
    @InjectModel(Publisher.name) private readonly publisherModel: Model<PublisherDocument>,
    @InjectModel(Calendar.name) private readonly calendarModel: Model<CalendarDocument>,
    @InjectModel(Listing.name) private readonly listingModel: Model<ListingDocument>,
    private readonly listings: ListingsService,
    private readonly schedule: ScheduleService,
  ) {}

  // ---- Master admin ----

  async master() {
    const [accounts, calendars, listings] = await Promise.all([
      this.publisherModel.find().sort({ createdAt: -1 }).exec(),
      this.calendarModel.find().sort({ createdAt: -1 }).exec(),
      this.listingModel.find().exec(),
    ]);

    const calendarsByType: Record<string, number> = {};
    for (const c of calendars) calendarsByType[c.type] = (calendarsByType[c.type] ?? 0) + 1;

    return {
      totalAccounts: accounts.length,
      totalCalendars: calendars.length,
      activeCalendars: calendars.filter((c) => c.active).length,
      totalListings: listings.length,
      pendingListings: listings.filter((l) => l.status === 'pending').length,
      calendarsByType,
      recentAccounts: accounts.slice(0, 6).map((a) => ({
        id: a._id.toString(),
        name: a.name,
        status: a.status,
      })),
      recentCalendars: calendars.slice(0, 6).map((c) => ({
        id: c._id.toString(),
        name: c.name,
        type: c.type,
        subdomain: c.subdomain,
        active: c.active,
      })),
    };
  }

  // ---- Account (per selected calendar) ----

  async calendar(calendarId: string) {
    const listings = await this.listings.findByCalendar(calendarId);
    const stops = await this.schedule.allForCalendar(calendarId);
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
