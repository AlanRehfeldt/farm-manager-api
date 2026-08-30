import { Controller, Delete, HttpStatus, Param } from '@nestjs/common';
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
import { DeleteMachineParamDto } from '../dtos/request/machine-request.dto';
import { DeleteMachineResponseDto } from '../dtos/response/machine-response.dto';
import { DeleteMachineService } from '../services/delete-machine.service';

const deleteMachineParamSchema = z.object({ id: z.uuid() });

@ApiTags('Machine')
@FarmScoped()
@Controller('/machines')
export class DeleteMachineController {
  constructor(private readonly deleteMachineService: DeleteMachineService) {}

  @ApiOperation({ summary: 'Delete machine' })
  @ApiOkResponse({
    description: 'Machine deleted successfully',
    type: DeleteMachineResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Machine does not exist',
    type: NotFoundDto,
  })
  @Delete(':id')
  async delete(
    @FarmId() farmId: string,
    @Param(new ZodValidationPipe(deleteMachineParamSchema))
    param: DeleteMachineParamDto,
  ) {
    await this.deleteMachineService.execute(param.id, farmId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Machine deleted successfully',
      result: null,
    };
  }
}
