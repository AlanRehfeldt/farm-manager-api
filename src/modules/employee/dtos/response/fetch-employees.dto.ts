import { ApiProperty } from '@nestjs/swagger';
import { EmployeeDto } from '../entity/employee.entity';

export class FetchEmployeesResponseDto {
  @ApiProperty({
    type: [EmployeeDto],
  })
  results!: EmployeeDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty({
    default: 1,
  })
  page!: number;

  @ApiProperty({
    default: 10,
  })
  perPage!: number;

  @ApiProperty({
    default: 'name',
  })
  orderBy!: number;

  @ApiProperty({
    default: 'asc',
  })
  orderDirection!: number;
}
