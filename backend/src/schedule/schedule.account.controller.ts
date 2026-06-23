import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { PublishersService } from '../publishers/publishers.service';
import { CalendarsService } from '../calendars/calendars.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';

@ApiTags('account-schedule')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('publisher')
@Controller('publisher/calendars/:calendarId/schedule')
export class ScheduleAccountController {
  constructor(
    private readonly schedule: ScheduleService,
    private readonly publishers: PublishersService,
    private readonly calendars: CalendarsService,
  ) {}

  /** All schedule entries in one of the account's calendars (optionally ?day=). */
  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Param('calendarId') calendarId: string,
    @Query('day') day?: string,
  ) {
    const acc = await this.publishers.getOwnOrThrow(user.id);
    await this.calendars.getInAccountOrThrow(acc._id.toString(), calendarId);
    return this.schedule.allForCalendar(calendarId, day);
  }
}
