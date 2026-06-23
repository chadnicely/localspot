import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CalendarsService } from './calendars.service';

@ApiTags('public')
@Controller('public/:calendar')
export class CalendarsPublicController {
  constructor(private readonly calendars: CalendarsService) {}

  /** Calendar meta + account branding, resolved by subdomain. */
  @Get()
  hub(@Param('calendar') subdomain: string) {
    return this.calendars.publicHub(subdomain);
  }
}
