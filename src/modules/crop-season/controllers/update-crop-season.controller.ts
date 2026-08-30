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
  CropSeasonParamDto,
  UpdateCropSeasonBodyDto,
} from '../dtos/request/crop-season.dto';
import { UpdateCropSeasonResponseDto } from '../dtos/response/crop-season-response.dto';
import { UpdateCropSeasonService } from '../services/update-crop-season.service';

const updateCropSeasonParamSchema = z.object({ id: z.uuid() });

const updateCropSeasonBodySchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name must be at least 1 character long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' })
    .optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  productionUomId: z.uuid().optional(),
  referenceSalePriceInCents: z.number().int().min(0).optional().nullable(),
});

@ApiTags('CropSeason')
@FarmScoped()
@Controller('/crop-seasons')
export class UpdateCropSeasonController {
  constructor(
    private readonly updateCropSeasonService: UpdateCropSeasonService,
  ) {}

  @ApiOperation({ summary: 'Update crop season' })
  @ApiOkResponse({
    description: 'Crop season updated successfully',
    type: UpdateCropSeasonResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Closed crop season cannot be updated',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Crop season or unit of measurement does not exist',
    type: NotFoundDto,
  })
  @Put(':id')
  async update(
    @FarmId() farmId: string,
    @OrganizationId() organizationId: string,
    @Param(new ZodValidationPipe(updateCropSeasonParamSchema))
    param: CropSeasonParamDto,
    @Body(new ZodValidationPipe(updateCropSeasonBodySchema))
    data: UpdateCropSeasonBodyDto,
  ) {
    const { cropSeason } = await this.updateCropSeasonService.execute({
      id: param.id,
      ...data,
      farmId,
      organizationId,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Crop season updated successfully',
      result: cropSeason,
    };
  }
}
