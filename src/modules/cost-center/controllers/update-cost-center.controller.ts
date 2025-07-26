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
import { UpdateCostCenterService } from '../services/update-cost-center.service';
import { UpdateCostCenterResponseDto } from '../dtos/response/update-cost-center.dto';
import {
  UpdateCostCenterBodyDto,
  UpdateCostCenterParamDto,
} from '../dtos/request/update-cost-center.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

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
    .min(3, { message: 'Registration must be at least 3 characters long.' })
    .max(250, { message: 'Registration must be at most 250 characters long.' })
    .optional(),
  code: z
    .string()
    .min(1, { message: 'Code must be at least 1 character long.' })
    .optional(),
  parentId: z.uuid().optional(),
});

@ApiTags('CostCenter')
@Controller('/cost-centers')
export class UpdateCostCenterController {
  constructor(
    private readonly updateCostCenterService: UpdateCostCenterService,
  ) {}

  @ApiOperation({ summary: 'Update cost center' })
  @ApiCreatedResponse({
    description: 'Cost center updated successfully',
    type: UpdateCostCenterResponseDto,
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
    description: 'Not found: Cost center/ParentId does not exist',
    type: NotFoundDto,
  })
  @Put(':id')
  async update(
    @Param(new ZodValidationPipe(updateCostCenterParamSchema))
    param: UpdateCostCenterParamDto,
    @Body(new ZodValidationPipe(updateCostCenterSchema))
    data: UpdateCostCenterBodyDto,
  ) {
    try {
      const { costCenter } = await this.updateCostCenterService.execute({
        id: param.id,
        ...data,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Cost center updated successfully',
        result: costCenter,
      };
    } catch (error) {
      console.error('Error updating cost center', error);
      throw error;
    }
  }
}
