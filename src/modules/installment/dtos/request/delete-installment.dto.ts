import { ApiProperty } from '@nestjs/swagger';

export class DeleteInstallmentParamDto {
  @ApiProperty({
    description: "Installment's unique identifier",
  })
  id: string;
}
