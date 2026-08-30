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
import { GetMachineParamDto } from '../dtos/request/machine-request.dto';
import { GetMachineResponseDto } from '../dtos/response/machine-response.dto';
import { GetMachineService } from '../services/get-machine.service';

const getMachineParamSchema = z.object({ id: z.uuid() });

@ApiTags('Machine')
@FarmScoped()
@Controller('/machines')
export class GetMachineController {
  constructor(private readonly getMachineService: GetMachineService) {}

  @ApiOperation({ summary: 'Get machine by id' })
  @ApiOkResponse({
    description: 'Machine retrieved successfully',
    type: GetMachineResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Machine does not exist',
    type: NotFoundDto,
  })
  @Get(':id')
  async get(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(getMachineParamSchema))
    param: GetMachineParamDto,
  ) {
    const { machine } = await this.getMachineService.execute(param.id, farmId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Machine retrieved successfully',
      result: machine,
    };
  }
}
