import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
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
import { DeleteUnitOfMeasurementParamDto } from '../dtos/request/delete-unit-of-measurement.dto';
import { DeleteUnitOfMeasurementResponseDto } from '../dtos/response/delete-unit-of-measurement.dto';
import { DeleteUnitOfMeasurementService } from '../services/delete-unit-of-measurement.service';

const deleteUnitOfMeasurementParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('UnitOfMeasurement')
@FarmScoped()
@Controller('/unit-of-measurements')
export class DeleteUnitOfMeasurementController {
  constructor(
    private readonly deleteUnitOfMeasurementService: DeleteUnitOfMeasurementService,
  ) {}

  @ApiOperation({ summary: 'Delete unit of measurement' })
  @ApiOkResponse({
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
    @OrganizationId() organizationId: string,
    @Param(new ZodValidationPipe(deleteUnitOfMeasurementParamSchema))
    param: DeleteUnitOfMeasurementParamDto,
  ) {
    await this.deleteUnitOfMeasurementService.execute(param.id, organizationId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Unit of measurement deleted successfully',
      result: null,
    };
  }
}
