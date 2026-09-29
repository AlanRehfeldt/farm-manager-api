import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import z from 'zod';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { ForbiddenDto } from 'src/common/errors/forbidden.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { UnauthorizedDto } from 'src/common/errors/unauthorized.dto';
import { PlatformAdmin } from 'src/common/platform/platform-admin.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';
import { GrantSupportAccessResponseDto } from '../dtos/response/support-access.dto';
import { GrantSupportAccessService } from '../services/grant-support-access.service';

const grantSupportAccessBodySchema = z.object({
  userId: z.uuid(),
  organizationId: z.uuid(),
});

class GrantSupportAccessBodyDto {
  userId!: string;
  organizationId!: string;
}

@ApiTags('Platform')
@PlatformAdmin()
@Controller('/platform/support-access')
export class GrantSupportAccessController {
  constructor(
    private readonly grantSupportAccessService: GrantSupportAccessService,
  ) {}

  @ApiOperation({ summary: 'Grant a support user access to an organization' })
  @ApiCreatedResponse({ type: GrantSupportAccessResponseDto })
  @ApiBadRequestResponse({ type: BadRequestDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedDto })
  @ApiForbiddenResponse({ type: ForbiddenDto })
  @ApiNotFoundResponse({ type: NotFoundDto })
  @ApiConflictResponse({ type: ConflictDto })
  @Post()
  async create(
    @CurrentUser() actor: AuthenticatedUser,
    @Body(new ZodValidationPipe(grantSupportAccessBodySchema))
    data: GrantSupportAccessBodyDto,
  ) {
    const result = await this.grantSupportAccessService.execute(
      actor.userId,
      data,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Support access granted successfully',
      result,
    };
  }
}
