import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { TrucksService } from './trucks.service';
import { UpdateTruckProfileDto } from './dto/truck.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { imageUploadOptions } from '../common/upload.config';

@ApiTags('owner-truck')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('me/truck')
export class TrucksOwnerController {
  constructor(
    private readonly trucks: TrucksService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  myTruck(@CurrentUser() user: AuthUser) {
    return this.trucks.getOwnerTruckOrThrow(user.id);
  }

  @Patch()
  updateMyTruck(@CurrentUser() user: AuthUser, @Body() dto: UpdateTruckProfileDto) {
    return this.trucks.updateOwnProfile(user.id, dto);
  }

  @Post('logo')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions('logo')))
  uploadLogo(@CurrentUser() user: AuthUser, @UploadedFile() file?: Express.Multer.File) {
    return this.saveUpload(user.id, 'logoUrl', file);
  }

  @Post('photo')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions('photo')))
  uploadPhoto(@CurrentUser() user: AuthUser, @UploadedFile() file?: Express.Multer.File) {
    return this.saveUpload(user.id, 'mainImageUrl', file);
  }

  private async saveUpload(
    userId: string,
    field: 'logoUrl' | 'mainImageUrl',
    file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No image file received');
    const base = this.config.get<string>('PUBLIC_BASE_URL') ?? 'http://localhost:3001';
    const url = `${base}/uploads/${file.filename}`;
    const truck = await this.trucks.setOwnerImage(userId, field, url);
    return { url, truck };
  }
}
