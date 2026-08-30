import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
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
import { CropPlantingParamDto } from '../dtos/request/crop-season.dto';
import { DeleteCropPlantingResponseDto } from '../dtos/response/crop-season-response.dto';
import { DeleteCropPlantingService } from '../services/delete-crop-planting.service';

const deleteCropPlantingParamSchema = z.object({ id: z.uuid() });

@ApiTags('CropPlanting')
@FarmScoped()
@Controller('/crop-plantings')
export class DeleteCropPlantingController {
  constructor(
    private readonly deleteCropPlantingService: DeleteCropPlantingService,
  ) {}

  @ApiOperation({ summary: 'Delete crop planting' })
  @ApiOkResponse({
    description: 'Crop planting deleted successfully',
    type: DeleteCropPlantingResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Crop planting or crop season does not exist',
    type: NotFoundDto,
  })
  @ApiConflictResponse({
    description:
      'Conflict: Active crop season must keep at least one planting',
    type: ConflictDto,
  })
  @Delete(':id')
  async delete(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(deleteCropPlantingParamSchema))
    param: CropPlantingParamDto,
  ) {
    await this.deleteCropPlantingService.execute(param.id, farmId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Crop planting deleted successfully',
      result: null,
    };
  }
}
