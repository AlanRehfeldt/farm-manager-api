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
import { FetchEmployeesService } from '../services/fetch-employee.service';
import { FetchEmployeesQueryDto } from '../dtos/request/fetch-employees.dto';
import { FetchEmployeesResponseDto } from '../dtos/response/fetch-employees.dto';

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
@Controller('/employees')
export class FetchEmployeesController {
  constructor(private readonly fetchEmployeesService: FetchEmployeesService) {}

  @ApiOperation({ summary: 'List employees' })
  @ApiOkResponse({
    description: 'Employees retrived successfully',
    type: FetchEmployeesResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @Get()
  @UsePipes(new ZodValidationPipe(fetchEmployeesSchema))
  async fetch(@Query() query: FetchEmployeesQueryDto) {
    try {
      const { results, total, page, perPage, orderBy, orderDirection } =
        await this.fetchEmployeesService.execute(query);

      return {
        results,
        total,
        page,
        perPage,
        orderBy,
        orderDirection,
      };
    } catch (error) {
      console.error('Error fetching employees', error);
      throw error;
    }
  }
}
