import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { GetAccountPlanService } from '../services/get-account-plan.service';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetAccountPlanParamDto } from '../dtos/request/get-account-plan.dto';
import { GetAccountPlanResponseDto } from '../dtos/response/get-account-plan.dto';

const getAccountPlanParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('AccountPlan')
@Controller('/account-plans')
export class GetAccountPlanController {
  constructor(private readonly getAccountPlanService: GetAccountPlanService) {}

  @ApiOperation({ summary: 'Get account plan' })
  @ApiOkResponse({
    description: 'Account Plan retrived successfully',
    type: GetAccountPlanResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Account Plan does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @Param(new ZodValidationPipe(getAccountPlanParamSchema))
    param: GetAccountPlanParamDto,
  ) {
    try {
      const { accountPlan } = await this.getAccountPlanService.execute(
        param.id,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Account Plan retrived successfully',
        result: accountPlan,
      };
    } catch (error) {
      console.error('Error getting account plan', error);
      throw error;
    }
  }
}
