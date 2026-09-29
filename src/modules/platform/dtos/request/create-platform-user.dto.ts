import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreatePlatformUserBodyDto {
  @ApiProperty({ example: 'uuid' })
  organizationId!: string;

  @ApiProperty({ example: 'Operador Norte' })
  name!: string;

  @ApiProperty({ example: 'operador@example.com' })
  email!: string;

  @ApiProperty({ example: 'Operat1!x' })
  password!: string;

  @ApiPropertyOptional({ enum: Role, example: Role.USER })
  role?: Role;

  @ApiPropertyOptional({
    type: [String],
    description: 'Omitted or empty means an org-wide membership.',
  })
  farmIds?: string[];
}
