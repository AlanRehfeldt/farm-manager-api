import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmAdmin } from 'src/common/tenancy/farm-admin.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { CreateProductBodyDto } from '../dtos/request/create-product.dto';
import { CreateProductResponseDto } from '../dtos/response/create-product.dto';
import { CreateProductService } from '../services/create-product.service';

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
  costCategoryId: z.uuid(),
  farmId: z.uuid().nullable().optional(),
});

@ApiTags('Product')
@FarmScoped()
@FarmAdmin()
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
  async create(
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @Body(new ZodValidationPipe(createProductBodySchema))
    data: CreateProductBodyDto,
  ) {
    const { product } = await this.createProductService.execute({
      ...data,
      organizationId,
      activeFarmId: farmId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Product created successfully',
      result: product,
    };
  }
}
