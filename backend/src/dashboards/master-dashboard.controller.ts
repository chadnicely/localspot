import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardsService } from './dashboards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('master-dashboard')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('master_admin')
@Controller('admin/dashboard')
export class MasterDashboardController {
  constructor(private readonly dashboards: DashboardsService) {}

  @Get()
  dashboard() {
    return this.dashboards.master();
  }
}
