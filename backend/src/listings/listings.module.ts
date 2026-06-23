import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Listing, ListingSchema } from './listing.schema';
import { ListingsService } from './listings.service';
import { ListingsOwnerController } from './listings.owner.controller';
import { ListingsAccountController } from './listings.account.controller';
import { ListingsMasterController } from './listings.master.controller';
import { ListingsPublicController } from './listings.public.controller';
import { PublishersModule } from '../publishers/publishers.module';
import { CalendarsModule } from '../calendars/calendars.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Listing.name, schema: ListingSchema }]),
    PublishersModule,
    CalendarsModule,
  ],
  providers: [ListingsService],
  controllers: [
    ListingsOwnerController,
    ListingsAccountController,
    ListingsMasterController,
    ListingsPublicController,
  ],
  exports: [ListingsService, MongooseModule],
})
export class ListingsModule {}
