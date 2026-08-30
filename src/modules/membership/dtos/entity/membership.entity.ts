import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class MembershipUserDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Bruna Silva' })
  name!: string;

  @ApiProperty({ example: 'bruna@example.com' })
  email!: string;

  constructor(partial: Partial<MembershipUserDto>) {
    Object.assign(this, partial);
  }
}

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

  @ApiPropertyOptional({ type: MembershipUserDto })
  user?: MembershipUserDto;

  constructor(partial: Partial<MembershipDto>) {
    Object.assign(this, partial);
  }
}
