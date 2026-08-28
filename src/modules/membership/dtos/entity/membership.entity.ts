import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class MembershipDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'uuid' })
  userId!: string;

  @ApiProperty({ example: 'uuid' })
  organizationId!: string;

  @ApiPropertyOptional({ example: 'uuid', nullable: true })
  farmId?: string | null;

  @ApiProperty({ example: Role.USER, enum: Role })
  role!: Role;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  constructor(partial: Partial<MembershipDto>) {
    Object.assign(this, partial);
  }
}
