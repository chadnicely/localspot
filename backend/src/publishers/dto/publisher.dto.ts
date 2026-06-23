import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Fields a publisher can edit on their own hub (branding + contact). */
export class UpdatePublisherDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: '#dc2626' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#1f3559' })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactEmail?: string;
}

/** Master-admin fields on top of the editable profile. */
export class AdminUpdatePublisherDto extends PartialType(UpdatePublisherDto) {
  @ApiPropertyOptional({ enum: ['pending', 'approved', 'suspended'] })
  @IsOptional()
  @IsIn(['pending', 'approved', 'suspended'])
  status?: string;
}

/** Master admin provisions a customer account + its owner login. */
export class CreatePublisherDto extends UpdatePublisherDto {
  @ApiProperty({ example: 'North Port Matters', description: 'Account / customer name' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ example: 'owner@northportmatters.com', description: 'Login email for the account owner' })
  @IsEmail()
  ownerEmail: string;

  @ApiPropertyOptional({ description: 'Temp password; auto-generated if omitted' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  ownerPassword?: string;
}
