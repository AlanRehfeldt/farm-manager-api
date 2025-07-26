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
import { DeleteInstallmentService } from '../services/delete-installment.service';
import { DeleteInstallmentParamDto } from '../dtos/request/delete-installment.dto';
import { DeleteInstallmentResponseDto } from '../dtos/response/delete-installment.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

const deleteInstallmentParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Installment')
@Controller('/installments')
export class DeleteInstallmentController {
  constructor(
    private readonly deleteInstallmentService: DeleteInstallmentService,
  ) {}

  @ApiOperation({ summary: 'Delete installment' })
  @ApiCreatedResponse({
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
  async delete(
    @Param(new ZodValidationPipe(deleteInstallmentParamSchema))
    param: DeleteInstallmentParamDto,
  ) {
    try {
      await this.deleteInstallmentService.execute(param.id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Installment deleted successfully',
        result: null,
      };
    } catch (error) {
      console.error('Error deleting installment', error);
      throw error;
    }
  }
}
