import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { AccountPlanDto } from '../entity/account-plan.entity';

export class UpdateAccountPlanResponseDto {
  @ApiProperty({
    default: HttpStatus.OK,
  })
  statusCode!: string;

  @ApiProperty({
    default: 'Account plan updated successfully',
  })
  message!: string;

  @ApiProperty()
  result!: AccountPlanDto;
}
