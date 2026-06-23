import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { PublishersService } from '../publishers/publishers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';

@ApiTags('publisher-schedule')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('publisher')
@Controller('publisher/schedule')
export class SchedulePublisherController {
  constructor(
    private readonly schedule: ScheduleService,
    private readonly publishers: PublishersService,
  ) {}

  /** All schedule entries in the publisher's hub (optionally ?day=). */
  @Get()
  async list(@CurrentUser() user: AuthUser, @Query('day') day?: string) {
    const pub = await this.publishers.getOwnOrThrow(user.id);
    return this.schedule.allForPublisher(pub._id.toString(), day);
  }
}
