import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CropSeasonStatus } from '@prisma/client';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { FetchCropSeasonsQueryDto } from '../dtos/request/crop-season.dto';
import { FetchCropSeasonsResponseDto } from '../dtos/response/crop-season-response.dto';
import { FetchCropSeasonsService } from '../services/fetch-crop-seasons.service';

const fetchCropSeasonsSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'CLOSED']).optional(),
  cropId: z.uuid().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('name'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('asc'),
});

@ApiTags('CropSeason')
@FarmScoped()
@Controller('/crop-seasons')
export class FetchCropSeasonsController {
  constructor(
    private readonly fetchCropSeasonsService: FetchCropSeasonsService,
  ) {}

  @ApiOperation({ summary: 'List crop seasons' })
  @ApiOkResponse({
    description: 'Crop seasons retrieved successfully',
    type: FetchCropSeasonsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid query',
    type: BadRequestDto,
  })
  @Get()
  async fetch(
    @FarmId() farmId: string,
    @Query(new ZodValidationPipe(fetchCropSeasonsSchema))
    query: FetchCropSeasonsQueryDto,
  ) {
    return await this.fetchCropSeasonsService.execute({
      id: query.id,
      name: query.name,
      status: query.status as CropSeasonStatus | undefined,
      cropId: query.cropId,
      farmId,
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      orderBy: query.orderBy ?? 'name',
      orderDirection: (query.orderDirection ?? 'asc') as 'asc' | 'desc',
    });
  }
}
