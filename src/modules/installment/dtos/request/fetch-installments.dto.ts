import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentForm } from '@prisma/client';

export class FetchInstallmentsQueryDto {
  @ApiPropertyOptional()
  id: string;

  @ApiPropertyOptional()
  valueInCentsFrom: number;

  @ApiPropertyOptional()
  valueInCentsTo: number;

  @ApiPropertyOptional()
  dueDateFrom: Date;

  @ApiPropertyOptional()
  dueDateTo: Date;

  @ApiPropertyOptional()
  paymentDateFrom: Date;

  @ApiPropertyOptional()
  paymentDateTo: Date;

  @ApiPropertyOptional()
  paymentForm: PaymentForm;

  @ApiPropertyOptional()
  transactionId: string;

  @ApiPropertyOptional()
  createdAtFrom: Date;

  @ApiPropertyOptional()
  createdAtTo: Date;

  @ApiPropertyOptional()
  updatedAtFrom: Date;

  @ApiPropertyOptional()
  updatedAtTo: Date;

  @ApiPropertyOptional()
  page: number;

  @ApiPropertyOptional()
  perPage: number;

  @ApiPropertyOptional()
  orderBy: string;

  @ApiPropertyOptional()
  orderDirection: 'asc' | 'desc';
}
