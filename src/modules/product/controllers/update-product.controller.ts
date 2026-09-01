import { Body, Controller, HttpStatus, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
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
import {
  UpdateProductBodyDto,
  UpdateProductParamDto,
} from '../dtos/request/update-product.dto';
import { UpdateProductResponseDto } from '../dtos/response/update-product.dto';
import { UpdateProductService } from '../services/update-product.service';

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
  costCategoryId: z.uuid().optional(),
});

@ApiTags('Product')
@FarmScoped()
@FarmAdmin()
@Controller('/products')
export class UpdateProductController {
  constructor(private readonly updateProductService: UpdateProductService) {}

  @ApiOperation({ summary: 'Update product' })
  @ApiOkResponse({
    description: 'Product updated successfully',
    type: UpdateProductResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Product does not exist',
    type: NotFoundDto,
  })
  @Put(':id')
  async update(
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(updateProductParamSchema))
    param: UpdateProductParamDto,
    @Body(new ZodValidationPipe(updateProductSchema))
    data: UpdateProductBodyDto,
  ) {
    const { product } = await this.updateProductService.execute(
      organizationId,
      farmId,
      {
        id: param.id,
        ...data,
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Product updated successfully',
      result: product,
    };
  }
}
