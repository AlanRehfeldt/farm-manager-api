import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { AccountPlanDto } from '../entity/account-plan.entity';

export class GetAccountPlanResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode: string;

  @ApiProperty({
    default: 'Account plan retrived successfully',
  })
  message: string;

  @ApiProperty()
  result: AccountPlanDto;
}
