import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleEntry, ScheduleEntrySchema } from './schedule-entry.schema';
import { ScheduleService } from './schedule.service';
import { ScheduleOwnerController } from './schedule.owner.controller';
import { SchedulePublicController } from './schedule.public.controller';
import { SchedulePublisherController } from './schedule.publisher.controller';
import { ListingsModule } from '../listings/listings.module';
import { PublishersModule } from '../publishers/publishers.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ScheduleEntry.name, schema: ScheduleEntrySchema }]),
    ListingsModule,
    PublishersModule,
  ],
  providers: [ScheduleService],
  controllers: [
    ScheduleOwnerController,
    SchedulePublicController,
    SchedulePublisherController,
  ],
  exports: [ScheduleService],
})
export class ScheduleModule {}
