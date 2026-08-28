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
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { CreateCostCenterBodyDto } from '../dtos/request/create-cost-center.dto';
import { CreateCostCenterResponseDto } from '../dtos/response/create-cost-center.dto';
import { CreateCostCenterService } from '../services/create-cost-center.service';

const createCostCenterBodySchema = z.object({
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

@ApiTags('CostCenter')
@FarmScoped()
@Controller('/cost-centers')
export class CreateCostCenterController {
  constructor(
    private readonly createCostCenterService: CreateCostCenterService,
  ) {}

  @ApiOperation({ summary: 'Create cost center' })
  @ApiCreatedResponse({
    description: 'Cost center created successfully',
    type: CreateCostCenterResponseDto,
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
    @Body(new ZodValidationPipe(createCostCenterBodySchema))
    data: CreateCostCenterBodyDto,
  ) {
    const { costCenter } = await this.createCostCenterService.execute({
      ...data,
      organizationId,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Cost center created successfully',
      result: costCenter,
    };
  }
}
