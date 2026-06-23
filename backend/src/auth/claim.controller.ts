import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ClaimListingDto } from './dto/claim-listing.dto';

@ApiTags('public')
@Controller('public/:calendar')
export class ClaimController {
  constructor(private readonly auth: AuthService) {}

  /** A business/vendor/food truck/musician submits a listing to a calendar for approval. */
  @Post('claim-listing')
  claimListing(@Param('calendar') subdomain: string, @Body() dto: ClaimListingDto) {
    return this.auth.claimListing(subdomain, dto);
  }
}
