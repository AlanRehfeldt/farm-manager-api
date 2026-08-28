import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetProductParamDto } from '../dtos/request/get-product.dto';
import { GetProductResponseDto } from '../dtos/response/get-product.dto';
import { GetProductService } from '../services/get-product.service';

const getProductParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Product')
@FarmScoped()
@Controller('/products')
export class GetProductController {
  constructor(private readonly getProductService: GetProductService) {}

  @ApiOperation({ summary: 'Get product' })
  @ApiOkResponse({
    description: 'Product retrieved successfully',
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
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(getProductParamSchema))
    param: GetProductParamDto,
  ) {
    const { product } = await this.getProductService.execute(
      param.id,
      organizationId,
      farmId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Product retrieved successfully',
      result: product,
    };
  }
}
