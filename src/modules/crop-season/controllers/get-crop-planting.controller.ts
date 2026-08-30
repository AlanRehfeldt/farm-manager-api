import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
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
import { CropPlantingParamDto } from '../dtos/request/crop-season.dto';
import { GetCropPlantingResponseDto } from '../dtos/response/crop-season-response.dto';
import { GetCropPlantingService } from '../services/get-crop-planting.service';

const getCropPlantingParamSchema = z.object({ id: z.uuid() });

@ApiTags('CropPlanting')
@FarmScoped()
@Controller('/crop-plantings')
export class GetCropPlantingController {
  constructor(
    private readonly getCropPlantingService: GetCropPlantingService,
  ) {}

  @ApiOperation({ summary: 'Get crop planting by id' })
  @ApiOkResponse({
    description: 'Crop planting retrieved successfully',
    type: GetCropPlantingResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Crop planting does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(getCropPlantingParamSchema))
    param: CropPlantingParamDto,
  ) {
    const { cropPlanting } = await this.getCropPlantingService.execute(
      param.id,
      farmId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Crop planting retrieved successfully',
      result: cropPlanting,
    };
  }
}
