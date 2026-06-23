import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publisher, PublisherDocument } from './publisher.schema';
import {
  AdminUpdatePublisherDto,
  CreatePublisherDto,
  UpdatePublisherDto,
} from './dto/publisher.dto';
import { UsersService } from '../users/users.service';
import { slugify } from '../common/slug.util';
import { isReservedSlug } from '../common/reserved-slugs';

@Injectable()
export class PublishersService {
  constructor(
    @InjectModel(Publisher.name) private readonly model: Model<PublisherDocument>,
    private readonly users: UsersService,
  ) {}

  // ---- Tenant resolution ----

  /** Resolve an APPROVED publisher by subdomain (used by all public endpoints). */
  async resolveApproved(subdomain: string) {
    const pub = await this.model
      .findOne({ subdomain: subdomain.toLowerCase(), status: 'approved' })
      .exec();
    if (!pub) throw new NotFoundException('Local hub not found');
    return pub;
  }

  /** Resolve a publisher by subdomain regardless of status (for claim flows). */
  async resolveAny(subdomain: string) {
    const pub = await this.model.findOne({ subdomain: subdomain.toLowerCase() }).exec();
    if (!pub) throw new NotFoundException('Local hub not found');
    return pub;
  }

  // ---- Publisher (self) ----

  findByUser(userId: string) {
    return this.model.findOne({ userId: new Types.ObjectId(userId) }).exec();
  }

  async getOwnOrThrow(userId: string) {
    const pub = await this.findByUser(userId);
    if (!pub) throw new NotFoundException('No publisher hub is linked to this account');
    return pub;
  }

  async updateOwn(userId: string, dto: UpdatePublisherDto) {
    const pub = await this.getOwnOrThrow(userId);
    Object.assign(pub, dto);
    await pub.save();
    return pub;
  }

  async setOwnLogo(userId: string, url: string) {
    const pub = await this.getOwnOrThrow(userId);
    pub.logoUrl = url;
    await pub.save();
    return pub;
  }

  // ---- Master admin ----

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const pub = await this.model.findById(id).exec();
    if (!pub) throw new NotFoundException('Publisher not found');
    return pub;
  }

  /**
   * Master admin creates a hub and the publisher account that owns it.
   * Returns the publisher plus the temp password to share (if one was generated).
   */
  async adminCreate(dto: CreatePublisherDto) {
    const email = dto.ownerEmail.toLowerCase().trim();
    if (await this.users.findByEmail(email)) {
      throw new BadRequestException('A user with that email already exists');
    }
    const subdomain = await this.uniqueSubdomain(dto.subdomain || dto.name);
    const tempPassword = dto.ownerPassword || this.randomPassword();
    const owner = await this.users.create(dto.name, email, tempPassword, 'publisher');

    const publisher = await this.model.create({
      userId: owner._id,
      name: dto.name,
      slug: subdomain,
      subdomain,
      city: dto.city ?? '',
      state: dto.state ?? '',
      country: dto.country ?? 'USA',
      primaryColor: dto.primaryColor ?? '#4f46e5',
      secondaryColor: dto.secondaryColor ?? '#1f3559',
      websiteUrl: dto.websiteUrl ?? '',
      facebookUrl: dto.facebookUrl ?? '',
      instagramUrl: dto.instagramUrl ?? '',
      contactEmail: email,
      status: 'approved',
    });

    return {
      publisher,
      ownerEmail: email,
      tempPassword: dto.ownerPassword ? undefined : tempPassword,
    };
  }

  private randomPassword() {
    // Readable temp password the admin can hand off.
    const part = () => Math.random().toString(36).slice(2, 6);
    return `ots-${part()}-${part()}`;
  }

  async adminUpdate(id: string, dto: AdminUpdatePublisherDto) {
    const pub = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!pub) throw new NotFoundException('Publisher not found');
    return pub;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Publisher not found');
    return { deleted: true, id };
  }

  // ---- Helpers ----

  private async uniqueSubdomain(source: string) {
    const base = slugify(source);
    if (!base) throw new BadRequestException('A hub name or subdomain is required');
    if (isReservedSlug(base)) {
      throw new BadRequestException(`"${base}" is reserved and cannot be used as a subdomain`);
    }
    let sub = base;
    let n = 2;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.model.findOne({ subdomain: sub }).exec();
      if (!existing) return sub;
      sub = `${base}-${n++}`;
    }
  }
}
