import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
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
import { CreateSupplierBodyDto } from '../dtos/request/create-supplier.dto';
import { CreateSupplierResponseDto } from '../dtos/response/create-supplier.dto';
import { CreateSupplierService } from '../services/create-supplier.service';

const createSupplierBodySchema = z.object({
  name: z
    .string()
    .min(5, { message: 'Name must be at least 5 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' }),
  cnpj: z.string().length(14, { message: 'CNPJ must be 14 characters long.' }),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  farmId: z.uuid().nullable().optional(),
});

@ApiTags('Supplier')
@FarmScoped()
@Controller('/suppliers')
export class CreateSupplierController {
  constructor(private readonly createSupplierService: CreateSupplierService) {}

  @ApiOperation({ summary: 'Create supplier' })
  @ApiCreatedResponse({
    description: 'Supplier created successfully',
    type: CreateSupplierResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: CNPJ already exists',
    type: ConflictDto,
  })
  @Post()
  async create(
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @Body(new ZodValidationPipe(createSupplierBodySchema))
    data: CreateSupplierBodyDto,
  ) {
    const { supplier } = await this.createSupplierService.execute({
      ...data,
      organizationId,
      activeFarmId: farmId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Supplier created successfully',
      result: supplier,
    };
  }
}
