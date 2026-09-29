import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlatformOrganizationDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Rehfeldt Agro' })
  name!: string;

  @ApiProperty({ example: '2026-09-29T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-29T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ example: 1 })
  farmCount!: number;

  @ApiProperty({ example: 0 })
  seasonCount!: number;

  @ApiProperty({
    example: 0,
    description:
      'Operational entries: transactions + activities + harvests across the organization farms.',
  })
  entryCount!: number;

  @ApiPropertyOptional({
    example: '2026-09-29T12:00:00.000Z',
    nullable: true,
    description:
      'Latest refresh-token creation among members of the organization. Null when nobody has authenticated.',
  })
  lastAccessAt!: Date | null;
}
