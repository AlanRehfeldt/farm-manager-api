import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { DeleteUnitOfMeasurementService } from '../services/delete-unit-of-measurement.service';
import { DeleteUnitOfMeasurementParamDto } from '../dtos/request/delete-unit-of-measurement.dto';
import { DeleteUnitOfMeasurementResponseDto } from '../dtos/response/delete-unit-of-measurement.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

const deleteUnitOfMeasurementParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('UnitOfMeasurement')
@Controller('/unit-of-measurements')
export class DeleteUnitOfMeasurementController {
  constructor(
    private readonly deleteUnitOfMeasurementService: DeleteUnitOfMeasurementService,
  ) {}

  @ApiOperation({ summary: 'Delete unit of measurement' })
  @ApiCreatedResponse({
    description: 'Unit of measurement deleted successfully',
    type: DeleteUnitOfMeasurementResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Unit of measurement does not exist',
    type: NotFoundDto,
  })
  @Delete(':id')
  async delete(
    @Param(new ZodValidationPipe(deleteUnitOfMeasurementParamSchema))
    param: DeleteUnitOfMeasurementParamDto,
  ) {
    try {
      await this.deleteUnitOfMeasurementService.execute(param.id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Unit of measurement deleted successfully',
        result: null,
      };
    } catch (error) {
      console.error('Error deleting unit of measurement', error);
      throw error;
    }
  }
}
