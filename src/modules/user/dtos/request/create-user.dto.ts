import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserRequestDto {
  @ApiProperty({
    example: 'John Doe',
    description: "User's name",
  })
  name: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: "User's Email address",
  })
  email: string;

  @ApiProperty({
    example: 'user-password',
    description: "User's password",
  })
  password: string;

  @ApiPropertyOptional({
    example: Role.USER,
    description: "User's role in system",
    enum: Role,
  })
  role: Role;

  @ApiPropertyOptional({
    example: 'uuid',
    description: "User's employee unique identifier",
  })
  employeeId: string;
}
