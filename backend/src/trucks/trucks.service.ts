import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FoodTruck, FoodTruckDocument } from './food-truck.schema';
import { AdminUpdateTruckDto, CreateTruckDto, UpdateTruckProfileDto } from './dto/truck.dto';
import { slugify } from '../common/slug.util';

@Injectable()
export class TrucksService {
  constructor(
    @InjectModel(FoodTruck.name) private readonly model: Model<FoodTruckDocument>,
  ) {}

  // ---- Owner ----

  findByOwner(ownerUserId: string) {
    return this.model.findOne({ ownerUserId: new Types.ObjectId(ownerUserId) }).exec();
  }

  async getOwnerTruckOrThrow(ownerUserId: string) {
    const truck = await this.findByOwner(ownerUserId);
    if (!truck) throw new NotFoundException('No food truck is linked to this account');
    return truck;
  }

  async createForOwner(
    ownerUserId: string,
    data: { name: string; email?: string; plan?: string },
  ) {
    const slug = await this.uniqueSlug(data.name);
    return this.model.create({
      ownerUserId: new Types.ObjectId(ownerUserId),
      name: data.name,
      slug,
      email: data.email ?? '',
      plan: data.plan ?? 'weekly',
      paymentStatus: 'unpaid',
      isActive: false,
    });
  }

  async updateOwnProfile(ownerUserId: string, dto: UpdateTruckProfileDto) {
    const truck = await this.getOwnerTruckOrThrow(ownerUserId);
    return this.applyProfileUpdate(truck._id.toString(), dto);
  }

  async setOwnerImage(ownerUserId: string, field: 'logoUrl' | 'mainImageUrl', url: string) {
    const truck = await this.getOwnerTruckOrThrow(ownerUserId);
    truck.set(field, url);
    await truck.save();
    return truck;
  }

  // ---- Admin ----

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const truck = await this.model.findById(id).exec();
    if (!truck) throw new NotFoundException('Food truck not found');
    return truck;
  }

  async adminCreate(dto: CreateTruckDto) {
    const slug = dto.slug ? await this.uniqueSlug(dto.slug) : await this.uniqueSlug(dto.name);
    return this.model.create({ ...dto, slug });
  }

  async adminUpdate(id: string, dto: AdminUpdateTruckDto) {
    return this.applyProfileUpdate(id, dto);
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Food truck not found');
    return { deleted: true, id };
  }

  // ---- Public ----

  /** Active + paid/comped/trial trucks for the public directory. */
  findPublicList() {
    return this.model
      .find({ isActive: true, paymentStatus: { $in: ['paid', 'comped', 'trial'] } })
      .sort({ isFeatured: -1, name: 1 })
      .exec();
  }

  async findPublicBySlug(slug: string) {
    const truck = await this.model
      .findOne({ slug, isActive: true, paymentStatus: { $in: ['paid', 'comped', 'trial'] } })
      .exec();
    if (!truck) throw new NotFoundException('Food truck not found');
    return truck;
  }

  // ---- Helpers ----

  private async applyProfileUpdate(
    id: string,
    dto: UpdateTruckProfileDto | AdminUpdateTruckDto,
  ) {
    const update: Record<string, unknown> = { ...dto };
    if (dto.slug || dto.name) {
      update.slug = await this.uniqueSlug(dto.slug || dto.name || '', id);
    }
    const truck = await this.model.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!truck) throw new NotFoundException('Food truck not found');
    return truck;
  }

  private async uniqueSlug(source: string, excludeId?: string) {
    const base = slugify(source);
    if (!base) throw new BadRequestException('A truck name is required');
    let slug = base;
    let n = 2;
    // Append -2, -3, ... until unique.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.model.findOne({ slug }).exec();
      if (!existing || existing._id.toString() === excludeId) return slug;
      slug = `${base}-${n++}`;
    }
  }
}
