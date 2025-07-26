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
import { DeleteSupplierService } from '../services/delete-supplier.service';
import { DeleteSupplierParamDto } from '../dtos/request/delete-supplier.dto';
import { DeleteSupplierResponseDto } from '../dtos/response/delete-supplier.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

const deleteSupplierParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Supplier')
@Controller('/suppliers')
export class DeleteSupplierController {
  constructor(private readonly deleteSupplierService: DeleteSupplierService) {}

  @ApiOperation({ summary: 'Delete supplier' })
  @ApiCreatedResponse({
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
    @Param(new ZodValidationPipe(deleteSupplierParamSchema))
    param: DeleteSupplierParamDto,
  ) {
    try {
      await this.deleteSupplierService.execute(param.id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Supplier deleted successfully',
        result: null,
      };
    } catch (error) {
      console.error('Error deleting supplier', error);
      throw error;
    }
  }
}
