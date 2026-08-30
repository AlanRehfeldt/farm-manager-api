import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  productName!: string;

  @ApiProperty()
  uomAcronym!: string;

  @ApiProperty()
  quantity!: string;

  @ApiProperty()
  priceInCents!: number;
}

export class PurchaseInstallmentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  valueInCents!: number;

  @ApiProperty()
  dueDate!: Date;

  @ApiProperty({ nullable: true })
  paymentDate!: Date | null;

  @ApiProperty()
  paymentForm!: string;
}

export class PurchaseSupplierDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class StockEffectDto {
  @ApiProperty()
  productName!: string;

  @ApiProperty()
  quantity!: string;

  @ApiProperty()
  uomAcronym!: string;

  @ApiProperty()
  avgCost!: string;
}

export class PurchaseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  transactionId!: string;

  @ApiProperty()
  farmId!: string;

  @ApiProperty()
  date!: Date;

  @ApiProperty({ nullable: true })
  documentRef!: string | null;

  @ApiProperty({ nullable: true })
  note!: string | null;

  @ApiProperty({ type: PurchaseSupplierDto })
  supplier!: PurchaseSupplierDto;

  @ApiProperty({ type: [PurchaseItemDto] })
  items!: PurchaseItemDto[];

  @ApiProperty({ type: [PurchaseInstallmentDto] })
  installments!: PurchaseInstallmentDto[];

  @ApiProperty()
  totalInCents!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class CreatePurchaseResponseDto {
  @ApiProperty({ default: HttpStatus.CREATED })
  statusCode!: number;

  @ApiProperty({ default: 'Purchase created successfully' })
  message!: string;

  @ApiProperty()
  result!: PurchaseDto & { stockEffects: StockEffectDto[] };
}

export class FetchPurchasesResponseDto {
  @ApiProperty({ type: [PurchaseDto] })
  results!: PurchaseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  perPage!: number;

  @ApiProperty()
  orderBy!: string;

  @ApiProperty()
  orderDirection!: string;
}

export class GetPurchaseResponseDto {
  @ApiProperty({ default: HttpStatus.OK })
  statusCode!: number;

  @ApiProperty({ default: 'Purchase retrieved successfully' })
  message!: string;

  @ApiProperty()
  result!: PurchaseDto;
}
