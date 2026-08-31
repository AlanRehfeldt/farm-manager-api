import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { FetchHarvestsQueryDto } from '../dtos/request/harvest.dto';
import { FetchHarvestsResponseDto } from '../dtos/response/harvest-response.dto';
import { FetchHarvestsService } from '../services/fetch-harvests.service';

const fetchHarvestsSchema = z.object({
  cropSeasonId: z.uuid(),
  name: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('date'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});

@ApiTags('Harvest')
@FarmScoped()
@Controller('/harvests')
export class FetchHarvestsController {
  constructor(private readonly fetchHarvestsService: FetchHarvestsService) {}

  @ApiOperation({ summary: 'List harvests for a crop season' })
  @ApiOkResponse({
    description: 'Harvests retrieved successfully',
    type: FetchHarvestsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid query',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Crop season does not exist',
    type: NotFoundDto,
  })
  @Get()
  async fetch(
    @FarmId() farmId: string,
    @Query(new ZodValidationPipe(fetchHarvestsSchema))
    query: FetchHarvestsQueryDto,
  ) {
    return await this.fetchHarvestsService.execute({
      farmId,
      cropSeasonId: query.cropSeasonId,
      name: query.name,
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      orderBy: query.orderBy ?? 'date',
      orderDirection: (query.orderDirection ?? 'desc') as 'asc' | 'desc',
    });
  }
}
