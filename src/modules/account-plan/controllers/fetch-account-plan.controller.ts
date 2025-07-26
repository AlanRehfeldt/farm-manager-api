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
import { FetchAccountPlansService } from '../services/fetch-account-plan.service';
import { FetchAccountPlansQueryDto } from '../dtos/request/fetch-account-plan.dto';
import { FetchAccountPlansResponseDto } from '../dtos/response/fetch-account-plan.dto';

const fetchAccountPlansSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().optional(),
  code: z.string().optional(),
  type: z
    .enum(['ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY'])
    .optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
  orderBy: z.string().optional().default('name'),
  orderDirection: z.string().optional().default('asc'),
});

@ApiTags('AccountPlan')
@Controller('/account-plans')
export class FetchAccountPlansController {
  constructor(
    private readonly fetchAccountPlansService: FetchAccountPlansService,
  ) {}

  @ApiOperation({ summary: 'List account plan' })
  @ApiOkResponse({
    description: 'Account Plan retrived successfully',
    type: FetchAccountPlansResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @Get()
  @UsePipes(new ZodValidationPipe(fetchAccountPlansSchema))
  async fetch(@Query() query: FetchAccountPlansQueryDto) {
    try {
      const { results, total, page, perPage, orderBy, orderDirection } =
        await this.fetchAccountPlansService.execute(query);

      return {
        results,
        total,
        page,
        perPage,
        orderBy,
        orderDirection,
      };
    } catch (error) {
      console.error('Error fetching account plan', error);
      throw error;
    }
  }
}
