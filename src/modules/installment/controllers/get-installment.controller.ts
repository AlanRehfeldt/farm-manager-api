import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
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
import { GetInstallmentParamDto } from '../dtos/request/get-installment.dto';
import { GetInstallmentResponseDto } from '../dtos/response/get-installment.dto';
import { GetInstallmentService } from '../services/get-installment.service';

const getInstallmentParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Installment')
@FarmScoped()
@Controller('/installments')
export class GetInstallmentController {
  constructor(private readonly getInstallmentService: GetInstallmentService) {}

  @ApiOperation({ summary: 'Get installment' })
  @ApiOkResponse({
    description: 'Installment retrieved successfully',
    type: GetInstallmentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Installment does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(getInstallmentParamSchema))
    param: GetInstallmentParamDto,
  ) {
    const { installment } = await this.getInstallmentService.execute(
      param.id,
      farmId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Installment retrieved successfully',
      result: installment,
    };
  }
}
