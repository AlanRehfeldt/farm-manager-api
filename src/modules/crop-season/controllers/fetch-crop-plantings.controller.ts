import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { FetchCropPlantingsQueryDto } from '../dtos/request/crop-season.dto';
import { FetchCropPlantingsResponseDto } from '../dtos/response/crop-season-response.dto';
import { FetchCropPlantingsService } from '../services/fetch-crop-plantings.service';

const fetchCropPlantingsSchema = z.object({
  id: z.uuid().optional(),
  cropSeasonId: z.uuid().optional(),
  fieldId: z.uuid().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('createdAt'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});

@ApiTags('CropPlanting')
@FarmScoped()
@Controller('/crop-plantings')
export class FetchCropPlantingsController {
  constructor(
    private readonly fetchCropPlantingsService: FetchCropPlantingsService,
  ) {}

  @ApiOperation({ summary: 'List crop plantings' })
  @ApiOkResponse({
    description: 'Crop plantings retrieved successfully',
    type: FetchCropPlantingsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid query',
    type: BadRequestDto,
  })
  @Get()
  async fetch(
    @FarmId() farmId: string,
    @Query(new ZodValidationPipe(fetchCropPlantingsSchema))
    query: FetchCropPlantingsQueryDto,
  ) {
    return await this.fetchCropPlantingsService.execute({
      ...query,
      farmId,
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      orderBy: query.orderBy ?? 'createdAt',
      orderDirection: (query.orderDirection ?? 'desc') as 'asc' | 'desc',
    });
  }
}
