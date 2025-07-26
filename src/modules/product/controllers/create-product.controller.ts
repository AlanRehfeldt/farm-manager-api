import { Body, Controller, HttpStatus, Post, UsePipes } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { CreateProductService } from '../services/create-product.service';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { CreateProductResponseDto } from '../dtos/response/create-product.dto';
import { CreateProductBodyDto } from '../dtos/request/create-product.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

const createProductBodySchema = z.object({
  name: z
    .string()
    .min(5, { message: 'Name must be at least 5 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' }),
  description: z
    .string()
    .max(250, { message: 'Registration must be at most 250 characters long.' })
    .optional(),
  unitOfMeasurementId: z.uuid(),
});

@ApiTags('Product')
@Controller('/products')
export class CreateProductController {
  constructor(private readonly createProductService: CreateProductService) {}

  @ApiOperation({ summary: 'Create product' })
  @ApiCreatedResponse({
    description: 'Product created successfully',
    type: CreateProductResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Unit of measurement does not exist',
    type: NotFoundDto,
  })
  @Post()
  @UsePipes(new ZodValidationPipe(createProductBodySchema))
  async create(@Body() data: CreateProductBodyDto) {
    try {
      const { product } = await this.createProductService.execute(data);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Product created successfully',
        result: product,
      };
    } catch (error) {
      console.error('Error creating product', error);
      throw error;
    }
  }
}
