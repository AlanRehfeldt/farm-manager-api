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
import z from 'zod';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';
import {
  UpdateOrganizationBodyDto,
  UpdateOrganizationParamDto,
} from '../dtos/request/update-organization.dto';
import { UpdateOrganizationResponseDto } from '../dtos/response/update-organization.dto';
import { UpdateOrganizationService } from '../services/update-organization.service';

const updateOrganizationParamSchema = z.object({
  id: z.uuid(),
});

const updateOrganizationBodySchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' })
    .optional(),
});

@ApiTags('Organization')
@Controller('/organizations')
export class UpdateOrganizationController {
  constructor(
    private readonly updateOrganizationService: UpdateOrganizationService,
  ) {}

  @ApiOperation({ summary: 'Update organization' })
  @ApiOkResponse({
    description: 'Organization updated successfully',
    type: UpdateOrganizationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request',
    type: BadRequestDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiForbiddenResponse({
    description: 'Only organization admins can update',
    type: ForbiddenDto,
  })
  @ApiNotFoundResponse({
    description: 'Organization does not exist',
    type: NotFoundDto,
  })
  @Patch(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(updateOrganizationParamSchema))
    param: UpdateOrganizationParamDto,
    @Body(new ZodValidationPipe(updateOrganizationBodySchema))
    data: UpdateOrganizationBodyDto,
  ) {
    const { organization } = await this.updateOrganizationService.execute(
      user.userId,
      { id: param.id, name: data.name },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Organization updated successfully',
      result: organization,
    };
  }
}
