import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleEntry, ScheduleEntrySchema } from './schedule-entry.schema';
import { ScheduleService } from './schedule.service';
import { ScheduleOwnerController } from './schedule.owner.controller';
import { SchedulePublicController } from './schedule.public.controller';
import { ScheduleAdminController } from './schedule.admin.controller';
import { TrucksModule } from '../trucks/trucks.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ScheduleEntry.name, schema: ScheduleEntrySchema }]),
    TrucksModule,
  ],
  providers: [ScheduleService],
  controllers: [ScheduleOwnerController, SchedulePublicController, ScheduleAdminController],
  exports: [ScheduleService],
})
export class ScheduleModule {}
