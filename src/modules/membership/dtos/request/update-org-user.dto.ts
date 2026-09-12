import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UpdateOrgUserBodyDto {
  @ApiProperty({ example: 'uuid' })
  organizationId!: string;

  @ApiProperty({ example: 'Bruna Silva' })
  name!: string;

  @ApiProperty({ example: 'bruna@example.com' })
  email!: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role!: Role;

  @ApiProperty({
    example: ['uuid'],
    type: [String],
    description: 'Empty array = org-wide. N ids = N farm memberships.',
  })
  farmIds!: string[];
}
