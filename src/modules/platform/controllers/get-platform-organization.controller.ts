import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import z from 'zod';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { PlatformAdmin } from 'src/common/platform/platform-admin.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { GetPlatformOrganizationResponseDto } from '../dtos/response/get-platform-organization.dto';
import { GetPlatformOrganizationService } from '../services/get-platform-organization.service';

const getPlatformOrganizationParamSchema = z.object({
  organizationId: z.uuid(),
});

@ApiTags('Platform')
@PlatformAdmin()
@Controller('/platform/organizations')
export class GetPlatformOrganizationController {
  constructor(
    private readonly getPlatformOrganizationService: GetPlatformOrganizationService,
  ) {}

  @ApiOperation({
    summary: 'Get one organization with a 30-day usage snapshot',
  })
  @ApiOkResponse({
    description: 'Organization retrieved successfully',
    type: GetPlatformOrganizationResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiForbiddenResponse({
    description: 'Platform admin access required',
    type: ForbiddenDto,
  })
  @ApiNotFoundResponse({
    description: 'Organization does not exist',
    type: NotFoundDto,
  })
  @Get('/:organizationId')
  async get(
    @Param(new ZodValidationPipe(getPlatformOrganizationParamSchema))
    params: {
      organizationId: string;
    },
  ) {
    const result = await this.getPlatformOrganizationService.execute(
      params.organizationId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Organization retrieved successfully',
      result,
    };
  }
}
