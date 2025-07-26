import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { CostCenterDto } from '../entity/cost-center.entity';

export class CreateCostCenterResponseDto {
  @ApiProperty({
    default: HttpStatus.CREATED,
  })
  statusCode: string;

  @ApiProperty({
    default: 'Cost center created successfully',
  })
  message: string;

  @ApiProperty()
  result: CostCenterDto;
}
