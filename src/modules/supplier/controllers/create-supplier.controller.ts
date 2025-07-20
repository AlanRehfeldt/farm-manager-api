import { Body, Controller, HttpStatus, Post, UsePipes } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { CreateSupplierService } from '../services/create-supplier.service';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { CreateSupplierResponseDto } from '../dtos/response/create-supplier.dto';
import { CreateSupplierBodyDto } from '../dtos/request/create-supplier.dto';

const createSupplierBodySchema = z.object({
  name: z
    .string()
    .min(5, { message: 'Name must be at least 5 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' }),
  cnpj: z.string().length(14, { message: 'CNPJ must be 14 characters long.' }),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
});

@ApiTags('Supplier')
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
  @UsePipes(new ZodValidationPipe(createSupplierBodySchema))
  async create(@Body() data: CreateSupplierBodyDto) {
    try {
      const { supplier } = await this.createSupplierService.execute(data);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Supplier created successfully',
        result: supplier,
      };
    } catch (error) {
      console.error('Error creating supplier', error);
      throw error;
    }
  }
}
