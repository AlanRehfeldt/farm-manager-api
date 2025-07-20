import { Body, Controller, HttpStatus, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { UpdateSupplierService } from '../services/update-supplier.service';
import { UpdateSupplierResponseDto } from '../dtos/response/update-supplier.dto';
import {
  UpdateSupplierBodyDto,
  UpdateSupplierParamDto,
} from '../dtos/request/update-supplier.dto';

const updateSupplierParamSchema = z.object({
  id: z.uuid(),
});

const updateSupplierSchema = z.object({
  name: z
    .string()
    .min(5, { message: 'Name must be at least 5 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' })
    .optional(),
  cnpj: z
    .string()
    .length(14, { message: 'CNPJ must be 14 characters long.' })
    .optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
});

@ApiTags('Supplier')
@Controller('/suppliers')
export class UpdateSupplierController {
  constructor(private readonly updateSupplierService: UpdateSupplierService) {}

  @ApiOperation({ summary: 'Update supplier' })
  @ApiCreatedResponse({
    description: 'Supplier updated successfully',
    type: UpdateSupplierResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Registration already exists',
    type: ConflictDto,
  })
  @Put(':id')
  async update(
    @Param(new ZodValidationPipe(updateSupplierParamSchema))
    param: UpdateSupplierParamDto,
    @Body(new ZodValidationPipe(updateSupplierSchema))
    data: UpdateSupplierBodyDto,
  ) {
    try {
      const { supplier } = await this.updateSupplierService.execute({
        id: param.id,
        ...data,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Supplier updated successfully',
        supplier,
      };
    } catch (error) {
      console.error('Error updating supplier', error);
      throw error;
    }
  }
}
