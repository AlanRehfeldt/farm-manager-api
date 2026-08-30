import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
import { CreatePurchaseBodyDto } from '../dtos/request/purchase.dto';
import { CreatePurchaseResponseDto } from '../dtos/response/purchase-response.dto';
import { CreatePurchaseService } from '../services/create-purchase.service';

const paymentFormSchema = z.enum([
  'CASH',
  'CREDIT_CARD',
  'DEBIT_CARD',
  'BANK_SLIP',
  'TRANSFER',
  'PIX',
  'CHECK',
  'DIGITAL_WALLET',
  'LOAN',
  'TRADE',
  'FINANCING',
  'OTHER',
]);

const createPurchaseBodySchema = z.object({
  date: z.coerce.date(),
  documentRef: z.string().optional(),
  note: z.string().optional(),
  supplierId: z.uuid(),
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: z
          .string()
          .min(1)
          .refine(
            (value) => !Number.isNaN(Number(value)) && Number(value) > 0,
            {
              message: 'Quantity must be greater than zero',
            },
          ),
        priceInCents: z.coerce.number().int().min(0),
      }),
    )
    .min(1),
  installments: z
    .array(
      z.object({
        valueInCents: z.coerce.number().int().positive(),
        dueDate: z.coerce.date(),
        paymentDate: z.coerce.date().optional(),
        paymentForm: paymentFormSchema,
      }),
    )
    .min(1),
});

@ApiTags('Purchase')
@FarmScoped()
@Controller('/purchases')
export class CreatePurchaseController {
  constructor(private readonly createPurchaseService: CreatePurchaseService) {}

  @ApiOperation({ summary: 'Create purchase with stock IN' })
  @ApiCreatedResponse({
    description: 'Purchase created successfully',
    type: CreatePurchaseResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Supplier or product does not exist',
    type: NotFoundDto,
  })
  @Post()
  async create(
    @OrganizationId() organizationId: string,
    @FarmId() farmId: string,
    @Body(new ZodValidationPipe(createPurchaseBodySchema))
    data: CreatePurchaseBodyDto,
  ) {
    const { purchase } = await this.createPurchaseService.execute({
      ...data,
      organizationId,
      farmId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Purchase created successfully',
      result: purchase,
    };
  }
}
