import { Controller, Delete, Param } from '@nestjs/common';
import { throwDeprecatedWriteEndpoint } from 'src/common/http/deprecated-endpoint';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { BadRequestDto } from 'src/common/errors/bad-request.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { DeleteInstallmentParamDto } from '../dtos/request/delete-installment.dto';
import { DeleteInstallmentResponseDto } from '../dtos/response/delete-installment.dto';
import { DeleteInstallmentService } from '../services/delete-installment.service';

const deleteInstallmentParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Installment')
@FarmScoped()
@Controller('/installments')
export class DeleteInstallmentController {
  constructor(
    private readonly deleteInstallmentService: DeleteInstallmentService,
  ) {}

  @ApiOperation({ summary: 'Delete installment' })
  @ApiOkResponse({
    description: 'Installment deleted successfully',
    type: DeleteInstallmentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Installment does not exist',
    type: NotFoundDto,
  })
  @Delete(':id')
  delete(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(deleteInstallmentParamSchema))
    param: DeleteInstallmentParamDto,
  ) {
    void farmId;
    void param;
    throwDeprecatedWriteEndpoint('Installment');
  }
}
