import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { GetUnitOfMeasurementService } from '../services/get-unit-of-measurement.service';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetUnitOfMeasurementParamDto } from '../dtos/request/get-unit-of-measurement.dto';
import { GetUnitOfMeasurementResponseDto } from '../dtos/response/get-unit-of-measurement.dto';

const getUnitOfMeasurementParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('UnitOfMeasurement')
@Controller('/unit-of-measurements')
export class GetUnitOfMeasurementController {
  constructor(
    private readonly getUnitOfMeasurementService: GetUnitOfMeasurementService,
  ) {}

  @ApiOperation({ summary: 'Get unit of measurement' })
  @ApiOkResponse({
    description: 'Unit of measurement retrived successfully',
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
    @Param(new ZodValidationPipe(getUnitOfMeasurementParamSchema))
    param: GetUnitOfMeasurementParamDto,
  ) {
    try {
      const { unitOfMeasurement } =
        await this.getUnitOfMeasurementService.execute(param.id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Unit of measurement retrived successfully',
        result: unitOfMeasurement,
      };
    } catch (error) {
      console.error('Error getting unit of measurement', error);
      throw error;
    }
  }
}
