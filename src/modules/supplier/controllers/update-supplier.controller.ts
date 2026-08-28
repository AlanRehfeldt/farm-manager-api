import { Body, Controller, HttpStatus, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
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
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import {
  UpdateSupplierBodyDto,
  UpdateSupplierParamDto,
} from '../dtos/request/update-supplier.dto';
import { UpdateSupplierResponseDto } from '../dtos/response/update-supplier.dto';
import { UpdateSupplierService } from '../services/update-supplier.service';

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
@FarmScoped()
@Controller('/suppliers')
export class UpdateSupplierController {
  constructor(private readonly updateSupplierService: UpdateSupplierService) {}

  @ApiOperation({ summary: 'Update supplier' })
  @ApiOkResponse({
    description: 'Supplier updated successfully',
    type: UpdateSupplierResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: CNPJ already exists',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Supplier does not exist',
    type: NotFoundDto,
  })
  @Put(':id')
  async update(
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(updateSupplierParamSchema))
    param: UpdateSupplierParamDto,
    @Body(new ZodValidationPipe(updateSupplierSchema))
    data: UpdateSupplierBodyDto,
  ) {
    const { supplier } = await this.updateSupplierService.execute(
      organizationId,
      farmId,
      {
        id: param.id,
        ...data,
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Supplier updated successfully',
      result: supplier,
    };
  }
}
