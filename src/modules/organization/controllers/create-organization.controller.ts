import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import z from 'zod';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
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
  ) {
    const { organization } = await this.createOrganizationService.execute(
      user.userId,
      data.name,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Organization created successfully',
      result: organization,
    };
  }
}
