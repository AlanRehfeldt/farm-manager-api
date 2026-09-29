import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { OrganizationSelection } from '@prisma/client';
import type { Response } from 'express';
import z from 'zod';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { TokenService } from 'src/modules/auth/services/token.service';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';
import { CreateOrganizationBodyDto } from '../dtos/request/create-organization.dto';
import { CreateOrganizationResponseDto } from '../dtos/response/create-organization.dto';
import { CreateOrganizationService } from '../services/create-organization.service';

const createOrganizationBodySchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' }),
});

@ApiTags('Organization')
@Controller('/organizations')
export class CreateOrganizationController {
  constructor(
    private readonly createOrganizationService: CreateOrganizationService,
    private readonly tokenService: TokenService,
  ) {}

  @ApiOperation({ summary: 'Create organization' })
  @ApiCreatedResponse({
    description: 'Organization created successfully',
    type: CreateOrganizationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: UnauthorizedDto,
  })
  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(createOrganizationBodySchema))
    data: CreateOrganizationBodyDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { organization } = await this.createOrganizationService.execute(
      user.userId,
      data.name,
    );

    const tokens = await this.tokenService.revokeAndIssue(user.userId, {
      organizationSelection: OrganizationSelection.BOUND,
      organizationId: organization.id,
    });
    this.tokenService.setAuthCookies(res, tokens);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Organization created successfully',
      result: organization,
    };
  }
}
