import { Module } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { MasterDashboardController } from './master-dashboard.controller';
import { PublisherDashboardController } from './publisher-dashboard.controller';
import { PublishersModule } from '../publishers/publishers.module';
import { CalendarsModule } from '../calendars/calendars.module';
import { ListingsModule } from '../listings/listings.module';
import { ScheduleModule } from '../schedule/schedule.module';

@Module({
  imports: [PublishersModule, CalendarsModule, ListingsModule, ScheduleModule],
  providers: [DashboardsService],
  controllers: [MasterDashboardController, PublisherDashboardController],
})
export class DashboardsModule {}
