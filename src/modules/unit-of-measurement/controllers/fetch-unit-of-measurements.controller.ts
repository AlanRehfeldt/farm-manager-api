import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { FetchUnitOfMeasurementsService } from '../services/fetch-unit-of-measurement.service';
import { FetchUnitOfMeasurementsQueryDto } from '../dtos/request/fetch-unit-of-measurements.dto';
import { FetchUnitOfMeasurementsResponseDto } from '../dtos/response/fetch-unit-of-measurements.dto';

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
@Controller('/unit-of-measurements')
export class FetchUnitOfMeasurementsController {
  constructor(
    private readonly fetchUnitOfMeasurementsService: FetchUnitOfMeasurementsService,
  ) {}

  @ApiOperation({ summary: 'List unit of measurements' })
  @ApiOkResponse({
    description: 'Unit of measurements retrived successfully',
    type: FetchUnitOfMeasurementsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @Get()
  @UsePipes(new ZodValidationPipe(fetchUnitOfMeasurementsSchema))
  async fetch(@Query() query: FetchUnitOfMeasurementsQueryDto) {
    try {
      const { results, total, page, perPage, orderBy, orderDirection } =
        await this.fetchUnitOfMeasurementsService.execute(query);

      return {
        results,
        total,
        page,
        perPage,
        orderBy,
        orderDirection,
      };
    } catch (error) {
      console.error('Error fetching unit of measurements', error);
      throw error;
    }
  }
}
