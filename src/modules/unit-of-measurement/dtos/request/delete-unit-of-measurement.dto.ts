import { ApiProperty } from '@nestjs/swagger';

export class DeleteUnitOfMeasurementParamDto {
  @ApiProperty({
    description: "Unit of measurement's unique identifier",
  })
  id!: string;
}
