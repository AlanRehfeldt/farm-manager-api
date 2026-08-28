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
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { FetchProductsQueryDto } from '../dtos/request/fetch-products.dto';
import { FetchProductsResponseDto } from '../dtos/response/fetch-products.dto';
import { FetchProductsService } from '../services/fetch-products.service';

const fetchProductsSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  unitOfMeasurementId: z.uuid().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('name'),
  orderDirection: z.string().optional().default('asc'),
});

@ApiTags('Product')
@FarmScoped()
@Controller('/products')
export class FetchProductsController {
  constructor(private readonly fetchProductsService: FetchProductsService) {}

  @ApiOperation({ summary: 'List products' })
  @ApiOkResponse({
    description: 'Products retrieved successfully',
    type: FetchProductsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @Get()
  async fetch(
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @Query(new ZodValidationPipe(fetchProductsSchema))
    query: FetchProductsQueryDto,
  ) {
    const { results, total, page, perPage, orderBy, orderDirection } =
      await this.fetchProductsService.execute({
        ...query,
        organizationId,
        farmId,
        page: query.page ?? 1,
        perPage: query.perPage ?? 10,
        orderBy: query.orderBy ?? 'name',
        orderDirection: query.orderDirection ?? 'asc',
      });

    return {
      results,
      total,
      page,
      perPage,
      orderBy,
      orderDirection,
    };
  }
}
