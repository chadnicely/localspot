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
import { PublishersService } from './publishers.service';
import { UpdatePublisherDto } from './dto/publisher.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { imageUploadOptions } from '../common/upload.config';

@ApiTags('publisher-self')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('publisher')
@Controller('me/publisher')
export class PublishersSelfController {
  constructor(
    private readonly publishers: PublishersService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  myPublisher(@CurrentUser() user: AuthUser) {
    return this.publishers.getOwnOrThrow(user.id);
  }

  @Patch()
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdatePublisherDto) {
    return this.publishers.updateOwn(user.id, dto);
  }

  @Post('logo')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions('publisher-logo')))
  async uploadLogo(@CurrentUser() user: AuthUser, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No image file received');
    const base = this.config.get<string>('PUBLIC_BASE_URL') ?? 'http://localhost:3001';
    const url = `${base}/uploads/${file.filename}`;
    const publisher = await this.publishers.setOwnLogo(user.id, url);
    return { url, publisher };
  }
}
