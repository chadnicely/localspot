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

/**
 * Publisher == the customer Account (white-label brand owner). Subdomains live on
 * Calendars; this service manages the account record + branding.
 */
@Injectable()
export class PublishersService {
  constructor(
    @InjectModel(Publisher.name) private readonly model: Model<PublisherDocument>,
    private readonly users: UsersService,
  ) {}

  // ---- Account (self) ----

  findByUser(userId: string) {
    return this.model.findOne({ userId: new Types.ObjectId(userId) }).exec();
  }

  async getOwnOrThrow(userId: string) {
    const acc = await this.findByUser(userId);
    if (!acc) throw new NotFoundException('No account is linked to this login');
    return acc;
  }

  async updateOwn(userId: string, dto: UpdatePublisherDto) {
    const acc = await this.getOwnOrThrow(userId);
    Object.assign(acc, dto);
    await acc.save();
    return acc;
  }

  async setOwnLogo(userId: string, url: string) {
    const acc = await this.getOwnOrThrow(userId);
    acc.logoUrl = url;
    await acc.save();
    return acc;
  }

  // ---- Master admin ----

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const acc = await this.model.findById(id).exec();
    if (!acc) throw new NotFoundException('Account not found');
    return acc;
  }

  /**
   * Master admin provisions a customer account and its owner login.
   * Returns the account plus the temp password to share (if auto-generated).
   */
  async adminCreate(dto: CreatePublisherDto) {
    const email = dto.ownerEmail.toLowerCase().trim();
    if (await this.users.findByEmail(email)) {
      throw new BadRequestException('A user with that email already exists');
    }
    const tempPassword = dto.ownerPassword || this.randomPassword();
    const owner = await this.users.create(dto.name, email, tempPassword, 'publisher');

    const account = await this.model.create({
      userId: owner._id,
      name: dto.name,
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
      account,
      ownerEmail: email,
      tempPassword: dto.ownerPassword ? undefined : tempPassword,
    };
  }

  async adminUpdate(id: string, dto: AdminUpdatePublisherDto) {
    const acc = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!acc) throw new NotFoundException('Account not found');
    return acc;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Account not found');
    return { deleted: true, id };
  }

  private randomPassword() {
    const part = () => Math.random().toString(36).slice(2, 6);
    return `ots-${part()}-${part()}`;
  }
}
