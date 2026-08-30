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
import { FetchMachinesQueryDto } from '../dtos/request/machine-request.dto';
import { FetchMachinesResponseDto } from '../dtos/response/machine-response.dto';
import { FetchMachinesService } from '../services/fetch-machines.service';

const fetchMachinesSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().optional(),
  active: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('name'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('asc'),
});

@ApiTags('Machine')
@FarmScoped()
@Controller('/machines')
export class FetchMachinesController {
  constructor(private readonly fetchMachinesService: FetchMachinesService) {}

  @ApiOperation({ summary: 'List machines' })
  @ApiOkResponse({
    description: 'Machines retrieved successfully',
    type: FetchMachinesResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid query',
    type: BadRequestDto,
  })
  @Get()
  async fetch(
    @FarmId() farmId: string,
    @Query(new ZodValidationPipe(fetchMachinesSchema))
    query: FetchMachinesQueryDto,
  ) {
    return await this.fetchMachinesService.execute({
      ...query,
      farmId,
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      orderBy: query.orderBy ?? 'name',
      orderDirection: (query.orderDirection ?? 'asc') as 'asc' | 'desc',
    });
  }
}
