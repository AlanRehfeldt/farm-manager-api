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
import { FetchEmployeesQueryDto } from '../dtos/request/fetch-employees.dto';
import { FetchEmployeesResponseDto } from '../dtos/response/fetch-employees.dto';
import { FetchEmployeesService } from '../services/fetch-employee.service';

const fetchEmployeesSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().optional(),
  registration: z.string().optional(),
  type: z
    .enum([
      'FARM_MANAGER',
      'AGRONOMIST',
      'VETERINARIAN',
      'MACHINE_OPERATOR',
      'FIELD_WORKER',
      'LIVESTOCK_HANDLER',
      'IRRIGATION_TECHNICIAN',
      'ADMINISTRATIVE_ASSISTANT',
      'DRIVER',
      'SECURITY_GUARD',
      'TEMPORARY_WORKER',
      'OTHER',
    ])
    .optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('name'),
  orderDirection: z.string().optional().default('asc'),
});

@ApiTags('Employee')
@FarmScoped()
@Controller('/employees')
export class FetchEmployeesController {
  constructor(private readonly fetchEmployeesService: FetchEmployeesService) {}

  @ApiOperation({ summary: 'List employees' })
  @ApiOkResponse({
    description: 'Employees retrieved successfully',
    type: FetchEmployeesResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @Get()
  async fetch(
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @Query(new ZodValidationPipe(fetchEmployeesSchema))
    query: FetchEmployeesQueryDto,
  ) {
    const { results, total, page, perPage, orderBy, orderDirection } =
      await this.fetchEmployeesService.execute({
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
