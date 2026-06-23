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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';

@ApiTags('publisher-listings')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('publisher')
@Controller('publisher/listings')
export class ListingsPublisherController {
  constructor(
    private readonly listings: ListingsService,
    private readonly publishers: PublishersService,
  ) {}

  private async pubId(user: AuthUser) {
    const pub = await this.publishers.getOwnOrThrow(user.id);
    return pub._id.toString();
  }

  @Get()
  async all(@CurrentUser() user: AuthUser) {
    return this.listings.findByPublisher(await this.pubId(user));
  }

  @Get('pending')
  async pending(@CurrentUser() user: AuthUser) {
    return this.listings.findPendingByPublisher(await this.pubId(user));
  }

  @Get(':id')
  async one(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.listings.getInPublisherOrThrow(await this.pubId(user), id);
  }

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateListingDto) {
    return this.listings.publisherCreate(await this.pubId(user), user.id, dto);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ManageListingDto,
  ) {
    return this.listings.publisherUpdate(await this.pubId(user), id, dto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.listings.publisherRemove(await this.pubId(user), id);
  }
}
