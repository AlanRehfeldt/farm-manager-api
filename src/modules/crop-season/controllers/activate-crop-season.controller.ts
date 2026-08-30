import { Controller, HttpStatus, Param, Patch } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { CropSeasonParamDto } from '../dtos/request/crop-season.dto';
import { ActivateCropSeasonResponseDto } from '../dtos/response/crop-season-response.dto';
import { ActivateCropSeasonService } from '../services/activate-crop-season.service';

const activateCropSeasonParamSchema = z.object({ id: z.uuid() });

@ApiTags('CropSeason')
@FarmScoped()
@Controller('/crop-seasons')
export class ActivateCropSeasonController {
  constructor(
    private readonly activateCropSeasonService: ActivateCropSeasonService,
  ) {}

  @ApiOperation({ summary: 'Activate crop season' })
  @ApiOkResponse({
    description: 'Crop season activated successfully',
    type: ActivateCropSeasonResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Crop season does not exist',
    type: NotFoundDto,
  })
  @ApiConflictResponse({
    description:
      'Conflict: Crop season is already active, closed, or has no plantings',
    type: ConflictDto,
  })
  @Patch(':id/activate')
  async activate(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(activateCropSeasonParamSchema))
    param: CropSeasonParamDto,
  ) {
    const { cropSeason } = await this.activateCropSeasonService.execute(
      param.id,
      farmId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Crop season activated successfully',
      result: cropSeason,
    };
  }
}
