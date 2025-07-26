import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CostCenterDto } from '../entity/cost-center.entity';

export class UpdateCostCenterResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode: string;

  @ApiProperty({
    default: 'Cost center updated successfully',
  })
  message: string;

  @ApiProperty()
  result: CostCenterDto;
}
