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
  createForClaim(publisherId: string, ownerUserId: string, dto: CreateListingDto) {
    return this.create(publisherId, ownerUserId, dto, 'pending');
  }

  // ---- Publisher ----

  findByPublisher(publisherId: string) {
    return this.model
      .find({ publisherId: new Types.ObjectId(publisherId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  findPendingByPublisher(publisherId: string) {
    return this.model
      .find({ publisherId: new Types.ObjectId(publisherId), status: 'pending' })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getInPublisherOrThrow(publisherId: string, id: string) {
    const listing = await this.model.findById(id).exec();
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.publisherId.toString() !== publisherId) {
      throw new ForbiddenException('That listing belongs to another hub');
    }
    return listing;
  }

  /** Publisher creates a listing in their own hub (approved immediately). */
  publisherCreate(publisherId: string, ownerUserId: string, dto: CreateListingDto) {
    return this.create(publisherId, ownerUserId, dto, 'approved');
  }

  async publisherUpdate(publisherId: string, id: string, dto: ManageListingDto) {
    const listing = await this.getInPublisherOrThrow(publisherId, id);
    return this.applyUpdate(listing, dto);
  }

  async publisherRemove(publisherId: string, id: string) {
    await this.getInPublisherOrThrow(publisherId, id);
    await this.model.findByIdAndDelete(id).exec();
    return { deleted: true, id };
  }

  // ---- Master admin ----

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  // ---- Public (tenant-scoped) ----

  findPublicList(publisherId: string, filters: { type?: string; category?: string } = {}) {
    const query: Record<string, unknown> = {
      publisherId: new Types.ObjectId(publisherId),
      status: 'approved',
    };
    if (filters.type) query.type = filters.type;
    if (filters.category) query.category = filters.category;
    return this.model.find(query).sort({ featured: -1, name: 1 }).exec();
  }

  async findPublicBySlug(publisherId: string, slug: string) {
    const listing = await this.model
      .findOne({ publisherId: new Types.ObjectId(publisherId), slug, status: 'approved' })
      .exec();
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  // ---- Helpers ----

  private async create(
    publisherId: string,
    ownerUserId: string,
    dto: CreateListingDto,
    status: 'pending' | 'approved',
  ) {
    const slug = await this.uniqueSlug(publisherId, dto.slug || dto.name);
    return this.model.create({
      ...dto,
      slug,
      status,
      publisherId: new Types.ObjectId(publisherId),
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
        listing.publisherId.toString(),
        dto.slug || dto.name || '',
        listing._id.toString(),
      );
    }
    Object.assign(listing, update);
    await listing.save();
    return listing;
  }

  private async uniqueSlug(publisherId: string, source: string, excludeId?: string) {
    const base = slugify(source);
    if (!base) throw new BadRequestException('A listing name is required');
    let slug = base;
    let n = 2;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.model
        .findOne({ publisherId: new Types.ObjectId(publisherId), slug })
        .exec();
      if (!existing || existing._id.toString() === excludeId) return slug;
      slug = `${base}-${n++}`;
    }
  }
}
