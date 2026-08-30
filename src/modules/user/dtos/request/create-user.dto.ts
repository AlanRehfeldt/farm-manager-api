import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserBodyDto {
  @ApiProperty({
    example: 'John Doe',
    description: "User's name",
  })
  name!: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: "User's Email address",
  })
  email!: string;

  @ApiProperty({
    example: '$trongP@ssw0rd1',
    description: "User's password",
  })
  password!: string;

  @ApiPropertyOptional({
    example: Role.USER,
    description:
      'Legacy global role (optional). Does not grant tenant permissions — use POST /memberships for org roles. Removal PR-18.',
    enum: Role,
    deprecated: true,
  })
  role!: Role;

  @ApiPropertyOptional({
    example: 'uuid',
    description: "User's employee unique identifier",
  })
  employeeId!: string;
}
