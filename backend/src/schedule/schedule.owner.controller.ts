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
@Controller('me/truck/schedule')
export class ScheduleOwnerController {
  constructor(private readonly schedule: ScheduleService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.schedule.listForOwner(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateScheduleEntryDto) {
    return this.schedule.createForOwner(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateScheduleEntryDto,
  ) {
    return this.schedule.updateForOwner(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.schedule.removeForOwner(user.id, id);
  }
}
