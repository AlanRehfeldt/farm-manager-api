import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteAccountPlanResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode: string;

  @ApiProperty({
    default: 'Account plan deleted successfully',
  })
  message: string;

  @ApiProperty({ default: null, nullable: true, type: 'null' })
  result: null;
}
