import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TrucksService } from './trucks.service';

@ApiTags('public')
@Controller('public/trucks')
export class TrucksPublicController {
  constructor(private readonly trucks: TrucksService) {}

  /** Public directory: all active, paid food trucks. */
  @Get()
  list() {
    return this.trucks.findPublicList();
  }
}
