import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ScheduleEntry, ScheduleEntryDocument } from './schedule-entry.schema';
import { Listing, ListingDocument } from '../listings/listing.schema';
import { ListingsService } from '../listings/listings.service';
import { CreateScheduleEntryDto, UpdateScheduleEntryDto } from './dto/schedule.dto';
import { DAYS_OF_WEEK, dayNameFromDate } from '../common/food-categories';

const DAY_INDEX: Record<string, number> = DAYS_OF_WEEK.reduce(
  (acc, day, i) => ({ ...acc, [day]: i }),
  {},
);

function listingSummary(l: ListingDocument) {
  return {
    id: l._id.toString(),
    name: l.name,
    slug: l.slug,
    logoUrl: l.logoUrl,
    type: l.type,
    category: l.category,
    cuisineType: l.cuisineType,
    featured: l.featured,
  };
}

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(ScheduleEntry.name)
    private readonly model: Model<ScheduleEntryDocument>,
    @InjectModel(Listing.name)
    private readonly listingModel: Model<ListingDocument>,
    private readonly listings: ListingsService,
  ) {}

  // ---- Owner CRUD (scoped to an owned listing) ----

  async listForOwnerListing(ownerUserId: string, listingId: string) {
    await this.listings.getOwnedOrThrow(ownerUserId, listingId);
    return this.sortEntries(
      await this.model.find({ listingId: new Types.ObjectId(listingId) }).exec(),
    );
  }

  async createForOwnerListing(
    ownerUserId: string,
    listingId: string,
    dto: CreateScheduleEntryDto,
  ) {
    const listing = await this.listings.getOwnedOrThrow(ownerUserId, listingId);
    return this.model.create({
      ...dto,
      date: dto.date ? new Date(dto.date) : null,
      listingId: listing._id,
      publisherId: listing.publisherId,
    });
  }

  async updateForOwnerListing(
    ownerUserId: string,
    listingId: string,
    entryId: string,
    dto: UpdateScheduleEntryDto,
  ) {
    await this.listings.getOwnedOrThrow(ownerUserId, listingId);
    const entry = await this.model.findById(entryId).exec();
    if (!entry || entry.listingId.toString() !== listingId) {
      throw new NotFoundException('Schedule entry not found');
    }
    const update: Record<string, unknown> = { ...dto };
    if (dto.date !== undefined) update.date = dto.date ? new Date(dto.date) : null;
    return this.model.findByIdAndUpdate(entryId, update, { new: true }).exec();
  }

  async removeForOwnerListing(ownerUserId: string, listingId: string, entryId: string) {
    await this.listings.getOwnedOrThrow(ownerUserId, listingId);
    await this.model
      .deleteOne({ _id: new Types.ObjectId(entryId), listingId: new Types.ObjectId(listingId) })
      .exec();
    return { deleted: true, id: entryId };
  }

  // ---- Public calendar (tenant-scoped) ----

  async calendarByDay(publisherId: string, day: string) {
    const listings = await this.approvedListingMap(publisherId);
    const entries = await this.model
      .find({
        dayOfWeek: day,
        status: { $ne: 'cancelled' },
        listingId: { $in: [...listings.keys()].map((id) => new Types.ObjectId(id)) },
      })
      .exec();
    return entries
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map((e) => ({ ...this.entryJson(e), listing: listings.get(e.listingId.toString()) }))
      .filter((e) => e.listing);
  }

  calendarToday(publisherId: string) {
    return this.calendarByDay(publisherId, dayNameFromDate(new Date()));
  }

  async calendarWeek(publisherId: string) {
    const listings = await this.approvedListingMap(publisherId);
    const entries = await this.model
      .find({
        status: { $ne: 'cancelled' },
        listingId: { $in: [...listings.keys()].map((id) => new Types.ObjectId(id)) },
      })
      .exec();
    return this.sortEntries(entries)
      .map((e) => ({ ...this.entryJson(e), listing: listings.get(e.listingId.toString()) }))
      .filter((e) => e.listing);
  }

  /** Public listing profile: the approved listing plus its schedule. */
  async publicProfile(publisherId: string, slug: string) {
    const listing = await this.listings.findPublicBySlug(publisherId, slug);
    const entries = await this.model
      .find({ listingId: listing._id, status: { $ne: 'cancelled' } })
      .exec();
    return { listing, schedule: this.sortEntries(entries) };
  }

  // ---- Publisher view ----

  async allForPublisher(publisherId: string, day?: string) {
    const listings = await this.allListingMap(publisherId);
    const filter: Record<string, unknown> = {
      publisherId: new Types.ObjectId(publisherId),
    };
    if (day) filter.dayOfWeek = day;
    const entries = await this.model.find(filter).exec();
    return this.sortEntries(entries).map((e) => ({
      ...this.entryJson(e),
      listing: listings.get(e.listingId.toString()),
    }));
  }

  // ---- Helpers ----

  private entryJson(e: ScheduleEntryDocument) {
    return {
      id: e._id.toString(),
      listingId: e.listingId.toString(),
      publisherId: e.publisherId.toString(),
      title: e.title,
      date: e.date,
      dayOfWeek: e.dayOfWeek,
      startTime: e.startTime,
      endTime: e.endTime,
      locationName: e.locationName,
      address: e.address,
      city: e.city,
      state: e.state,
      latitude: e.latitude,
      longitude: e.longitude,
      externalLink: e.externalLink,
      notes: e.notes,
      status: e.status,
    };
  }

  private sortEntries(entries: ScheduleEntryDocument[]) {
    return [...entries].sort((a, b) => {
      const d = (DAY_INDEX[a.dayOfWeek] ?? 99) - (DAY_INDEX[b.dayOfWeek] ?? 99);
      return d !== 0 ? d : a.startTime.localeCompare(b.startTime);
    });
  }

  private async approvedListingMap(publisherId: string) {
    const listings = await this.listingModel
      .find({ publisherId: new Types.ObjectId(publisherId), status: 'approved' })
      .exec();
    return new Map(listings.map((l) => [l._id.toString(), listingSummary(l)]));
  }

  private async allListingMap(publisherId: string) {
    const listings = await this.listingModel
      .find({ publisherId: new Types.ObjectId(publisherId) })
      .exec();
    return new Map(listings.map((l) => [l._id.toString(), listingSummary(l)]));
  }
}
