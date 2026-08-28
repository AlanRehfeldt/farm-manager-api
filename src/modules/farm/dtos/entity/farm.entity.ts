import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FarmDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'uuid' })
  organizationId!: string;

  @ApiProperty({ example: 'Sede' })
  name!: string;

  @ApiPropertyOptional({ example: 'America/Bahia' })
  timezone?: string | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  constructor(partial: Partial<FarmDto>) {
    Object.assign(this, partial);
  }
}
