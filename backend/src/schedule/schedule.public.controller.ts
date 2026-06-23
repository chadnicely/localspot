import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { DAYS_OF_WEEK } from '../common/food-categories';

@ApiTags('public')
@Controller('public')
export class SchedulePublicController {
  constructor(private readonly schedule: ScheduleService) {}

  /** Trucks scheduled on a given weekday (?day=Monday). */
  @Get('calendar')
  byDay(@Query('day') day: string) {
    if (!day || !(DAYS_OF_WEEK as readonly string[]).includes(day)) {
      throw new BadRequestException('A valid ?day= weekday is required');
    }
    return this.schedule.calendarByDay(day);
  }

  /** Trucks scheduled today. */
  @Get('calendar/today')
  today() {
    return this.schedule.calendarToday();
  }

  /** Every active stop for the whole week (for the month calendar + map). */
  @Get('calendar/week')
  week() {
    return this.schedule.calendarWeek();
  }

  /** Public truck profile plus its weekly schedule. */
  @Get('trucks/:slug')
  profile(@Param('slug') slug: string) {
    return this.schedule.publicProfile(slug);
  }
}
