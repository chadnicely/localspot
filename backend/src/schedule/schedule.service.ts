import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ScheduleEntry, ScheduleEntryDocument } from './schedule-entry.schema';
import { FoodTruck, FoodTruckDocument } from '../trucks/food-truck.schema';
import { TrucksService } from '../trucks/trucks.service';
import { CreateScheduleEntryDto, UpdateScheduleEntryDto } from './dto/schedule.dto';
import { DAYS_OF_WEEK, dayNameFromDate } from '../common/food-categories';

const DAY_INDEX: Record<string, number> = DAYS_OF_WEEK.reduce(
  (acc, day, i) => ({ ...acc, [day]: i }),
  {},
);

function truckSummary(t: FoodTruckDocument) {
  return {
    id: t._id.toString(),
    name: t.name,
    slug: t.slug,
    logoUrl: t.logoUrl,
    foodCategories: t.foodCategories,
    isFeatured: t.isFeatured,
  };
}

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(ScheduleEntry.name)
    private readonly model: Model<ScheduleEntryDocument>,
    @InjectModel(FoodTruck.name)
    private readonly truckModel: Model<FoodTruckDocument>,
    private readonly trucks: TrucksService,
  ) {}

  // ---- Owner CRUD (scoped to the owner's truck) ----

  async listForOwner(ownerUserId: string) {
    const truck = await this.trucks.getOwnerTruckOrThrow(ownerUserId);
    return this.sortEntries(await this.model.find({ foodTruckId: truck._id }).exec());
  }

  async createForOwner(ownerUserId: string, dto: CreateScheduleEntryDto) {
    const truck = await this.trucks.getOwnerTruckOrThrow(ownerUserId);
    return this.model.create({
      ...dto,
      date: dto.date ? new Date(dto.date) : null,
      foodTruckId: truck._id,
    });
  }

  async updateForOwner(ownerUserId: string, entryId: string, dto: UpdateScheduleEntryDto) {
    const truck = await this.trucks.getOwnerTruckOrThrow(ownerUserId);
    await this.assertOwnsEntry(truck._id, entryId);
    const update: Record<string, unknown> = { ...dto };
    if (dto.date !== undefined) update.date = dto.date ? new Date(dto.date) : null;
    return this.model.findByIdAndUpdate(entryId, update, { new: true }).exec();
  }

  async removeForOwner(ownerUserId: string, entryId: string) {
    const truck = await this.trucks.getOwnerTruckOrThrow(ownerUserId);
    await this.assertOwnsEntry(truck._id, entryId);
    await this.model.findByIdAndDelete(entryId).exec();
    return { deleted: true, id: entryId };
  }

  // ---- Public calendar ----

  async calendarByDay(day: string) {
    const trucks = await this.activeTruckMap();
    const entries = await this.model
      .find({
        dayOfWeek: day,
        status: { $ne: 'canceled' },
        foodTruckId: { $in: [...trucks.keys()].map((id) => new Types.ObjectId(id)) },
      })
      .exec();
    return entries
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map((e) => ({
        ...this.entryJson(e),
        truck: trucks.get(e.foodTruckId.toString()),
      }))
      .filter((e) => e.truck);
  }

  calendarToday() {
    return this.calendarByDay(dayNameFromDate(new Date()));
  }

  /** Every active stop for the whole week, joined with truck summaries. */
  async calendarWeek() {
    const trucks = await this.activeTruckMap();
    const entries = await this.model
      .find({
        status: { $ne: 'canceled' },
        foodTruckId: { $in: [...trucks.keys()].map((id) => new Types.ObjectId(id)) },
      })
      .exec();
    return this.sortEntries(entries)
      .map((e) => ({ ...this.entryJson(e), truck: trucks.get(e.foodTruckId.toString()) }))
      .filter((e) => e.truck);
  }

  /** Public truck profile: the active truck plus its week schedule. */
  async publicProfile(slug: string) {
    const truck = await this.trucks.findPublicBySlug(slug);
    const entries = await this.model
      .find({ foodTruckId: truck._id, status: { $ne: 'canceled' } })
      .exec();
    return { truck, schedule: this.sortEntries(entries) };
  }

  // ---- Admin ----

  async findAllWithTrucks(day?: string) {
    const trucks = await this.allTruckMap();
    const filter = day ? { dayOfWeek: day } : {};
    const entries = await this.model.find(filter).exec();
    return this.sortEntries(entries).map((e) => ({
      ...this.entryJson(e),
      truck: trucks.get(e.foodTruckId.toString()),
    }));
  }

  // ---- Helpers ----

  private entryJson(e: ScheduleEntryDocument) {
    return {
      id: e._id.toString(),
      foodTruckId: e.foodTruckId.toString(),
      date: e.date,
      dayOfWeek: e.dayOfWeek,
      startTime: e.startTime,
      endTime: e.endTime,
      locationName: e.locationName,
      address: e.address,
      city: e.city,
      latitude: e.latitude,
      longitude: e.longitude,
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

  private async assertOwnsEntry(truckId: Types.ObjectId, entryId: string) {
    const entry = await this.model.findById(entryId).exec();
    if (!entry) throw new NotFoundException('Schedule entry not found');
    if (entry.foodTruckId.toString() !== truckId.toString()) {
      throw new ForbiddenException('That schedule entry belongs to another truck');
    }
    return entry;
  }

  private async activeTruckMap() {
    const trucks = await this.truckModel
      .find({ isActive: true, paymentStatus: { $in: ['paid', 'comped', 'trial'] } })
      .exec();
    return new Map(trucks.map((t) => [t._id.toString(), truckSummary(t)]));
  }

  private async allTruckMap() {
    const trucks = await this.truckModel.find().exec();
    return new Map(trucks.map((t) => [t._id.toString(), truckSummary(t)]));
  }
}
