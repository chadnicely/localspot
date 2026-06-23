import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CalendarsService } from './calendars.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('master-calendars')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('master_admin')
@Controller('admin/calendars')
export class CalendarsMasterController {
  constructor(private readonly calendars: CalendarsService) {}

  @Get()
  all() {
    return this.calendars.findAll();
  }
}
