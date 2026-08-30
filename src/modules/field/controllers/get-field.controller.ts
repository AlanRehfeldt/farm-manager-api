import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { FarmId } from 'src/common/tenancy/farm-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetFieldParamDto } from '../dtos/request/field-request.dto';
import { GetFieldResponseDto } from '../dtos/response/field-response.dto';
import { GetFieldService } from '../services/get-field.service';

const getFieldParamSchema = z.object({ id: z.uuid() });

@ApiTags('Field')
@FarmScoped()
@Controller('/fields')
export class GetFieldController {
  constructor(private readonly getFieldService: GetFieldService) {}

  @ApiOperation({ summary: 'Get field by id' })
  @ApiOkResponse({
    description: 'Field retrieved successfully',
    type: GetFieldResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Field does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(getFieldParamSchema)) param: GetFieldParamDto,
  ) {
    const { field } = await this.getFieldService.execute(param.id, farmId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Field retrieved successfully',
      result: field,
    };
  }
}
