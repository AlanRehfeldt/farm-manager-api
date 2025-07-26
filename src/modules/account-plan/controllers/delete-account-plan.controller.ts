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
import { DeleteAccountPlanService } from '../services/delete-account-plan.service';
import { DeleteAccountPlanParamDto } from '../dtos/request/delete-account-plan.dto';
import { DeleteAccountPlanResponseDto } from '../dtos/response/delete-account-plan.dto';
import { NotFoundDto } from 'src/common/errors/not-found.dto';

const deleteAccountPlanParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('AccountPlan')
@Controller('/account-plans')
export class DeleteAccountPlanController {
  constructor(
    private readonly deleteAccountPlanService: DeleteAccountPlanService,
  ) {}

  @ApiOperation({ summary: 'Delete account plan' })
  @ApiCreatedResponse({
    description: 'Account plan deleted successfully',
    type: DeleteAccountPlanResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request: Invalid request parameter',
    type: BadRequestDto,
  })
  @ApiNotFoundResponse({
    description: 'Not found: Account plan does not exist',
    type: NotFoundDto,
  })
  @Delete(':id')
  async delete(
    @Param(new ZodValidationPipe(deleteAccountPlanParamSchema))
    param: DeleteAccountPlanParamDto,
  ) {
    try {
      await this.deleteAccountPlanService.execute(param.id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Account plan deleted successfully',
        result: null,
      };
    } catch (error) {
      console.error('Error deleting account plan', error);
      throw error;
    }
  }
}
