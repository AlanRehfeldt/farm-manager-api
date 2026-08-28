import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetUnitOfMeasurementParamDto } from '../dtos/request/get-unit-of-measurement.dto';
import { GetUnitOfMeasurementResponseDto } from '../dtos/response/get-unit-of-measurement.dto';
import { GetUnitOfMeasurementService } from '../services/get-unit-of-measurement.service';

const getUnitOfMeasurementParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('UnitOfMeasurement')
@FarmScoped()
@Controller('/unit-of-measurements')
export class GetUnitOfMeasurementController {
  constructor(
    private readonly getUnitOfMeasurementService: GetUnitOfMeasurementService,
  ) {}

  @ApiOperation({ summary: 'Get unit of measurement' })
  @ApiOkResponse({
    description: 'Unit of measurement retrieved successfully',
    type: GetUnitOfMeasurementResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Unit of measurement does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @OrganizationId() organizationId: string,
    @Param(new ZodValidationPipe(getUnitOfMeasurementParamSchema))
    param: GetUnitOfMeasurementParamDto,
  ) {
    const { unitOfMeasurement } =
      await this.getUnitOfMeasurementService.execute(param.id, organizationId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Unit of measurement retrieved successfully',
      result: unitOfMeasurement,
    };
  }
}
