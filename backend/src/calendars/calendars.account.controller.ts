import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CalendarsService } from './calendars.service';
import { CreateCalendarDto, UpdateCalendarDto } from './dto/calendar.dto';
import { PublishersService } from '../publishers/publishers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { imageUploadOptions } from '../common/upload.config';

@ApiTags('account-calendars')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('publisher')
@Controller('publisher/calendars')
export class CalendarsAccountController {
  constructor(
    private readonly calendars: CalendarsService,
    private readonly publishers: PublishersService,
    private readonly config: ConfigService,
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

  @Post(':id/hero')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions('calendar-hero')))
  async uploadHero(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No image file received');
    const base = this.config.get<string>('PUBLIC_BASE_URL') ?? 'http://localhost:3001';
    const url = `${base}/uploads/${file.filename}`;
    const calendar = await this.calendars.setHeroImage(await this.accId(user), id, url);
    return { url, calendar };
  }
}

