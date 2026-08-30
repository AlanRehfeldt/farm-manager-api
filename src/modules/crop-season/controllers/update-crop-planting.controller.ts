import { Body, Controller, HttpStatus, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import {
  CropPlantingParamDto,
  UpdateCropPlantingBodyDto,
} from '../dtos/request/crop-season.dto';
import { UpdateCropPlantingResponseDto } from '../dtos/response/crop-season-response.dto';
import { UpdateCropPlantingService } from '../services/update-crop-planting.service';

const updateCropPlantingParamSchema = z.object({ id: z.uuid() });

const updateCropPlantingBodySchema = z.object({
  varietyId: z.uuid().optional().nullable(),
  plantedAreaHa: z.union([z.string(), z.number()]).optional().nullable(),
});

@ApiTags('CropPlanting')
@FarmScoped()
@Controller('/crop-plantings')
export class UpdateCropPlantingController {
  constructor(
    private readonly updateCropPlantingService: UpdateCropPlantingService,
  ) {}

  @ApiOperation({ summary: 'Update crop planting' })
  @ApiOkResponse({
    description: 'Crop planting updated successfully',
    type: UpdateCropPlantingResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Closed crop season plantings cannot be updated',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description:
      'Not found: Crop planting, crop season, or variety does not exist',
    type: NotFoundDto,
  })
  @Put(':id')
  async update(
    @FarmId() farmId: string,
    @OrganizationId() organizationId: string,
    @Param(new ZodValidationPipe(updateCropPlantingParamSchema))
    param: CropPlantingParamDto,
    @Body(new ZodValidationPipe(updateCropPlantingBodySchema))
    data: UpdateCropPlantingBodyDto,
  ) {
    const { cropPlanting } = await this.updateCropPlantingService.execute({
      id: param.id,
      ...data,
      farmId,
      organizationId,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Crop planting updated successfully',
      result: cropPlanting,
    };
  }
}
