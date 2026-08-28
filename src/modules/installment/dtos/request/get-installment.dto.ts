import { ApiProperty } from '@nestjs/swagger';

export class GetInstallmentParamDto {
  @ApiProperty({
    description: "Installment's unique identifier",
  })
  id!: string;
}
