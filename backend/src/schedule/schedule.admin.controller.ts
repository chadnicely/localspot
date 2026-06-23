import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('admin-schedule')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/schedule')
export class ScheduleAdminController {
  constructor(private readonly schedule: ScheduleService) {}

  /** All schedule entries (optionally filtered by ?day=) with truck info. */
  @Get()
  list(@Query('day') day?: string) {
    return this.schedule.findAllWithTrucks(day);
  }
}
