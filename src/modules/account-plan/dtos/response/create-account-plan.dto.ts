import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { AccountPlanDto } from '../entity/account-plan.entity';

export class CreateAccountPlanResponseDto {
  @ApiProperty({
    default: HttpStatus.CREATED,
  })
  statusCode!: string;

  @ApiProperty({
    default: 'Account plan created successfully',
  })
  message!: string;

  @ApiProperty()
  result!: AccountPlanDto;
}
