import { Body, Controller, HttpStatus, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { UpdateProductService } from '../services/update-product.service';
import { UpdateProductResponseDto } from '../dtos/response/update-product.dto';
import {
  UpdateProductBodyDto,
  UpdateProductParamDto,
} from '../dtos/request/update-product.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

const updateProductParamSchema = z.object({
  id: z.uuid(),
});

const updateProductSchema = z.object({
  name: z
    .string()
    .min(5, { message: 'Name must be at least 5 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' })
    .optional(),
  description: z
    .string()
    .max(250, { message: 'Description must be at most 250 characters long.' })
    .optional(),
  unitOfMeasurementId: z.uuid().optional(),
});

@ApiTags('Product')
@Controller('/products')
export class UpdateProductController {
  constructor(private readonly updateProductService: UpdateProductService) {}

  @ApiOperation({ summary: 'Update product' })
  @ApiCreatedResponse({
    description: 'Product updated successfully',
    type: UpdateProductResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Registration already exists',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Product does not exist',
    type: NotFoundDto,
  })
  @Put(':id')
  async update(
    @Param(new ZodValidationPipe(updateProductParamSchema))
    param: UpdateProductParamDto,
    @Body(new ZodValidationPipe(updateProductSchema))
    data: UpdateProductBodyDto,
  ) {
    try {
      const { product } = await this.updateProductService.execute({
        id: param.id,
        ...data,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Product updated successfully',
        product,
      };
    } catch (error) {
      console.error('Error updating product', error);
      throw error;
    }
  }
}
