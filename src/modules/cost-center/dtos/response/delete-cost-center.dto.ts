import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteCostCenterResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode!: string;

  @ApiProperty({
    default: 'Cost center deleted successfully',
  })
  message!: string;

  @ApiProperty({ default: null, nullable: true, type: 'null' })
  result!: null;
}
