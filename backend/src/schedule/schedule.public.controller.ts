import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { PublishersService } from '../publishers/publishers.service';
import { DAYS_OF_WEEK } from '../common/food-categories';

@ApiTags('public')
@Controller('public/:publisher')
export class SchedulePublicController {
  constructor(
    private readonly schedule: ScheduleService,
    private readonly publishers: PublishersService,
  ) {}

  /** Listings scheduled on a given weekday (?day=Monday) in this hub. */
  @Get('calendar')
  async byDay(@Param('publisher') subdomain: string, @Query('day') day: string) {
    if (!day || !(DAYS_OF_WEEK as readonly string[]).includes(day)) {
      throw new BadRequestException('A valid ?day= weekday is required');
    }
    const pub = await this.publishers.resolveApproved(subdomain);
    return this.schedule.calendarByDay(pub._id.toString(), day);
  }

  /** Listings scheduled today in this hub. */
  @Get('calendar/today')
  async today(@Param('publisher') subdomain: string) {
    const pub = await this.publishers.resolveApproved(subdomain);
    return this.schedule.calendarToday(pub._id.toString());
  }

  /** Every active stop for the whole week in this hub (month calendar + map). */
  @Get('calendar/week')
  async week(@Param('publisher') subdomain: string) {
    const pub = await this.publishers.resolveApproved(subdomain);
    return this.schedule.calendarWeek(pub._id.toString());
  }

  /** Public listing profile plus its schedule. */
  @Get('listings/:slug')
  async profile(@Param('publisher') subdomain: string, @Param('slug') slug: string) {
    const pub = await this.publishers.resolveApproved(subdomain);
    return this.schedule.publicProfile(pub._id.toString(), slug);
  }
}
