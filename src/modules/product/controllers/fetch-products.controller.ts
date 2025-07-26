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
import { FetchProductsService } from '../services/fetch-products.service';
import { FetchProductsQueryDto } from '../dtos/request/fetch-products.dto';
import { FetchProductsResponseDto } from '../dtos/response/fetch-products.dto';

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
@Controller('/products')
export class FetchProductsController {
  constructor(private readonly fetchProductsService: FetchProductsService) {}

  @ApiOperation({ summary: 'List products' })
  @ApiOkResponse({
    description: 'Products retrived successfully',
    type: FetchProductsResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @Get()
  @UsePipes(new ZodValidationPipe(fetchProductsSchema))
  async fetch(@Query() query: FetchProductsQueryDto) {
    try {
      const { results, total, page, perPage, orderBy, orderDirection } =
        await this.fetchProductsService.execute(query);

      return {
        results,
        total,
        page,
        perPage,
        orderBy,
        orderDirection,
      };
    } catch (error) {
      console.error('Error fetching products', error);
      throw error;
    }
  }
}
