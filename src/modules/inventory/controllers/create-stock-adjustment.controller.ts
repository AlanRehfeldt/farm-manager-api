import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
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
import { CreateStockAdjustmentBodyDto } from '../dtos/request/stock-adjustment.dto';
import { CreateStockAdjustmentResponseDto } from '../dtos/response/stock-adjustment-response.dto';
import { CreateStockAdjustmentService } from '../services/create-stock-adjustment.service';

const signedQuantitySchema = z
  .string()
  .min(1)
  .refine((value) => {
    const qty = Number(value);
    return !Number.isNaN(qty) && qty !== 0;
  }, 'Quantity must be non-zero');

const createStockAdjustmentBodySchema = z.object({
  productId: z.uuid(),
  quantity: signedQuantitySchema,
  date: z.coerce.date(),
  note: z.string().min(1, 'Adjustment reason is required'),
});

@ApiTags('Inventory')
@FarmScoped()
@Controller('/stock-adjustments')
export class CreateStockAdjustmentController {
  constructor(
    private readonly createStockAdjustmentService: CreateStockAdjustmentService,
  ) {}

  @ApiOperation({ summary: 'Create stock adjustment' })
  @ApiCreatedResponse({
    description: 'Stock adjustment created successfully',
    type: CreateStockAdjustmentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Product does not exist',
    type: NotFoundDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Adjustment would result in negative stock',
  })
  @Post()
  async create(
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @Body(new ZodValidationPipe(createStockAdjustmentBodySchema))
    data: CreateStockAdjustmentBodyDto,
  ) {
    const result = await this.createStockAdjustmentService.execute({
      ...data,
      organizationId,
      farmId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Stock adjustment created successfully',
      result,
    };
  }
}
