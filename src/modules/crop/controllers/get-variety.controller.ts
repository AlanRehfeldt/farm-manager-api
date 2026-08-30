import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import z from 'zod';
import { OrganizationId } from 'src/common/tenancy/organization-id.decorator';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { NotFoundDto } from 'src/common/errors/not-found.dto';
import { GetVarietyParamDto } from '../dtos/request/variety-request.dto';
import { GetVarietyResponseDto } from '../dtos/response/variety-response.dto';
import { GetVarietyService } from '../services/get-variety.service';

const getVarietyParamSchema = z.object({ id: z.uuid() });

@ApiTags('Variety')
@FarmScoped()
@Controller('/varieties')
export class GetVarietyController {
  constructor(private readonly getVarietyService: GetVarietyService) {}

  @ApiOperation({ summary: 'Get variety by id' })
  @ApiOkResponse({
    description: 'Variety retrieved successfully',
    type: GetVarietyResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Variety does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @OrganizationId() organizationId: string,
    @Param(new ZodValidationPipe(getVarietyParamSchema))
    param: GetVarietyParamDto,
  ) {
    const { variety } = await this.getVarietyService.execute(
      param.id,
      organizationId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Variety retrieved successfully',
      result: variety,
    };
  }
}
