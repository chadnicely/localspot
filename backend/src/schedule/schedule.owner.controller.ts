import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { CreateScheduleEntryDto, UpdateScheduleEntryDto } from './dto/schedule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';

@ApiTags('owner-schedule')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('me/listings/:listingId/schedule')
export class ScheduleOwnerController {
  constructor(private readonly schedule: ScheduleService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Param('listingId') listingId: string) {
    return this.schedule.listForOwnerListing(user.id, listingId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('listingId') listingId: string,
    @Body() dto: CreateScheduleEntryDto,
  ) {
    return this.schedule.createForOwnerListing(user.id, listingId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('listingId') listingId: string,
    @Param('id') id: string,
    @Body() dto: UpdateScheduleEntryDto,
  ) {
    return this.schedule.updateForOwnerListing(user.id, listingId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('listingId') listingId: string,
    @Param('id') id: string,
  ) {
    return this.schedule.removeForOwnerListing(user.id, listingId, id);
  }
}
