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
import { FetchSuppliersService } from '../services/fetch-supplier.service';
import { FetchSuppliersQueryDto } from '../dtos/request/fetch-supplier.dto';
import { FetchSuppliersResponseDto } from '../dtos/response/fetch-supplier.dto';

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
@Controller('/suppliers')
export class FetchSuppliersController {
  constructor(private readonly fetchSuppliersService: FetchSuppliersService) {}

  @ApiOperation({ summary: 'List suppliers' })
  @ApiOkResponse({
    description: 'Suppliers retrived successfully',
    type: FetchSuppliersResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @Get()
  @UsePipes(new ZodValidationPipe(fetchSuppliersSchema))
  async fetch(@Query() query: FetchSuppliersQueryDto) {
    try {
      const { results, total, page, perPage, orderBy, orderDirection } =
        await this.fetchSuppliersService.execute(query);

      return {
        results,
        total,
        page,
        perPage,
        orderBy,
        orderDirection,
      };
    } catch (error) {
      console.error('Error fetching suppliers', error);
      throw error;
    }
  }
}
