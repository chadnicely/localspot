import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardsService } from './dashboards.service';
import { PublishersService } from '../publishers/publishers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';

@ApiTags('publisher-dashboard')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('publisher')
@Controller('publisher/dashboard')
export class PublisherDashboardController {
  constructor(
    private readonly dashboards: DashboardsService,
    private readonly publishers: PublishersService,
  ) {}

  @Get()
  async dashboard(@CurrentUser() user: AuthUser) {
    const pub = await this.publishers.getOwnOrThrow(user.id);
    return this.dashboards.publisher(pub._id.toString());
  }
}
