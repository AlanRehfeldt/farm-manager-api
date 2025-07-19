import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UpdateUserParamDto {
  @ApiProperty({
    description: "User's unique identifier",
  })
  id: string;
}

export class UpdateUserBodyDto {
  @ApiPropertyOptional({
    description: "User's name",
  })
  name: string;

  @ApiPropertyOptional({
    description: "User's Email address",
  })
  email: string;

  @ApiPropertyOptional({
    description: "User's role in system",
    enum: Role,
  })
  role: Role;

  @ApiPropertyOptional({
    description: "User's employee unique identifier",
  })
  employeeId: string;
}
