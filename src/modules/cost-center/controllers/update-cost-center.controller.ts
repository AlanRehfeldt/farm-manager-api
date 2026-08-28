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
  UpdateCostCenterBodyDto,
  UpdateCostCenterParamDto,
} from '../dtos/request/update-cost-center.dto';
import { UpdateCostCenterResponseDto } from '../dtos/response/update-cost-center.dto';
import { UpdateCostCenterService } from '../services/update-cost-center.service';

const updateCostCenterParamSchema = z.object({
  id: z.uuid(),
});

const updateCostCenterSchema = z.object({
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

@ApiTags('CostCenter')
@FarmScoped()
@Controller('/cost-centers')
export class UpdateCostCenterController {
  constructor(
    private readonly updateCostCenterService: UpdateCostCenterService,
  ) {}

  @ApiOperation({ summary: 'Update cost center' })
  @ApiOkResponse({
    description: 'Cost center updated successfully',
    type: UpdateCostCenterResponseDto,
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
    description: 'Not found: Cost center/ParentId does not exist',
    type: NotFoundDto,
  })
  @Put(':id')
  async update(
    @OrganizationId() organizationId: string,
    @Param(new ZodValidationPipe(updateCostCenterParamSchema))
    param: UpdateCostCenterParamDto,
    @Body(new ZodValidationPipe(updateCostCenterSchema))
    data: UpdateCostCenterBodyDto,
  ) {
    const { costCenter } = await this.updateCostCenterService.execute(
      organizationId,
      {
        id: param.id,
        ...data,
      },
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Cost center updated successfully',
      result: costCenter,
    };
  }
}
