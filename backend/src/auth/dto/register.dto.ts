import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: "Rosie's Red Truck", description: 'Food truck name' })
  @IsString()
  @MaxLength(120)
  truckName: string;

  @ApiProperty({ example: 'owner@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'ChangeMe123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'weekly', description: 'Selected plan: weekly | monthly | featured' })
  @IsOptional()
  @IsString()
  plan?: string;
}
