import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { DAYS_OF_WEEK } from '../../common/food-categories';

export class CreateScheduleEntryDto {
  @ApiProperty({ enum: DAYS_OF_WEEK, example: 'Monday' })
  @IsIn(DAYS_OF_WEEK as unknown as string[])
  dayOfWeek: string;

  @ApiPropertyOptional({ example: '2026-07-06', description: 'Optional specific date (ISO)' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: '11:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '14:00' })
  @IsString()
  endTime: string;

  @ApiProperty({ example: 'City Hall Parking Lot' })
  @IsString()
  @MaxLength(160)
  locationName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Map latitude for this stop' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Map longitude for this stop' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ enum: ['scheduled', 'canceled', 'updated'] })
  @IsOptional()
  @IsIn(['scheduled', 'canceled', 'updated'])
  status?: string;
}

export class UpdateScheduleEntryDto extends PartialType(CreateScheduleEntryDto) {}
