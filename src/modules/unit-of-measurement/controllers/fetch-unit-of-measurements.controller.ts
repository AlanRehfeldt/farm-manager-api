import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { FetchUnitOfMeasurementsQueryDto } from '../dtos/request/fetch-unit-of-measurements.dto';
import { FetchUnitOfMeasurementsResponseDto } from '../dtos/response/fetch-unit-of-measurements.dto';
import { FetchUnitOfMeasurementsService } from '../services/fetch-unit-of-measurement.service';

const fetchUnitOfMeasurementsSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().optional(),
  acronym: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('name'),
  orderDirection: z.string().optional().default('asc'),
});

@ApiTags('UnitOfMeasurement')
@FarmScoped()
@Controller('/unit-of-measurements')
export class FetchUnitOfMeasurementsController {
  constructor(
    private readonly fetchUnitOfMeasurementsService: FetchUnitOfMeasurementsService,
  ) {}

  @ApiOperation({ summary: 'List unit of measurements' })
  @ApiOkResponse({
    description: 'Unit of measurements retrieved successfully',
    type: FetchUnitOfMeasurementsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @Get()
  async fetch(
    @OrganizationId() organizationId: string,
    @Query(new ZodValidationPipe(fetchUnitOfMeasurementsSchema))
    query: FetchUnitOfMeasurementsQueryDto,
  ) {
    return this.fetchUnitOfMeasurementsService.execute({
      ...query,
      organizationId,
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      orderBy: query.orderBy ?? 'name',
      orderDirection: query.orderDirection ?? 'asc',
    });
  }
}
