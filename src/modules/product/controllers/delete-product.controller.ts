import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
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
import { DeleteProductParamDto } from '../dtos/request/delete-product.dto';
import { DeleteProductResponseDto } from '../dtos/response/delete-product.dto';
import { DeleteProductService } from '../services/delete-product.service';

const deleteProductParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Product')
@FarmScoped()
@FarmAdmin()
@Controller('/products')
export class DeleteProductController {
  constructor(private readonly deleteProductService: DeleteProductService) {}

  @ApiOperation({ summary: 'Delete product' })
  @ApiOkResponse({
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
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(deleteProductParamSchema))
    param: DeleteProductParamDto,
  ) {
    await this.deleteProductService.execute(param.id, organizationId, farmId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Product deleted successfully',
      result: null,
    };
  }
}
