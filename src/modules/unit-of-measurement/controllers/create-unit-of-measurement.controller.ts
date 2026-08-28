import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { ConflictDto } from 'src/common/errors/conflict.dto';
import { CreateUnitOfMeasurementBodyDto } from '../dtos/request/create-unit-of-measurement.dto';
import { CreateUnitOfMeasurementResponseDto } from '../dtos/response/create-unit-of-measurement.dto';
import { CreateUnitOfMeasurementService } from '../services/create-unit-of-measurement.service';

const createUnitOfMeasurementBodySchema = z.object({
  name: z
    .string()
    .min(5, { message: 'Name must be at least 5 characters long.' })
    .max(150, { message: 'Name must be at most 150 characters long.' }),
  acronym: z
    .string()
    .min(1, { message: 'Acronym must be at least 1 characters long.' })
    .max(20, { message: 'Acronym must be at most 20 characters long.' }),
});

@ApiTags('UnitOfMeasurement')
@FarmScoped()
@Controller('/unit-of-measurements')
export class CreateUnitOfMeasurementController {
  constructor(
    private readonly createUnitOfMeasurementService: CreateUnitOfMeasurementService,
  ) {}

  @ApiOperation({ summary: 'Create unit of measurement' })
  @ApiCreatedResponse({
    description: 'Unit of measurement created successfully',
    type: CreateUnitOfMeasurementResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request body',
    type: BadRequestDto,
  })
  @ApiConflictResponse({
    description: 'Conflict: Acronym already exists',
    type: ConflictDto,
  })
  @Post()
  async create(
    @OrganizationId() organizationId: string,
    @Body(new ZodValidationPipe(createUnitOfMeasurementBodySchema))
    data: CreateUnitOfMeasurementBodyDto,
  ) {
    const { unitOfMeasurement } =
      await this.createUnitOfMeasurementService.execute(
        organizationId,
        data.name,
        data.acronym,
      );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Unit of measurement created successfully',
      result: unitOfMeasurement,
    };
  }
}
