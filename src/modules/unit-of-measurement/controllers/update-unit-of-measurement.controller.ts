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
  UpdateUnitOfMeasurementBodyDto,
  UpdateUnitOfMeasurementParamDto,
} from '../dtos/request/update-unit-of-measurement.dto';
import { UpdateUnitOfMeasurementResponseDto } from '../dtos/response/update-unit-of-measurement.dto';
import { UpdateUnitOfMeasurementService } from '../services/update-unit-of-measurement.service';

const updateUnitOfMeasurementParamSchema = z.object({
  id: z.uuid(),
});

const updateUnitOfMeasurementSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name must be at least 1 character long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' })
    .optional(),
  acronym: z
    .string()
    .min(1, { message: 'Acronym must be at least 1 characters long.' })
    .max(20, { message: 'Acronym must be at most 20 characters long.' })
    .optional(),
});

@ApiTags('UnitOfMeasurement')
@FarmScoped()
@Controller('/unit-of-measurements')
export class UpdateUnitOfMeasurementController {
  constructor(
    private readonly updateUnitOfMeasurementService: UpdateUnitOfMeasurementService,
  ) {}

  @ApiOperation({ summary: 'Update unit of measurement' })
  @ApiOkResponse({
    description: 'Unit of measurement updated successfully',
    type: UpdateUnitOfMeasurementResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Acronym already exists',
    type: ConflictDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Unit of measurement does not exist',
    type: NotFoundDto,
  })
  @Put(':id')
  async update(
    @OrganizationId() organizationId: string,
    @Param(new ZodValidationPipe(updateUnitOfMeasurementParamSchema))
    param: UpdateUnitOfMeasurementParamDto,
    @Body(new ZodValidationPipe(updateUnitOfMeasurementSchema))
    data: UpdateUnitOfMeasurementBodyDto,
  ) {
    const { unitOfMeasurement } =
      await this.updateUnitOfMeasurementService.execute(organizationId, {
        id: param.id,
        ...data,
      });

    return {
      statusCode: HttpStatus.OK,
      message: 'Unit of measurement updated successfully',
      result: unitOfMeasurement,
    };
  }
}
