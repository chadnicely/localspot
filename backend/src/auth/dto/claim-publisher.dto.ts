import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ClaimPublisherDto {
  @ApiProperty({ example: 'North Port Matters', description: 'Newsletter / hub name' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'northport', description: 'Desired subdomain' })
  @IsString()
  @MaxLength(63)
  subdomain: string;

  @ApiProperty({ example: 'North Port' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'FL' })
  @IsString()
  state: string;

  @ApiPropertyOptional({ example: 'USA' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'owner@northportmatters.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'ChangeMe123!' })
  @IsString()
  @MinLength(6)
  password: string;
}
