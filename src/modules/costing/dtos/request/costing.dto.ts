import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReferencePriceBodyDto {
  @ApiPropertyOptional({ example: 120, nullable: true })
  referenceSalePriceInCents!: number | null;
}
