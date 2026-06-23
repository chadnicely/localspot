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
import { ListingsService } from './listings.service';
import { CreateListingDto, ManageListingDto } from './dto/listing.dto';
import { PublishersService } from '../publishers/publishers.service';
import { CalendarsService } from '../calendars/calendars.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';

@ApiTags('account-listings')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('publisher')
@Controller('publisher')
export class ListingsAccountController {
  constructor(
    private readonly listings: ListingsService,
    private readonly publishers: PublishersService,
    private readonly calendars: CalendarsService,
  ) {}

  private async ctx(user: AuthUser, calendarId: string) {
    const acc = await this.publishers.getOwnOrThrow(user.id);
    const calendar = await this.calendars.getInAccountOrThrow(acc._id.toString(), calendarId);
    return { accId: acc._id.toString(), calendar };
  }

  @Get('calendars/:calendarId/listings')
  async list(@CurrentUser() user: AuthUser, @Param('calendarId') calendarId: string) {
    await this.ctx(user, calendarId);
    return this.listings.findByCalendar(calendarId);
  }

  @Get('calendars/:calendarId/listings/pending')
  async pending(@CurrentUser() user: AuthUser, @Param('calendarId') calendarId: string) {
    await this.ctx(user, calendarId);
    return this.listings.findPendingByCalendar(calendarId);
  }

  @Post('calendars/:calendarId/listings')
  async create(
    @CurrentUser() user: AuthUser,
    @Param('calendarId') calendarId: string,
    @Body() dto: CreateListingDto,
  ) {
    const { accId, calendar } = await this.ctx(user, calendarId);
    return this.listings.accountCreate(accId, calendarId, user.id, calendar.type, dto);
  }

  @Get('listings/:id')
  async one(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const acc = await this.publishers.getOwnOrThrow(user.id);
    return this.listings.getInAccountOrThrow(acc._id.toString(), id);
  }

  @Patch('listings/:id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ManageListingDto,
  ) {
    const acc = await this.publishers.getOwnOrThrow(user.id);
    return this.listings.accountUpdate(acc._id.toString(), id, dto);
  }

  @Delete('listings/:id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const acc = await this.publishers.getOwnOrThrow(user.id);
    return this.listings.accountRemove(acc._id.toString(), id);
  }
}
