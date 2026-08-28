import { Body, Controller, HttpStatus, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import {
  UpdateAccountPlanBodyDto,
  UpdateAccountPlanParamDto,
} from '../dtos/request/update-account-plan.dto';
import { UpdateAccountPlanResponseDto } from '../dtos/response/update-account-plan.dto';
import { UpdateAccountPlanService } from '../services/update-account-plan.service';

const updateAccountPlanParamSchema = z.object({
  id: z.uuid(),
});

const updateAccountPlanSchema = z.object({
  name: z
    .string()
    .min(5, { message: 'Name must be at least 5 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' })
    .optional(),
  descrioption: z
    .string()
    .min(3, { message: 'Description must be at least 3 characters long.' })
    .max(250, { message: 'Description must be at most 250 characters long.' })
    .optional(),
  code: z
    .string()
    .min(1, { message: 'Code must be at least 1 character long.' })
    .optional(),
  parentId: z.uuid().optional(),
});

@ApiTags('AccountPlan')
@FarmScoped()
@Controller('/account-plans')
export class UpdateAccountPlanController {
  constructor(
    private readonly updateAccountPlanService: UpdateAccountPlanService,
  ) {}

  @ApiOperation({ summary: 'Update account plan' })
  @ApiOkResponse({
    description: 'Account Plan updated successfully',
    type: UpdateAccountPlanResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Code already exists',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Account plan/ParentId does not exist',
    type: NotFoundDto,
  })
  @Put(':id')
  async update(
    @OrganizationId() organizationId: string,
    @Param(new ZodValidationPipe(updateAccountPlanParamSchema))
    param: UpdateAccountPlanParamDto,
    @Body(new ZodValidationPipe(updateAccountPlanSchema))
    data: UpdateAccountPlanBodyDto,
  ) {
    const { accountPlan } = await this.updateAccountPlanService.execute(
      organizationId,
      {
        id: param.id,
        ...data,
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Account Plan updated successfully',
      result: accountPlan,
    };
  }
}
