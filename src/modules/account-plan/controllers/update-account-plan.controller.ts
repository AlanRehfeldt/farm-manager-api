import { Body, Controller, HttpStatus, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { UpdateAccountPlanService } from '../services/update-account-plan.service';
import { UpdateAccountPlanResponseDto } from '../dtos/response/update-account-plan.dto';
import {
  UpdateAccountPlanBodyDto,
  UpdateAccountPlanParamDto,
} from '../dtos/request/update-account-plan.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

const updateAccountPlanParamSchema = z.object({
  id: z.uuid(),
});

const updateAccountPlanSchema = z.object({
  name: z
    .string()
    .min(5, { message: 'Name must be at least 5 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' })
    .optional(),
  code: z
    .string()
    .min(1, { message: 'Code must be at least 1 character long.' })
    .optional(),
  type: z
    .enum(['ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY'])
    .optional(),
});

@ApiTags('AccountPlan')
@Controller('/account-plans')
export class UpdateAccountPlanController {
  constructor(
    private readonly updateAccountPlanService: UpdateAccountPlanService,
  ) {}

  @ApiOperation({ summary: 'Update account plan' })
  @ApiCreatedResponse({
    description: 'Account Plan updated successfully',
    type: UpdateAccountPlanResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Registration already exists',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Account plan does not exist',
    type: NotFoundDto,
  })
  @Put(':id')
  async update(
    @Param(new ZodValidationPipe(updateAccountPlanParamSchema))
    param: UpdateAccountPlanParamDto,
    @Body(new ZodValidationPipe(updateAccountPlanSchema))
    data: UpdateAccountPlanBodyDto,
  ) {
    try {
      const { accountPlan } = await this.updateAccountPlanService.execute({
        id: param.id,
        ...data,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Account Plan updated successfully',
        resukt: accountPlan,
      };
    } catch (error) {
      console.error('Error updating account plan', error);
      throw error;
    }
  }
}
