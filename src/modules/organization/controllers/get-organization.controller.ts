import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import z from 'zod';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';
import { GetOrganizationParamDto } from '../dtos/request/get-organization.dto';
import { GetOrganizationResponseDto } from '../dtos/response/get-organization.dto';
import { GetOrganizationService } from '../services/get-organization.service';

const getOrganizationParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Organization')
@Controller('/organizations')
export class GetOrganizationController {
  constructor(
    private readonly getOrganizationService: GetOrganizationService,
  ) {}

  @ApiOperation({ summary: 'Get organization' })
  @ApiOkResponse({
    description: 'Organization retrieved successfully',
    type: GetOrganizationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiNotFoundResponse({
    description: 'Organization does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(getOrganizationParamSchema))
    param: GetOrganizationParamDto,
  ) {
    const { organization } = await this.getOrganizationService.execute(
      param.id,
      user.userId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Organization retrieved successfully',
      result: organization,
    };
  }
}
