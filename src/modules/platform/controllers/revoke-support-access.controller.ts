import {
  Controller,
  Delete,
  HttpStatus,
  Param,
} from '@nestjs/common';
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
import {
  AuthenticatedUser,
  CurrentUser,
} from 'src/modules/auth/decorators/current-user.decorator';
import { RevokeSupportAccessResponseDto } from '../dtos/response/support-access.dto';
import { RevokeSupportAccessService } from '../services/revoke-support-access.service';

const revokeSupportAccessParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Platform')
@PlatformAdmin()
@Controller('/platform/support-access')
export class RevokeSupportAccessController {
  constructor(
    private readonly revokeSupportAccessService: RevokeSupportAccessService,
  ) {}

  @ApiOperation({ summary: 'Revoke a support access grant' })
  @ApiOkResponse({ type: RevokeSupportAccessResponseDto })
  @ApiUnauthorizedResponse({ type: UnauthorizedDto })
  @ApiForbiddenResponse({ type: ForbiddenDto })
  @ApiNotFoundResponse({ type: NotFoundDto })
  @Delete('/:id')
  async revoke(
    @CurrentUser() actor: AuthenticatedUser,
    @Param(new ZodValidationPipe(revokeSupportAccessParamSchema))
    params: { id: string },
  ) {
    const result = await this.revokeSupportAccessService.execute(
      params.id,
      actor.userId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Support access revoked successfully',
      result,
    };
  }
}
