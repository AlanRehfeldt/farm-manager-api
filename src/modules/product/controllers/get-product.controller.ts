import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { GetProductService } from '../services/get-product.service';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetProductParamDto } from '../dtos/request/get-product.dto';
import { GetProductResponseDto } from '../dtos/response/get-product.dto';

const getProductParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Product')
@Controller('/products')
export class GetProductController {
  constructor(private readonly getProductService: GetProductService) {}

  @ApiOperation({ summary: 'Get product' })
  @ApiOkResponse({
    description: 'Product retrived successfully',
    type: GetProductResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Product does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @Param(new ZodValidationPipe(getProductParamSchema))
    param: GetProductParamDto,
  ) {
    try {
      const { product } = await this.getProductService.execute(param.id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Product retrived successfully',
        product,
      };
    } catch (error) {
      console.error('Error getting product', error);
      throw error;
    }
  }
}
