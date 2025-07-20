import { ApiPropertyOptional } from '@nestjs/swagger';

export class FetchSuppliersQueryDto {
  @ApiPropertyOptional()
  id: string;

  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional()
  cnpj: string;

  @ApiPropertyOptional()
  address: string;

  @ApiPropertyOptional()
  phoneNumber: string;

  @ApiPropertyOptional()
  page: number;

  @ApiPropertyOptional()
  perPage: number;

  @ApiPropertyOptional()
  orderBy: string;

  @ApiPropertyOptional()
  orderDirection: 'asc' | 'desc';
}
