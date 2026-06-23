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
import { TrucksService } from './trucks.service';
import { AdminUpdateTruckDto, CreateTruckDto } from './dto/truck.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('admin-trucks')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/trucks')
export class TrucksAdminController {
  constructor(private readonly trucks: TrucksService) {}

  @Get()
  findAll() {
    return this.trucks.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trucks.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTruckDto) {
    return this.trucks.adminCreate(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: AdminUpdateTruckDto) {
    return this.trucks.adminUpdate(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trucks.remove(id);
  }
}
