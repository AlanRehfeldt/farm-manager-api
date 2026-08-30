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
import { FetchActivitiesQueryDto } from '../dtos/request/activity.dto';
import { FetchActivitiesResponseDto } from '../dtos/response/activity-response.dto';
import { FetchActivitiesService } from '../services/fetch-activities.service';

const fetchActivitiesSchema = z.object({
  cropSeasonId: z.uuid(),
  name: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('date'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});

@ApiTags('Activity')
@FarmScoped()
@Controller('/activities')
export class FetchActivitiesController {
  constructor(
    private readonly fetchActivitiesService: FetchActivitiesService,
  ) {}

  @ApiOperation({ summary: 'List activities for a crop season' })
  @ApiOkResponse({
    description: 'Activities retrieved successfully',
    type: FetchActivitiesResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid query',
    type: BadRequestDto,
  })
  @Get()
  async fetch(
    @FarmId() farmId: string,
    @Query(new ZodValidationPipe(fetchActivitiesSchema))
    query: FetchActivitiesQueryDto,
  ) {
    return await this.fetchActivitiesService.execute({
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
