import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const CALENDAR_TYPES = ['food_truck', 'musician', 'vendor', 'farmers_market', 'event'];

export class CreateCalendarDto {
  @ApiProperty({ example: 'North Port Food Trucks' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ enum: CALENDAR_TYPES, example: 'food_truck' })
  @IsIn(CALENDAR_TYPES)
  type: string;

  @ApiProperty({ example: 'northportfoodtrucks', description: 'Public subdomain for this calendar' })
  @IsString()
  @MaxLength(63)
  subdomain: string;
}

export class UpdateCalendarDto extends PartialType(CreateCalendarDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
