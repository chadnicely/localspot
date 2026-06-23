import {
  BadRequestException,
  Body,
  Controller,
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
import { ListingsService } from './listings.service';
import { UpdateListingDto } from './dto/listing.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { imageUploadOptions } from '../common/upload.config';

@ApiTags('owner-listings')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('me/listings')
export class ListingsOwnerController {
  constructor(
    private readonly listings: ListingsService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  mine(@CurrentUser() user: AuthUser) {
    return this.listings.findByOwner(user.id);
  }

  @Get(':id')
  one(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.listings.getOwnedOrThrow(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listings.updateOwn(user.id, id, dto);
  }

  @Post(':id/logo')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions('listing-logo')))
  uploadLogo(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.saveUpload(user.id, id, 'logoUrl', file);
  }

  @Post(':id/cover')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions('listing-cover')))
  uploadCover(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.saveUpload(user.id, id, 'coverImageUrl', file);
  }

  private async saveUpload(
    userId: string,
    id: string,
    field: 'logoUrl' | 'coverImageUrl',
    file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No image file received');
    const base = this.config.get<string>('PUBLIC_BASE_URL') ?? 'http://localhost:3001';
    const url = `${base}/uploads/${file.filename}`;
    const listing = await this.listings.setOwnerImage(userId, id, field, url);
    return { url, listing };
  }
}
