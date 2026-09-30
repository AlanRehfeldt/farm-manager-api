import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationStatus } from '@prisma/client';

export class PlatformOrganizationDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Rehfeldt Agro' })
  name!: string;

  @ApiProperty({
    enum: OrganizationStatus,
    example: OrganizationStatus.ACTIVE,
  })
  status!: OrganizationStatus;

  @ApiPropertyOptional({ example: 'Juazeiro', nullable: true })
  city!: string | null;

  @ApiPropertyOptional({ example: 'BA', nullable: true })
  state!: string | null;

  @ApiProperty({ example: '2026-09-29T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-29T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ example: 1 })
  farmCount!: number;

  @ApiPropertyOptional({
    example: '2026-09-29T12:00:00.000Z',
    nullable: true,
    description:
      'Latest tenant login or refresh bound to this organization. Null when nobody has authenticated.',
  })
  lastAccessAt!: Date | null;

  @ApiPropertyOptional({
    example: '2026-09-29T12:00:00.000Z',
    nullable: true,
    description:
      'createdAt of the latest field activity recorded in the organization. Null when none exists.',
  })
  lastActivityAt!: Date | null;
}
