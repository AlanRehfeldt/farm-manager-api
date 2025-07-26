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
import { FetchCostCentersService } from '../services/fetch-cost-center.service';
import { FetchCostCentersQueryDto } from '../dtos/request/fetch-cost-centers.dto';
import { FetchCostCentersResponseDto } from '../dtos/response/fetch-cost-centers.dto';

const fetchCostCentersSchema = z.object({
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

@ApiTags('CostCenter')
@Controller('/cost-centers')
export class FetchCostCentersController {
  constructor(
    private readonly fetchCostCentersService: FetchCostCentersService,
  ) {}

  @ApiOperation({ summary: 'List cost centers' })
  @ApiOkResponse({
    description: 'Cost centers retrived successfully',
    type: FetchCostCentersResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @Get()
  @UsePipes(new ZodValidationPipe(fetchCostCentersSchema))
  async fetch(@Query() query: FetchCostCentersQueryDto) {
    try {
      const { results, total, page, perPage, orderBy, orderDirection } =
        await this.fetchCostCentersService.execute(query);

      return {
        results,
        total,
        page,
        perPage,
        orderBy,
        orderDirection,
      };
    } catch (error) {
      console.error('Error fetching cost centers', error);
      throw error;
    }
  }
}
