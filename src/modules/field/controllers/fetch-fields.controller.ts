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
import { FetchFieldsQueryDto } from '../dtos/request/field-request.dto';
import { FetchFieldsResponseDto } from '../dtos/response/field-response.dto';
import { FetchFieldsService } from '../services/fetch-fields.service';

const fetchFieldsSchema = z.object({
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

@ApiTags('Field')
@FarmScoped()
@Controller('/fields')
export class FetchFieldsController {
  constructor(private readonly fetchFieldsService: FetchFieldsService) {}

  @ApiOperation({ summary: 'List fields' })
  @ApiOkResponse({
    description: 'Fields retrieved successfully',
    type: FetchFieldsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid query',
    type: BadRequestDto,
  })
  @Get()
  async fetch(
    @FarmId() farmId: string,
    @Query(new ZodValidationPipe(fetchFieldsSchema)) query: FetchFieldsQueryDto,
  ) {
    return await this.fetchFieldsService.execute({
      ...query,
      farmId,
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      orderBy: query.orderBy ?? 'name',
      orderDirection: (query.orderDirection ?? 'asc') as 'asc' | 'desc',
    });
  }
}
