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
import { PublishersService } from './publishers.service';
import { AdminUpdatePublisherDto, CreatePublisherDto } from './dto/publisher.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('master-publishers')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('master_admin')
@Controller('admin/publishers')
export class PublishersMasterController {
  constructor(private readonly publishers: PublishersService) {}

  @Get()
  findAll() {
    return this.publishers.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publishers.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePublisherDto) {
    return this.publishers.adminCreate(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: AdminUpdatePublisherDto) {
    return this.publishers.adminUpdate(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.publishers.remove(id);
  }
}
