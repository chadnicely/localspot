import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Calendar, CalendarDocument } from './calendar.schema';
import { Publisher, PublisherDocument } from '../publishers/publisher.schema';
import { CreateCalendarDto, UpdateCalendarDto } from './dto/calendar.dto';
import { slugify } from '../common/slug.util';
import { isReservedSlug } from '../common/reserved-slugs';

@Injectable()
export class CalendarsService {
  constructor(
    @InjectModel(Calendar.name) private readonly model: Model<CalendarDocument>,
    @InjectModel(Publisher.name) private readonly publisherModel: Model<PublisherDocument>,
  ) {}

  // ---- Public tenant resolution (by subdomain) ----

  /** Active calendar whose account is approved, with the account for branding. */
  async resolveActive(subdomain: string) {
    const calendar = await this.model
      .findOne({ subdomain: subdomain.toLowerCase(), active: true })
      .exec();
    if (!calendar) throw new NotFoundException('Calendar not found');
    const account = await this.publisherModel.findById(calendar.publisherId).exec();
    if (!account || account.status !== 'approved') {
      throw new NotFoundException('Calendar not found');
    }
    return { calendar, account };
  }

  async publicHub(subdomain: string) {
    const { calendar, account } = await this.resolveActive(subdomain);
    return {
      calendar: {
        id: calendar._id.toString(),
        name: calendar.name,
        type: calendar.type,
        subdomain: calendar.subdomain,
      },
      brand: {
        accountName: account.name,
        logoUrl: account.logoUrl,
        primaryColor: account.primaryColor,
        secondaryColor: account.secondaryColor,
        websiteUrl: account.websiteUrl,
        facebookUrl: account.facebookUrl,
        instagramUrl: account.instagramUrl,
        city: account.city,
        state: account.state,
      },
    };
  }

  // ---- Account (publisher) ----

  findByAccount(publisherId: string) {
    return this.model
      .find({ publisherId: new Types.ObjectId(publisherId) })
      .sort({ createdAt: 1 })
      .exec();
  }

  async getInAccountOrThrow(publisherId: string, id: string) {
    const cal = await this.model.findById(id).exec();
    if (!cal) throw new NotFoundException('Calendar not found');
    if (cal.publisherId.toString() !== publisherId) {
      throw new ForbiddenException('That calendar belongs to another account');
    }
    return cal;
  }

  async createForAccount(publisherId: string, dto: CreateCalendarDto) {
    const subdomain = await this.uniqueSubdomain(dto.subdomain || dto.name);
    return this.model.create({
      publisherId: new Types.ObjectId(publisherId),
      name: dto.name,
      type: dto.type,
      subdomain,
      active: true,
    });
  }

  async updateForAccount(publisherId: string, id: string, dto: UpdateCalendarDto) {
    const cal = await this.getInAccountOrThrow(publisherId, id);
    const update: Record<string, unknown> = { ...dto };
    if (dto.subdomain && dto.subdomain !== cal.subdomain) {
      update.subdomain = await this.uniqueSubdomain(dto.subdomain);
    } else {
      delete update.subdomain;
    }
    Object.assign(cal, update);
    await cal.save();
    return cal;
  }

  async removeForAccount(publisherId: string, id: string) {
    await this.getInAccountOrThrow(publisherId, id);
    await this.model.findByIdAndDelete(id).exec();
    return { deleted: true, id };
  }

  // ---- Master ----

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  /** Create a calendar for an account directly (used at account provisioning). */
  async createRaw(publisherId: string, name: string, type: string, subdomain: string) {
    const sub = await this.uniqueSubdomain(subdomain || name);
    return this.model.create({
      publisherId: new Types.ObjectId(publisherId),
      name,
      type,
      subdomain: sub,
      active: true,
    });
  }

  // ---- Helpers ----

  private async uniqueSubdomain(source: string, excludeId?: string) {
    const base = slugify(source);
    if (!base) throw new BadRequestException('A calendar name or subdomain is required');
    if (isReservedSlug(base)) {
      throw new BadRequestException(`"${base}" is reserved and cannot be used as a subdomain`);
    }
    let sub = base;
    let n = 2;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.model.findOne({ subdomain: sub }).exec();
      if (!existing || existing._id.toString() === excludeId) return sub;
      sub = `${base}-${n++}`;
    }
  }
}
