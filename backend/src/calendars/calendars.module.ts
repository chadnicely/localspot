import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Calendar, CalendarSchema } from './calendar.schema';
import { CalendarsService } from './calendars.service';
import { CalendarsAccountController } from './calendars.account.controller';
import { CalendarsMasterController } from './calendars.master.controller';
import { CalendarsPublicController } from './calendars.public.controller';
import { PublishersModule } from '../publishers/publishers.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Calendar.name, schema: CalendarSchema }]),
    PublishersModule,
  ],
  providers: [CalendarsService],
  controllers: [
    CalendarsAccountController,
    CalendarsMasterController,
    CalendarsPublicController,
  ],
  exports: [CalendarsService, MongooseModule],
})
export class CalendarsModule {}
