import { ApiProperty } from '@nestjs/swagger';

export class CreateProductBodyDto {
  @ApiProperty({
    example: 'John Doe',
    description: "Product's name",
  })
  name!: string;

  @ApiProperty({
    example: '123456',
    description: "Product's description",
  })
  description!: string;

  @ApiProperty({
    example: 'uuid',
    description: "Unit of measurement's unique identifier",
  })
  unitOfMeasurementId!: string;
}
