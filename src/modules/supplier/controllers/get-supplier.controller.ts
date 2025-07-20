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
import { GetSupplierService } from '../services/get-supplier.service';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetSupplierParamDto } from '../dtos/request/get-supplier.dto';
import { GetSupplierResponseDto } from '../dtos/response/get-supplier.dto';

const getSupplierParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Supplier')
@Controller('/suppliers')
export class GetSupplierController {
  constructor(private readonly getSupplierService: GetSupplierService) {}

  @ApiOperation({ summary: 'Get supplier' })
  @ApiOkResponse({
    description: 'Supplier retrived successfully',
    type: GetSupplierResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Supplier does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @Param(new ZodValidationPipe(getSupplierParamSchema))
    param: GetSupplierParamDto,
  ) {
    try {
      const { supplier } = await this.getSupplierService.execute(param.id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Supplier retrived successfully',
        supplier,
      };
    } catch (error) {
      console.error('Error getting supplier', error);
      throw error;
    }
  }
}
