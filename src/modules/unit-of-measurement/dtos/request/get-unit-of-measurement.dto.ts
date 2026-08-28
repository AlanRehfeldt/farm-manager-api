import { ApiProperty } from '@nestjs/swagger';

export class GetUnitOfMeasurementParamDto {
  @ApiProperty({
    description: "Unit of measurement's unique identifier",
  })
  id!: string;
}
