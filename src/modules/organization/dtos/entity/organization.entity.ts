import { ApiProperty } from '@nestjs/swagger';

export class OrganizationDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Rehfeldt Agro' })
  name!: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  constructor(partial: Partial<OrganizationDto>) {
    Object.assign(this, partial);
  }
}
