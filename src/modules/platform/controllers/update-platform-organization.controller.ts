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
import { PlatformAdmin } from 'src/common/platform/platform-admin.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { optionalNullableBrStateSchema } from 'src/common/validation/br-state';
import { emptyToNull } from 'src/common/validation/empty-to-null';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';
import { UpdatePlatformOrganizationResponseDto } from '../dtos/response/update-platform-organization.dto';
import { UpdatePlatformOrganizationService } from '../services/update-platform-organization.service';

const updatePlatformOrganizationParamSchema = z.object({
  organizationId: z.uuid(),
});

const optionalDigits = (length: number, field: string) =>
  emptyToNull(
    z.string().regex(new RegExp(`^\\d{${length}}$`), {
      message: `${field} must be ${length} digits.`,
    }),
  );

const updatePlatformOrganizationBodySchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' })
    .optional(),
  cnpj: optionalDigits(14, 'CNPJ'),
  phone: emptyToNull(
    z
      .string()
      .regex(/^\d{10,11}$/, { message: 'Phone must be 10 or 11 digits.' }),
  ),
  email: emptyToNull(z.email()),
  street: emptyToNull(z.string().max(200)),
  number: emptyToNull(z.string().max(20)),
  complement: emptyToNull(z.string().max(100)),
  city: emptyToNull(z.string().max(100)),
  state: optionalNullableBrStateSchema,
  zipCode: optionalDigits(8, 'ZIP code'),
});

@ApiTags('Platform')
@PlatformAdmin()
@Controller('/platform/organizations')
export class UpdatePlatformOrganizationController {
  constructor(
    private readonly updatePlatformOrganizationService: UpdatePlatformOrganizationService,
  ) {}

  @ApiOperation({ summary: 'Update organization profile' })
  @ApiOkResponse({
    description: 'Organization updated successfully',
    type: UpdatePlatformOrganizationResponseDto,
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
  @Patch('/:organizationId')
  async update(
    @CurrentUser() actor: AuthenticatedUser,
    @Param(new ZodValidationPipe(updatePlatformOrganizationParamSchema))
    params: { organizationId: string },
    @Body(new ZodValidationPipe(updatePlatformOrganizationBodySchema))
    data: z.infer<typeof updatePlatformOrganizationBodySchema>,
  ) {
    const result = await this.updatePlatformOrganizationService.execute(
      params.organizationId,
      data,
      actor.userId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Organization updated successfully',
      result,
    };
  }
}
