import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { FarmAdmin } from 'src/common/tenancy/farm-admin.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { CreateAccountPlanBodyDto } from '../dtos/request/create-account-plan.dto';
import { CreateAccountPlanResponseDto } from '../dtos/response/create-account-plan.dto';
import { CreateAccountPlanService } from '../services/create-account-plan.service';

const createAccountPlanBodySchema = z.object({
  name: z
    .string()
    .min(5, { message: 'Name must be at least 5 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' }),
  description: z
    .string()
    .min(3, { message: 'Description must be at least 3 characters long.' })
    .max(250, { message: 'Description must be at most 250 characters long.' }),
  code: z
    .string()
    .min(1, { message: 'Code must be at least 1 character long.' }),
  parentId: z.uuid().optional(),
});

@ApiTags('AccountPlan')
@FarmScoped()
@FarmAdmin()
@Controller('/account-plans')
export class CreateAccountPlanController {
  constructor(
    private readonly createAccountPlanService: CreateAccountPlanService,
  ) {}

  @ApiOperation({ summary: 'Create Account plan' })
  @ApiCreatedResponse({
    description: 'Account plan created successfully',
    type: CreateAccountPlanResponseDto,
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
    description: 'Not found: ParentId does not exist',
    type: NotFoundDto,
  })
  @Post()
  async create(
    @OrganizationId() organizationId: string,
    @Body(new ZodValidationPipe(createAccountPlanBodySchema))
    data: CreateAccountPlanBodyDto,
  ) {
    const { accountPlan } = await this.createAccountPlanService.execute({
      ...data,
      organizationId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Account plan created successfully',
      result: accountPlan,
    };
  }
}
