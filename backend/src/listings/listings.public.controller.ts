import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { PublishersService } from '../publishers/publishers.service';

@ApiTags('public')
@Controller('public/:publisher/listings')
export class ListingsPublicController {
  constructor(
    private readonly listings: ListingsService,
    private readonly publishers: PublishersService,
  ) {}

  /** Approved listings in a hub, optionally filtered by ?type= and ?category=. */
  @Get()
  async list(
    @Param('publisher') subdomain: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
  ) {
    const pub = await this.publishers.resolveApproved(subdomain);
    return this.listings.findPublicList(pub._id.toString(), { type, category });
  }
  // Individual listing profile (with schedule) is served by the schedule controller
  // at GET /public/:publisher/listings/:slug.
}
