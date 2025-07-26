import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { DeleteProductService } from '../services/delete-product.service';
import { DeleteProductParamDto } from '../dtos/request/delete-product.dto';
import { DeleteProductResponseDto } from '../dtos/response/delete-product.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

const deleteProductParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Product')
@Controller('/products')
export class DeleteProductController {
  constructor(private readonly deleteProductService: DeleteProductService) {}

  @ApiOperation({ summary: 'Delete product' })
  @ApiCreatedResponse({
    description: 'Product deleted successfully',
    type: DeleteProductResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Product does not exist',
    type: NotFoundDto,
  })
  @Delete(':id')
  async delete(
    @Param(new ZodValidationPipe(deleteProductParamSchema))
    param: DeleteProductParamDto,
  ) {
    try {
      await this.deleteProductService.execute(param.id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Product deleted successfully',
        result: null,
      };
    } catch (error) {
      console.error('Error deleting product', error);
      throw error;
    }
  }
}
