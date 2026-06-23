import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { CalendarsService } from '../calendars/calendars.service';

@ApiTags('public')
@Controller('public/:calendar/listings')
export class ListingsPublicController {
  constructor(
    private readonly listings: ListingsService,
    private readonly calendars: CalendarsService,
  ) {}

  /** Approved listings in a calendar, optionally filtered by ?category=. */
  @Get()
  async list(@Param('calendar') subdomain: string, @Query('category') category?: string) {
    const { calendar } = await this.calendars.resolveActive(subdomain);
    return this.listings.findPublicByCalendar(calendar._id.toString(), { category });
  }
  // Individual listing profile (with schedule) is served by the schedule controller
  // at GET /public/:calendar/listings/:slug.
}
