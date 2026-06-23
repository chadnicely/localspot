import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FoodTruck, FoodTruckSchema } from './food-truck.schema';
import { TrucksService } from './trucks.service';
import { TrucksOwnerController } from './trucks.owner.controller';
import { TrucksAdminController } from './trucks.admin.controller';
import { TrucksPublicController } from './trucks.public.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FoodTruck.name, schema: FoodTruckSchema }]),
  ],
  providers: [TrucksService],
  controllers: [TrucksOwnerController, TrucksAdminController, TrucksPublicController],
  exports: [TrucksService, MongooseModule],
})
export class TrucksModule {}
