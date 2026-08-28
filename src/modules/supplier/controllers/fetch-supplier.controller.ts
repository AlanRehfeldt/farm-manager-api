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
import { FetchSuppliersQueryDto } from '../dtos/request/fetch-supplier.dto';
import { FetchSuppliersResponseDto } from '../dtos/response/fetch-supplier.dto';
import { FetchSuppliersService } from '../services/fetch-supplier.service';

const fetchSuppliersSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().optional(),
  cnpj: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('name'),
  orderDirection: z.string().optional().default('asc'),
});

@ApiTags('Supplier')
@FarmScoped()
@Controller('/suppliers')
export class FetchSuppliersController {
  constructor(private readonly fetchSuppliersService: FetchSuppliersService) {}

  @ApiOperation({ summary: 'List suppliers' })
  @ApiOkResponse({
    description: 'Suppliers retrieved successfully',
    type: FetchSuppliersResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @Get()
  async fetch(
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @Query(new ZodValidationPipe(fetchSuppliersSchema))
    query: FetchSuppliersQueryDto,
  ) {
    const { results, total, page, perPage, orderBy, orderDirection } =
      await this.fetchSuppliersService.execute({
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
