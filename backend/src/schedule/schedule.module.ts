import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleEntry, ScheduleEntrySchema } from './schedule-entry.schema';
import { ScheduleService } from './schedule.service';
import { ScheduleOwnerController } from './schedule.owner.controller';
import { SchedulePublicController } from './schedule.public.controller';
import { ScheduleAccountController } from './schedule.account.controller';
import { ListingsModule } from '../listings/listings.module';
import { PublishersModule } from '../publishers/publishers.module';
import { CalendarsModule } from '../calendars/calendars.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ScheduleEntry.name, schema: ScheduleEntrySchema }]),
    ListingsModule,
    PublishersModule,
    CalendarsModule,
  ],
  providers: [ScheduleService],
  controllers: [
    ScheduleOwnerController,
    SchedulePublicController,
    ScheduleAccountController,
  ],
  exports: [ScheduleService],
})
export class ScheduleModule {}
