import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { CropSeasonParamDto } from '../dtos/request/crop-season.dto';
import { DeleteCropSeasonResponseDto } from '../dtos/response/crop-season-response.dto';
import { DeleteCropSeasonService } from '../services/delete-crop-season.service';

const deleteCropSeasonParamSchema = z.object({ id: z.uuid() });

@ApiTags('CropSeason')
@FarmScoped()
@Controller('/crop-seasons')
export class DeleteCropSeasonController {
  constructor(
    private readonly deleteCropSeasonService: DeleteCropSeasonService,
  ) {}

  @ApiOperation({ summary: 'Delete crop season' })
  @ApiOkResponse({
    description: 'Crop season deleted successfully',
    type: DeleteCropSeasonResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Crop season does not exist',
    type: NotFoundDto,
  })
  @Delete(':id')
  async delete(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(deleteCropSeasonParamSchema))
    param: CropSeasonParamDto,
  ) {
    await this.deleteCropSeasonService.execute(param.id, farmId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Crop season deleted successfully',
      result: null,
    };
  }
}
