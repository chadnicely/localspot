import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publisher, PublisherSchema } from './publisher.schema';
import { PublishersService } from './publishers.service';
import { PublishersMasterController } from './publishers.master.controller';
import { PublishersSelfController } from './publishers.self.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Publisher.name, schema: PublisherSchema }]),
    UsersModule,
  ],
  providers: [PublishersService],
  controllers: [PublishersMasterController, PublishersSelfController],
  exports: [PublishersService, MongooseModule],
})
export class PublishersModule {}
