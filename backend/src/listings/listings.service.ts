import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Listing, ListingDocument } from './listing.schema';
import { CreateListingDto, ManageListingDto, UpdateListingDto } from './dto/listing.dto';
import { slugify } from '../common/slug.util';

@Injectable()
export class ListingsService {
  constructor(
    @InjectModel(Listing.name) private readonly model: Model<ListingDocument>,
  ) {}

  // ---- Owner (listing_owner) ----

  findByOwner(ownerUserId: string) {
    return this.model
      .find({ ownerUserId: new Types.ObjectId(ownerUserId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getOwnedOrThrow(ownerUserId: string, id: string) {
    const listing = await this.model.findById(id).exec();
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.ownerUserId.toString() !== ownerUserId) {
      throw new ForbiddenException('That listing belongs to another account');
    }
    return listing;
  }

  async updateOwn(ownerUserId: string, id: string, dto: UpdateListingDto) {
    const listing = await this.getOwnedOrThrow(ownerUserId, id);
    return this.applyUpdate(listing, dto);
  }

  async setOwnerImage(
    ownerUserId: string,
    id: string,
    field: 'logoUrl' | 'coverImageUrl',
    url: string,
  ) {
    const listing = await this.getOwnedOrThrow(ownerUserId, id);
    listing.set(field, url);
    await listing.save();
    return listing;
  }

  /** Created via the public claim flow — always pending. */
  createForClaim(
    publisherId: string,
    calendarId: string,
    ownerUserId: string,
    type: string,
    dto: CreateListingDto,
  ) {
    return this.create(publisherId, calendarId, ownerUserId, type, dto, 'pending');
  }

  // ---- Account (publisher), scoped to a calendar ----

  findByCalendar(calendarId: string) {
    return this.model
      .find({ calendarId: new Types.ObjectId(calendarId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  findPendingByCalendar(calendarId: string) {
    return this.model
      .find({ calendarId: new Types.ObjectId(calendarId), status: 'pending' })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getInAccountOrThrow(publisherId: string, id: string) {
    const listing = await this.model.findById(id).exec();
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.publisherId.toString() !== publisherId) {
      throw new ForbiddenException('That listing belongs to another account');
    }
    return listing;
  }

  /** Account creates a listing in one of their calendars (approved immediately). */
  accountCreate(
    publisherId: string,
    calendarId: string,
    ownerUserId: string,
    type: string,
    dto: CreateListingDto,
  ) {
    return this.create(publisherId, calendarId, ownerUserId, type, dto, 'approved');
  }

  async accountUpdate(publisherId: string, id: string, dto: ManageListingDto) {
    const listing = await this.getInAccountOrThrow(publisherId, id);
    return this.applyUpdate(listing, dto);
  }

  async accountRemove(publisherId: string, id: string) {
    await this.getInAccountOrThrow(publisherId, id);
    await this.model.findByIdAndDelete(id).exec();
    return { deleted: true, id };
  }

  // ---- Master admin ----

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  // ---- Public (calendar-scoped) ----

  findPublicByCalendar(calendarId: string, filters: { category?: string } = {}) {
    const query: Record<string, unknown> = {
      calendarId: new Types.ObjectId(calendarId),
      status: 'approved',
    };
    if (filters.category) query.category = filters.category;
    return this.model.find(query).sort({ featured: -1, name: 1 }).exec();
  }

  async findPublicBySlug(calendarId: string, slug: string) {
    const listing = await this.model
      .findOne({ calendarId: new Types.ObjectId(calendarId), slug, status: 'approved' })
      .exec();
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  // ---- Helpers ----

  private async create(
    publisherId: string,
    calendarId: string,
    ownerUserId: string,
    type: string,
    dto: CreateListingDto,
    status: 'pending' | 'approved',
  ) {
    const slug = await this.uniqueSlug(calendarId, dto.slug || dto.name);
    return this.model.create({
      ...dto,
      type,
      slug,
      status,
      publisherId: new Types.ObjectId(publisherId),
      calendarId: new Types.ObjectId(calendarId),
      ownerUserId: new Types.ObjectId(ownerUserId),
    });
  }

  private async applyUpdate(
    listing: ListingDocument,
    dto: UpdateListingDto | ManageListingDto,
  ) {
    const update: Record<string, unknown> = { ...dto };
    if (dto.slug || dto.name) {
      update.slug = await this.uniqueSlug(
        listing.calendarId.toString(),
        dto.slug || dto.name || '',
        listing._id.toString(),
      );
    }
    Object.assign(listing, update);
    await listing.save();
    return listing;
  }

  private async uniqueSlug(calendarId: string, source: string, excludeId?: string) {
    const base = slugify(source);
    if (!base) throw new BadRequestException('A listing name is required');
    let slug = base;
    let n = 2;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.model
        .findOne({ calendarId: new Types.ObjectId(calendarId), slug })
        .exec();
      if (!existing || existing._id.toString() === excludeId) return slug;
      slug = `${base}-${n++}`;
    }
  }
}
