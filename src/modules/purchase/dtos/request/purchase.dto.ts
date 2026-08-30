import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const paymentForms = [
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
] as const;

export class CreatePurchaseItemBodyDto {
  @ApiProperty()
  productId!: string;

  @ApiProperty({ example: '1000' })
  quantity!: string;

  @ApiProperty({ example: 350 })
  priceInCents!: number;
}

export class CreatePurchaseInstallmentBodyDto {
  @ApiProperty({ example: 350000 })
  valueInCents!: number;

  @ApiProperty()
  dueDate!: Date;

  @ApiPropertyOptional()
  paymentDate?: Date;

  @ApiProperty({ enum: paymentForms })
  paymentForm!: (typeof paymentForms)[number];
}

export class CreatePurchaseBodyDto {
  @ApiProperty()
  date!: Date;

  @ApiPropertyOptional()
  documentRef?: string;

  @ApiPropertyOptional()
  note?: string;

  @ApiProperty()
  supplierId!: string;

  @ApiProperty({ type: [CreatePurchaseItemBodyDto] })
  items!: CreatePurchaseItemBodyDto[];

  @ApiProperty({ type: [CreatePurchaseInstallmentBodyDto] })
  installments!: CreatePurchaseInstallmentBodyDto[];
}

export class FetchPurchasesQueryDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  perPage?: number;

  @ApiPropertyOptional({ default: 'date' })
  orderBy?: string;

  @ApiPropertyOptional({ default: 'desc' })
  orderDirection?: string;
}
