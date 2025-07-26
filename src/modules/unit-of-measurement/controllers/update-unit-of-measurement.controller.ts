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
import { UpdateUnitOfMeasurementService } from '../services/update-unit-of-measurement.service';
import { UpdateUnitOfMeasurementResponseDto } from '../dtos/response/update-unit-of-measurement.dto';
import {
  UpdateUnitOfMeasurementBodyDto,
  UpdateUnitOfMeasurementParamDto,
} from '../dtos/request/update-unit-of-measurement.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

const updateUnitOfMeasurementParamSchema = z.object({
  id: z.uuid(),
});

const updateUnitOfMeasurementSchema = z.object({
  name: z
    .string()
    .min(5, { message: 'Name must be at least 5 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' })
    .optional(),
  acronym: z
    .string()
    .min(1, { message: 'Acronym must be at least 1 characters long.' })
    .max(20, { message: 'Acronym must be at most 20 characters long.' })
    .optional(),
});

@ApiTags('UnitOfMeasurement')
@Controller('/unit-of-measurements')
export class UpdateUnitOfMeasurementController {
  constructor(
    private readonly updateUnitOfMeasurementService: UpdateUnitOfMeasurementService,
  ) {}

  @ApiOperation({ summary: 'Update unit of measurement' })
  @ApiCreatedResponse({
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
    @Param(new ZodValidationPipe(updateUnitOfMeasurementParamSchema))
    param: UpdateUnitOfMeasurementParamDto,
    @Body(new ZodValidationPipe(updateUnitOfMeasurementSchema))
    data: UpdateUnitOfMeasurementBodyDto,
  ) {
    try {
      const { unitOfMeasurement } =
        await this.updateUnitOfMeasurementService.execute({
          id: param.id,
          ...data,
        });

      return {
        statusCode: HttpStatus.OK,
        message: 'Unit of measurement updated successfully',
        result: unitOfMeasurement,
      };
    } catch (error) {
      console.error('Error updating unit of measurement', error);
      throw error;
    }
  }
}
