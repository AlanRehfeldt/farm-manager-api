import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import z from 'zod';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { AllowPendingOrganizationSelection } from '../decorators/allow-pending-organization-selection.decorator';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../decorators/current-user.decorator';
import { SelectOrganizationBodyDto } from '../dtos/request/select-organization.dto';
import { MessageResponseDto } from '../dtos/response/message.dto';
import { SelectOrganizationService } from '../services/select-organization.service';

const selectOrganizationBodySchema = z.object({
  organizationId: z.uuid(),
});

@ApiTags('Auth')
@Controller('/auth')
export class SelectOrganizationController {
  constructor(
    private readonly selectOrganizationService: SelectOrganizationService,
  ) {}

  @AllowPendingOrganizationSelection()
  @ApiOperation({
    summary: 'Bind the session to one organization after login',
  })
  @ApiOkResponse({
    description: 'Issues a new token pair scoped to the organization',
    type: MessageResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: BadRequestDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @ApiForbiddenResponse({
    description: 'Selection is not pending or the organization is forbidden',
    type: ForbiddenDto,
  })
  @Post('/select-organization')
  @HttpCode(HttpStatus.OK)
  async select(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(selectOrganizationBodySchema))
    data: SelectOrganizationBodyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.selectOrganizationService.execute(
      user,
      data.organizationId,
      res,
    );

    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }
}
