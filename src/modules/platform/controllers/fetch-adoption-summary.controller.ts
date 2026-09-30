import { Controller, Get, HttpStatus } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { PlatformAdmin } from 'src/common/platform/platform-admin.decorator';
import { FetchAdoptionSummaryResponseDto } from '../dtos/response/fetch-adoption-summary.dto';
import { FetchAdoptionSummaryService } from '../services/fetch-adoption-summary.service';

@ApiTags('Platform')
@PlatformAdmin()
@Controller('/platform/adoption-summary')
export class FetchAdoptionSummaryController {
  constructor(
    private readonly fetchAdoptionSummaryService: FetchAdoptionSummaryService,
  ) {}

  @ApiOperation({
    summary: 'Portfolio adoption counts and a 12-week activity series',
  })
  @ApiOkResponse({
    description: 'Adoption summary retrieved successfully',
    type: FetchAdoptionSummaryResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiForbiddenResponse({
    description: 'Platform admin access required',
    type: ForbiddenDto,
  })
  @Get()
  async fetch() {
    const result = await this.fetchAdoptionSummaryService.execute();

    return {
      statusCode: HttpStatus.OK,
      message: 'Adoption summary retrieved successfully',
      result,
    };
  }
}
