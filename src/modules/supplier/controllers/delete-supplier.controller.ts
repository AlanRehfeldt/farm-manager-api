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
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { DeleteSupplierParamDto } from '../dtos/request/delete-supplier.dto';
import { DeleteSupplierResponseDto } from '../dtos/response/delete-supplier.dto';
import { DeleteSupplierService } from '../services/delete-supplier.service';

const deleteSupplierParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Supplier')
@FarmScoped()
@Controller('/suppliers')
export class DeleteSupplierController {
  constructor(private readonly deleteSupplierService: DeleteSupplierService) {}

  @ApiOperation({ summary: 'Delete supplier' })
  @ApiOkResponse({
    description: 'Supplier deleted successfully',
    type: DeleteSupplierResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Supplier does not exist',
    type: NotFoundDto,
  })
  @Delete(':id')
  async delete(
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(deleteSupplierParamSchema))
    param: DeleteSupplierParamDto,
  ) {
    await this.deleteSupplierService.execute(param.id, organizationId, farmId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Supplier deleted successfully',
      result: null,
    };
  }
}
