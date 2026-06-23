import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PublishersService } from './publishers.service';

@ApiTags('public')
@Controller('public/:publisher')
export class PublishersPublicController {
  constructor(private readonly publishers: PublishersService) {}

  /** Branding + meta for a hub, resolved by subdomain. */
  @Get()
  async hub(@Param('publisher') subdomain: string) {
    const p = await this.publishers.resolveApproved(subdomain);
    return {
      id: p._id.toString(),
      name: p.name,
      subdomain: p.subdomain,
      city: p.city,
      state: p.state,
      logoUrl: p.logoUrl,
      primaryColor: p.primaryColor,
      secondaryColor: p.secondaryColor,
      websiteUrl: p.websiteUrl,
      facebookUrl: p.facebookUrl,
      instagramUrl: p.instagramUrl,
    };
  }
}
