import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ClaimListingDto {
  // Listing type is taken from the calendar's vertical; this is ignored if sent.
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: "Rosie's Red Truck" })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'owner@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'ChangeMe123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cuisineType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  websiteUrl?: string;
}
