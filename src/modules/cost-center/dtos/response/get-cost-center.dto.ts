import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CostCenterDto } from '../entity/cost-center.entity';

export class GetCostCenterResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode: string;

  @ApiProperty({
    default: 'Cost center retrived successfully',
  })
  message: string;

  @ApiProperty()
  result: CostCenterDto;
}
