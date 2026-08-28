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
import { FetchAccountPlansQueryDto } from '../dtos/request/fetch-account-plan.dto';
import { FetchAccountPlansResponseDto } from '../dtos/response/fetch-account-plan.dto';
import { FetchAccountPlansService } from '../services/fetch-account-plan.service';

const fetchAccountPlansSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  code: z.string().optional(),
  parentId: z.uuid().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('name'),
  orderDirection: z.string().optional().default('asc'),
});

@ApiTags('AccountPlan')
@FarmScoped()
@Controller('/account-plans')
export class FetchAccountPlansController {
  constructor(
    private readonly fetchAccountPlansService: FetchAccountPlansService,
  ) {}

  @ApiOperation({ summary: 'List account plan' })
  @ApiOkResponse({
    description: 'Account Plan retrieved successfully',
    type: FetchAccountPlansResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @Get()
  async fetch(
    @OrganizationId() organizationId: string,
    @Query(new ZodValidationPipe(fetchAccountPlansSchema))
    query: FetchAccountPlansQueryDto,
  ) {
    const { results, total, page, perPage, orderBy, orderDirection } =
      await this.fetchAccountPlansService.execute({
        ...query,
        organizationId,
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
