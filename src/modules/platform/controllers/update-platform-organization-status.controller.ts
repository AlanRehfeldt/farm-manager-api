import { Body, Controller, HttpStatus, Param, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { OrganizationStatus } from '@prisma/client';
import z from 'zod';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { PlatformAdmin } from 'src/common/platform/platform-admin.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';
import {
  UpdatePlatformOrganizationStatusBodyDto,
  UpdatePlatformOrganizationStatusParamDto,
} from '../dtos/request/update-platform-organization-status.dto';
import { UpdatePlatformOrganizationStatusResponseDto } from '../dtos/response/update-platform-organization-status.dto';
import { UpdatePlatformOrganizationStatusService } from '../services/update-platform-organization-status.service';

const updatePlatformOrganizationStatusParamSchema = z.object({
  organizationId: z.uuid(),
});

const updatePlatformOrganizationStatusBodySchema = z.object({
  status: z.enum(OrganizationStatus),
});

@ApiTags('Platform')
@PlatformAdmin()
@Controller('/platform/organizations')
export class UpdatePlatformOrganizationStatusController {
  constructor(
    private readonly updatePlatformOrganizationStatusService: UpdatePlatformOrganizationStatusService,
  ) {}

  @ApiOperation({
    summary: 'Suspend or reactivate an organization',
  })
  @ApiOkResponse({
    description: 'Organization status updated successfully',
    type: UpdatePlatformOrganizationStatusResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
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
  @Patch('/:organizationId/status')
  async update(
    @CurrentUser() actor: AuthenticatedUser,
    @Param(new ZodValidationPipe(updatePlatformOrganizationStatusParamSchema))
    params: UpdatePlatformOrganizationStatusParamDto,
    @Body(new ZodValidationPipe(updatePlatformOrganizationStatusBodySchema))
    data: UpdatePlatformOrganizationStatusBodyDto,
  ) {
    const result = await this.updatePlatformOrganizationStatusService.execute(
      params.organizationId,
      data.status,
      actor.userId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Organization status updated successfully',
      result,
    };
  }
}
