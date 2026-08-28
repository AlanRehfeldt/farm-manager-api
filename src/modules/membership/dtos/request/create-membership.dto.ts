import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateMembershipBodyDto {
  @ApiProperty({ example: 'uuid' })
  organizationId!: string;

  @ApiPropertyOptional({ example: 'uuid', nullable: true })
  farmId?: string | null;

  @ApiPropertyOptional({ enum: Role, example: Role.USER })
  role?: Role;

  @ApiPropertyOptional({ example: 'uuid' })
  userId?: string;

  @ApiPropertyOptional({ example: 'Bruna Silva' })
  name?: string;

  @ApiPropertyOptional({ example: 'bruna@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: 'Secret1!' })
  password?: string;
}
