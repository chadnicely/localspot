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
import { CalendarsService } from './calendars.service';
import { CreateCalendarDto, UpdateCalendarDto } from './dto/calendar.dto';
import { PublishersService } from '../publishers/publishers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';

@ApiTags('account-calendars')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('publisher')
@Controller('publisher/calendars')
export class CalendarsAccountController {
  constructor(
    private readonly calendars: CalendarsService,
    private readonly publishers: PublishersService,
  ) {}

  private async accId(user: AuthUser) {
    const acc = await this.publishers.getOwnOrThrow(user.id);
    return acc._id.toString();
  }

  @Get()
  async all(@CurrentUser() user: AuthUser) {
    return this.calendars.findByAccount(await this.accId(user));
  }

  @Get(':id')
  async one(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.calendars.getInAccountOrThrow(await this.accId(user), id);
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateCalendarDto) {
    return this.calendars.createForAccount(await this.accId(user), dto);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCalendarDto,
  ) {
    return this.calendars.updateForAccount(await this.accId(user), id, dto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.calendars.removeForAccount(await this.accId(user), id);
  }
}
