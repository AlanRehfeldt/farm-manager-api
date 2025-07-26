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
import { GetInstallmentService } from '../services/get-installment.service';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetInstallmentParamDto } from '../dtos/request/get-installment.dto';
import { GetInstallmentResponseDto } from '../dtos/response/get-installment.dto';

const getInstallmentParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('Installment')
@Controller('/installments')
export class GetInstallmentController {
  constructor(private readonly getInstallmentService: GetInstallmentService) {}

  @ApiOperation({ summary: 'Get installment' })
  @ApiOkResponse({
    description: 'Installment retrived successfully',
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
    @Param(new ZodValidationPipe(getInstallmentParamSchema))
    param: GetInstallmentParamDto,
  ) {
    try {
      const { installment } = await this.getInstallmentService.execute(
        param.id,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Installment retrived successfully',
        installment,
      };
    } catch (error) {
      console.error('Error getting installment', error);
      throw error;
    }
  }
}
