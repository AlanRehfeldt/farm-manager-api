import { Controller, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import z from 'zod';
import { FarmScoped } from 'src/common/tenancy/farm-scoped.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation-pipe';
import { CropSeasonParamDto } from '../dtos/request/crop-season.dto';
import { CloseCropSeasonService } from '../services/close-crop-season.service';

const closeCropSeasonParamSchema = z.object({ id: z.uuid() });

@ApiTags('CropSeason')
@FarmScoped()
@Controller('/crop-seasons')
export class CloseCropSeasonController {
  constructor(
    private readonly closeCropSeasonService: CloseCropSeasonService,
  ) {}

  @ApiOperation({ summary: 'Close crop season (not implemented)' })
  @Patch(':id/close')
  async close(
    @Param(new ZodValidationPipe(closeCropSeasonParamSchema))
    _param: CropSeasonParamDto,
  ) {
    await this.closeCropSeasonService.execute();
  }
}
