import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeType, EmploymentType } from '@prisma/client';

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
  name?: string;

  @ApiPropertyOptional({
    description: "Employee's registration",
  })
  registration?: string;

  @ApiPropertyOptional({
    example: EmployeeType.FARM_MANAGER,
    description: "Employee's role in the farm",
    enum: EmployeeType,
  })
  type?: EmployeeType;

  @ApiPropertyOptional({
    example: EmploymentType.CONTRACTOR,
    description: 'Employment contract type',
    enum: EmploymentType,
  })
  employmentType?: EmploymentType;

  @ApiPropertyOptional({
    example: 320000,
    nullable: true,
    description: 'Monthly salary in cents (CLT only; null clears)',
  })
  monthlySalaryInCents?: number | null;

  @ApiPropertyOptional({
    example: '160',
    nullable: true,
    description: 'Expected monthly hours (CLT only; null clears)',
  })
  expectedMonthlyHours?: string | null;
}
