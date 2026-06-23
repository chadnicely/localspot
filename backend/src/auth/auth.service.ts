import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PublishersService } from '../publishers/publishers.service';
import { ListingsService } from '../listings/listings.service';
import { LoginDto } from './dto/login.dto';
import { ClaimListingDto } from './dto/claim-listing.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly publishers: PublishersService,
    private readonly listings: ListingsService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await this.users.verifyPassword(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.buildSession(user);
  }

  /** A business/vendor/truck/musician claims a listing under a hub. */
  async claimListing(subdomain: string, dto: ClaimListingDto) {
    const publisher = await this.publishers.resolveApproved(subdomain);
    await this.assertEmailFree(dto.email);
    const user = await this.users.create(dto.name, dto.email, dto.password, 'listing_owner');
    await this.listings.createForClaim(publisher._id.toString(), user._id.toString(), {
      type: dto.type,
      name: dto.name,
      description: dto.description,
      category: dto.category,
      cuisineType: dto.cuisineType,
      phone: dto.phone,
      websiteUrl: dto.websiteUrl,
      email: dto.email,
    });
    return this.buildSession(user);
  }

  private async assertEmailFree(email: string) {
    if (await this.users.findByEmail(email)) {
      throw new BadRequestException('An account with that email already exists');
    }
  }

  private async buildSession(user: {
    _id: { toString(): string };
    name: string;
    email: string;
    role: string;
  }) {
    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload);
    return {
      accessToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
