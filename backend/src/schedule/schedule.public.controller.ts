import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { CalendarsService } from '../calendars/calendars.service';
import { DAYS_OF_WEEK } from '../common/food-categories';

@ApiTags('public')
@Controller('public/:calendar')
export class SchedulePublicController {
  constructor(
    private readonly schedule: ScheduleService,
    private readonly calendars: CalendarsService,
  ) {}

  @Get('calendar')
  async byDay(@Param('calendar') subdomain: string, @Query('day') day: string) {
    if (!day || !(DAYS_OF_WEEK as readonly string[]).includes(day)) {
      throw new BadRequestException('A valid ?day= weekday is required');
    }
    const { calendar } = await this.calendars.resolveActive(subdomain);
    return this.schedule.calendarByDay(calendar._id.toString(), day);
  }

  @Get('calendar/today')
  async today(@Param('calendar') subdomain: string) {
    const { calendar } = await this.calendars.resolveActive(subdomain);
    return this.schedule.calendarToday(calendar._id.toString());
  }

  @Get('calendar/week')
  async week(@Param('calendar') subdomain: string) {
    const { calendar } = await this.calendars.resolveActive(subdomain);
    return this.schedule.calendarWeek(calendar._id.toString());
  }

  /** Public listing profile plus its schedule. */
  @Get('listings/:slug')
  async profile(@Param('calendar') subdomain: string, @Param('slug') slug: string) {
    const { calendar } = await this.calendars.resolveActive(subdomain);
    return this.schedule.publicProfile(calendar._id.toString(), slug);
  }
}
