import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeType } from '@prisma/client';

export class UpdateEmployeeParamDto {
  @ApiProperty({
    description: "Employee's unique identifier",
  })
  id!: string;
}

export class UpdateEmployeeBodyDto {
  @ApiPropertyOptional({
    description: "Employee's name",
  })
  name!: string;

  @ApiPropertyOptional({
    description: "Employee's registration",
  })
  registration!: string;

  @ApiPropertyOptional({
    example: EmployeeType.FARM_MANAGER,
    description: "Employee's role in the farm",
    enum: EmployeeType,
  })
  type!: EmployeeType;
}
