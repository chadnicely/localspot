import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publisher, PublisherSchema } from './publisher.schema';
import { PublishersService } from './publishers.service';
import { PublishersMasterController } from './publishers.master.controller';
import { PublishersSelfController } from './publishers.self.controller';
import { PublishersPublicController } from './publishers.public.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Publisher.name, schema: PublisherSchema }])],
  providers: [PublishersService],
  controllers: [
    PublishersMasterController,
    PublishersSelfController,
    PublishersPublicController,
  ],
  exports: [PublishersService, MongooseModule],
})
export class PublishersModule {}
