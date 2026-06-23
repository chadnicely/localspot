import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TrucksModule } from '../trucks/trucks.module';

@Module({
  imports: [TrucksModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
