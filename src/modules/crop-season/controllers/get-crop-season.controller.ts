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
import { CropSeasonParamDto } from '../dtos/request/crop-season.dto';
import { GetCropSeasonResponseDto } from '../dtos/response/crop-season-response.dto';
import { GetCropSeasonService } from '../services/get-crop-season.service';

const getCropSeasonParamSchema = z.object({ id: z.uuid() });

@ApiTags('CropSeason')
@FarmScoped()
@Controller('/crop-seasons')
export class GetCropSeasonController {
  constructor(private readonly getCropSeasonService: GetCropSeasonService) {}

  @ApiOperation({ summary: 'Get crop season by id' })
  @ApiOkResponse({
    description: 'Crop season retrieved successfully',
    type: GetCropSeasonResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Crop season does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(getCropSeasonParamSchema))
    param: CropSeasonParamDto,
  ) {
    const { cropSeason } = await this.getCropSeasonService.execute(
      param.id,
      farmId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Crop season retrieved successfully',
      result: cropSeason,
    };
  }
}
