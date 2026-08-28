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
import { DeleteAccountPlanParamDto } from '../dtos/request/delete-account-plan.dto';
import { DeleteAccountPlanResponseDto } from '../dtos/response/delete-account-plan.dto';
import { DeleteAccountPlanService } from '../services/delete-account-plan.service';

const deleteAccountPlanParamSchema = z.object({
  id: z.uuid(),
});

@ApiTags('AccountPlan')
@FarmScoped()
@Controller('/account-plans')
export class DeleteAccountPlanController {
  constructor(
    private readonly deleteAccountPlanService: DeleteAccountPlanService,
  ) {}

  @ApiOperation({ summary: 'Delete account plan' })
  @ApiOkResponse({
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
    @OrganizationId() organizationId: string,
    @Param(new ZodValidationPipe(deleteAccountPlanParamSchema))
    param: DeleteAccountPlanParamDto,
  ) {
    await this.deleteAccountPlanService.execute(param.id, organizationId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Account plan deleted successfully',
      result: null,
    };
  }
}
