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
import { FarmAdmin } from 'src/common/tenancy/farm-admin.decorator';
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

const updateSupplierSchema = z
  .object({
    name: z
      .string()
      .min(5, { message: 'Name must be at least 5 characters long.' })
      .max(150, { message: 'Name must be at most 150 characters long.' })
      .optional(),
    cnpj: z
      .string()
      .length(14, { message: 'CNPJ must be 14 characters long.' })
      .nullable()
      .optional(),
    cpf: z
      .string()
      .length(11, { message: 'CPF must be 11 characters long.' })
      .nullable()
      .optional(),
    address: z.string().nullable().optional(),
    city: z.string().max(100).nullable().optional(),
    state: z
      .string()
      .length(2, { message: 'State must be a 2-letter UF.' })
      .nullable()
      .optional(),
    phoneNumber: z
      .string()
      .regex(/^\d{10,11}$/, { message: 'Phone must be 10 or 11 digits.' })
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      if (data.cnpj === undefined && data.cpf === undefined) {
        return true;
      }
      const hasCnpj = data.cnpj != null && data.cnpj !== '';
      const hasCpf = data.cpf != null && data.cpf !== '';
      return hasCnpj !== hasCpf;
    },
    {
      message: 'Provide exactly one of CNPJ or CPF.',
      path: ['cnpj'],
    },
  );

@ApiTags('Supplier')
@FarmScoped()
@FarmAdmin()
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
    description: 'Conflict: document already exists',
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
