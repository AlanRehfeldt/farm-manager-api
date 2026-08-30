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
import { FetchCropsQueryDto } from '../dtos/request/crop-request.dto';
import { FetchCropsResponseDto } from '../dtos/response/crop-response.dto';
import { FetchCropsService } from '../services/fetch-crops.service';

const fetchCropsSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('name'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('asc'),
});

@ApiTags('Crop')
@FarmScoped()
@Controller('/crops')
export class FetchCropsController {
  constructor(private readonly fetchCropsService: FetchCropsService) {}

  @ApiOperation({ summary: 'List crops' })
  @ApiOkResponse({
    description: 'Crops retrieved successfully',
    type: FetchCropsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid query',
    type: BadRequestDto,
  })
  @Get()
  async fetch(
    @OrganizationId() organizationId: string,
    @Query(new ZodValidationPipe(fetchCropsSchema)) query: FetchCropsQueryDto,
  ) {
    return await this.fetchCropsService.execute({
      ...query,
      organizationId,
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      orderBy: query.orderBy ?? 'name',
      orderDirection: (query.orderDirection ?? 'asc') as 'asc' | 'desc',
    });
  }
}
