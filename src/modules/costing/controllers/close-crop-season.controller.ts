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
import { CloseCropSeasonResponseDto } from '../dtos/response/costing-response.dto';
import { CloseCropSeasonService } from '../services/close-crop-season.service';

const paramSchema = z.object({ id: z.uuid() });

@ApiTags('Costing')
@FarmScoped()
@FarmAdmin()
@Controller('/crop-seasons')
export class CloseCropSeasonController {
  constructor(
    private readonly closeCropSeasonService: CloseCropSeasonService,
  ) {}

  @ApiOperation({ summary: 'Close crop season and create costing snapshot' })
  @ApiOkResponse({
    description: 'Crop season closed successfully',
    type: CloseCropSeasonResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Crop season does not exist',
    type: NotFoundDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Crop season is already closed or not active',
    type: ConflictDto,
  })
  @Patch(':id/close')
  async close(
    @FarmId() farmId: string,
    @CurrentUser() user: { userId: string },
    @Param(new ZodValidationPipe(paramSchema)) param: { id: string },
  ) {
    const { costing } = await this.closeCropSeasonService.execute(
      param.id,
      farmId,
      user.userId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Crop season closed successfully',
      result: costing,
    };
  }
}
