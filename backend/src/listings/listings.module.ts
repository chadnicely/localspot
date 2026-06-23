import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Listing, ListingSchema } from './listing.schema';
import { ListingsService } from './listings.service';
import { ListingsOwnerController } from './listings.owner.controller';
import { ListingsPublisherController } from './listings.publisher.controller';
import { ListingsMasterController } from './listings.master.controller';
import { ListingsPublicController } from './listings.public.controller';
import { PublishersModule } from '../publishers/publishers.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Listing.name, schema: ListingSchema }]),
    PublishersModule,
  ],
  providers: [ListingsService],
  controllers: [
    ListingsOwnerController,
    ListingsPublisherController,
    ListingsMasterController,
    ListingsPublicController,
  ],
  exports: [ListingsService, MongooseModule],
})
export class ListingsModule {}
