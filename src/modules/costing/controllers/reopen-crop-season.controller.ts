import { Body, Controller, HttpStatus, Param, Patch } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmAdmin } from 'src/common/tenancy/farm-admin.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { ReopenCropSeasonResponseDto } from '../dtos/response/costing-response.dto';
import { ReopenCropSeasonService } from '../services/reopen-crop-season.service';

const paramSchema = z.object({ id: z.uuid() });

const bodySchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, 'Reason must have at least 3 characters')
    .max(500, 'Reason must have at most 500 characters'),
});

@ApiTags('Costing')
@FarmScoped()
@FarmAdmin()
@Controller('/crop-seasons')
export class ReopenCropSeasonController {
  constructor(
    private readonly reopenCropSeasonService: ReopenCropSeasonService,
  ) {}

  @ApiOperation({
    summary: 'Reopen closed crop season and invalidate snapshot',
  })
  @ApiOkResponse({
    description: 'Crop season reopened successfully',
    type: ReopenCropSeasonResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Crop season does not exist',
    type: NotFoundDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Crop season is not closed',
    type: ConflictDto,
  })
  @Patch(':id/reopen')
  async reopen(
    @FarmId() farmId: string,
    @CurrentUser() user: { userId: string },
    @Param(new ZodValidationPipe(paramSchema)) param: { id: string },
    @Body(new ZodValidationPipe(bodySchema)) body: z.infer<typeof bodySchema>,
  ) {
    const { costing } = await this.reopenCropSeasonService.execute(
      param.id,
      farmId,
      body.reason,
      user.userId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Crop season reopened successfully',
      result: costing,
    };
  }
}
